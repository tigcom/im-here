'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  RefreshCw,
  Check,
  X,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Loader2,
  FlipHorizontal,
  MapPin,
  Clock,
  UserCheck,
  Eye,
  Maximize2
} from 'lucide-react';

import {
  loadMediaPipeFaceMesh,
  evaluateFaceQuality,
  AUTO_CAPTURE_CONFIG,
  FaceEvaluationDetails,
} from '@/lib/attendance/faceUtils';
import { cameraService } from '@/lib/attendance/cameraService';
import { gpsService, GpsCoordinates, GeocodedAddress } from '@/lib/attendance/gpsService';
import { stampWatermarkOnVideo, StampedImageResult, WatermarkMetadata } from '@/lib/attendance/watermarkEngine';

export interface AttendanceCaptureProps {
  isOpen?: boolean;
  title?: string;
  subtitle?: string;
  workerName?: string;
  workerCode?: string;
  shiftOrTask?: string;
  onClose?: () => void;
  onCaptureComplete: (result: StampedImageResult) => void;
  mode?: 'fullscreen' | 'modal';
  defaultFacingMode?: 'user' | 'environment';
}

export default function AttendanceCapture({
  isOpen = true,
  title = 'Điểm Danh & Xác Thực Khuôn Mặt',
  subtitle = 'Hệ thống tự động căn chỉnh và chụp khi khuôn mặt đạt chuẩn',
  workerName = '',
  workerCode = '',
  shiftOrTask = 'Hiện trường thực địa',
  onClose,
  onCaptureComplete,
  mode = 'modal',
  defaultFacingMode = 'user',
}: AttendanceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const faceMeshInstanceRef = useRef<any>(null);

  // Trạng thái camera và xử lý
  const [cameraState, setCameraState] = useState<'idle' | 'initializing' | 'ready' | 'captured' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(defaultFacingMode);
  
  // Trạng thái GPS
  const [currentGps, setCurrentGps] = useState<GpsCoordinates | null>(null);
  const [resolvedAddress, setResolvedAddress] = useState<string>('Đang định vị vệ tinh GPS...');

  // Trạng thái đánh giá khuôn mặt thời gian thực
  const [guidanceMessage, setGuidanceMessage] = useState('Đang khởi động cảm biến...');
  const [progress, setProgress] = useState(0); // 0 đến 100%
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [isPoseValid, setIsPoseValid] = useState(false);
  const [isSharpnessValid, setIsSharpnessValid] = useState(false);
  const [isBrightnessValid, setIsBrightnessValid] = useState(false);

  // Đếm thời gian ổn định liên tục 1000ms
  const stableStartTimeRef = useRef<number | null>(null);
  const isCapturingRef = useRef(false);

  // Kết quả sau khi chụp
  const [capturedResult, setCapturedResult] = useState<StampedImageResult | null>(null);
  const [isShutterFlashing, setIsShutterFlashing] = useState(false);

  // 1. Khởi động GPS theo dõi vị trí và Reverse Geocode
  useEffect(() => {
    if (!isOpen) return;

    const watcher = gpsService.startWatching(
      async (coords) => {
        setCurrentGps(coords);
        try {
          const addr = await gpsService.reverseGeocode(coords.latitude, coords.longitude);
          if (addr?.formattedAddress) {
            setResolvedAddress(addr.formattedAddress);
          }
        } catch (err) {
          console.warn('Lỗi reverse geocoding:', err);
        }
      },
      (err) => {
        console.warn('Lỗi định vị GPS:', err.message);
        setResolvedAddress('Không thể truy cập tọa độ GPS (chưa cấp quyền)');
      }
    );

    return () => {
      gpsService.stopWatching();
    };
  }, [isOpen]);

  // 2. Khởi tạo Camera WebRTC
  const initCamera = useCallback(async (targetFacingMode: 'user' | 'environment') => {
    setCameraState('initializing');
    setErrorMessage('');
    setProgress(0);
    stableStartTimeRef.current = null;
    isCapturingRef.current = false;
    setCapturedResult(null);

    try {
      const stream = await cameraService.startCamera({
        facingMode: targetFacingMode,
        idealWidth: 1280,
        idealHeight: 720,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {});
          setCameraState('ready');
        };
      } else {
        setCameraState('ready');
      }
    } catch (err: any) {
      console.error('Lỗi mở Camera:', err);
      setCameraState('error');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Quyền truy cập Camera bị từ chối. Vui lòng cho phép quyền Camera trên trình duyệt của bạn.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('Không tìm thấy thiết bị Camera trên thiết bị.');
      } else {
        setErrorMessage(err.message || 'Không thể khởi động Camera.');
      }
    }
  }, []);

  // 3. Khởi tạo MediaPipe FaceMesh qua CDN
  useEffect(() => {
    let isCancelled = false;

    if (!isOpen) return;

    loadMediaPipeFaceMesh()
      .then((FaceMeshClass) => {
        if (isCancelled) return;
        const faceMesh = new FaceMeshClass({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMesh.setOptions({
          maxNumFaces: 2,          // Kiểm tra xem có người thứ 2 lọt vào không
          refineLandmarks: false,  // Tối ưu tốc độ mobile
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        faceMeshInstanceRef.current = faceMesh;
      })
      .catch((err) => {
        console.warn('Lỗi tải MediaPipe CDN:', err);
      });

    return () => {
      isCancelled = true;
      if (faceMeshInstanceRef.current?.close) {
        try {
          faceMeshInstanceRef.current.close();
        } catch {}
      }
      faceMeshInstanceRef.current = null;
    };
  }, [isOpen]);

  // 4. Hàm kích hoạt chụp ảnh tự động & đóng dấu watermark
  const triggerAutoCapture = useCallback(async () => {
    if (isCapturingRef.current || !videoRef.current) return;
    isCapturingRef.current = true;

    // Hiệu ứng chớp sáng Shutter Flash
    setIsShutterFlashing(true);
    setTimeout(() => setIsShutterFlashing(false), 240);

    try {
      const metadata: WatermarkMetadata = {
        timestamp: new Date(),
        workerName: workerName || undefined,
        workerCode: workerCode || undefined,
        shiftOrTask: shiftOrTask,
        gpsLat: currentGps?.latitude,
        gpsLng: currentGps?.longitude,
        gpsAccuracy: currentGps?.accuracy,
        address: resolvedAddress,
      };

      const result = await stampWatermarkOnVideo(
        videoRef.current,
        facingMode,
        metadata
      );

      setCapturedResult(result);
      setCameraState('captured');
      cameraService.stopCamera();
    } catch (err) {
      console.error('Lỗi khi nướng watermark vào ảnh:', err);
      alert('Không thể hoàn tất chụp ảnh watermark. Vui lòng thử lại.');
      isCapturingRef.current = false;
      stableStartTimeRef.current = null;
      setProgress(0);
    }
  }, [currentGps, facingMode, resolvedAddress, shiftOrTask, workerCode, workerName]);

  // 5. Vòng lặp phân tích khung hình Real-Time (30 - 60 FPS)
  useEffect(() => {
    if (cameraState !== 'ready' || !isOpen) {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      return;
    }

    let isProcessingFrame = false;

    const processLoop = async () => {
      if (isCapturingRef.current || cameraState !== 'ready') return;

      const video = videoRef.current;
      const faceMesh = faceMeshInstanceRef.current;

      if (video && video.readyState >= 2 && faceMesh && !isProcessingFrame) {
        isProcessingFrame = true;

        try {
          // Gửi frame video đến FaceMesh
          faceMesh.onResults((results: any) => {
            const faces = results.multiFaceLandmarks;
            const videoWidth = video.videoWidth || 640;
            const videoHeight = video.videoHeight || 480;

            const evaluation: FaceEvaluationDetails = evaluateFaceQuality(
              faces,
              video,
              videoWidth,
              videoHeight
            );

            // Cập nhật trạng thái chỉ báo UI
            setIsFaceDetected(evaluation.faceCount === 1);
            setIsPoseValid(evaluation.isYawValid && evaluation.isPitchValid);
            setIsSharpnessValid(evaluation.isSharpnessValid);
            setIsBrightnessValid(evaluation.isBrightnessValid);
            setGuidanceMessage(evaluation.message);

            // Cơ chế ổn định 1000ms (Stability Hold)
            if (evaluation.isPassed) {
              const now = performance.now();
              if (stableStartTimeRef.current === null) {
                stableStartTimeRef.current = now;
              }

              const elapsed = now - stableStartTimeRef.current;
              const curProgress = Math.min(100, Math.round((elapsed / AUTO_CAPTURE_CONFIG.STABLE_DURATION_MS) * 100));
              setProgress(curProgress);

              // Nếu giữ ổn định liên tục đủ 1000ms -> TỰ ĐỘNG CHỤP
              if (elapsed >= AUTO_CAPTURE_CONFIG.STABLE_DURATION_MS) {
                triggerAutoCapture();
              }
            } else {
              // Bất kỳ điều kiện nào bị rớt -> Reset ngay lập tức
              stableStartTimeRef.current = null;
              setProgress(0);
            }
          });

          await faceMesh.send({ image: video });
        } catch (err) {
          // Bỏ qua frame rơi
        } finally {
          isProcessingFrame = false;
        }
      }

      if (cameraState === 'ready' && !isCapturingRef.current) {
        animationFrameIdRef.current = requestAnimationFrame(processLoop);
      }
    };

    animationFrameIdRef.current = requestAnimationFrame(processLoop);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    };
  }, [cameraState, isOpen, triggerAutoCapture]);

  // Vòng đời khởi động / tắt camera
  useEffect(() => {
    if (isOpen) {
      initCamera(facingMode);
    } else {
      cameraService.stopCamera();
      setCameraState('idle');
      setProgress(0);
      stableStartTimeRef.current = null;
      isCapturingRef.current = false;
      setCapturedResult(null);
    }

    return () => {
      cameraService.stopCamera();
    };
  }, [isOpen, initCamera, facingMode]);

  // Đổi camera trước / sau
  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    initCamera(nextMode);
  };

  // Chụp lại
  const handleRetake = () => {
    setCapturedResult(null);
    isCapturingRef.current = false;
    stableStartTimeRef.current = null;
    setProgress(0);
    initCamera(facingMode);
  };

  // Xác nhận ảnh đã chụp
  const handleConfirm = () => {
    if (!capturedResult) return;
    onCaptureComplete(capturedResult);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-ink-950/85 backdrop-blur-md transition-opacity duration-200 ${
        mode === 'fullscreen' ? 'p-0' : ''
      }`}
    >
      {/* Hiệu ứng chớp sáng Shutter */}
      {isShutterFlashing && (
        <div className="absolute inset-0 z-50 bg-paper-000 animate-out fade-out duration-200 pointer-events-none" />
      )}

      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full bg-surface-900 border border-rule-dark overflow-hidden flex flex-col shadow-[0_24px_70px_-15px_oklch(0_0_0/0.7)] ${
          mode === 'fullscreen'
            ? 'h-full max-w-none rounded-none'
            : 'max-w-lg rounded-3xl h-[94vh] max-h-[820px]'
        }`}
      >
        {/* ── HEADER ── */}
        <div className="px-4 py-3 border-b border-rule-dark flex items-center justify-between bg-surface-950/90 backdrop-blur-xs text-on-surface-900 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-accent-quiet text-accent flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-bold text-sm text-on-surface-900 truncate leading-tight">
                {title}
              </h3>
              <p className="text-[11px] text-on-surface-500 truncate">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {cameraState === 'ready' && (
              <button
                type="button"
                onClick={handleToggleFacingMode}
                className="p-2 rounded-xl border border-rule-dark bg-surface-800 text-on-surface-700 hover:text-on-surface-900 hover:bg-surface-700 active:scale-95 transition-[transform,background-color]"
                title="Đổi camera trước / sau"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-on-surface-500 hover:text-on-surface-900 rounded-xl hover:bg-surface-800 active:scale-95 transition-[transform,background-color]"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* ── VIEWPORT CAMERA & SCANNER RADAR ── */}
        <div className="relative flex-1 bg-surface-950 flex items-center justify-center overflow-hidden">
          {/* Trạng thái Đang khởi động */}
          {cameraState === 'initializing' && (
            <div className="flex flex-col items-center gap-3 text-on-surface-700 text-xs p-6 text-center">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
              <div className="space-y-1">
                <span className="font-bold text-on-surface-900">Đang khởi động Camera AI...</span>
                <p className="text-[11px] text-on-surface-500">Nạp mô hình MediaPipe FaceMesh &amp; kết nối GPS vệ tinh</p>
              </div>
            </div>
          )}

          {/* Trạng thái Sẵn sàng / Đang quét video */}
          {(cameraState === 'ready' || cameraState === 'initializing') && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />

              {/* KHUNG CĂN MẶT CÔNG NGHỆ CAO */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
                <div
                  className={`relative w-64 h-80 rounded-[46%] border-2 transition-all duration-300 shadow-[0_0_0_9999px_oklch(0_0_0/0.55)] ${
                    progress > 0
                      ? 'border-accent shadow-[0_0_24px_var(--accent)] scale-[1.02]'
                      : 'border-dashed border-paper-000/40'
                  }`}
                >
                  {/* Tia quét Laser Radar chuyển động */}
                  <div className="absolute inset-x-4 top-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent shadow-[0_0_12px_var(--accent)] animate-[bounce_2.5s_ease-in-out_infinite]" />

                  {/* 4 Góc định vị căn khung */}
                  <div className="absolute top-2 left-6 w-4 h-4 border-t-2 border-l-2 border-accent" />
                  <div className="absolute top-2 right-6 w-4 h-4 border-t-2 border-r-2 border-accent" />
                  <div className="absolute bottom-2 left-6 w-4 h-4 border-b-2 border-l-2 border-accent" />
                  <div className="absolute bottom-2 right-6 w-4 h-4 border-b-2 border-r-2 border-accent" />

                  {/* Vòng tròn tiến trình đếm ngược 1000ms quanh khung */}
                  {progress > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center bg-surface-950/80 backdrop-blur-xs px-4 py-2 rounded-2xl border border-accent/40 shadow-lg">
                        <span className="font-display text-2xl font-black text-accent tabular-nums">
                          {progress}%
                        </span>
                        <span className="block text-[10px] uppercase font-bold tracking-wider text-on-surface-500">
                          Đang giữ ổn định...
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* BANNER HƯỚNG DẪN ĐIỀU CHỈNH TRÊN CÙNG */}
              <div className="absolute top-3 inset-x-3 flex justify-center z-10 pointer-events-none">
                <div
                  className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 border shadow-lg backdrop-blur-md transition-all duration-200 ${
                    progress > 0
                      ? 'bg-accent text-paper-000 border-accent/50'
                      : 'bg-surface-900/90 text-on-surface-900 border-rule-dark'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate max-w-[280px] sm:max-w-md">{guidanceMessage}</span>
                </div>
              </div>

              {/* BỘ 4 CHỈ SỐ TIÊU CHUẨN THỜI GIAN THỰC (PILLS) */}
              <div className="absolute bottom-4 inset-x-3 flex justify-center gap-1.5 sm:gap-2 z-10 pointer-events-none flex-wrap">
                <span
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border backdrop-blur-md ${
                    isFaceDetected
                      ? 'bg-success/20 border-success/40 text-success'
                      : 'bg-surface-900/80 border-rule-dark text-on-surface-500'
                  }`}
                >
                  <UserCheck className="w-3 h-3" />
                  <span>1 Người</span>
                </span>

                <span
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border backdrop-blur-md ${
                    isPoseValid
                      ? 'bg-success/20 border-success/40 text-success'
                      : 'bg-surface-900/80 border-rule-dark text-on-surface-500'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Góc thẳng</span>
                </span>

                <span
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border backdrop-blur-md ${
                    isSharpnessValid
                      ? 'bg-success/20 border-success/40 text-success'
                      : 'bg-surface-900/80 border-rule-dark text-on-surface-500'
                  }`}
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Rõ nét</span>
                </span>

                <span
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border backdrop-blur-md ${
                    isBrightnessValid
                      ? 'bg-success/20 border-success/40 text-success'
                      : 'bg-surface-900/80 border-rule-dark text-on-surface-500'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Đủ sáng</span>
                </span>
              </div>
            </>
          )}

          {/* Trạng thái ĐÃ CHỤP XONG & XEM LẠI ẢNH KÈM WATERMARK */}
          {cameraState === 'captured' && capturedResult && (
            <div className="relative w-full h-full bg-surface-950 flex flex-col items-center justify-center p-2">
              <div className="relative w-full h-full rounded-2xl overflow-hidden border border-rule-dark shadow-2xl flex items-center justify-center bg-ink-950">
                <img
                  src={capturedResult.base64}
                  alt="Ảnh điểm danh kèm watermark"
                  className="w-full h-full object-contain"
                />

                <div className="absolute top-3 left-3 bg-accent text-paper-000 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md">
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Đã tự động chụp &amp; nướng Watermark</span>
                </div>
              </div>
            </div>
          )}

          {/* Trạng thái LỖI CAMERA */}
          {cameraState === 'error' && (
            <div className="p-6 text-center text-on-surface-900 space-y-4 max-w-sm">
              <div className="w-12 h-12 rounded-2xl bg-danger/20 text-danger mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-on-surface-900">Không thể mở Camera</h4>
                <p className="text-xs text-on-surface-500 leading-relaxed">
                  {errorMessage}
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => initCamera(facingMode)}
                  className="w-full py-3 rounded-2xl bg-accent text-paper-000 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-accent-hover transition-colors shadow-lg"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Cấp quyền &amp; Thử lại</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── BẢNG THÔNG TIN VỊ TRÍ GPS BÊN DƯỚI ── */}
        <div className="px-4 py-2.5 bg-surface-950 border-t border-rule-dark flex items-center justify-between gap-3 text-[11px] text-on-surface-500 shrink-0">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
            <span className="truncate">{resolvedAddress}</span>
          </div>
          {currentGps?.accuracy !== undefined && (
            <span className="shrink-0 font-mono text-[10px] text-accent font-semibold bg-accent-quiet px-2 py-0.5 rounded-md">
              ±{currentGps.accuracy}m
            </span>
          )}
        </div>

        {/* ── FOOTER ĐIỀU KHIỂN & XÁC NHẬN ── */}
        <div className="p-4 bg-surface-900 border-t border-rule-dark flex items-center justify-between gap-3 shrink-0">
          {cameraState === 'ready' && (
            <div className="w-full space-y-2">
              {/* Thanh tiến trình đếm ngược mượt mà */}
              <div className="w-full bg-surface-800 rounded-full h-2 overflow-hidden border border-rule-dark">
                <div
                  className="bg-accent h-full transition-[width] duration-150 ease-out shadow-[0_0_8px_var(--accent)]"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-on-surface-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-accent" />
                  Giữ yên 1000ms để chụp tự động
                </span>
                <span className="font-mono font-bold text-accent">{progress}%</span>
              </div>
            </div>
          )}

          {cameraState === 'captured' && (
            <div className="flex gap-2 w-full">
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 py-3 px-4 rounded-2xl border border-rule-dark text-xs font-bold text-on-surface-700 hover:text-on-surface-900 hover:bg-surface-800 active:scale-95 transition-[transform,background-color] flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Chụp lại</span>
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 py-3 px-4 rounded-2xl bg-accent hover:bg-accent-hover text-paper-000 font-display font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-[transform,background-color] shadow-[0_8px_20px_-4px_oklch(0_0_0/0.4)]"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Xác nhận &amp; Sử dụng ảnh</span>
              </button>
            </div>
          )}

          {cameraState === 'error' && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl border border-rule-dark text-xs font-bold text-on-surface-700 hover:bg-surface-800"
            >
              Đóng lại
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
