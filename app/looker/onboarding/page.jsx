'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Camera, 
  UploadCloud, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  FileCheck2, 
  Smartphone,
  ChevronRight,
  UserCheck,
  AlertCircle,
  Loader2,
  Upload,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import api from '@/lib/api';
import FaceScannerModal from '@/components/kyc/FaceScannerModal';

export default function LookerOnboardingPage() {
  const router = useRouter();
  const { currentUser, checkAuth, logout } = useAuth();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isFaceScannerOpen, setIsFaceScannerOpen] = useState(false);

  const [formData, setFormData] = useState({
    idNumber: '',
    fullName: currentUser?.fullName || '',
    birthDate: '',
    address: '',
    frontUrl: '',
    backUrl: '',
    faceUrl: '',
    frontPreview: '',
    backPreview: '',
    facePreview: '',
  });

  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);
  const faceInputRef = useRef(null);

  // Kiểm tra trạng thái KYC thực tế từ backend khi mount trang
  useEffect(() => {
    let isMounted = true;
    const checkKycStatus = async () => {
      try {
        const me = await api.auth.me();
        if (isMounted && me) {
          if (me.kycStatus === 'CHO_DUYET') {
            setStep(5); // Đang chờ duyệt
          } else if (me.kycStatus === 'DA_DUYET') {
            setStep(6); // Đã duyệt hoàn tất
          } else if (me.kycStatus === 'TU_CHOI') {
            setRejectionReason(me.rejectionReason || 'Thông tin thẻ không rõ ràng hoặc không hợp lệ');
          }
          if (me.idCardFrontUrl) {
            setFormData(prev => ({
              ...prev,
              frontUrl: me.idCardFrontUrl,
              backUrl: me.idCardBackUrl || prev.backUrl,
              fullName: me.fullName || prev.fullName
            }));
          }
        }
      } catch (e) {
        console.warn('Lỗi kiểm tra hồ sơ KYC:', e);
      } finally {
        if (isMounted) setIsLoadingProfile(false);
      }
    };
    checkKycStatus();
    return () => { isMounted = false; };
  }, []);

  const handleFileUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    if (type === 'front') setFormData(prev => ({ ...prev, frontPreview: localPreview }));
    if (type === 'back') setFormData(prev => ({ ...prev, backPreview: localPreview }));
    if (type === 'face') setFormData(prev => ({ ...prev, facePreview: localPreview }));

    try {
      const purposeMap = {
        front: 'KYC_FRONT',
        back: 'KYC_BACK',
        face: 'KYC_FACE',
      };
      const uploadRes = await api.upload.file(file, { purpose: purposeMap[type] || 'GENERAL' });
      const finalUrl = uploadRes?.url;
      if (!finalUrl) throw new Error('Máy chủ không trả về tệp KYC đã lưu.');
      if (type === 'front') setFormData(prev => ({ ...prev, frontUrl: finalUrl }));
      if (type === 'back') setFormData(prev => ({ ...prev, backUrl: finalUrl }));
      if (type === 'face') setFormData(prev => ({ ...prev, faceUrl: finalUrl }));
    } catch (err) {
      console.warn('Lỗi upload file KYC:', err);
    }
  };

  const handleFaceCaptured = async ({ file, previewUrl }) => {
    setFormData(prev => ({ ...prev, facePreview: previewUrl }));
    try {
      const uploadRes = await api.upload.file(file, { purpose: 'KYC_FACE' });
      const finalUrl = uploadRes?.url;
      if (!finalUrl) throw new Error('Máy chủ không trả về ảnh khuôn mặt đã lưu.');
      if (type === 'face') setFormData(prev => ({ ...prev, faceUrl: finalUrl }));
    } catch (err) {
      console.warn('Lỗi upload ảnh quét mặt:', err);
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      if (!formData.frontUrl || !formData.backUrl) {
        throw new Error('Cần tải thành công cả ảnh mặt trước và mặt sau CCCD.');
      }
      
      await api.users.submitKyc({
        frontUrl: formData.frontUrl,
        backUrl: formData.backUrl,
        faceUrl: formData.faceUrl,
        idCardNumber: formData.idNumber
      });

      if (checkAuth) {
        await checkAuth().catch(() => null);
      }
      setStep(5); // Màn hình chờ duyệt
    } catch (err) {
      console.warn('Lỗi nộp KYC:', err);
      alert('Không thể nộp hồ sơ lúc này. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-dvh bg-paper-100 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <span className="text-xs text-ink-500 font-mono">Đang kiểm tra hồ sơ định danh...</span>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-paper-100 flex flex-col justify-between py-6 px-4 max-w-lg mx-auto">
      {/* Hidden file inputs */}
      <input 
        type="file" 
        ref={frontInputRef} 
        accept="image/*" 
        className="hidden" 
        onChange={(e) => handleFileUpload(e, 'front')} 
      />
      <input 
        type="file" 
        ref={backInputRef} 
        accept="image/*" 
        className="hidden" 
        onChange={(e) => handleFileUpload(e, 'back')} 
      />
      <input 
        type="file" 
        ref={faceInputRef} 
        accept="image/*" 
        className="hidden" 
        onChange={(e) => handleFileUpload(e, 'face')} 
      />

      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/looker"
            className="p-2 rounded-xl bg-paper-000 border border-rule-subtle text-ink-700 hover:bg-paper-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="font-mono text-xs font-bold text-accent bg-accent-quiet px-3 py-1 rounded-full uppercase">
            XÁC THỰC HỒ SƠ NGƯỜI NHẬN VIỆC
          </span>
          <button
            type="button"
            onClick={logout}
            className="p-2 rounded-xl bg-paper-000 border border-rule-subtle text-ink-500 hover:text-danger hover:bg-danger/10 transition-colors"
            title="Đăng xuất tài khoản"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Dots */}
        {step <= 4 && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-colors ${
                  step === i
                    ? 'w-8 bg-accent'
                    : step > i
                    ? 'w-4 bg-accent/40'
                    : 'w-2 bg-paper-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Main Container */}
      <div className="card-float bg-paper-000 p-6 rounded-[24px] border border-rule-strong space-y-6">
        {/* Bước 1: Giới thiệu & Chuẩn bị */}
        {step === 1 && (
          <div className="space-y-4 text-center">
            {rejectionReason && (
              <div className="p-4 bg-danger/10 border border-danger/20 rounded-2xl text-left space-y-1">
                <div className="flex items-center gap-2 text-danger font-bold text-xs">
                  <AlertCircle className="w-4 h-4" />
                  <span>Hồ sơ trước đó bị từ chối</span>
                </div>
                <p className="text-[11px] text-danger/90 leading-relaxed">
                  Lý do hồ sơ chưa được duyệt: <strong>{rejectionReason}</strong>. Vui lòng chụp lại ảnh rõ nét và nộp lại hồ sơ.
                </p>
              </div>
            )}

            <div className="w-14 h-14 rounded-2xl bg-accent-quiet text-accent flex items-center justify-center mx-auto">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="font-display text-xl font-bold text-ink-900">
              Định Danh Căn Cước Công Dân (CCCD)
            </h1>
            <p className="text-xs text-ink-500 leading-relaxed max-w-sm mx-auto">
              Để nhận việc và nhận thù lao chuyển khoản, bạn cần gửi hồ sơ định danh để xác minh tài khoản.
            </p>

            <div className="p-4 bg-paper-100 rounded-2xl border border-rule-subtle text-left space-y-2.5 text-xs">
              <span className="font-bold text-ink-900 block">Sau khi hồ sơ được duyệt:</span>
              <div className="flex items-center gap-2 text-ink-700">
                <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                <span>Nhận việc độc quyền ngay trên bản đồ</span>
              </div>
              <div className="flex items-center gap-2 text-ink-700">
                <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                <span>Rút thù lao về tài khoản ngân hàng</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-xl font-display font-bold text-xs bg-accent hover:bg-accent-hover text-paper-000 flex items-center justify-center gap-2 transition-colors"
            >
              <span>Bắt Đầu Chụp / Tải CCCD</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Bước 2: Chụp CCCD Mặt Trước */}
        {step === 2 && (
          <div className="space-y-4 text-center">
            <h2 className="font-display text-lg font-bold text-ink-900">
              Chụp Mặt Trước CCCD Gắn Chip
            </h2>
            <p className="text-xs text-ink-500">
              Đặt thẻ CCCD ngay ngắn trong khung hình hoặc tải ảnh chụp từ thiết bị
            </p>

            <div className="aspect-[1.58/1] rounded-2xl border-2 border-dashed border-accent bg-paper-100 flex flex-col items-center justify-center p-4 relative overflow-hidden group">
              {(formData.frontPreview || formData.frontUrl) ? (
                <>
                  <img
                    src={formData.frontPreview || formData.frontUrl}
                    alt="Front card preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-ink-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-paper-000">
                    <button
                      type="button"
                      onClick={() => frontInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-accent text-paper-000 font-bold text-xs flex items-center gap-1.5 shadow-[0_8px_20px_-4px_oklch(0_0_0/0.4)]"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Thay đổi ảnh</span>
                    </button>
                  </div>
                </>
              ) : (
                <div 
                  onClick={() => frontInputRef.current?.click()}
                  className="cursor-pointer flex flex-col items-center justify-center p-6 text-center space-y-2"
                >
                  <div className="w-12 h-12 rounded-2xl bg-accent-quiet text-accent flex items-center justify-center">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-ink-900">Chưa có ảnh mặt trước</span>
                  <span className="text-[11px] text-ink-500">Bấm để chụp hoặc tải ảnh từ thiết bị</span>
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => frontInputRef.current?.click()}
                className="px-4 py-2 rounded-xl border border-rule-subtle bg-paper-100 hover:bg-paper-200 text-ink-700 text-xs font-bold flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5 text-accent" />
                <span>{formData.frontPreview || formData.frontUrl ? 'Thay đổi ảnh mặt trước' : 'Tải lên ảnh mặt trước CCCD'}</span>
              </button>
            </div>

            <div className="p-3 bg-paper-100 rounded-xl text-left text-[11px] text-ink-700 space-y-1">
              <div>Họ và tên: <strong className="text-ink-900">{formData.fullName || currentUser?.fullName || 'Chưa cập nhật'}</strong></div>
              <div>Số CCCD: <strong className="font-mono text-ink-900">{formData.idNumber || 'Chưa cập nhật'}</strong></div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 rounded-xl border border-rule-subtle text-xs font-bold text-ink-700 hover:bg-paper-200 transition-colors"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!formData.frontPreview && !formData.frontUrl) {
                    alert('Vui lòng tải lên ảnh mặt trước CCCD.');
                    return;
                  }
                  setStep(3);
                }}
                className="flex-1 py-2.5 rounded-xl font-display font-bold text-xs bg-accent hover:bg-accent-hover text-paper-000 transition-colors"
              >
                Tiếp Tục Mặt Sau
              </button>
            </div>
          </div>
        )}

        {/* Bước 3: Chụp CCCD Mặt Sau */}
        {step === 3 && (
          <div className="space-y-4 text-center">
            <h2 className="font-display text-lg font-bold text-ink-900">
              Chụp Mặt Sau CCCD (Chip Điện Tử)
            </h2>
            <p className="text-xs text-ink-500">
              Chụp rõ phần chip kim loại và mã vạch MRZ ở phía đáy thẻ
            </p>

            <div className="aspect-[1.58/1] rounded-2xl border-2 border-dashed border-accent bg-paper-100 flex flex-col items-center justify-center p-4 relative overflow-hidden group">
              {(formData.backPreview || formData.backUrl) ? (
                <>
                  <img
                    src={formData.backPreview || formData.backUrl}
                    alt="Back card preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-ink-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-paper-000">
                    <button
                      type="button"
                      onClick={() => backInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-accent text-paper-000 font-bold text-xs flex items-center gap-1.5 shadow-[0_8px_20px_-4px_oklch(0_0_0/0.4)]"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Thay đổi ảnh</span>
                    </button>
                  </div>
                </>
              ) : (
                <div 
                  onClick={() => backInputRef.current?.click()}
                  className="cursor-pointer flex flex-col items-center justify-center p-6 text-center space-y-2"
                >
                  <div className="w-12 h-12 rounded-2xl bg-accent-quiet text-accent flex items-center justify-center">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-ink-900">Chưa có ảnh mặt sau</span>
                  <span className="text-[11px] text-ink-500">Bấm để chụp hoặc tải ảnh từ thiết bị</span>
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => backInputRef.current?.click()}
                className="px-4 py-2 rounded-xl border border-rule-subtle bg-paper-100 hover:bg-paper-200 text-ink-700 text-xs font-bold flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5 text-accent" />
                <span>{formData.backPreview || formData.backUrl ? 'Thay đổi ảnh mặt sau' : 'Tải lên ảnh mặt sau CCCD'}</span>
              </button>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 py-2.5 rounded-xl border border-rule-subtle text-xs font-bold text-ink-700 hover:bg-paper-200 transition-colors"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!formData.backPreview && !formData.backUrl) {
                    alert('Vui lòng tải lên ảnh mặt sau CCCD.');
                    return;
                  }
                  setStep(4);
                }}
                className="flex-1 py-2.5 rounded-xl font-display font-bold text-xs bg-accent hover:bg-accent-hover text-paper-000 transition-colors"
              >
                Tiếp Tục Chân Dung
              </button>
            </div>
          </div>
        )}

        {/* Bước 4: Chụp Chân Dung Sinh Trắc Học */}
        {step === 4 && (
          <div className="space-y-4 text-center">
            <h2 className="font-display text-lg font-bold text-ink-900">
              Quét Chân Dung Sinh Trắc Học
            </h2>
            <p className="text-xs text-ink-500">
              Bật Camera quét trực diện khuôn mặt theo chuẩn eKYC để đối chiếu với ảnh trên thẻ CCCD.
            </p>

            <div className="w-44 h-44 rounded-full mx-auto border-4 border-accent overflow-hidden relative group bg-paper-100 flex items-center justify-center shadow-[0_8px_25px_-5px_oklch(0_0_0/0.15)]">
              {(formData.facePreview || formData.faceUrl) ? (
                <>
                  <img
                    src={formData.facePreview || formData.faceUrl}
                    alt="Ảnh chân dung sinh trắc học"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-ink-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setIsFaceScannerOpen(true)}
                      className="p-3 rounded-full bg-accent text-paper-000 shadow-[0_8px_20px_-4px_oklch(0_0_0/0.4)] hover:scale-110 transition-transform"
                      title="Quét lại khuôn mặt"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <div 
                  onClick={() => setIsFaceScannerOpen(true)}
                  className="cursor-pointer flex flex-col items-center justify-center p-4 text-center hover:opacity-80 transition-opacity"
                >
                  <div className="w-12 h-12 rounded-full bg-accent-quiet text-accent flex items-center justify-center mb-1.5 animate-pulse">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-ink-900">Chưa quét mặt</span>
                  <span className="text-[10px] text-accent font-semibold mt-0.5">Bấm để mở Camera</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setIsFaceScannerOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-paper-000 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors elevation-rich"
              >
                <Camera className="w-4 h-4" />
                <span>{formData.facePreview || formData.faceUrl ? 'Quét / Chụp lại khuôn mặt' : 'Bật Camera Quét Mặt Ngay'}</span>
              </button>

              <button
                type="button"
                onClick={() => faceInputRef.current?.click()}
                className="text-[11px] text-ink-500 hover:text-ink-700 underline py-1 px-2"
              >
                Tải ảnh từ tệp nếu camera lỗi
              </button>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-2.5 rounded-xl border border-rule-subtle text-xs font-bold text-ink-700 hover:bg-paper-200 transition-colors"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!formData.facePreview && !formData.faceUrl) {
                    alert('Vui lòng quét mặt hoặc tải ảnh chân dung sinh trắc học trước khi hoàn tất.');
                    return;
                  }
                  handleFinish();
                }}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl font-display font-bold text-xs bg-accent hover:bg-accent-hover text-paper-000 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Đang Gửi Hồ Sơ...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Hoàn Tất Gửi Hồ Sơ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Bước 5: Đang chờ duyệt */}
        {step === 5 && (
          <div className="space-y-4 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-accent-quiet text-accent flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <span className="font-mono text-[10px] text-accent font-bold px-3 py-1 rounded-full bg-accent-quiet uppercase tracking-wider inline-block">
              HỒ SƠ ĐANG ĐƯỢC XÉT DUYỆT
            </span>
            <h2 className="font-display text-xl font-bold text-ink-900">
              Hồ Sơ Đang Trong Hàng Đợi Duyệt
            </h2>
            <p className="text-xs text-ink-500 leading-relaxed max-w-sm mx-auto">
              Hồ sơ CCCD của bạn đã được tiếp nhận. Quyền nhận việc sẽ được mở sau khi hồ sơ được duyệt.
            </p>

            <Link
              href="/looker"
              className="inline-flex w-full py-3 rounded-xl font-display font-bold text-xs bg-paper-200 hover:bg-paper-300 text-ink-900 items-center justify-center gap-2 transition-colors"
            >
              <span>Về Bảng Tin Nhận Việc</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Bước 6: Đã duyệt */}
        {step === 6 && (
          <div className="space-y-4 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-accent/20 text-accent flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <span className="font-mono text-[10px] text-accent font-bold px-3 py-1 rounded-full bg-accent-quiet uppercase tracking-wider inline-block">
              HỒ SƠ ĐÃ ĐƯỢC DUYỆT
            </span>
            <h2 className="font-display text-xl font-bold text-ink-900">
              Hồ Sơ Định Danh Đã Được Phê Duyệt!
            </h2>
            <p className="text-xs text-ink-500 leading-relaxed max-w-sm mx-auto">
              Bạn đã đủ điều kiện nhận mọi nhiệm vụ thực địa và rút thù lao về tài khoản ngân hàng.
            </p>

            <Link
              href="/looker"
              className="inline-flex w-full py-3 rounded-xl font-display font-bold text-xs bg-accent hover:bg-accent-hover text-paper-000 items-center justify-center gap-2 transition-colors"
            >
              <span>Khám Phá Việc Làm Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      <div className="text-center text-[11px] text-ink-500 mt-4">
        Hồ sơ định danh được lưu trữ bảo mật và tuân thủ quy định bảo vệ dữ liệu cá nhân.
      </div>

      {/* Modal Quét Mặt Sinh Trắc Học */}
      <FaceScannerModal
        isOpen={isFaceScannerOpen}
        onClose={() => setIsFaceScannerOpen(false)}
        onCaptureComplete={handleFaceCaptured}
      />
    </div>
  );
}
