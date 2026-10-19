/**
 * CANVAS WATERMARK ENGINE
 * Nướng trực tiếp siêu dữ liệu thời gian, danh tính, toạ độ GPS và địa chỉ thực tế vào ảnh
 */

export interface WatermarkMetadata {
  timestamp?: Date | string | number;
  workerName?: string;
  workerCode?: string;
  shiftOrTask?: string;
  gpsLat?: number | null;
  gpsLng?: number | null;
  gpsAccuracy?: number | null;
  address?: string;
}

export interface StampedImageResult {
  base64: string;
  blob: Blob;
  file: File;
  width: number;
  height: number;
}

/**
 * Vẽ watermark lên khung hình video và xuất ảnh chất lượng cao
 */
export async function stampWatermarkOnVideo(
  video: HTMLVideoElement,
  facingMode: 'user' | 'environment',
  metadata: WatermarkMetadata
): Promise<StampedImageResult> {
  const width = video.videoWidth || video.clientWidth || 1280;
  const height = video.videoHeight || video.clientHeight || 720;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Không thể khởi tạo Canvas 2D context');
  }

  // 1. Vẽ khung hình video (Lật trục X nếu là camera trước để ảnh không bị ngược)
  ctx.save();
  if (facingMode === 'user') {
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, 0, 0, width, height);
  ctx.restore();

  // 2. Chuẩn bị nội dung text cho các dòng Watermark
  const timeStr = metadata.timestamp
    ? new Date(metadata.timestamp).toLocaleString('vi-VN', {
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : new Date().toLocaleString('vi-VN', { hour12: false });

  const workerStr = metadata.workerName || metadata.workerCode
    ? `Nhân viên: ${metadata.workerName || 'N/A'}${metadata.workerCode ? ` (Mã: ${metadata.workerCode})` : ''}`
    : 'Xác thực sinh trắc học hệ thống IM-HERE';

  const taskStr = metadata.shiftOrTask
    ? `Nhiệm vụ / Ca trực: ${metadata.shiftOrTask}`
    : 'Điểm danh hiện trường định danh';

  let gpsStr = 'Tọa độ GPS: Đang cập nhật vệ tinh...';
  if (metadata.gpsLat !== undefined && metadata.gpsLat !== null &&
      metadata.gpsLng !== undefined && metadata.gpsLng !== null) {
    const accStr = metadata.gpsAccuracy ? ` (±${metadata.gpsAccuracy}m)` : '';
    gpsStr = `Tọa độ GPS: ${metadata.gpsLat.toFixed(6)}, ${metadata.gpsLng.toFixed(6)}${accStr}`;
  }

  const addrStr = metadata.address
    ? `Địa chỉ: ${metadata.address}`
    : 'Địa chỉ: Đang phân giải vị trí địa lý...';

  const lines = [
    `⏱ ${timeStr}`,
    `👤 ${workerStr}`,
    `📌 ${taskStr}`,
    `🛰 ${gpsStr}`,
    `📍 ${addrStr}`,
  ];

  // 3. Tính toán kích thước chữ tỷ lệ theo độ phân giải ảnh
  const scale = Math.max(0.7, Math.min(width, height) / 720);
  const fontSize = Math.round(15 * scale);
  const lineHeight = Math.round(22 * scale);
  const paddingX = Math.round(18 * scale);
  const paddingY = Math.round(14 * scale);

  ctx.font = `600 ${fontSize}px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

  // Đo độ dài lớn nhất của text để tính cardWidth
  let maxTextWidth = 0;
  for (const line of lines) {
    const textMetrics = ctx.measureText(line);
    if (textMetrics.width > maxTextWidth) {
      maxTextWidth = textMetrics.width;
    }
  }

  const cardWidth = Math.min(width - paddingX * 2, maxTextWidth + paddingX * 2);
  const cardHeight = lines.length * lineHeight + paddingY * 2;
  const cardX = paddingX;
  const cardY = height - cardHeight - paddingY;
  const cornerRadius = Math.round(10 * scale);

  // 4. Vẽ nền Watermark Card màu đen bán trong suốt rgba(0, 0, 0, 0.62) bo góc
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.62)';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 12 * scale;
  ctx.shadowOffsetY = 4 * scale;

  // Vẽ hình chữ nhật bo góc
  ctx.beginPath();
  ctx.moveTo(cardX + cornerRadius, cardY);
  ctx.lineTo(cardX + cardWidth - cornerRadius, cardY);
  ctx.quadraticCurveTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + cornerRadius);
  ctx.lineTo(cardX + cardWidth, cardY + cardHeight - cornerRadius);
  ctx.quadraticCurveTo(cardX + cardWidth, cardY + cardHeight, cardX + cardWidth - cornerRadius, cardY + cardHeight);
  ctx.lineTo(cardX + cornerRadius, cardY + cardHeight);
  ctx.quadraticCurveTo(cardX, cardY + cardHeight, cardX, cardY + cardHeight - cornerRadius);
  ctx.lineTo(cardX, cardY + cornerRadius);
  ctx.quadraticCurveTo(cardX, cardY, cardX + cornerRadius, cardY);
  ctx.closePath();
  ctx.fill();

  // Đường viền vi tế tinh tế
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = 1 * scale;
  ctx.stroke();
  ctx.restore();

  // 5. Vẽ các dòng chữ màu trắng có viền bóng để chống chìm trên mọi nền
  ctx.save();
  ctx.font = `600 ${fontSize}px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillStyle = '#FFFFFF';
  ctx.textBaseline = 'top';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;

  for (let i = 0; i < lines.length; i++) {
    const lineY = cardY + paddingY + i * lineHeight;
    let displayText = lines[i];

    // Cắt bớt nếu chuỗi quá dài tràn cardWidth
    if (ctx.measureText(displayText).width > cardWidth - paddingX * 2) {
      while (displayText.length > 10 && ctx.measureText(displayText + '...').width > cardWidth - paddingX * 2) {
        displayText = displayText.slice(0, -1);
      }
      displayText += '...';
    }

    // Tô màu nhấn cho dòng thời gian và tọa độ
    if (i === 0) {
      ctx.fillStyle = '#6EE7B7'; // Xanh ngọc nổi bật
    } else if (i === 3) {
      ctx.fillStyle = '#93C5FD'; // Xanh lam định vị
    } else {
      ctx.fillStyle = '#FFFFFF';
    }

    ctx.fillText(displayText, cardX + paddingX, lineY);
  }
  ctx.restore();

  // 6. Xuất ảnh Base64 & Blob JPEG chất lượng 0.9
  const base64 = canvas.toDataURL('image/jpeg', 0.9);

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Không thể chuyển đổi canvas thành Blob'));
      },
      'image/jpeg',
      0.9
    );
  });

  const file = new File([blob], `attendance-verified-${Date.now()}.jpg`, {
    type: 'image/jpeg',
  });

  return {
    base64,
    blob,
    file,
    width,
    height,
  };
}
