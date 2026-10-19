'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  Search,
  Layers,
  ArrowUpRight,
  Calendar,
  MapPin,
} from 'lucide-react';

import { useAuth } from '@/components/auth/AuthContext';
import { api } from '@/lib/api';
import { getListingDetailsByHirer } from '@/lib/selectors';
import { getJobsByHirer } from '@/lib/data';
import {
  LISTING_STATUS,
  LISTING_STATUS_LABEL,
  JOB_STATUS,
} from '@/lib/constants';
import { formatVnd, formatDate } from '@/lib/format';
import Skeleton from '@/components/common/Skeleton';
import SyncBadge from '@/components/common/SyncBadge';

const JOB_STATUS_LABEL = {
  [JOB_STATUS.DRAFT]: 'Nháp',
  [JOB_STATUS.ACTIVE]: 'Đang chạy',
  [JOB_STATUS.PAUSED]: 'Tạm dừng',
  [JOB_STATUS.COMPLETED]: 'Hoàn thành',
  [JOB_STATUS.CANCELLED]: 'Đã huỷ',
};

// Tin đã kết thúc thì không còn thao tác được nữa.
const CLOSED_STATUSES = [LISTING_STATUS.COMPLETED, LISTING_STATUS.CANCELLED, LISTING_STATUS.EXPIRED];

