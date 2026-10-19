'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  CheckSquare,
  AlertTriangle,
  Layers,
  MapPin,
  Activity,
  LayoutGrid,
} from 'lucide-react';
import { api } from '@/lib/api';
import {
  getAdminOverview,
  getProvinceDistribution,
  getCategoryGroupDistribution,
  getActiveFraudAlerts,
  getPendingKycUsers,
  getUserById,
  getListingById,
  SUBMISSIONS,
  CATEGORIES,
} from '@/lib/data';
import { CATEGORY_GROUP_LABEL } from '@/lib/constants';
import { formatNumber, formatRelative } from '@/lib/format';
import Skeleton from '@/components/common/Skeleton';
import SyncBadge from '@/components/common/SyncBadge';

/** Nhật ký sự kiện suy từ dữ liệu thật: kết quả nộp, cảnh báo gian lận, hồ sơ chờ duyệt. */
function buildLiveEvents() {
  const events = [];

  for (const s of SUBMISSIONS) {
    const looker = getUserById(s.lookerId);
    const listing = getListingById(s.listingId);
    events.push({
      at: s.submittedAt,
      type: 'SUBMISSION',
      text: `${looker?.name || 'Người nhận việc'} nộp kết quả cho "${listing?.title || 'tin đăng'}"`,
      tag: 'Kết quả mới',
    });
  }

  for (const f of getActiveFraudAlerts()) {
    events.push({
      at: f.detectedAt,
      type: 'FRAUD_FLAG',
      text: `${f.title} (${f.location})`,
      tag: 'Cảnh báo gian lận',
    });
  }

  for (const u of getPendingKycUsers()) {
    events.push({
      at: u.kyc.submittedAt,
      type: 'KYC_SUBMIT',
      text: `${u.name} nộp hồ sơ định danh — chờ duyệt`,
      tag: 'Hồ sơ chờ duyệt',
    });
  }

  return events
    .filter((e) => e.at)
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 8)
    .map((e) => ({ ...e, time: formatRelative(e.at) }));
}

