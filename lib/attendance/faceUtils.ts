/**
 * AUTO-CAPTURE ATTENDANCE ENGINE & GEOMETRIC POSE CONFIG
 * Cấu hình chuẩn tham chiếu cho thuật toán nhận diện và chấm công
 */

export interface AutoCaptureConfig {
  STABLE_DURATION_MS: number;
  YAW_THRESHOLD: number;
  PITCH_THRESHOLD: number;
  NEUTRAL_NOSE_RATIO: number;
  SHARPNESS_THRESHOLD: number;
  BRIGHTNESS_THRESHOLD: number;
  CROP_SIZE: number;
  PADDING_RATIO: number;
  NOMINATIM_API_URL: string;
  BIGDATACLOUD_API_URL: string;
}

export const AUTO_CAPTURE_CONFIG: AutoCaptureConfig = {
  // Thời gian cần giữ khuôn mặt ổn định liên tục để kích hoạt chụp (ms)
  STABLE_DURATION_MS: 1000,
  // Ngưỡng lệch quay đầu trái / phải (Yaw ratio)
  YAW_THRESHOLD: 0.08,
  // Ngưỡng lệch cúi / ngẩng đầu (Pitch offset)
  PITCH_THRESHOLD: 0.06,
  // Tỉ lệ khoảng cách từ trán đến mũi so với toàn khuôn mặt ở tư thế thẳng tự nhiên
  NEUTRAL_NOSE_RATIO: 0.55,
  // Ngưỡng phương sai Laplacian tối thiểu (chống mờ nhòe do rung)
  SHARPNESS_THRESHOLD: 120,
  // Ngưỡng độ sáng trung bình tối thiểu (thang 0 - 255)
  BRIGHTNESS_THRESHOLD: 60,
  // Kích thước chuẩn hoá vùng mặt trên offscreen canvas để tính toán siêu tốc (96x96 px)
  CROP_SIZE: 96,
  // Tỉ lệ mở rộng khung cắt bao quanh khuôn mặt (15%)
  PADDING_RATIO: 0.15,
  // Dịch vụ Geocoding
  NOMINATIM_API_URL: 'https://nominatim.openstreetmap.org/reverse',
  BIGDATACLOUD_API_URL: 'https://api.bigdatacloud.net/data/reverse-geocode-client',
};

export interface NormalizedLandmark {
  x: number;
  y: number;
  z?: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FaceEvaluationDetails {
  faceCount: number;
  yawRatio: number;
  isYawValid: boolean;
  pitchOffset: number;
  isPitchValid: boolean;
  sharpness: number;
  isSharpnessValid: boolean;
  brightness: number;
  isBrightnessValid: boolean;
  isPassed: boolean;
  message: string;
}

// Landmark indexes chuẩn MediaPipe 468 points
export const LANDMARK_INDEX = {
  NOSE_TIP: 4,      // Đỉnh mũi
  FOREHEAD: 10,     // Đỉnh trán
  CHIN: 152,        // Cằm
  LEFT_CHEEK: 234,  // Gò má trái
  RIGHT_CHEEK: 454, // Gò má phải
} as const;

/**
 * Singleton Script Loader cho thư viện MediaPipe FaceMesh qua CDN
 */
let faceMeshScriptPromise: Promise<any> | null = null;

export function loadMediaPipeFaceMesh(): Promise<any> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('MediaPipe chỉ có thể chạy trên môi trường Trình duyệt (Client-side).'));
  }

  const win = window as any;
  if (win.FaceMesh) {
    return Promise.resolve(win.FaceMesh);
  }

  if (faceMeshScriptPromise) {
    return faceMeshScriptPromise;
  }

  faceMeshScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js';
    script.crossOrigin = 'anonymous';
    script.async = true;

    script.onload = () => {
      if (win.FaceMesh) {
        resolve(win.FaceMesh);
      } else {
        // Fallback sang CDN unpkg nếu jsdelivr gặp sự cố
        const fallbackScript = document.createElement('script');
        fallbackScript.src = 'https://unpkg.com/@mediapipe/face_mesh/face_mesh.js';
        fallbackScript.crossOrigin = 'anonymous';
        fallbackScript.async = true;
        fallbackScript.onload = () => {
          if (win.FaceMesh) resolve(win.FaceMesh);
          else reject(new Error('Không thể tải đối tượng FaceMesh từ CDN.'));
        };
        fallbackScript.onerror = () => reject(new Error('Lỗi nạp script MediaPipe FaceMesh CDN.'));
        document.head.appendChild(fallbackScript);
      }
    };

    script.onerror = () => {
      reject(new Error('Không thể tải MediaPipe FaceMesh từ CDN jsdelivr.'));
    };

    document.head.appendChild(script);
  });

  return faceMeshScriptPromise;
}

