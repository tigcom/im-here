'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  MapPin,
  Camera,
  ListChecks,
  ShieldCheck,
  Search,
  Info,
} from 'lucide-react';
import { CATEGORIES, PROTOCOLS } from '@/lib/data';
import { LISTINGS } from '@/lib/data';
import { CATEGORY_GROUP, CATEGORY_GROUP_LABEL } from '@/lib/constants';
import { formatVnd } from '@/lib/format';

/**
 * CMS — DANH MỤC VIỆC & NGHI THỨC
 *
 * Đây là màn hình quyết định "loại việc này cần gì". Nghi thức của mỗi danh mục
 * quyết định việc đơn giản (đi chợ dùm) có đơn giản thật hay không: nếu nghi thức
 * tắt hết cờ, người nhận việc sẽ không thấy GPS hay bước chụp bắt buộc.
 *
 * Thay đổi cấu hình hiện chỉ được giữ trong phiên làm việc.
 */

const FLAG_CHIPS = [
  { key: 'requireGps', label: 'Vị trí', icon: MapPin },
  { key: 'requirePhoto', label: 'Ảnh', icon: Camera },
  { key: 'requireStepPhotos', label: 'Bước chụp', icon: ListChecks },
  { key: 'requireAdminReview', label: 'Duyệt nội bộ', icon: ShieldCheck },
];

export default function AdminCategoriesPage() {
  const [activeGroup, setActiveGroup] = useState('ALL');
  const [keyword, setKeyword] = useState('');
  const [toggledOff, setToggledOff] = useState([]);

  // Đếm số tin đang dùng mỗi danh mục — để admin biết danh mục nào đang sống.
  const usageByCategory = useMemo(() => {
    const map = {};
    for (const l of LISTINGS) map[l.categoryId] = (map[l.categoryId] || 0) + 1;
    return map;
  }, []);

  const filtered = CATEGORIES.filter((c) => {
    if (activeGroup !== 'ALL' && c.group !== activeGroup) return false;
    if (keyword && !c.name.toLowerCase().includes(keyword.toLowerCase())) return false;
    return true;
  }).sort((a, b) => a.sortOrder - b.sortOrder);

  const groups = [
    { id: 'ALL', label: 'Tất cả', count: CATEGORIES.length },
    ...Object.values(CATEGORY_GROUP).map((g) => ({
      id: g,
      label: CATEGORY_GROUP_LABEL[g],
      count: CATEGORIES.filter((c) => c.group === g).length,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* ── Tiêu đề ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="label text-accent">Quản lý danh mục</span>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-on-surface-900 mt-1">
            Loại việc &amp; Nghi thức
          </h1>
          <p className="text-sm text-on-surface-500 mt-2 max-w-2xl">
            Mỗi loại việc có một <strong className="text-on-surface-700">nghi thức</strong> quyết
            định người nhận việc phải làm gì. Việc đơn giản thì nghi thức tắt hết — người làm chỉ
            cần nhận, làm và gửi kết quả.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-800 border border-rule-dark text-xs text-on-surface-500">
          <Info className="w-4 h-4 shrink-0" />
          <span>{CATEGORIES.length} loại · {PROTOCOLS.length} nghi thức</span>
        </div>
      </div>

      {/* ── Bộ lọc ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {groups.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setActiveGroup(g.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeGroup === g.id
                  ? 'bg-accent text-paper-000'
                  : 'bg-surface-800 text-on-surface-500 hover:text-on-surface-900 border border-rule-dark'
              }`}
            >
              {g.label} <span className="opacity-60">({g.count})</span>
            </button>
          ))}
        </div>

        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-500" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm loại việc..."
            aria-label="Tìm loại việc"
            className="pl-9 pr-4 py-2 w-56 rounded-xl bg-surface-800 border border-rule-dark text-sm text-on-surface-900 placeholder:text-on-surface-500 focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* ── Danh sách ───────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-rule-dark bg-surface-900 p-10 text-center">
          <p className="text-sm text-on-surface-500">Không có loại việc nào khớp bộ lọc.</p>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-4">
          {filtered.map((cat) => {
            const protocol = PROTOCOLS.find((p) => p.id === cat.protocolId);
            const active = cat.isActive && !toggledOff.includes(cat.id);
            const usage = usageByCategory[cat.id] || 0;
            const activeFlags = FLAG_CHIPS.filter((f) => protocol?.[f.key]);

            return (
              <div
                key={cat.id}
                className="col-span-12 xl:col-span-6 rounded-2xl border border-rule-dark bg-surface-900 p-5 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-display text-base font-bold text-on-surface-900">
                        {cat.name}
                      </h2>
                      <span className="px-2 py-0.5 rounded-full bg-surface-800 text-[10px] font-mono font-bold text-on-surface-500 uppercase">
                        {CATEGORY_GROUP_LABEL[cat.group]}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-500 mt-1.5 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={active}
                    aria-label={`${active ? 'Tắt' : 'Bật'} loại việc ${cat.name}`}
                    onClick={() =>
                      setToggledOff((prev) =>
                        prev.includes(cat.id)
                          ? prev.filter((id) => id !== cat.id)
                          : [...prev, cat.id]
                      )
                    }
                    className={`relative shrink-0 h-6 w-11 rounded-full transition-colors ${
                      active ? 'bg-accent' : 'bg-surface-700'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-paper-000 transition-transform ${
                        active ? 'translate-x-[22px]' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Nghi thức tóm tắt */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-on-surface-500">
                    Nghi thức:
                  </span>
                  <span className="text-xs font-semibold text-on-surface-700">
                    {protocol?.name || '—'}
                  </span>
                  {activeFlags.length === 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent text-[10px] font-bold">
                      Đơn giản — không yêu cầu gì
                    </span>
                  ) : (
                    activeFlags.map((f) => (
                      <span
                        key={f.key}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-800 border border-rule-dark text-[10px] font-semibold text-on-surface-700"
                      >
                        <f.icon className="w-3 h-3" />
                        {f.label}
                      </span>
                    ))
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-rule-dark pt-4 mt-auto">
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-on-surface-500">
                      Thù lao{' '}
                      <strong className="text-on-surface-900">
                        {formatVnd(protocol?.minReward)}–{formatVnd(protocol?.maxReward)}
                      </strong>
                    </span>
                    <span className="text-on-surface-500">
                      Đang dùng: <strong className="text-on-surface-900">{usage}</strong> tin
                    </span>
                  </div>
                  <Link
                    href={`/admin/categories/${cat.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-accent hover:underline"
                  >
                    Sửa nghi thức
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
