'use client';

import { useState, useEffect } from 'react';
import { Check, AlertTriangle, Camera, MapPin, ShieldCheck, X } from 'lucide-react';
import { api } from '@/lib/api';
import { QA_STATUS, CATEGORY_GROUP_LABEL } from '@/lib/constants';
import { formatDateTime, formatVnd } from '@/lib/format';
import Skeleton from '@/components/common/Skeleton';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SyncBadge from '@/components/common/SyncBadge';
import TaskChatBox from '@/components/chat/TaskChatBox';

/** Bản dịch trạng thái duyệt kết quả → nhãn hiển thị + tông màu. */
const QA_STATUS_VIEW = {
  [QA_STATUS.PENDING]: { label: 'Chờ duyệt', tone: 'bg-accent-amber/20 text-accent-amber' },
  [QA_STATUS.PASSED]: { label: 'Đã duyệt', tone: 'bg-accent/20 text-accent' },
  [QA_STATUS.REJECTED]: { label: 'Đã từ chối', tone: 'bg-danger/20 text-danger' },
  [QA_STATUS.FRAUD_FLAGGED]: { label: 'Cờ gian lận', tone: 'bg-danger/20 text-danger' },
};

export default function AdminQaControlPage() {
  const [queue, setQueue] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    api.evidence.getPending()
      .then((pendingEvs) => {
        if (pendingEvs && pendingEvs.length > 0) {
          const adapted = pendingEvs.map((ev) => ({
            id: ev.id,
            taskId: ev.taskId,
            listingTitle: ev.taskTitle || `Nhiệm vụ #${ev.taskId}`,
            storeName: 'Điểm thực địa',
            address: '',
            clientName: 'Người đăng',
            categoryName: 'Nhiệm vụ thực địa',
            groupLabel: '—',
            lookerName: ev.shepherdName || `CTV #${ev.shepherdId}`,
            lookerPhone: '',
            reward: 0,
            submittedAt: formatDateTime(ev.submittedAt),
            gps: {
              latitude: ev.actualLatitude,
              longitude: ev.actualLongitude,
              accuracy: ev.distanceFromTaskMeters,
              isMockSuspected: false,
            },
            isMockGpsSuspected: ev.isGpsVerified !== undefined ? !ev.isGpsVerified : false,
            answers: ev.note ? [{ question: 'Ghi chú thực địa', value: ev.note }] : [],
            photos: (() => { try { return JSON.parse(ev.photosJson || '[]').map((url) => ({ title: 'Ảnh bằng chứng', url, watermark: `GPS: ${Number(ev.actualLatitude).toFixed(4)}, ${Number(ev.actualLongitude).toFixed(4)}` })); } catch { return []; } })(),
            qaStatus: QA_STATUS.PENDING,
          }));
          setQueue(adapted);
          setSelectedId(adapted[0]?.id ?? null);
        }
      })
      .catch((err) => console.warn('Lỗi nạp bằng chứng pending:', err))
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Hàng đợi chỉ hiển thị kết quả còn chờ — đã xử lý thì rời hàng đợi.
  const pending = queue.filter((q) => q.qaStatus === QA_STATUS.PENDING);
  const selectedItem = queue.find((q) => q.id === selectedId) || null;

  const handleAction = async (status) => {
    setIsActionLoading(true);
    try {
      const isApproved = status === QA_STATUS.PASSED;
      const isFraud = status === QA_STATUS.FRAUD_FLAGGED;
      let notes = '';
      if (!isApproved) {
        const defaultPrompt = isFraud ? 'Phát hiện nghi vấn gian lận GPS hoặc ảnh chụp lại' : 'Ảnh chụp mờ hoặc không đúng vị trí yêu cầu';
        const inputReason = window.prompt(isFraud ? 'Nhập ghi chú gian lận (bắt buộc):' : 'Nhập lý do từ chối báo cáo (bắt buộc):', defaultPrompt);
        if (!inputReason || !inputReason.trim()) {
          setIsActionLoading(false);
          return;
        }
        notes = inputReason.trim();
      }

      await api.evidence.review(selectedId, {
        approved: isApproved,
        reviewNotes: notes
      });
      setQueue((prev) => prev.map((item) => (item.id === selectedId ? { ...item, qaStatus: status } : item)));
    } catch (err) {
      console.error('Lỗi thẩm định QA:', err);
      alert(err.message || 'Thao tác thẩm định thất bại. Vui lòng kiểm tra lại quyền truy cập hoặc trạng thái báo cáo.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSelect = (id) => {
    setSelectedId(id);
    setPhotoIndex(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-on-surface-900">
            Duyệt Kết Quả
          </h1>
          <p className="text-xs text-on-surface-500 mt-0.5">
            Thẩm định tính xác thực của ảnh bằng chứng và vị trí GPS trước khi chuyển cho người đăng xác nhận hoàn thành
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SyncBadge dark isSyncing={isLoading} label="Đang kiểm tra..." idleLabel="Hàng đợi trực tiếp" />
          <span className="font-mono text-xs px-3 py-1 rounded-full bg-accent/15 text-accent font-bold">
            {pending.length} kết quả đang chờ duyệt
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Danh sách kết quả chờ duyệt (5 cột) */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-bold text-on-surface-700 block px-1">
            Hàng Đợi Duyệt Kết Quả
          </span>

          <div className="space-y-2.5">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <Skeleton key={i} dark variant="card" className="p-4" />
              ))
            ) : pending.length === 0 ? (
              <div className="p-8 text-center text-on-surface-500 rounded-2xl bg-surface-900 border border-rule-dark text-xs animate-render-reveal">
                Hàng đợi trống. Mọi kết quả đã được xử lý.
              </div>
            ) : (
              pending.map((item) => {
                const isSelected = item.id === selectedId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-[border-color,background-color,box-shadow] animate-render-reveal ${
                      isSelected
                        ? 'border-accent bg-surface-900 ring-2 ring-accent/30'
                        : 'border-rule-dark bg-surface-900/60 hover:bg-surface-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <span className="font-mono text-[10px] font-bold text-accent">
                          {item.id} • {item.groupLabel}
                        </span>
                        <h2 className="font-display text-sm font-bold text-on-surface-900">
                          {item.listingTitle}
                        </h2>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-accent-amber/20 text-accent-amber">
                        Chờ duyệt
                      </span>
                    </div>

                    <p className="text-xs text-on-surface-500 line-clamp-1 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-accent flex-shrink-0" />
                      {item.storeName}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-on-surface-500 mt-3 pt-2.5 border-t border-rule-dark">
                      <span>Người làm: {item.lookerName}</span>
                      <span className="font-mono text-accent font-semibold">{formatVnd(item.reward)}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Màn hình thẩm định chi tiết (7 cột) */}
        {selectedItem ? (
          <div className="lg:col-span-7 p-6 rounded-[24px] bg-surface-900 border border-rule-dark space-y-6">
            <div className="flex items-start justify-between border-b border-rule-dark pb-4">
              <div>
                <span className="font-mono text-[10px] font-bold text-accent uppercase">
                  {selectedItem.categoryName} • {selectedItem.id}
                </span>
                <h2 className="font-display text-lg font-bold text-on-surface-900 mt-0.5">
                  {selectedItem.listingTitle}
                </h2>
                <p className="text-xs text-on-surface-500">{selectedItem.address}</p>
              </div>
              <div className="text-right space-y-1">
                {(() => {
                  const view = QA_STATUS_VIEW[selectedItem.qaStatus] || QA_STATUS_VIEW[QA_STATUS.PENDING];
                  return (
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${view.tone}`}>
                      {view.label}
                    </span>
                  );
                })()}
                <span className="block text-[10px] text-on-surface-500">
                  Người đăng tin: <strong className="text-on-surface-700">{selectedItem.clientName}</strong>
                </span>
                <span className="block text-[10px] text-on-surface-500">
                  Nộp lúc: {selectedItem.submittedAt}
                </span>
              </div>
            </div>

            {/* Người làm & chỉ số cảm biến */}
            <div className="p-4 rounded-2xl bg-surface-800 border border-rule-dark space-y-2 text-xs">
              <span className="font-mono text-[11px] font-bold text-accent flex items-center gap-1.5 uppercase">
                <ShieldCheck className="w-4 h-4 text-accent" />
                Người làm &amp; chỉ số xác thực thiết bị
              </span>
              <div className="flex flex-wrap items-start justify-between gap-3 text-on-surface-700 pt-1">
                <div className="w-[48%]">
                  <span className="text-on-surface-500 block text-[11px]">Người thực hiện:</span>
                  <span className="font-bold text-on-surface-900">
                    {selectedItem.lookerName} • {selectedItem.lookerPhone}
                  </span>
                </div>
                <div className="w-[48%]">
                  <span className="text-on-surface-500 block text-[11px]">Thù lao:</span>
                  <span className="font-mono font-bold text-accent">{formatVnd(selectedItem.reward)}</span>
                </div>
                {selectedItem.gps ? (
                  <>
                    <div className="w-[48%]">
                      <span className="text-on-surface-500 block text-[11px]">Toạ độ thực địa:</span>
                      <span className="font-mono font-bold text-on-surface-900">
                        {selectedItem.gps.lat}, {selectedItem.gps.lng}
                      </span>
                    </div>
                    <div className="w-[48%]">
                      <span className="text-on-surface-500 block text-[11px]">Sai số / cách mục tiêu:</span>
                      <span
                        className={`font-mono font-bold ${
                          selectedItem.isMockGpsSuspected ? 'text-danger' : 'text-accent'
                        }`}
                      >
                        ±{selectedItem.gps.accuracy}m • cách {selectedItem.gps.distanceToTarget}m
                        {selectedItem.isMockGpsSuspected ? ' • nghi giả lập' : ''}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="col-span-2">
                    <span className="text-on-surface-500 block text-[11px]">Vị trí:</span>
                    <span className="font-mono font-bold text-on-surface-500">
                      Loại việc này không yêu cầu GPS
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Câu trả lời của người làm */}
            {selectedItem.answers.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-on-surface-900">Trả lời bảng hỏi</span>
                <div className="divide-y divide-rule-dark rounded-2xl bg-surface-800 border border-rule-dark text-xs">
                  {selectedItem.answers.map((a, i) => (
                    <div key={i} className="p-3 flex items-center justify-between gap-3">
                      <span className="text-on-surface-500">{a.question}</span>
                      <span className="font-mono font-bold text-on-surface-900">{a.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Viewer ảnh bằng chứng */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-on-surface-900 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-accent" />
                  Ảnh bằng chứng (kiểm tra độ nét &amp; tem chìm)
                </span>
                <span className="text-xs font-mono text-on-surface-500">
                  Ảnh {photoIndex + 1}/{selectedItem.photos?.length || 0}
                </span>
              </div>

              {selectedItem.photos?.length > 0 ? (
                <>
                  <div className="relative rounded-2xl overflow-hidden border border-rule-dark aspect-video bg-surface-950 flex items-center justify-center">
                    <img
                      src={selectedItem.photos[photoIndex]?.url}
                      alt={selectedItem.photos[photoIndex]?.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 p-3 bg-surface-950/85 backdrop-blur-md border-t border-rule-dark">
                      <p className="font-mono text-[11px] text-accent">
                        {selectedItem.photos[photoIndex]?.watermark}
                      </p>
                    </div>
                  </div>

                  {selectedItem.photos.length > 1 && (
                    <div className="flex gap-2 mt-3">
                      {selectedItem.photos.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPhotoIndex(idx)}
                          className={`w-20 h-14 rounded-xl overflow-hidden border-2 transition-colors ${
                            photoIndex === idx
                              ? 'border-accent'
                              : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={p.url} alt={p.title} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-2xl border border-rule-dark aspect-video bg-surface-950 flex items-center justify-center text-on-surface-500 text-xs">
                  Kết quả này không kèm ảnh bằng chứng
                </div>
              )}
            </div>

            {/* Action Bar — chỉ thao tác khi còn chờ duyệt */}
            {selectedItem.qaStatus === QA_STATUS.PENDING ? (
              <div className="pt-4 border-t border-rule-dark flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={isActionLoading}
                  onClick={() => handleAction(QA_STATUS.FRAUD_FLAGGED)}
                  className="px-4 py-2.5 rounded-xl border border-danger/40 hover:bg-danger/20 text-danger text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Gắn Cờ Gian Lận</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isActionLoading}
                    onClick={() => handleAction(QA_STATUS.REJECTED)}
                    className="px-4 py-2.5 rounded-xl border border-rule-dark hover:bg-surface-800 text-on-surface-700 text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    <span>Từ Chối</span>
                  </button>
                  <button
                    type="button"
                    disabled={isActionLoading}
                    onClick={() => handleAction(QA_STATUS.PASSED)}
                    className="px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-paper-000 font-display font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {isActionLoading ? (
                      <>
                        <LoadingSpinner size="xs" color="white" />
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Duyệt Đạt</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t border-rule-dark text-xs text-on-surface-500 font-mono">
                Kết quả đã được xử lý và rời khỏi hàng đợi.
              </div>
            )}

            {selectedItem.taskId && (
              <div className="pt-5 border-t border-rule-dark">
                <TaskChatBox taskId={selectedItem.taskId} title="Trao đổi về nhiệm vụ" />
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-7 p-12 text-center text-on-surface-500 rounded-[24px] bg-surface-900 border border-rule-dark">
            Không có kết quả nào được chọn
          </div>
        )}
      </div>
    </div>
  );
}