/**
 * 2.2.A: Ước lượng góc xoay ngang (Yaw Ratio)
 * Kiểm tra xem người dùng có đang nhìn thẳng hay quay đầu sang trái / phải
 */
export function calculateYaw(landmarks: NormalizedLandmark[]): { yawRatio: number; isValid: boolean; message: string } {
  const nose = landmarks[LANDMARK_INDEX.NOSE_TIP];
  const leftCheek = landmarks[LANDMARK_INDEX.LEFT_CHEEK];
  const rightCheek = landmarks[LANDMARK_INDEX.RIGHT_CHEEK];

  if (!nose || !leftCheek || !rightCheek) {
    return { yawRatio: 1, isValid: false, message: 'Không phát hiện đủ mốc gò má và mũi' };
  }

  const cheekMidX = (leftCheek.x + rightCheek.x) / 2;
  const faceWidth = Math.abs(rightCheek.x - leftCheek.x);

  if (faceWidth === 0) {
    return { yawRatio: 1, isValid: false, message: 'Độ rộng khuôn mặt quá nhỏ' };
  }

  const yawRatio = (nose.x - cheekMidX) / faceWidth;
  const isValid = Math.abs(yawRatio) <= AUTO_CAPTURE_CONFIG.YAW_THRESHOLD;

  let message = 'Tư thế thẳng chuẩn';
  if (!isValid) {
    message = yawRatio > 0 
      ? 'Nhìn thẳng vào camera (đang xoay sang phải)' 
      : 'Nhìn thẳng vào camera (đang xoay sang trái)';
  }

  return { yawRatio, isValid, message };
}

/**
 * 2.2.B: Ước lượng góc ngẩng / cúi (Pitch Offset)
 * Kiểm tra xem người dùng có đang cúi gằm mặt hoặc ngửa cổ lên trên
 */
export function calculatePitch(landmarks: NormalizedLandmark[]): { pitchOffset: number; isValid: boolean; message: string } {
  const nose = landmarks[LANDMARK_INDEX.NOSE_TIP];
  const forehead = landmarks[LANDMARK_INDEX.FOREHEAD];
  const chin = landmarks[LANDMARK_INDEX.CHIN];

  if (!nose || !forehead || !chin) {
    return { pitchOffset: 1, isValid: false, message: 'Không phát hiện đủ mốc trán, mũi và cằm' };
  }

  const faceHeight = Math.abs(chin.y - forehead.y);
  if (faceHeight === 0) {
    return { pitchOffset: 1, isValid: false, message: 'Chiều cao khuôn mặt không hợp lệ' };
  }

  const noseRatio = (nose.y - forehead.y) / faceHeight;
  const pitchOffset = noseRatio - AUTO_CAPTURE_CONFIG.NEUTRAL_NOSE_RATIO;
  const isValid = Math.abs(pitchOffset) <= AUTO_CAPTURE_CONFIG.PITCH_THRESHOLD;

  let message = 'Tư thế thẳng chuẩn';
  if (!isValid) {
    message = pitchOffset > 0
      ? 'Nhìn thẳng vào camera (đang cúi đầu)'
      : 'Nhìn thẳng vào camera (đang ngẩng đầu)';
  }

  return { pitchOffset, isValid, message };
}

/**
 * 2.3.A: Tính Bounding Box khuôn mặt từ landmarks với padding 15%
 */
