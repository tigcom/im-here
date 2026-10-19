'use client';

import { useState, useRef } from 'react';
import { 
  ShieldCheck, 
  AlertCircle, 
  UploadCloud, 
  ArrowRight, 
  Lock, 
  Clock, 
  FileCheck2,
  RefreshCw,
  Camera,
  Upload,
  Image as ImageIcon,
  LogOut,
  Sparkles,
  Check
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import api from '@/lib/api';
import FaceScannerModal from '@/components/kyc/FaceScannerModal';

export default function ClientKycGate({ onApproved }) {
  const { currentUser, refreshUser, logout } = useAuth();
  
  const [formData, setFormData] = useState({
    idNumber: '',
    fullName: currentUser?.fullName || '',
    frontUrl: '',
    backUrl: '',
    faceUrl: '',
    facePreview: '',
  });

  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);
  const [isFaceScannerOpen, setIsFaceScannerOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [localStatus, setLocalStatus] = useState(null);

  const kycStatus = localStatus || currentUser?.kycStatus || 'CHUA_NOP';

  // Xử lý chọn/tải ảnh thật từ thiết bị
  const handleFileChange = async (e, side) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Xem trước cục bộ ngay lập tức
    const previewUrl = URL.createObjectURL(file);
    if (side === 'front') {
      setFormData(prev => ({ ...prev, frontUrl: previewUrl }));
    } else {
      setFormData(prev => ({ ...prev, backUrl: previewUrl }));
    }

    // Tải lên backend server
    try {
      const purpose = side === 'front' ? 'KYC_FRONT' : 'KYC_BACK';
      const res = await api.upload.file(file, { purpose }).catch(() => null);
      const serverUrl = res?.data?.url || res?.url || res?.fullUrl;
      if (serverUrl) {
        if (side === 'front') {
          setFormData(prev => ({ ...prev, frontUrl: serverUrl }));
        } else {
          setFormData(prev => ({ ...prev, backUrl: serverUrl }));
        }
      }
    } catch (err) {
      console.warn('Lỗi tải file lên server:', err);
    }
  };

  const handleFaceCaptured = async ({ file, previewUrl }) => {
    setFormData(prev => ({ ...prev, facePreview: previewUrl }));
    try {
      const res = await api.upload.file(file, { purpose: 'KYC_FACE' }).catch(() => null);
      const serverUrl = res?.data?.url || res?.url || res?.fullUrl || previewUrl;
      setFormData(prev => ({ ...prev, faceUrl: serverUrl }));
    } catch (err) {
      console.warn('Lỗi tải ảnh quét mặt lên server:', err);
    }
  };

  // Nộp hồ sơ KYC Người thuê
  const handleSubmitKyc = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.idNumber.trim()) {
      setErrorMessage('Vui lòng nhập số CCCD hoặc Mã số thuế.');
      return;
    }

    if (!formData.frontUrl || !formData.backUrl) {
      setErrorMessage('Vui lòng tải lên đủ ảnh mặt trước và mặt sau CCCD.');
      return;
    }

    if (!formData.faceUrl && !formData.facePreview) {
      setErrorMessage('Vui lòng bật Camera và quét mặt xác thực sinh trắc học.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Gửi hồ sơ lên backend; trạng thái chỉ cập nhật theo dữ liệu trả về từ server.
      const me = await api.auth.me().catch(() => null);
      const targetUserId = me?.id || currentUser?.id;
      if (!targetUserId) throw new Error('Không xác định được tài khoản cần nộp KYC.');

      await api.users.submitKyc({
        userId: targetUserId,
        frontUrl: formData.frontUrl,
        backUrl: formData.backUrl,
        faceUrl: formData.faceUrl || formData.facePreview,
        idCardNumber: formData.idNumber.trim(),
      });

      if (refreshUser) {
        await refreshUser().catch(() => null);
      }
      const updatedUser = await api.auth.me().catch(() => null);
      setLocalStatus(updatedUser?.kycStatus || 'CHO_DUYET');
    } catch (err) {
      console.warn('Lỗi nộp KYC Client:', err);
      setErrorMessage('Không thể nộp hồ sơ lúc này. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Kiểm tra lại trạng thái hồ sơ sau khi Admin xét duyệt
  const handleRefreshStatus = async () => {
    setIsCheckingStatus(true);
    setErrorMessage('');
    try {
      if (refreshUser) {
        await refreshUser().catch(() => null);
      }
      const me = await api.auth.me().catch(() => null);
      const currentStatus = me?.kycStatus || currentUser?.kycStatus;
      if (currentStatus === 'DA_DUYET') {
        setLocalStatus('DA_DUYET');
        if (onApproved) onApproved();
      } else if (currentStatus === 'TU_CHOI') {
        setLocalStatus('TU_CHOI');
      }
    } catch (err) {
      console.warn('Lỗi kiểm tra trạng thái KYC:', err);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-paper-000 rounded-3xl border border-rule-strong shadow-[0_16px_40px_oklch(0_0_0/0.08)] p-6 sm:p-9 relative overflow-hidden">
        {/* Thanh người dùng & Nút Đăng xuất cho Người tạo */}
        <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-rule-subtle text-xs">
          <div className="flex items-center gap-2 text-ink-700">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="truncate max-w-[220px]">
              Tài khoản: <strong className="text-ink-900">{currentUser?.fullName || currentUser?.name || currentUser?.email || 'Người tạo'}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-danger/30 text-danger hover:bg-danger/10 font-semibold text-[11px] transition-colors"
            title="Đăng xuất khỏi tài khoản này"
          >
            <LogOut className="w-3 h-3" />
            <span>Đăng xuất</span>
          </button>
        </div>
        {/* Vệt sáng trang trí ngọc Emerald dịu chuẩn Fintech Paper */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        {/* TRẠNG THÁI 1: CHƯA NỘP HỒ SƠ (CHUA_NOP) */}
        {kycStatus === 'CHUA_NOP' && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-accent-quiet text-accent border border-accent/20 flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <span className="font-mono text-[10px] font-bold text-accent uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-accent-quiet border border-accent/20 inline-block mb-1">
                  XÁC MINH TRƯỚC KHI ĐĂNG TIN
                </span>
                <h2 className="font-display text-xl font-bold text-ink-900">
                  Xác Thực Hồ Sơ Định Danh Người Thuê
                </h2>
              </div>
            </div>

            <p className="text-xs text-ink-500 leading-relaxed mb-6">
              Để bảo vệ an toàn dòng tiền ký quỹ và ngăn chặn việc tạo tin ảo, tất cả Người thuê việc (Cá nhân hoặc Doanh nghiệp) đều phải xác thực thông tin định danh trước khi đăng tin hoặc sử dụng tính năng trên hệ thống.
            </p>

            <form onSubmit={handleSubmitKyc} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1">
                  Họ và tên người đại diện *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="VD: Trần Hoàng Nam"
                  className="w-full px-3.5 py-2.5 bg-paper-100 border border-rule-subtle focus:border-accent rounded-xl text-sm font-semibold text-ink-900 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1">
                  Số CCCD / Hộ chiếu / Mã số thuế *
                </label>
                <input
                  type="text"
                  required
                  value={formData.idNumber}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                  placeholder="Nhập số giấy tờ"
                  className="w-full px-3.5 py-2.5 bg-paper-100 border border-rule-subtle focus:border-accent rounded-xl text-sm font-semibold text-ink-900 focus:outline-none font-mono transition-colors"
                />
              </div>

              {/* Ẩn file input để kích hoạt khi click */}
              <input
                ref={frontInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, 'front')}
              />
              <input
                ref={backInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, 'back')}
              />

              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-semibold text-ink-700">Ảnh giấy tờ CCCD (2 mặt) *</span>

                <div className="grid grid-cols-2 gap-3">
                  {/* Mặt trước */}
                  <div 
                    onClick={() => frontInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-colors relative overflow-hidden group ${
                      formData.frontUrl ? 'border-accent bg-accent/5' : 'border-rule-subtle bg-paper-100 hover:border-accent/60'
                    }`}
                  >
                    <span className="text-[11px] font-semibold text-ink-700 block mb-1">Mặt trước CCCD</span>
                    <div className="h-20 rounded-lg bg-paper-200 overflow-hidden relative flex flex-col items-center justify-center">
                      {formData.frontUrl ? (
                        <>
                          <img src={formData.frontUrl} alt="CCCD Front" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-ink-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-[10px] text-paper-000 font-bold bg-accent px-2 py-1 rounded">Đổi ảnh</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-ink-400 p-1">
                          <Upload className="w-5 h-5 mb-1 text-ink-400 group-hover:text-accent transition-colors" />
                          <span className="text-[10px] font-medium">Bấm để tải ảnh</span>
                        </div>
                      )}
                    </div>
                    <span className={`text-[10px] font-medium mt-1 inline-block ${formData.frontUrl ? 'text-accent' : 'text-ink-400'}`}>
                      {formData.frontUrl ? '✓ Đã chọn ảnh' : 'Chưa có ảnh'}
                    </span>
                  </div>

                  {/* Mặt sau */}
                  <div 
                    onClick={() => backInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-colors relative overflow-hidden group ${
                      formData.backUrl ? 'border-accent bg-accent/5' : 'border-rule-subtle bg-paper-100 hover:border-accent/60'
                    }`}
                  >
                    <span className="text-[11px] font-semibold text-ink-700 block mb-1">Mặt sau CCCD</span>
                    <div className="h-20 rounded-lg bg-paper-200 overflow-hidden relative flex flex-col items-center justify-center">
                      {formData.backUrl ? (
                        <>
                          <img src={formData.backUrl} alt="CCCD Back" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-ink-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-[10px] text-paper-000 font-bold bg-accent px-2 py-1 rounded">Đổi ảnh</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-ink-400 p-1">
                          <Upload className="w-5 h-5 mb-1 text-ink-400 group-hover:text-accent transition-colors" />
                          <span className="text-[10px] font-medium">Bấm để tải ảnh</span>
                        </div>
                      )}
                    </div>
                    <span className={`text-[10px] font-medium mt-1 inline-block ${formData.backUrl ? 'text-accent' : 'text-ink-400'}`}>
                      {formData.backUrl ? '✓ Đã chọn ảnh' : 'Chưa có ảnh'}
                    </span>
                  </div>
                </div>
              </div>

              {/* BẮT BUỘC: Quét mặt chân dung sinh trắc học */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink-700">Xác thực chân dung sinh trắc học (Quét mặt) *</span>
                  <span className="text-[10px] text-accent font-medium">Chuẩn eKYC</span>
                </div>

                <div 
                  onClick={() => setIsFaceScannerOpen(true)}
                  className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-colors relative overflow-hidden group flex items-center justify-between gap-3 ${
                    formData.faceUrl || formData.facePreview ? 'border-accent bg-accent/5' : 'border-rule-subtle bg-paper-100 hover:border-accent/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-paper-200 overflow-hidden relative flex-shrink-0 flex items-center justify-center border border-rule-subtle">
                      {(formData.facePreview || formData.faceUrl) ? (
                        <img 
                          src={formData.facePreview || formData.faceUrl} 
                          alt="Ảnh quét mặt" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <Camera className="w-5 h-5 text-accent animate-pulse" />
                      )}
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-ink-900 block">
                        {(formData.facePreview || formData.faceUrl) ? 'Đã quét khuôn mặt thành công' : 'Bật Camera Quét Mặt Trực Tiếp'}
                      </span>
                      <span className="text-[11px] text-ink-500">
                        {(formData.facePreview || formData.faceUrl) ? 'Bấm để quét hoặc chụp lại' : 'Nhìn thẳng vào camera để đối soát với CCCD'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFaceScannerOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-accent text-paper-000 text-xs font-bold flex items-center gap-1 shrink-0 hover:bg-accent-hover transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{(formData.facePreview || formData.faceUrl) ? 'Quét lại' : 'Quét mặt'}</span>
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl font-display font-bold text-sm bg-accent hover:bg-accent-hover text-paper-000 flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 mt-2 shadow-[0_4px_16px_oklch(0.68_0.198_152/0.25)]"
              >
                {isSubmitting ? (
                  <span>Đang gửi hồ sơ xét duyệt...</span>
                ) : (
                  <>
                    <FileCheck2 className="w-4 h-4" />
                    <span>Nộp Hồ Sơ Xác Thực Danh Tính</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* TRẠNG THÁI 2: ĐANG CHỜ DUYỆT (CHO_DUYET) */}
        {kycStatus === 'CHO_DUYET' && (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-accent-quiet text-accent border border-accent/20 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 animate-pulse text-accent" />
            </div>

            <span className="font-mono text-[10px] text-accent font-bold px-3 py-1 rounded-full bg-accent-quiet border border-accent/20 uppercase tracking-wider inline-block">
              HỒ SƠ ĐANG ĐƯỢC XÉT DUYỆT
            </span>

            <h2 className="font-display text-xl font-bold text-ink-900">
              Hồ Sơ Đang Trong Hàng Đợi Xét Duyệt
            </h2>

            <p className="text-xs text-ink-500 leading-relaxed max-w-md mx-auto">
              Hồ sơ định danh của bạn đã được tiếp nhận. Các chức năng đăng tin và quản lý ví sẽ mở sau khi hồ sơ được duyệt.
            </p>

            <div className="mt-6 pt-5 border-t border-rule-subtle space-y-4">
              <button
                type="button"
                onClick={handleRefreshStatus}
                disabled={isCheckingStatus}
                className="w-full py-3 px-4 rounded-xl bg-paper-200 hover:bg-paper-300 text-ink-900 text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                <span>{isCheckingStatus ? 'Đang kiểm tra...' : 'Kiểm Tra Lại Trạng Thái Hồ Sơ'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TRẠNG THÁI 3: BỊ TỪ CHỐI (TU_CHOI) */}
        {kycStatus === 'TU_CHOI' && (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-accent-red/15 text-accent-red flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>

            <span className="font-mono text-[10px] text-accent-red font-bold px-3 py-1 rounded-full bg-accent-red/10 uppercase tracking-wider inline-block">
              TRẠNG THÁI: HỒ SƠ BỊ TỪ CHỐI (TU_CHOI)
            </span>

            <h2 className="font-display text-xl font-bold text-ink-900">
              Hồ Sơ Xác Thực Cần Bổ Sung
            </h2>

            <div className="p-3.5 rounded-xl bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs text-left">
              <strong>Lý do hồ sơ chưa được duyệt:</strong>
              <p className="mt-1">{currentUser?.rejectionReason || 'Thông tin giấy tờ không rõ ràng hoặc không khớp với thông tin tài khoản.'}</p>
            </div>

            <button
              type="button"
              onClick={() => {
                setLocalStatus('CHUA_NOP');
              }}
              className="w-full py-3 px-4 rounded-xl bg-accent text-paper-000 text-xs font-bold hover:bg-accent-hover transition-colors shadow-[0_4px_16px_oklch(0.68_0.198_152/0.25)]"
            >
              Nộp Lại Hồ Sơ Mới
            </button>
          </div>
        )}
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
