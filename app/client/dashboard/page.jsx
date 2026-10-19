'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Layers,
  CheckCircle2,
  CheckSquare,
  TrendingUp,
  MapPin,
  ChevronRight,
  ArrowUpRight,
  Wallet,
  PackageOpen,
} from 'lucide-react';

import { useAuth } from '@/components/auth/AuthContext';
import { api } from '@/lib/api';
import { getClientOverview, getJobsByHirer } from '@/lib/data';
import {
  getListingDetailsByHirer,
  getAwaitingHirerDetails,
} from '@/lib/selectors';
import {
  LISTING_STATUS,
  LISTING_STATUS_LABEL,
  JOB_STATUS,
} from '@/lib/constants';
import { formatVnd, formatDate, formatRelative } from '@/lib/format';
import Skeleton from '@/components/common/Skeleton';
import SyncBadge from '@/components/common/SyncBadge';

// Nhãn tiếng Việt cho trạng thái đơn gom (đơn gom chưa có file nhãn riêng).
const JOB_STATUS_LABEL = {
  [JOB_STATUS.DRAFT]: 'Nháp',
  [JOB_STATUS.ACTIVE]: 'Đang chạy',
  [JOB_STATUS.PAUSED]: 'Tạm dừng',
  [JOB_STATUS.COMPLETED]: 'Hoàn thành',
  [JOB_STATUS.CANCELLED]: 'Đã huỷ',
};