export function getFaceBoundingBox(
  landmarks: NormalizedLandmark[], 
  imageWidth: number, 
  imageHeight: number
): BoundingBox {
  let minX = 1;
  let maxX = 0;
  let minY = 1;
  let maxY = 0;

  for (let i = 0; i < landmarks.length; i++) {
    const pt = landmarks[i];
    if (pt.x < minX) minX = pt.x;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.y > maxY) maxY = pt.y;
  }

  const width = (maxX - minX) * imageWidth;
  const height = (maxY - minY) * imageHeight;
  const padX = width * AUTO_CAPTURE_CONFIG.PADDING_RATIO;
  const padY = height * AUTO_CAPTURE_CONFIG.PADDING_RATIO;

  const x = Math.max(0, minX * imageWidth - padX);
  const y = Math.max(0, minY * imageHeight - padY);
  const finalWidth = Math.min(imageWidth - x, width + padX * 2);
  const finalHeight = Math.min(imageHeight - y, height + padY * 2);

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(finalWidth),
    height: Math.round(finalHeight),
  };
}

// Canvas ảo Offscreen tái sử dụng để tránh cấp phát bộ nhớ liên tục trong vòng lặp 60 FPS
let offscreenCanvas: HTMLCanvasElement | null = null;
let offscreenCtx: CanvasRenderingContext2D | null = null;

function getOffscreenContext(size: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null {
  if (typeof document === 'undefined') return null;
  if (!offscreenCanvas) {
    offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;
    offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });
  }
  return offscreenCtx ? { canvas: offscreenCanvas, ctx: offscreenCtx } : null;
}

/**
 * 2.3.B & 2.3.C: Đánh giá độ nét (Variance of Laplacian) & Độ sáng trung bình (Luminance)
 * Thực hiện trên canvas ảo 96x96 px giúp CPU chạy siêu tốc
 */
export function evaluateBlurAndBrightness(
  sourceImage: HTMLVideoElement | HTMLCanvasElement,
  box: BoundingBox
): { sharpness: number; isSharpnessValid: boolean; brightness: number; isBrightnessValid: boolean } {
  const size = AUTO_CAPTURE_CONFIG.CROP_SIZE;
  const contextHolder = getOffscreenContext(size);

  if (!contextHolder || box.width <= 0 || box.height <= 0) {
    return {
      sharpness: 0,
      isSharpnessValid: false,
      brightness: 0,
      isBrightnessValid: false,
    };
  }

  const { ctx } = contextHolder;

  // Cắt và scale vùng mặt về 96x96
  ctx.drawImage(
    sourceImage,
    box.x, box.y, box.width, box.height,
    0, 0, size, size
  );

  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  const totalPixels = size * size;

  // Chuyển sang ảnh xám Grayscale: 0.299R + 0.587G + 0.114B & tính độ chói trung bình
  const gray = new Float32Array(totalPixels);
  let luminanceSum = 0;

  for (let i = 0; i < totalPixels; i++) {
    const offset = i * 4;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    const val = 0.299 * r + 0.587 * g + 0.114 * b;
    gray[i] = val;
    luminanceSum += val;
  }

  const meanBrightness = luminanceSum / totalPixels;
  const isBrightnessValid = meanBrightness >= AUTO_CAPTURE_CONFIG.BRIGHTNESS_THRESHOLD;

  // Tích chập ma trận Laplacian 3x3:
  // [[-1, -1, -1],
  //  [-1,  8, -1],
  //  [-1, -1, -1]]
  let lapSum = 0;
  let lapSqSum = 0;
  let validCount = 0;

  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      const idx = y * size + x;
      const center = gray[idx];

      const lap =
        8 * center -
        (gray[idx - size - 1] + gray[idx - size] + gray[idx - size + 1] +
         gray[idx - 1]                          + gray[idx + 1] +
         gray[idx + size - 1] + gray[idx + size] + gray[idx + size + 1]);

      lapSum += lap;
      lapSqSum += lap * lap;
      validCount++;
    }
  }

  // Variance = sum(Lap^2) / N - (sum(Lap) / N)^2
  const meanLap = lapSum / validCount;
  const variance = (lapSqSum / validCount) - (meanLap * meanLap);
  const sharpness = Math.max(0, Math.round(variance));
  const isSharpnessValid = sharpness >= AUTO_CAPTURE_CONFIG.SHARPNESS_THRESHOLD;

  return {
    sharpness,
    isSharpnessValid,
    brightness: Math.round(meanBrightness),
    isBrightnessValid,
  };
}

