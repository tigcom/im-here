'use client';

import { useState, useEffect } from 'react';
import { 
  Check, 
  ShieldCheck, 
  FileCheck2, 
  Star, 
  Maximize2, 
  Eye, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  User,
  X 
} from 'lucide-react';
import { getLookers, getWalletByOwner } from '@/lib/data';
import { KYC_STATUS, KYC_STATUS_LABEL } from '@/lib/constants';
import { formatVnd, formatRating } from '@/lib/format';
import Skeleton from '@/components/common/Skeleton';
import SyncBadge from '@/components/common/SyncBadge';
import api from '@/lib/api';

const DEFAULT_FRONT_IMAGE = null;
const DEFAULT_BACK_IMAGE = null;
const DEFAULT_FACE_IMAGE = null;

function resolveImageUrl(url, fallback) {
  if (!url || typeof url !== 'string' || !url.trim()) return fallback;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  return api.getFileUrl ? api.getFileUrl(url) : url;
}

function useModalA11y(isOpen, onClose) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);
}

/** Dựng state cục bộ từ tầng dữ liệu — không còn mảng looker gõ cứng. */
function buildLookers() {
  return getLookers().map((u) => {
    return {
      id: u.id,
      name: u.name,
      phone: u.phone,
      province: u.province,
      kycStatus: u.kyc?.status || KYC_STATUS.NOT_SUBMITTED,
      isLocked: u.isLocked,
      idCardNumber: u.kyc?.idCardNumber || null,
      idCardFrontUrl: resolveImageUrl(u.kyc?.frontUrl, null),
      idCardBackUrl: resolveImageUrl(u.kyc?.backUrl, null),
      faceUrl: resolveImageUrl(u.kyc?.faceUrl, null),
      rating: u.rating,
      completedCount: u.stats?.completedCount || 0,
      approvalRate: u.stats?.approvalRate || 0,
      balance: getWalletByOwner(u.id)?.available ?? 0,
    };
  });
}