export default function ClientDashboardPage() {
  const { currentUser } = useAuth();
  const hirerId = currentUser?.id || 'USR-CL-8803';

  const defaultOverview = getClientOverview(hirerId);
  const defaultListings = getListingDetailsByHirer(hirerId);
  const jobs = getJobsByHirer(hirerId);
  const awaiting = getAwaitingHirerDetails(hirerId);

  const [realListings, setRealListings] = useState(null);
  const [realWallet, setRealWallet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Lấy tin do chính người dùng đăng hoặc tất cả tin trong DB
    const fetchTasks = api.tasks.getMyCreated()
      .then((tasks) => {
        if (tasks && tasks.length > 0) {
          const adapted = tasks.map((t) => ({
            id: t.id,
            title: t.title,
            status: t.status === 'CREATED' ? LISTING_STATUS.OPEN : (t.status === 'APPROVED' ? LISTING_STATUS.COMPLETED : LISTING_STATUS.IN_PROGRESS),
            reward: Number(t.rewardAmount || t.reward || 0),
            location: { address: t.address || t.locationAddress || 'Hà Nội' },
            createdAt: t.createdAt,
          }));
          setRealListings(adapted);
        }
      })
      .catch((err) => console.warn('Lỗi tải tin client:', err));

    const fetchWallet = api.wallet.getMyWallet()
      .then((w) => setRealWallet(w))
      .catch((err) => console.warn('Lỗi tải ví client:', err));

    Promise.allSettled([fetchTasks, fetchWallet]).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const listings = useMemo(() => realListings || defaultListings, [realListings, defaultListings]);
  const recentListings = useMemo(() => listings.slice(0, 4), [listings]);
  const recentJobs = useMemo(() => jobs.slice(0, 3), [jobs]);
  const isEmpty = listings.length === 0 && jobs.length === 0;

  // Tính toán metrics thực tế (memoized)
  const activeCount = useMemo(() => {
    return listings.filter((l) => l.status === LISTING_STATUS.OPEN || l.status === LISTING_STATUS.IN_PROGRESS).length;
  }, [listings]);

  const completedCount = useMemo(() => {
    return listings.filter((l) => l.status === LISTING_STATUS.COMPLETED).length;
  }, [listings]);

  const totalSpent = realWallet ? Number(realWallet.escrowBalance || 0) : defaultOverview.totalSpent;

  const metrics = useMemo(() => [
    {
      label: 'Tin đang mở',
      val: activeCount || defaultOverview.activeListings,
      sub: `${listings.length} tin đã đăng`,
      icon: Layers,
      color: 'text-accent',
    },
    {
      label: 'Việc đã hoàn thành',
      val: completedCount || defaultOverview.completed,
      sub: 'Người đăng đã xác nhận',
      icon: CheckCircle2,
      color: 'text-accent-blue',
    },
    {
      label: 'Chờ bạn xác nhận',
      val: defaultOverview.awaitingApproval,
      sub: `${defaultOverview.inQaReview} đang chờ duyệt nội bộ`,
      icon: CheckSquare,
      color: 'text-accent-amber',
    },
    {
      label: 'Đang ký quỹ',
      val: formatVnd(totalSpent),
      sub: `${defaultOverview.activeJobs} đơn gom đang chạy`,
      icon: TrendingUp,
      color: 'text-accent',
    },
  ], [activeCount, completedCount, listings.length, defaultOverview, totalSpent]);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-paper-000 p-6 rounded-[24px] border border-rule-strong card-float">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] font-bold text-accent uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-accent-quiet">
              VIỆC BẠN ĐÃ ĐĂNG
            </span>
            <SyncBadge isSyncing={isLoading} label="Đang tải..." idleLabel="Thời gian thực" />
          </div>
          <h1 className="font-display text-2xl font-bold text-ink-900 mt-1">
            Việc bạn đã đăng
          </h1>
          <p className="text-xs text-ink-500 mt-0.5">
            Theo dõi tin đăng, đơn gom và các kết quả chờ bạn xác nhận.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/looker"
            className="px-3.5 py-2.5 rounded-xl font-display font-bold text-xs bg-paper-100 hover:bg-paper-200 text-ink-700 border border-rule-subtle transition-colors flex items-center gap-1.5"
          >
            <span>🔄 Chuyển sang Nhận việc</span>
          </Link>
          <Link
            href="/client/campaigns/new"
            className="px-4 py-2.5 rounded-xl font-display font-bold text-xs bg-accent hover:bg-accent-hover text-paper-000 transition-colors flex items-center gap-1.5"
          >
            <span>Đăng tin mới</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-12 gap-4">
        {isLoading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="col-span-12 sm:col-span-6 xl:col-span-3">
              <Skeleton variant="metric" />
            </div>
          ))
        ) : (
          metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                className="col-span-12 sm:col-span-6 xl:col-span-3 card-float bg-paper-000 p-5 rounded-[22px] border border-rule-subtle flex flex-col justify-between animate-render-reveal"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-ink-700">{m.label}</span>
                  <div className={`p-2 rounded-xl bg-paper-100 ${m.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="font-display text-2xl font-bold text-ink-900 tracking-tight">
                    {m.val}
                  </div>
                  <div className="text-[11px] text-ink-500 mt-1 truncate">{m.sub}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isEmpty ? (
        <div className="card-float bg-paper-000 p-12 rounded-[24px] border border-rule-subtle text-center space-y-3">
          <PackageOpen className="w-10 h-10 text-ink-400 mx-auto" />
          <p className="text-sm font-bold text-ink-900">Bạn chưa đăng tin nào</p>
          <p className="text-xs text-ink-500">
            Đăng việc đầu tiên để người nhận việc gần bạn nhận được.
          </p>
          <Link
            href="/client/campaigns/new"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-paper-000 text-xs font-bold transition-colors"
          >
            Đăng tin mới
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cột trái: Tin đăng & đơn gom (7 cột) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-accent" />
                <h2 className="font-display text-base font-bold text-ink-900">
                  Tin đăng gần đây
                </h2>
              </div>
              <Link
                href="/client/campaigns"
                className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
              >
                Xem tất cả ({listings.length})
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Đơn gom (nếu có) */}
            {recentJobs.length > 0 && (
              <div className="space-y-3">
                {recentJobs.map((job) => {
                  const progress = job.listingCount
                    ? Math.round((job.completedCount / job.listingCount) * 100)
                    : 0;
                  return (
                    <div
                      key={job.id}
                      className="card-float bg-paper-000 p-4 rounded-2xl border border-rule-subtle"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <span className="font-mono text-[9px] font-bold text-accent-blue px-2 py-0.5 rounded-full bg-accent-blue/15 mr-2">
                            ĐƠN GOM
                          </span>
                          <span className="font-mono text-[10px] text-ink-500">{job.id}</span>
                          <h3 className="font-display text-sm font-bold text-ink-900 mt-1 line-clamp-1">
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
                      <div className="space-y-1.5 mt-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-ink-500 text-[11px]">Tiến độ:</span>
                          <span className="font-semibold text-ink-900">
                            {job.completedCount}/{job.listingCount} việc ({progress}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-paper-200 overflow-hidden">
                          <div
                            className="h-full bg-accent-blue rounded-full transition-[width] duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tin lẻ */}
            <div className="space-y-3">
              {isLoading ? (
                [1, 2, 3].map((i) => <Skeleton key={i} variant="card" />)
              ) : (
                recentListings.map((l) => (
                  <div
                    key={l.id}
                    className="card-float bg-paper-000 p-4 rounded-2xl border border-rule-subtle hover:border-rule-strong transition-colors animate-render-reveal"
                  >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <span className="font-mono text-[9px] font-bold text-accent px-2 py-0.5 rounded-full bg-accent-quiet mr-2">
                        {l.category?.name}
                      </span>
                      <span className="font-mono text-[10px] text-ink-500">{l.id}</span>
                      <h3 className="font-display text-sm font-bold text-ink-900 mt-1 line-clamp-1">
                        {l.title}
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-accent whitespace-nowrap">
                      {formatVnd(l.reward)}
                    </span>
                  </div>

                  <p className="text-[11px] text-ink-500 line-clamp-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-accent flex-shrink-0" />
                    {l.location?.address}
                  </p>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-rule-subtle text-xs">
                    <span className="text-[11px] text-ink-500">
                      {LISTING_STATUS_LABEL[l.status]} • {formatDate(l.createdAt)}
                    </span>
                    {l.submission ? (
                      <Link
                        href={`/client/campaigns/${l.id}/review`}
                        className="font-bold text-accent hover:underline flex items-center gap-1"
                      >
                        Xác nhận kết quả
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    ) : (
                      <span className="text-[11px] text-ink-400">Chưa có kết quả</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          </div>

          {/* Cột phải: Kết quả chờ xác nhận (5 cột) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-accent-blue" />
                <h2 className="font-display text-base font-bold text-ink-900">
                  Chờ xác nhận ({awaiting.length})
                </h2>
              </div>
              <Link
                href="/client/campaigns"
                className="text-xs font-semibold text-accent-blue hover:underline"
              >
                Tin đã đăng
              </Link>
            </div>

            {awaiting.length === 0 ? (
              <div className="card-float bg-paper-000 p-8 rounded-2xl border border-rule-subtle text-center">
                <p className="text-xs text-ink-500">Không có kết quả nào chờ xác nhận.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {awaiting.map((sub) => (
                  <div
                    key={sub.id}
                    className="card-float bg-paper-000 p-4 rounded-2xl border border-rule-subtle hover:border-accent-blue transition-colors"
                  >
                    <div className="flex gap-3">
                      {sub.thumbnail && (
                        <img
                          src={sub.thumbnail}
                          alt={sub.listing?.title}
                          className="w-16 h-16 rounded-xl object-cover border border-rule-subtle flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-[9px] font-bold text-ink-500">
                            {sub.id}
                          </span>
                          <span className="text-[10px] font-semibold text-accent px-1.5 py-0.5 rounded-full bg-accent-quiet">
                            {sub.qaStatus === 'NOT_REQUIRED' ? 'Không cần duyệt' : 'Đã qua duyệt'}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-ink-900 truncate mt-0.5">
                          {sub.looker?.name}
                        </div>
                        <p className="text-[11px] text-ink-500 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-accent flex-shrink-0" />
                          {sub.listing?.location?.address}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-rule-subtle text-xs">
                      <span className="font-mono font-bold text-accent">
                        {formatVnd(sub.reward)}
                      </span>
                      <span className="text-[11px] text-ink-500">
                        {formatRelative(sub.submittedAt)}
                      </span>
                      <Link
                        href={`/client/campaigns/${sub.listingId}/review`}
                        className="px-3 py-1.5 rounded-lg bg-accent-blue hover:bg-accent-blue/90 text-paper-000 font-bold text-xs transition-colors"
                      >
                        Xác nhận
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Ghi chú cơ chế chi trả */}
            <div className="p-4 rounded-2xl bg-paper-200 border border-rule-subtle text-xs text-ink-700 space-y-2">
              <div className="flex items-center gap-2 font-bold text-ink-900">
                <Wallet className="w-4 h-4 text-accent" />
                <span>Xác nhận hoàn thành &amp; trả thù lao</span>
              </div>
              <p className="text-[11px] text-ink-500 leading-relaxed">
                Khi bạn bấm <strong>Xác nhận hoàn thành</strong>, hệ thống tự động giải phóng
                tiền đã giữ và trả thù lao về ví của người nhận việc.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