/**
 * 2.4: Đánh giá tổng hợp toàn bộ 4 tiêu chuẩn chất lượng khuôn mặt
 */
export function evaluateFaceQuality(
  faces: any[] | null | undefined,
  sourceImage: HTMLVideoElement | HTMLCanvasElement,
  imageWidth: number,
  imageHeight: number
): FaceEvaluationDetails {
  const faceCount = faces?.length || 0;

  // Tiêu chuẩn 1: Bắt buộc chỉ duy nhất 1 khuôn mặt trong khung hình
  if (faceCount === 0) {
    return {
      faceCount: 0,
      yawRatio: 0,
      isYawValid: false,
      pitchOffset: 0,
      isPitchValid: false,
      sharpness: 0,
      isSharpnessValid: false,
      brightness: 0,
      isBrightnessValid: false,
      isPassed: false,
      message: 'Vui lòng đưa khuôn mặt vào giữa khung hình',
    };
  }

  if (faceCount > 1) {
    return {
      faceCount,
      yawRatio: 0,
      isYawValid: false,
      pitchOffset: 0,
      isPitchValid: false,
      sharpness: 0,
      isSharpnessValid: false,
      brightness: 0,
      isBrightnessValid: false,
      isPassed: false,
      message: 'Cảnh báo: Phát hiện nhiều người! Chỉ cho phép 1 người điểm danh',
    };
  }

  const landmarks: NormalizedLandmark[] = faces[0];

  // Tiêu chuẩn 2: Góc nhìn chuẩn (Pose - Yaw & Pitch)
  const yawRes = calculateYaw(landmarks);
  if (!yawRes.isValid) {
    return {
      faceCount: 1,
      yawRatio: yawRes.yawRatio,
      isYawValid: false,
      pitchOffset: 0,
      isPitchValid: false,
      sharpness: 0,
      isSharpnessValid: false,
      brightness: 0,
      isBrightnessValid: false,
      isPassed: false,
      message: yawRes.message,
    };
  }

  const pitchRes = calculatePitch(landmarks);
  if (!pitchRes.isValid) {
    return {
      faceCount: 1,
      yawRatio: yawRes.yawRatio,
      isYawValid: true,
      pitchOffset: pitchRes.pitchOffset,
      isPitchValid: false,
      sharpness: 0,
      isSharpnessValid: false,
      brightness: 0,
      isBrightnessValid: false,
      isPassed: false,
      message: pitchRes.message,
    };
  }

  // Tiêu chuẩn 3 & 4: Độ nét và Độ sáng
  const bbox = getFaceBoundingBox(landmarks, imageWidth, imageHeight);
  const quality = evaluateBlurAndBrightness(sourceImage, bbox);

  if (!quality.isBrightnessValid) {
    return {
      faceCount: 1,
      yawRatio: yawRes.yawRatio,
      isYawValid: true,
      pitchOffset: pitchRes.pitchOffset,
      isPitchValid: true,
      sharpness: quality.sharpness,
      isSharpnessValid: quality.isSharpnessValid,
      brightness: quality.brightness,
      isBrightnessValid: false,
      isPassed: false,
      message: 'Ánh sáng yếu - vui lòng đến nơi sáng hơn',
    };
  }

  if (!quality.isSharpnessValid) {
    return {
      faceCount: 1,
      yawRatio: yawRes.yawRatio,
      isYawValid: true,
      pitchOffset: pitchRes.pitchOffset,
      isPitchValid: true,
      sharpness: quality.sharpness,
      isSharpnessValid: false,
      brightness: quality.brightness,
      isBrightnessValid: true,
      isPassed: false,
      message: 'Ảnh bị mờ - vui lòng giữ yên điện thoại',
    };
  }

  // ĐẠT ĐỦ 4 TIÊU CHUẨN CHẤT LƯỢNG
  return {
    faceCount: 1,
    yawRatio: yawRes.yawRatio,
    isYawValid: true,
    pitchOffset: pitchRes.pitchOffset,
    isPitchValid: true,
    sharpness: quality.sharpness,
    isSharpnessValid: true,
    brightness: quality.brightness,
    isBrightnessValid: true,
    isPassed: true,
    message: 'Giữ yên tư thế, đang tự động quét...',
  };
}