export default function AdminWorkforcePage() {
  const [lookers, setLookers] = useState([]);
  const [selectedLooker, setSelectedLooker] = useState(null);
  const [filterKyc, setFilterKyc] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [rejectModalLooker, setRejectModalLooker] = useState(null);
  const [rejectReason, setRejectReason] = useState('Ảnh CCCD bị mờ, không rõ số hoặc họ tên');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  useModalA11y(Boolean(selectedLooker), () => setSelectedLooker(null));
  useModalA11y(Boolean(rejectModalLooker), () => setRejectModalLooker(null));
  useModalA11y(Boolean(lightboxImage), () => setLightboxImage(null));

  const fetchLookers = async () => {
    setIsLoading(true);
    try {
      const users = await api.admin.getUsers();
      if (users && Array.isArray(users)) {
        const mapped = users.map((u) => {
          const effectiveStatus = u.kycStatus === 'CHO_DUYET'
            ? KYC_STATUS.PENDING_REVIEW
            : u.kycStatus === 'DA_DUYET'
            ? KYC_STATUS.VERIFIED
            : u.kycStatus === 'TU_CHOI'
            ? KYC_STATUS.REJECTED
            : KYC_STATUS.NOT_SUBMITTED;

          return {
            id: u.id,
            name: u.fullName || u.email,
            email: u.email,
            phone: u.phone || '—',
            province: u.workingArea || 'Hà Nội',
            kycStatus: effectiveStatus,
            isLocked: u.status === 'BLOCKED',
            idCardNumber: u.idCardNumber || null,
            idCardFrontUrl: resolveImageUrl(u.idCardFrontUrl, null),
            idCardBackUrl: resolveImageUrl(u.idCardBackUrl, null),
            faceUrl: resolveImageUrl(u.faceUrl || u.avatarUrl, null),
            rating: u.ratingScore ?? null,
            completedCount: u.completedTasksCount || 0,
            approvalRate: u.completionRate ?? null,
            balance: 0,
          };
        });
        setLookers(mapped);
        return;
      }
    } catch (e) {
      console.error('Lỗi lấy danh sách user từ API admin:', e);
      setLookers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLookers();
  }, []);

  // Duyệt hồ sơ định danh — cập nhật UI và đồng bộ Backend API
  const handleApproveKyc = async (id) => {
    setIsSubmittingReview(true);
    try {
      const numId = Number(String(id).replace(/\D/g, '')) || id;
      await api.admin.reviewKyc(numId, 'DA_DUYET');
      await fetchLookers();
      setSelectedLooker(null);
    } catch (e) {
      console.error('API reviewKyc error:', e);
      alert(e.message || 'Không thể duyệt hồ sơ. Vui lòng kiểm tra lại quyền Admin hoặc trạng thái hồ sơ.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Mở modal bắt buộc nhập lý do từ chối theo BRD
  const handleOpenRejectModal = (looker) => {
    setRejectModalLooker(looker);
    setRejectReason('Ảnh CCCD bị mờ, không rõ số hoặc họ tên');
  };

  // Xác nhận từ chối với lý do cụ thể
  const handleConfirmRejectKyc = async () => {
    if (!rejectModalLooker) return;
    setIsSubmittingReview(true);
    try {
      const numId = Number(String(rejectModalLooker.id).replace(/\D/g, '')) || rejectModalLooker.id;
      await api.admin.reviewKyc(numId, 'TU_CHOI', rejectReason || 'Ảnh CCCD không hợp lệ');
      await fetchLookers();
      setRejectModalLooker(null);
      setSelectedLooker(null);
    } catch (e) {
      console.error('API reviewKyc error:', e);
      alert(e.message || 'Không thể từ chối hồ sơ. Vui lòng thử lại.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Khoá / mở khoá tài khoản — đồng bộ backend API
  const handleToggleLock = async (id) => {
    const target = lookers.find((l) => l.id === id);
    if (!target) return;
    const newStatus = target.isLocked ? 'ACTIVE' : 'BLOCKED';
    try {
      const numId = Number(String(id).replace(/\D/g, '')) || id;
      await api.admin.updateUserStatus(numId, newStatus);
      await fetchLookers();
      setSelectedLooker(null);
    } catch (e) {
      console.error('API updateUserStatus error:', e);
      alert(e.message || 'Không thể cập nhật trạng thái khoá tài khoản.');
    }
  };

  const filtered = lookers.filter((l) => {
    if (filterKyc === 'ALL') return true;
    if (filterKyc === 'LOCKED') return l.isLocked;
    return l.kycStatus === filterKyc && !l.isLocked;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-on-surface-900">
              Quản Lý Người Nhận Việc &amp; Duyệt Hồ Sơ
            </h1>
            <SyncBadge dark isSyncing={isLoading} label="Đang nạp..." idleLabel="Hồ sơ trực tiếp" />
          </div>
          <p className="text-xs text-on-surface-500 mt-0.5">
            Xét duyệt ảnh CCCD hai mặt và đối soát sinh trắc học — duyệt hồ sơ là điều kiện duy nhất để nhận việc
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: 'ALL', label: 'Tất Cả' },
            { id: KYC_STATUS.PENDING_REVIEW, label: 'Chờ Duyệt' },
            { id: KYC_STATUS.VERIFIED, label: 'Đã Duyệt' },
            { id: KYC_STATUS.REJECTED, label: 'Bị Từ Chối' },
            { id: 'LOCKED', label: 'Tài Khoản Khóa' },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setFilterKyc(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filterKyc === st.id
                  ? 'bg-accent text-paper-000'
                  : 'bg-surface-800 text-on-surface-500 hover:text-on-surface-900'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Looker */}
      <div className="p-5 rounded-[24px] bg-surface-900 border border-rule-dark overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-rule-dark text-on-surface-500 font-mono uppercase text-[10px]">
              <th className="pb-3 font-semibold">Người nhận việc</th>
              <th className="pb-3 font-semibold">Tỉnh Thành</th>
              <th className="pb-3 font-semibold">Trạng Thái</th>
              <th className="pb-3 font-semibold">Đánh Giá</th>
              <th className="pb-3 font-semibold">Đã Làm</th>
              <th className="pb-3 font-semibold">Số Dư Ví</th>
              <th className="pb-3 font-semibold text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule-dark">
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 pr-4">
                    <Skeleton dark variant="text" className="w-32 h-4 mb-1" />
                    <Skeleton dark variant="text" className="w-24 h-3" />
                  </td>
                  <td className="py-4 pr-4">
                    <Skeleton dark variant="text" className="w-20 h-4" />
                  </td>
                  <td className="py-4 pr-4">
                    <Skeleton dark variant="rectangular" className="w-24 h-5 rounded-full" />
                  </td>
                  <td className="py-4 pr-4">
                    <Skeleton dark variant="text" className="w-12 h-4" />
                  </td>
                  <td className="py-4 pr-4">
                    <Skeleton dark variant="text" className="w-16 h-4" />
                  </td>
                  <td className="py-4 pr-4">
                    <Skeleton dark variant="text" className="w-24 h-4" />
                  </td>
                  <td className="py-4 text-right">
                    <Skeleton dark variant="rectangular" className="w-20 h-7 rounded-lg ml-auto" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-on-surface-500">
                  Không tìm thấy người nhận việc nào phù hợp với bộ lọc
                </td>
              </tr>
            ) : (
              filtered.map((lk) => (
                <tr key={lk.id} className="hover:bg-surface-800/40 transition-colors animate-render-reveal">
                <td className="py-3.5 pr-4">
                  <div className="font-bold text-on-surface-900">{lk.name}</div>
                  <div className="font-mono text-[10px] text-on-surface-500">{lk.id} • {lk.phone}</div>
                </td>
                <td className="py-3.5 pr-4 text-on-surface-700">
                  {lk.province}
                </td>
                <td className="py-3.5 pr-4">
                  {lk.isLocked ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-danger/20 text-danger">
                      Tài khoản bị khóa
                    </span>
                  ) : (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        lk.kycStatus === KYC_STATUS.VERIFIED
                          ? 'bg-accent/20 text-accent'
                          : lk.kycStatus === KYC_STATUS.PENDING_REVIEW
                          ? 'bg-accent-amber/20 text-accent-amber animate-pulse'
                          : 'bg-surface-800 text-on-surface-500'
                      }`}
                    >
                      {KYC_STATUS_LABEL[lk.kycStatus] || lk.kycStatus}
                    </span>
                  )}
                </td>
                <td className="py-3.5 pr-4">
                  <div className="flex items-center gap-1 font-bold text-accent">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {lk.rating != null && lk.completedCount > 0 ? formatRating(lk.rating) : 'Mới'}
                  </div>
                  <div className="text-[10px] text-on-surface-500 font-mono">
                    {lk.approvalRate != null && lk.completedCount > 0 ? `Xác nhận ${lk.approvalRate}%` : 'Chưa có tỷ lệ'}
                  </div>
                </td>
                <td className="py-3.5 pr-4 font-mono font-bold text-on-surface-900">
                  {lk.completedCount} việc
                </td>
                <td className="py-3.5 pr-4 font-mono text-accent">
                  {formatVnd(lk.balance)}
                </td>
                <td className="py-3.5 text-right space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedLooker(lk)}
                    className="px-3 py-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-on-surface-900 font-bold text-[11px] transition-colors"
                  >
                    Xem Hồ Sơ
                  </button>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>

      {/* Modal Xem Hồ Sơ & Duyệt */}
      {selectedLooker && (
        <div
          onClick={() => setSelectedLooker(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/80 backdrop-blur-sm overflow-y-auto"
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="p-6 rounded-[24px] bg-surface-900 border border-rule-dark max-w-2xl w-full space-y-5 text-xs text-on-surface-900 my-8 shadow-[0_20px_50px_-15px_oklch(0_0_0/0.7)]"
          >
            <div className="flex items-center justify-between border-b border-rule-dark pb-3">
              <div>
                <span className="font-mono text-[10px] text-accent font-bold uppercase tracking-wider">
                  THẨM ĐỊNH HỒ SƠ ĐỊNH DANH (CCCD & SINH TRẮC HỌC)
                </span>
                <h3 className="font-display text-lg font-bold text-on-surface-900 mt-0.5">
                  {selectedLooker.name} ({selectedLooker.id})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLooker(null)}
                className="text-on-surface-500 hover:text-on-surface-900 p-1.5 rounded-lg hover:bg-surface-800 transition-colors"
                aria-label="Đóng modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 bg-surface-800 rounded-xl space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex justify-between border-b border-rule-dark/50 pb-1">
                      <span className="text-on-surface-500">Số CCCD / Định danh:</span>
                      <span className="font-mono font-bold text-accent">{selectedLooker.idCardNumber || '—'}</span>
                    </div>
                    <div className="flex justify-between border-b border-rule-dark/50 pb-1">
                      <span className="text-on-surface-500">Số điện thoại liên kết:</span>
                      <span className="font-mono font-bold text-on-surface-900">{selectedLooker.phone}</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex justify-between border-b border-rule-dark/50 pb-1">
                      <span className="text-on-surface-500">Trạng thái hiện tại:</span>
                      <span className="font-mono font-bold text-accent">
                        {KYC_STATUS_LABEL[selectedLooker.kycStatus] || selectedLooker.kycStatus}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-rule-dark/50 pb-1">
                      <span className="text-on-surface-500">Khu vực hoạt động:</span>
                      <span className="font-mono font-bold text-on-surface-900">{selectedLooker.province || 'Hà Nội'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* KHU VỰC HÌNH ẢNH CCCD & SINH TRẮC HỌC THỰC TẾ */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-on-surface-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-accent" />
                    <span>Hình Ảnh Giấy Tờ Đối Soát (Bấm vào ảnh để phóng to)</span>
                  </span>
                  <span className="text-[10px] text-accent font-mono">
                    3 ảnh kiểm duyệt
                  </span>
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                  {/* 1. Mặt trước CCCD */}
                  <div className="flex-1 min-w-0 bg-surface-950 p-2.5 rounded-2xl border border-rule-dark flex flex-col justify-between group">
                    <div className="flex items-center justify-between mb-1.5 px-0.5">
                      <span className="text-[11px] font-bold text-on-surface-900">Mặt trước CCCD</span>
                      <span className="text-[9px] font-mono text-accent bg-accent/15 px-1.5 py-0.5 rounded">Gắn chip</span>
                    </div>
                    <div 
                      onClick={() => setLightboxImage({ url: selectedLooker.idCardFrontUrl, title: `CCCD Mặt Trước — ${selectedLooker.name}` })}
                      className="aspect-[1.58/1] rounded-xl overflow-hidden relative border border-rule-dark bg-surface-900 cursor-pointer group-hover:border-accent transition-colors"
                    >
                      <img
                        src={selectedLooker.idCardFrontUrl}
                        alt="CCCD Mặt trước"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-200"
                        onError={(e) => { e.currentTarget.src = DEFAULT_FRONT_IMAGE; }}
                      />
                      <div className="absolute inset-0 bg-ink-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-paper-000 text-[11px] font-bold">
                        <Maximize2 className="w-4 h-4" />
                        <span>Xem lớn</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-on-surface-500 text-center mt-1.5 truncate">
                      Số: {selectedLooker.idCardNumber}
                    </span>
                  </div>

                  {/* 2. Mặt sau CCCD */}
                  <div className="flex-1 min-w-0 bg-surface-950 p-2.5 rounded-2xl border border-rule-dark flex flex-col justify-between group">
                    <div className="flex items-center justify-between mb-1.5 px-0.5">
                      <span className="text-[11px] font-bold text-on-surface-900">Mặt sau CCCD</span>
                      <span className="text-[9px] font-mono text-accent bg-accent/15 px-1.5 py-0.5 rounded">MRZ & Chip</span>
                    </div>
                    <div 
                      onClick={() => setLightboxImage({ url: selectedLooker.idCardBackUrl, title: `CCCD Mặt Sau — ${selectedLooker.name}` })}
                      className="aspect-[1.58/1] rounded-xl overflow-hidden relative border border-rule-dark bg-surface-900 cursor-pointer group-hover:border-accent transition-colors"
                    >
                      <img
                        src={selectedLooker.idCardBackUrl}
                        alt="CCCD Mặt sau"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-200"
                        onError={(e) => { e.currentTarget.src = DEFAULT_BACK_IMAGE; }}
                      />
                      <div className="absolute inset-0 bg-ink-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-paper-000 text-[11px] font-bold">
                        <Maximize2 className="w-4 h-4" />
                        <span>Xem lớn</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-on-surface-500 text-center mt-1.5">
                      Mã vạch và vân tay
                    </span>
                  </div>

                  {/* 3. Chân dung đối chiếu sinh trắc học */}
                  <div className="flex-1 min-w-0 bg-surface-950 p-2.5 rounded-2xl border border-rule-dark flex flex-col justify-between group">
                    <div className="flex items-center justify-between mb-1.5 px-0.5">
                      <span className="text-[11px] font-bold text-on-surface-900">Sinh trắc học</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                        selectedLooker.faceUrl ? 'text-accent bg-accent/15' : 'text-danger bg-danger/15'
                      }`}>
                        {selectedLooker.faceUrl ? 'Đã quét mặt' : 'Chưa quét'}
                      </span>
                    </div>
                    {selectedLooker.faceUrl ? (
                      <div 
                        onClick={() => setLightboxImage({ url: selectedLooker.faceUrl, title: `Chân Dung Sinh Trắc Học — ${selectedLooker.name}` })}
                        className="aspect-[1.58/1] rounded-xl overflow-hidden relative border border-rule-dark bg-surface-900 cursor-pointer group-hover:border-accent transition-colors flex items-center justify-center"
                      >
                        <img
                          src={selectedLooker.faceUrl}
                          alt="Chân dung đối chiếu sinh trắc học"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-200"
                        />
                        <div className="absolute inset-0 bg-ink-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-paper-000 text-[11px] font-bold">
                          <Maximize2 className="w-4 h-4" />
                          <span>Xem lớn</span>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-[1.58/1] rounded-xl border border-dashed border-danger/40 bg-danger/5 flex flex-col items-center justify-center p-2 text-center">
                        <AlertCircle className="w-6 h-6 text-danger mb-1" />
                        <span className="text-[11px] font-bold text-danger">Chưa có ảnh quét mặt</span>
                        <span className="text-[9px] text-on-surface-500">Hồ sơ thiếu sinh trắc học</span>
                      </div>
                    )}
                    <span className={`text-[10px] text-center mt-1.5 font-bold ${
                      selectedLooker.faceUrl ? 'text-accent' : 'text-danger'
                    }`}>
                      {selectedLooker.faceUrl ? '✓ Đã quét mặt qua Camera' : '⚠ Thiếu ảnh đối soát khuôn mặt'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-rule-dark flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleToggleLock(selectedLooker.id)}
                className="px-4 py-2 rounded-xl border border-danger/40 text-danger hover:bg-danger/20 font-bold transition-colors"
              >
                {selectedLooker.isLocked ? 'Mở Khóa Tài Khoản' : 'Tạm Khóa Tài Khoản'}
              </button>

              {selectedLooker.kycStatus === KYC_STATUS.PENDING_REVIEW ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenRejectModal(selectedLooker)}
                    className="px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-danger font-bold transition-colors"
                  >
                    Từ Chối
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApproveKyc(selectedLooker.id)}
                    disabled={isSubmittingReview}
                    className="px-5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-paper-000 font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-[0_4px_16px_oklch(0.68_0.198_152/0.25)]"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isSubmittingReview ? 'Đang duyệt...' : 'Phê Duyệt Hồ Sơ'}</span>
                  </button>
                </div>
              ) : selectedLooker.kycStatus === KYC_STATUS.VERIFIED ? (
                <span className="text-xs font-mono font-bold text-accent py-2 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Hồ sơ đã được phê duyệt</span>
                </span>
              ) : (
                <div className="py-2 space-y-1">
                  <span className="text-xs font-mono font-bold text-danger block">
                    ✕ Hồ sơ bị từ chối
                  </span>
                  {selectedLooker.rejectionReason && (
                    <span className="text-[11px] text-on-surface-500 block">
                      Lý do: {selectedLooker.rejectionReason}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Nhập lý do từ chối KYC theo BRD */}
      {rejectModalLooker && (
        <div
          onClick={() => setRejectModalLooker(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/80 backdrop-blur-sm"
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="p-6 rounded-[24px] bg-surface-900 border border-rule-dark max-w-md w-full space-y-4 text-xs text-on-surface-900"
          >
            <div>
              <span className="font-mono text-[10px] text-danger font-bold uppercase tracking-wider block mb-1">
                NHẬP LÝ DO TỪ CHỐI
              </span>
              <h3 className="font-display text-base font-bold text-on-surface-900">
                Từ chối hồ sơ của {rejectModalLooker.name}
              </h3>
              <p className="text-xs text-on-surface-500 mt-1">
                Lý do này sẽ được gửi trực tiếp cho người nhận việc và hiển thị trên màn hình hồ sơ của họ để khắc phục.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-on-surface-700">
                Chọn hoặc nhập lý do từ chối:
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {[
                  'Ảnh CCCD bị mờ, không rõ số hoặc họ tên',
                  'Ảnh chụp không phải CCCD/CMND bản gốc',
                  'Khuôn mặt chụp chân dung không khớp với CCCD',
                  'Thông tin số CCCD nhập không khớp với ảnh'
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRejectReason(preset)}
                    className={`text-[10px] px-2.5 py-1 rounded-lg border transition-colors ${
                      rejectReason === preset
                        ? 'border-danger bg-danger/10 text-danger font-bold'
                        : 'border-rule-dark text-on-surface-500 hover:text-on-surface-900'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="Nhập lý do chi tiết..."
                className="w-full p-3 rounded-xl bg-surface-800 border border-rule-dark text-on-surface-900 text-xs focus:outline-none focus:border-danger"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-rule-dark">
              <button
                type="button"
                onClick={() => setRejectModalLooker(null)}
                className="px-4 py-2 rounded-xl border border-rule-dark text-on-surface-700 hover:text-on-surface-900 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmRejectKyc}
                disabled={isSubmittingReview || !rejectReason.trim()}
                className="px-5 py-2 rounded-xl bg-danger hover:bg-danger/90 text-paper-000 text-xs font-bold disabled:opacity-50 transition-colors"
              >
                {isSubmittingReview ? 'Đang gửi...' : 'Xác Nhận Từ Chối'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Phóng To Ảnh (Lightbox) để thẩm định chi tiết số CCCD và khuôn mặt */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-ink-900/90 backdrop-blur-md"
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-surface-900 border border-rule-dark rounded-2xl overflow-hidden flex flex-col p-3 shadow-[0_20px_50px_-15px_oklch(0_0_0/0.7)]"
          >
            <div className="flex items-center justify-between pb-2 px-1 border-b border-rule-dark mb-2">
              <span className="font-display text-xs font-bold text-on-surface-900 truncate">
                {lightboxImage.title}
              </span>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="p-1 rounded-lg hover:bg-surface-800 text-on-surface-500 hover:text-on-surface-900 transition-colors"
                aria-label="Đóng ảnh"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center min-h-[300px]">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-w-full max-h-[75vh] object-contain rounded-xl"
              />
            </div>
            <div className="pt-2 text-center text-[10px] text-on-surface-500 font-mono">
              Bấm phím Esc hoặc bấm ra ngoài để đóng xem ảnh
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