export default function ClientListingsPage() {
  const { currentUser } = useAuth();
  const hirerId = currentUser?.id || 'USR-CL-8803';

  const defaultListings = getListingDetailsByHirer(hirerId);
  const jobs = getJobsByHirer(hirerId);

  const [realListings, setRealListings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskToCancel, setTaskToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const loadMyTasks = async () => {
    setIsLoading(true);
    try {
      const tasks = await api.tasks.getMyCreated();
      if (tasks && Array.isArray(tasks)) {
        const adapted = tasks.map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          status:
            t.status === 'CREATED'
              ? LISTING_STATUS.OPEN
              : t.status === 'APPROVED' || t.status === 'COMPLETED'
              ? LISTING_STATUS.COMPLETED
              : t.status === 'CANCELLED'
              ? LISTING_STATUS.CANCELLED
              : t.status === 'SUBMITTED'
              ? LISTING_STATUS.SUBMITTED
              : LISTING_STATUS.IN_PROGRESS,
          rawStatus: t.status,
          reward: Number(t.rewardAmount || t.reward || 0),
          location: {
            address: t.address || t.locationAddress || 'Hà Nội',
            lat: t.latitude,
            lng: t.longitude,
          },
          instructions: t.instructions,
          checklist: t.checklistRequirementsJson
            ? (typeof t.checklistRequirementsJson === 'string' ? JSON.parse(t.checklistRequirementsJson) : t.checklistRequirementsJson)
            : [],
          createdAt: t.createdAt,
          expiresAt: t.deadline,
          looker: t.assignedShepherdName
            ? { name: t.assignedShepherdName }
            : t.assignedShepherdId
            ? { name: `Worker #${t.assignedShepherdId}` }
            : null,
          submission: t.status === 'SUBMITTED',
        }));
        setRealListings(adapted);
      }
    } catch (err) {
      console.warn('Lỗi tải tin đã đăng từ API:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMyTasks();
  }, []);

  const handleConfirmCancel = async () => {
    if (!taskToCancel) return;
    setIsCancelling(true);
    try {
      await api.tasks.cancel(taskToCancel.id);
      await loadMyTasks();
      setTaskToCancel(null);
    } catch (err) {
      console.error('Lỗi hủy nhiệm vụ:', err);
      alert(err.message || 'Không thể hủy nhiệm vụ');
    } finally {
      setIsCancelling(false);
    }
  };

  const listings = realListings || defaultListings;

  // Bộ lọc trạng thái lấy từ chính dữ liệu — chỉ hiện trạng thái đang có.
  const presentStatuses = Array.from(new Set(listings.map((l) => l.status)));

  const filtered = listings.filter((l) => {
    const matchStatus = statusFilter === 'ALL' || l.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchQuery = l.title.toLowerCase().includes(q) || l.id.toLowerCase().includes(q);
    return matchStatus && matchQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display text-2xl font-bold text-ink-900">Tin đã đăng</h1>
            <SyncBadge isSyncing={isLoading} label="Đang tải..." idleLabel="Thời gian thực" />
          </div>
          <p className="text-xs text-ink-500">
            Theo dõi tin lẻ, đơn gom và các kết quả chờ xác nhận.
          </p>
        </div>
        <Link
          href="/client/campaigns/new"
          className="px-4 py-2.5 rounded-xl font-display font-bold text-xs bg-accent hover:bg-accent-hover text-paper-000 transition-colors flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Đăng tin mới</span>
        </Link>
      </div>

      {/* Đơn gom */}
      {jobs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Layers className="w-4 h-4 text-accent-blue" />
            <h2 className="font-display text-sm font-bold text-ink-900">
              Đơn gom ({jobs.length})
            </h2>
          </div>
          <div className="grid grid-cols-12 gap-3">
            {jobs.map((job) => {
              const progress = job.listingCount
                ? Math.round((job.completedCount / job.listingCount) * 100)
                : 0;
              return (
                <div
                  key={job.id}
                  className="col-span-12 lg:col-span-6 card-float bg-paper-000 p-4 rounded-2xl border border-rule-subtle"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <span className="font-mono text-[10px] text-ink-500">{job.id}</span>
                      <h3 className="font-display text-sm font-bold text-ink-900 line-clamp-1">
                        {job.title}
                      </h3>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                        job.status === JOB_STATUS.ACTIVE
                          ? 'bg-accent/15 text-accent'
                          : 'bg-paper-200 text-ink-500'
                      }`}
                    >
                      {JOB_STATUS_LABEL[job.status] || job.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-ink-500 text-[11px]">Tiến độ:</span>
                    <span className="font-bold text-ink-900">
                      {job.completedCount}/{job.listingCount} việc ({progress}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-paper-200 overflow-hidden">
                    <div
                      className="h-full bg-accent-blue rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-ink-500 mt-2">
                    <span>Ngân sách: {formatVnd(job.budgetTotal)}</span>
                    <span className="font-mono">Giữ: {formatVnd(job.escrowHeld)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bộ lọc + tìm kiếm */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-paper-000 rounded-2xl border border-rule-subtle card-float">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-ink-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            aria-label="Tìm kiếm tin đã đăng"
            placeholder="Tìm theo tên hoặc mã tin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-paper-100 rounded-xl text-xs font-semibold text-ink-900 border border-transparent focus:border-accent focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', ...presentStatuses].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-ink-900 text-paper-000'
                  : 'bg-paper-100 text-ink-500 hover:text-ink-900'
              }`}
            >
              {st === 'ALL' ? 'Tất cả' : LISTING_STATUS_LABEL[st] || st}
            </button>
          ))}
        </div>
      </div>

      {/* Danh sách tin đăng */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-float bg-paper-000 p-12 rounded-[24px] border border-rule-subtle text-center space-y-3 animate-render-reveal">
          <Layers className="w-10 h-10 text-ink-400 mx-auto" />
          <p className="text-sm font-bold text-ink-900">Không có tin nào khớp</p>
          <p className="text-xs text-ink-500">
            Thử đổi bộ lọc, hoặc đăng tin mới.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((l) => {
            const isClosed = CLOSED_STATUSES.includes(l.status);
            return (
              <div
                key={l.id}
                className="card-float bg-paper-000 p-5 rounded-[22px] border border-rule-subtle hover:border-rule-strong transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="font-mono text-[10px] font-bold text-accent px-2 py-0.5 rounded-full bg-accent-quiet">
                        {l.category?.name}
                      </span>
                      <span className="font-mono text-xs text-ink-500">{l.id}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          l.status === LISTING_STATUS.OPEN ||
                          l.status === LISTING_STATUS.IN_PROGRESS ||
                          l.status === LISTING_STATUS.ASSIGNED
                            ? 'bg-accent/15 text-accent'
                            : l.status === LISTING_STATUS.SUBMITTED
                            ? 'bg-accent-blue/15 text-accent-blue'
                            : 'bg-paper-200 text-ink-500'
                        }`}
                      >
                        {LISTING_STATUS_LABEL[l.status]}
                      </span>
                    </div>

                    <h2 className="font-display text-base font-bold text-ink-900 line-clamp-1">
                      {l.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2 text-xs text-ink-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-accent" />
                        {l.location?.district}, {l.location?.province}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-ink-500" />
                        Đăng {formatDate(l.createdAt)}
                      </span>
                      {l.looker && (
                        <span className="text-ink-700 font-semibold">
                          Người nhận: {l.looker.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-6 lg:border-l lg:border-rule-subtle lg:pl-6">
                    <div className="w-full sm:w-40">
                      <div className="text-[11px] text-ink-500">Thù lao</div>
                      <div className="font-display text-lg font-bold text-accent">
                        {formatVnd(l.reward)}
                      </div>
                      {l.submission && (
                        <div className="text-[11px] text-ink-500 mt-1">
                          Đã nộp kết quả
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setSelectedTask(l)}
                        className="px-3 py-1.5 rounded-xl border border-rule-subtle hover:bg-paper-200 text-xs font-bold text-ink-700 transition-colors"
                      >
                        Chi tiết
                      </button>

                      {l.status === LISTING_STATUS.OPEN && (
                        <button
                          type="button"
                          onClick={() => setTaskToCancel(l)}
                          className="px-3 py-1.5 rounded-xl border border-danger/30 hover:bg-danger/10 text-xs font-bold text-danger transition-colors"
                        >
                          Hủy tin
                        </button>
                      )}

                      {l.submission && !isClosed ? (
                        <Link
                          href={`/client/campaigns/${l.id}/review`}
                          className="px-3.5 py-2 rounded-xl bg-accent-blue hover:bg-accent-blue/90 text-paper-000 text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <span>Xác nhận kết quả</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : isClosed ? (
                        <span className="px-3 py-1.5 rounded-xl bg-paper-200 text-ink-500 text-xs font-semibold">
                          {LISTING_STATUS_LABEL[l.status]}
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 rounded-xl bg-accent/10 text-accent text-xs font-semibold">
                          Đang tìm người nhận
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL CHI TIẾT NHIỆM VỤ */}
      {selectedTask && (
        <div
          onClick={() => setSelectedTask(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm"
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="p-6 rounded-[24px] bg-paper-000 border border-rule-strong max-w-lg w-full space-y-4 text-xs text-ink-900 card-float"
          >
            <div className="flex items-center justify-between border-b border-rule-subtle pb-3">
              <div>
                <span className="font-mono text-[10px] text-accent font-bold uppercase">CHI TIẾT NHIỆM VỤ #{selectedTask.id}</span>
                <h3 className="font-display text-base font-bold text-ink-900">{selectedTask.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="text-ink-500 hover:text-ink-900 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-paper-100 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-ink-500">Trạng thái:</span>
                  <span className="font-bold text-accent">{LISTING_STATUS_LABEL[selectedTask.status]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-500">Thù lao ký quỹ:</span>
                  <span className="font-mono font-bold text-ink-900">{formatVnd(selectedTask.reward)} (Ký quỹ Escrow 100%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-500">Địa chỉ thực địa:</span>
                  <span className="font-medium text-ink-900 text-right max-w-xs">{selectedTask.location?.address}</span>
                </div>
                {selectedTask.location?.lat && (
                  <div className="flex justify-between">
                    <span className="text-ink-500">Tọa độ GPS:</span>
                    <span className="font-mono font-bold text-accent">
                      {selectedTask.location.lat}, {selectedTask.location.lng} (Bán kính 100m)
                    </span>
                  </div>
                )}
              </div>

              {selectedTask.description && (
                <div>
                  <span className="font-bold text-ink-900 block mb-1">Mô tả công việc:</span>
                  <p className="text-ink-700 bg-paper-100 p-3 rounded-xl leading-relaxed">{selectedTask.description}</p>
                </div>
              )}

              {selectedTask.instructions && (
                <div>
                  <span className="font-bold text-ink-900 block mb-1">Hướng dẫn thực hiện:</span>
                  <p className="text-ink-700 bg-paper-100 p-3 rounded-xl leading-relaxed">{selectedTask.instructions}</p>
                </div>
              )}

              {selectedTask.checklist && selectedTask.checklist.length > 0 && (
                <div>
                  <span className="font-bold text-ink-900 block mb-1">Checklist hiện trường bắt buộc:</span>
                  <div className="space-y-1 bg-paper-100 p-3 rounded-xl">
                    {selectedTask.checklist.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 text-ink-700">
                        <span className="w-4 h-4 rounded-full bg-accent/20 text-accent font-mono text-[10px] flex items-center justify-center font-bold">✓</span>
                        <span>{typeof c === 'string' ? c : c.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-rule-subtle">
              {selectedTask.status === LISTING_STATUS.OPEN ? (
                <button
                  type="button"
                  onClick={() => {
                    const t = selectedTask;
                    setSelectedTask(null);
                    setTaskToCancel(t);
                  }}
                  className="px-4 py-2 rounded-xl border border-danger/30 text-danger hover:bg-danger/10 font-bold transition-colors"
                >
                  Hủy nhiệm vụ này
                </button>
              ) : <div />}
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="px-5 py-2 rounded-xl bg-ink-900 text-paper-000 font-bold hover:bg-ink-700 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN HỦY NHIỆM VỤ & HOÀN KÝ QUỸ */}
      {taskToCancel && (
        <div
          onClick={() => setTaskToCancel(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/70 backdrop-blur-sm"
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="p-6 rounded-[24px] bg-paper-000 border border-rule-strong max-w-md w-full space-y-4 text-xs text-ink-900 card-float"
          >
            <div>
              <span className="font-mono text-[10px] text-danger font-bold uppercase tracking-wider block mb-1">
                HỦY NHIỆM VỤ &amp; HOÀN TIỀN KÝ QUỸ
              </span>
              <h3 className="font-display text-base font-bold text-ink-900">
                Xác nhận hủy nhiệm vụ #{taskToCancel.id}?
              </h3>
              <p className="text-ink-500 mt-1 leading-relaxed">
                Nhiệm vụ <strong>&quot;{taskToCancel.title}&quot;</strong> hiện chưa có người nhận. Khi bạn xác nhận hủy, nhiệm vụ sẽ đóng lại và toàn bộ thù lao ký quỹ sẽ được hoàn trả tự động.
              </p>
            </div>

            <div className="p-4 bg-accent-quiet border border-accent/20 rounded-2xl space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-ink-700">Số tiền ký quỹ hoàn lại:</span>
                <span className="font-mono font-bold text-accent text-sm">+{formatVnd(taskToCancel.reward)}</span>
              </div>
              <p className="text-[11px] text-ink-500">
                Tiền hoàn sẽ được cộng ngay lập tức vào số dư ví khả dụng của bạn.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-rule-subtle">
              <button
                type="button"
                onClick={() => setTaskToCancel(null)}
                className="px-4 py-2 rounded-xl border border-rule-subtle text-ink-700 hover:bg-paper-200 font-semibold"
              >
                Giữ lại
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="px-5 py-2 rounded-xl bg-danger hover:bg-danger/90 text-paper-000 font-bold disabled:opacity-50 transition-colors"
              >
                {isCancelling ? 'Đang hoàn tiền...' : 'Xác Nhận Hủy Nhiệm Vụ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