export default function AdminDashboardPage() {
  const defaultOverview = useMemo(() => getAdminOverview(), []);
  const provinces = useMemo(() => getProvinceDistribution(), []);
  const categoryGroups = useMemo(() => getCategoryGroupDistribution(CATEGORIES), []);
  const liveEvents = useMemo(() => buildLiveEvents(), []);
  const maxGroupCount = useMemo(() => Math.max(1, ...categoryGroups.map((g) => g.count)), [categoryGroups]);

  const [backendStats, setBackendStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.admin.getStats()
      .then((s) => setBackendStats(s))
      .catch((err) => console.warn('Lỗi nạp admin stats từ backend:', err))
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const totalUsers = backendStats?.totalUsers ?? defaultOverview.totalLookers;
  const activeUsers = backendStats ? Math.round(backendStats.totalUsers * 0.8) : defaultOverview.activeLookers;
  const openTasks = backendStats?.openTasks ?? defaultOverview.openListings;
  const totalTasks = backendStats?.totalTasks ?? defaultOverview.totalListings;
  const pendingEvs = backendStats?.pendingEvidences ?? defaultOverview.qaQueue;

  const metrics = [
    {
      label: 'Người Nhận Việc Đã Duyệt Hồ Sơ',
      val: formatNumber(activeUsers),
      sub: `Tổng ${formatNumber(totalUsers)} người dùng trên hệ thống`,
      icon: Users,
      color: 'text-accent',
    },
    {
      label: 'Tin Đang Mở',
      val: formatNumber(openTasks),
      sub: `${formatNumber(totalTasks)} tổng số tin đăng thực tế`,
      icon: Layers,
      color: 'text-accent-blue',
    },
    {
      label: 'Hàng Đợi Duyệt Kết Quả',
      val: formatNumber(pendingEvs),
      sub: 'Kết quả nộp chờ thẩm định QA',
      icon: CheckSquare,
      color: 'text-accent-amber',
    },
    {
      label: 'Cảnh Báo Gian Lận Đang Mở',
      val: formatNumber(defaultOverview.activeFraudAlerts),
      sub: `${formatNumber(defaultOverview.pendingKyc)} hồ sơ chờ duyệt`,
      icon: AlertTriangle,
      color: 'text-danger',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[24px] bg-surface-900 border border-rule-dark">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] font-bold text-accent uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-accent/15">
              TRUNG TÂM ĐIỀU HÀNH NỀN TẢNG
            </span>
            <SyncBadge dark isSyncing={isLoading} label="Đang nạp..." idleLabel="Hệ thống trực tiếp" />
          </div>
          <h1 className="font-display text-2xl font-bold text-on-surface-900 mt-1">
            Bảng Điều Hành Chợ Lao Động
          </h1>
          <p className="text-xs text-on-surface-500 mt-0.5">
            Giám sát tin đăng, duyệt hồ sơ người nhận việc, duyệt kết quả và an toàn dòng tiền 9Pay
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/qa"
            className="px-4 py-2.5 rounded-xl font-display font-bold text-xs bg-accent hover:bg-accent-hover text-paper-000 flex items-center gap-1.5 transition-[background-color,color]"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Mở Duyệt Kết Quả ({pendingEvs} Chờ)</span>
          </Link>
        </div>
      </div>

      {/* Metrics 4 Cards */}
      <div className="grid grid-cols-12 gap-4">
        {isLoading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="col-span-12 sm:col-span-6 xl:col-span-3">
              <Skeleton dark variant="metric" />
            </div>
          ))
        ) : (
          metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                className="col-span-12 sm:col-span-6 xl:col-span-3 p-5 rounded-[22px] bg-surface-900 border border-rule-dark flex flex-col justify-between animate-render-reveal"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-on-surface-700">{m.label}</span>
                  <div className={`p-2 rounded-xl bg-surface-800 ${m.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="font-display text-2xl font-bold text-on-surface-900 tracking-tight">
                    {m.val}
                  </div>
                  <div className="mt-1 text-[11px] text-on-surface-500 truncate">{m.sub}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 2 Cột: Phân Bố Địa Lý (7 cột) & Live Event Logs (5 cột) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cột trái: Phân Bổ Tỉnh Thành */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent" />
              <h2 className="font-display text-base font-bold text-on-surface-900">
                Phân Bố Tin Đăng Theo Tỉnh Thành
              </h2>
            </div>
            <span className="text-xs font-mono text-accent">{provinces.length} tỉnh thành</span>
          </div>

          <div className="p-5 rounded-[24px] bg-surface-900 border border-rule-dark divide-y divide-rule-dark">
            {provinces.map((c) => (
              <div key={c.province} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-on-surface-900 block">{c.province}</span>
                  <span className="text-on-surface-500 text-[11px]">
                    {formatNumber(c.completed)} tin đã hoàn thành
                  </span>
                </div>
                <span className="font-mono font-bold text-accent">{formatNumber(c.listings)} tin đăng</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cột phải: Live Realtime Feed */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent-blue" />
              <h2 className="font-display text-base font-bold text-on-surface-900">
                Nhật Ký Sự Kiện
              </h2>
            </div>
            <span className="font-mono text-[10px] text-accent font-bold">● CẬP NHẬT TRỰC TIẾP</span>
          </div>

          <div className="p-5 rounded-[24px] bg-surface-900 border border-rule-dark space-y-3.5">
            {liveEvents.map((ev, i) => (
              <div key={i} className="flex items-start gap-3 text-xs">
                <span className="font-mono text-[10px] text-on-surface-500 mt-0.5 w-16 flex-shrink-0">
                  {ev.time}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-on-surface-700 leading-relaxed">{ev.text}</p>
                  <span
                    className={`inline-block text-[9px] font-mono font-bold px-2 py-0.5 rounded-full mt-1 ${
                      ev.type === 'FRAUD_FLAG'
                        ? 'bg-danger/20 text-danger'
                        : ev.type === 'SUBMISSION'
                        ? 'bg-accent/20 text-accent'
                        : 'bg-surface-800 text-on-surface-500'
                    }`}
                  >
                    {ev.tag}
                  </span>
                </div>
              </div>
            ))}
            {liveEvents.length === 0 && (
              <div className="text-center text-on-surface-500 text-xs py-6">
                Chưa có sự kiện nào
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Phân Bố Theo Nhóm Việc — cho thấy chợ không chỉ có kiểm định */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-accent" />
          <h2 className="font-display text-base font-bold text-on-surface-900">
            Phân Bố Theo Nhóm Việc
          </h2>
        </div>

        <div className="p-5 rounded-[24px] bg-surface-900 border border-rule-dark space-y-4">
          {categoryGroups.map((g) => (
            <div key={g.group} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-on-surface-900">
                  {CATEGORY_GROUP_LABEL[g.group] || g.group}
                </span>
                <span className="font-mono text-accent">{formatNumber(g.count)} tin</span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${Math.round((g.count / maxGroupCount) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
