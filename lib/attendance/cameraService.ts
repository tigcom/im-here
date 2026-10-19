/**
 * CAMERA SERVICE
 * Quản lý luồng MediaStream WebRTC, thiết bị thu nhận hình ảnh và vòng đời camera
 */

export interface CameraConstraintsOptions {
  facingMode?: 'user' | 'environment';
  idealWidth?: number;
  idealHeight?: number;
}

export class CameraService {
  private activeStream: MediaStream | null = null;
  private currentFacingMode: 'user' | 'environment' = 'user';

  /**
   * Khởi động MediaStream từ webcam / camera điện thoại
   */
  async startCamera(
    options: CameraConstraintsOptions = {}
  ): Promise<MediaStream> {
    this.stopCamera();

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      throw new Error('Trình duyệt hiện tại không hỗ trợ WebRTC getUserMedia.');
    }

    const mode = options.facingMode || this.currentFacingMode || 'user';
    this.currentFacingMode = mode;

    const constraints: MediaStreamConstraints = {
      audio: false,
      video: {
        facingMode: mode,
        width: { ideal: options.idealWidth || 1280 },
        height: { ideal: options.idealHeight || 720 },
      },
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.activeStream = stream;
      return stream;
    } catch (err: any) {
      // Fallback nếu constraints lý tưởng bị thiết bị từ chối
      if (err.name === 'OverconstrainedError') {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: mode },
        });
        this.activeStream = fallbackStream;
        return fallbackStream;
      }
      throw err;
    }
  }

  /**
   * Dừng toàn bộ các track và giải phóng camera
   */
  stopCamera(): void {
    if (this.activeStream) {
      this.activeStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      this.activeStream = null;
    }
  }

  /**
   * Đảo chiều camera trước/sau
   */
  async toggleFacingMode(options?: Omit<CameraConstraintsOptions, 'facingMode'>): Promise<{ stream: MediaStream; facingMode: 'user' | 'environment' }> {
    const nextMode = this.currentFacingMode === 'user' ? 'environment' : 'user';
    const stream = await this.startCamera({
      ...options,
      facingMode: nextMode,
    });
    return { stream, facingMode: nextMode };
  }

  getCurrentFacingMode(): 'user' | 'environment' {
    return this.currentFacingMode;
  }

  getActiveStream(): MediaStream | null {
    return this.activeStream;
  }

  /**
   * Trích xuất kích thước thực tế của frame video
   */
  static getVideoDimensions(video: HTMLVideoElement): { width: number; height: number } {
    const width = video.videoWidth || video.clientWidth || 640;
    const height = video.videoHeight || video.clientHeight || 480;
    return { width, height };
  }
}

export const cameraService = new CameraService();
