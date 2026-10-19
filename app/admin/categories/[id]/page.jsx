'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Camera,
  ListChecks,
  ShieldCheck,
  MessageSquare,
  Info,
  Check,
} from 'lucide-react';
import { getCategoryById, getProtocolById, getProtocolForCategory } from '@/lib/data';
import { LISTINGS } from '@/lib/data';
import { CATEGORY_GROUP_LABEL, REQ_TYPE_LABEL } from '@/lib/constants';
import { formatVnd } from '@/lib/format';

/**
 * Sửa một loại việc và nghi thức của nó.
 *
 * Nghi thức là thứ quyết định trải nghiệm của người nhận việc. Khối "Xem trước"
 * bên phải cho admin thấy ngay hệ quả của từng công tắc.
 *
 * Thay đổi cấu hình hiện chỉ được giữ trong phiên làm việc.
 */

/** Công tắc bật/tắt dùng chung. */
function Toggle({ checked, onChange, label, hint, icon: Icon }) {
  return (
    <label className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-800 border border-rule-dark cursor-pointer hover:border-accent/40 transition-colors">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 mt-0.5 h-5 w-9 rounded-full transition-colors ${
          checked ? 'bg-accent' : 'bg-surface-700'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-paper-000 transition-transform ${
            checked ? 'translate-x-[18px]' : 'translate-x-0.5'
          }`}
        />
      </button>
      <div className="min-w-0">
        <span className="flex items-center gap-1.5 text-xs font-bold text-on-surface-900">
          {Icon && <Icon className="w-3.5 h-3.5 text-accent" />}
          {label}
        </span>
        {hint && <span className="block text-[11px] text-on-surface-500 mt-1">{hint}</span>}
      </div>
    </label>
  );
}

/** Ô nhập số có nhãn. */
function NumberField({ label, value, onChange, suffix, hint, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-[11px] font-semibold text-on-surface-500 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full px-3 py-2.5 rounded-xl bg-surface-800 border border-rule-dark text-sm font-semibold text-on-surface-900 tabular-nums focus:outline-none focus:border-accent"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-on-surface-500">
            {suffix}
          </span>
        )}
      </div>
      {hint && <span className="block text-[10px] text-on-surface-500 mt-1">{hint}</span>}
    </div>
  );
}

export default function AdminCategoryDetailPage() {
  const params = useParams();
  const category = getCategoryById(params.id);

  const baseProtocol = category ? getProtocolForCategory(category.id) : null;
  const [protocol, setProtocol] = useState(baseProtocol);
  const [saved, setSaved] = useState(false);

  if (!category || !protocol) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/categories"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Về danh sách loại việc
        </Link>
        <div className="rounded-2xl border border-rule-dark bg-surface-900 p-10 text-center">
          <p className="text-sm text-on-surface-500">
            Không tìm thấy loại việc <code className="font-mono text-accent">{params.id}</code>.
          </p>
        </div>
      </div>
    );
  }

  const usage = LISTINGS.filter((l) => l.categoryId === category.id).length;
  const set = (key) => (value) => {
    setProtocol((p) => ({ ...p, [key]: value }));
    setSaved(false);
  };

  // Suy ra các bước mà người nhận việc sẽ đi qua, dựa trên nghi thức hiện tại.
  const workerSteps = [
    { label: 'Xem tin và nhận việc', always: true },
    { label: 'Xác thực vị trí', when: protocol.requireGps },
    { label: 'Trả lời câu hỏi của người đăng', when: protocol.requireAnswers },
    {
      label: protocol.requireStepPhotos
        ? `Chụp ảnh theo ${protocol.photoMinCount} bước bắt buộc`
        : `Chụp ${protocol.photoMinCount} ảnh kết quả`,
      when: protocol.requirePhoto,
    },
    { label: 'Gửi kết quả', always: true },
    { label: 'Qua duyệt nội bộ', when: protocol.requireAdminReview },
    { label: 'Người đăng xác nhận hoàn thành', when: protocol.requireHirerApproval },
  ].filter((s) => s.always || s.when);

  return (
    <div className="space-y-6">
      {/* ── Đầu trang ───────────────────────────────────────────────────── */}
      <div>
        <Link
          href="/admin/categories"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Về danh sách loại việc
        </Link>

        <div className="flex flex-wrap items-end justify-between gap-4 mt-3">
          <div>
            <span className="label text-accent">
              {CATEGORY_GROUP_LABEL[category.group]} · {protocol.name}
            </span>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-on-surface-900 mt-1">
              {category.name}
            </h1>
            <p className="text-sm text-on-surface-500 mt-1.5">
              {usage} tin đang dùng loại việc này · phiên bản nghi thức {protocol.version}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {saved && (
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent/15 text-accent text-xs font-bold">
                <Check className="w-3.5 h-3.5" />
                Đã lưu (trong phiên)
              </span>
            )}
            <button
              type="button"
              onClick={() => setSaved(true)}
              className="px-5 py-2.5 rounded-xl bg-accent text-paper-000 text-sm font-bold hover:bg-accent-hover transition-colors"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* ── Cột trái: nghi thức ────────────────────────────────────────── */}
        <div className="xl:col-span-8 space-y-6">
          {/* Yêu cầu bằng chứng */}
          <section className="rounded-2xl border border-rule-dark bg-surface-900 p-5 lg:p-6">
            <h2 className="font-display text-base font-bold text-on-surface-900">
              Người nhận việc phải làm gì
            </h2>
            <p className="text-xs text-on-surface-500 mt-1 mb-4">
              Tắt hết thì việc trở thành đơn giản. Chỉ bật khi loại việc thực sự cần.
            </p>

            <div className="space-y-2.5">
              <Toggle
                checked={protocol.requireGps}
                onChange={set('requireGps')}
                label="Bắt xác thực vị trí"
                hint="Bắt người làm có mặt tại địa điểm. Dùng cho việc cần bằng chứng hiện trường."
                icon={MapPin}
              />
              <Toggle
                checked={protocol.requirePhoto}
                onChange={set('requirePhoto')}
                label="Bắt chụp ảnh"
                hint="Với việc thường, ảnh chỉ là biên nhận báo cáo kết quả."
                icon={Camera}
              />
              <Toggle
                checked={protocol.requireStepPhotos}
                onChange={set('requireStepPhotos')}
                label="Bắt chụp theo từng bước đã liệt kê"
                hint="Chỉ dùng khi chất lượng bằng chứng là cốt lõi (kiểm định, thẩm định)."
                icon={ListChecks}
              />
              <Toggle
                checked={protocol.requireAnswers}
                onChange={set('requireAnswers')}
                label="Bắt trả lời câu hỏi của người đăng"
                hint="Người đăng tự soạn vài câu để chắc người làm hiểu việc."
                icon={MessageSquare}
              />
            </div>

            <div className="grid grid-cols-12 gap-4 mt-5 pt-5 border-t border-rule-dark">
              <NumberField
                className="col-span-6 lg:col-span-3"
                label="Bán kính hợp lệ"
                value={protocol.gpsRadiusMeters}
                onChange={set('gpsRadiusMeters')}
                suffix="m"
              />
              <NumberField
                className="col-span-6 lg:col-span-3"
                label="Số ảnh tối thiểu"
                value={protocol.photoMinCount}
                onChange={set('photoMinCount')}
              />
              <NumberField
                className="col-span-6 lg:col-span-3"
                label="Hạn hoàn thành"
                value={protocol.slaMinutes}
                onChange={set('slaMinutes')}
                suffix="phút"
              />
              <NumberField
                className="col-span-6 lg:col-span-3"
                label="Phí nền tảng"
                value={Math.round(protocol.platformFeeRate * 100)}
                onChange={(v) => set('platformFeeRate')(v / 100)}
                suffix="%"
              />
            </div>
          </section>

          {/* Luồng duyệt */}
          <section className="rounded-2xl border border-rule-dark bg-surface-900 p-5 lg:p-6">
            <h2 className="font-display text-base font-bold text-on-surface-900">
              Ai duyệt kết quả
            </h2>
            <p className="text-xs text-on-surface-500 mt-1 mb-4">
              Việc thường không cần nền tảng duyệt — chỉ người đăng xác nhận.
            </p>
            <div className="space-y-2.5">
              <Toggle
                checked={protocol.requireAdminReview}
                onChange={set('requireAdminReview')}
                label="Qua duyệt nội bộ của nền tảng"
                hint="Chỉ bật cho nhóm kiểm định — duyệt thủ công mọi việc sẽ phá kinh tế đơn vị."
                icon={ShieldCheck}
              />
              <Toggle
                checked={protocol.requireHirerApproval}
                onChange={set('requireHirerApproval')}
                label="Người đăng xác nhận hoàn thành"
                hint="Tiền chỉ được trả sau khi người đăng xác nhận."
              />
            </div>
          </section>

          {/* Kinh tế & quy mô */}
          <section className="rounded-2xl border border-rule-dark bg-surface-900 p-5 lg:p-6">
            <h2 className="font-display text-base font-bold text-on-surface-900">
              Thù lao &amp; quy mô
            </h2>
            <div className="grid grid-cols-12 gap-4 mt-4">
              <NumberField
                className="col-span-12 sm:col-span-6 lg:col-span-4"
                label="Thù lao tối thiểu"
                value={protocol.minReward}
                onChange={set('minReward')}
                suffix="đ"
                hint={formatVnd(protocol.minReward)}
              />
              <NumberField
                className="col-span-12 sm:col-span-6 lg:col-span-4"
                label="Thù lao tối đa"
                value={protocol.maxReward}
                onChange={set('maxReward')}
                suffix="đ"
                hint={formatVnd(protocol.maxReward)}
              />
              <NumberField
                className="col-span-12 sm:col-span-6 lg:col-span-4"
                label="Phiên bản nghi thức"
                value={protocol.version}
                onChange={set('version')}
                hint="Tin đã đăng giữ bản nghi thức cũ."
              />
            </div>
            <div className="mt-4">
              <Toggle
                checked={protocol.allowMultiplePoints}
                onChange={set('allowMultiplePoints')}
                label="Cho phép gom nhiều địa điểm vào một đơn"
                hint="Bật cho việc kiểm định nhiều điểm (tạo Đơn gom)."
              />
            </div>
            <div className="mt-4">
              <Toggle
                checked={protocol.isActive}
                onChange={set('isActive')}
                label="Nghi thức đang hoạt động"
              />
            </div>
          </section>
        </div>

        {/* ── Cột phải: xem trước + thông tin ────────────────────────────── */}
        <div className="xl:col-span-4 space-y-6">
          {/* Xem trước luồng người làm */}
          <section className="rounded-2xl border border-accent/30 bg-surface-900 p-5 lg:p-6 xl:sticky xl:top-24">
            <h2 className="font-display text-base font-bold text-on-surface-900">
              Người nhận việc sẽ thấy
            </h2>
            <p className="text-xs text-on-surface-500 mt-1 mb-4">
              Hệ quả trực tiếp của nghi thức bên trái.
            </p>

            <ol className="space-y-2.5">
              {workerSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-accent/15 text-accent text-[11px] font-bold">
                    {i + 1}
                  </span>
                  <span className="text-xs text-on-surface-700 pt-1">{step.label}</span>
                </li>
              ))}
            </ol>

            {workerSteps.length <= 2 && (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-surface-800 border border-rule-dark p-3">
                <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <p className="text-[11px] text-on-surface-500 leading-relaxed">
                  Việc này rất đơn giản — người làm chỉ cần nhận và làm xong.
                </p>
              </div>
            )}

            <div className="mt-5 pt-5 border-t border-rule-dark space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-on-surface-500">Thù lao</span>
                <span className="font-semibold text-on-surface-900">
                  {formatVnd(protocol.minReward)}–{formatVnd(protocol.maxReward)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-500">Hạn hoàn thành</span>
                <span className="font-semibold text-on-surface-900">{protocol.slaMinutes} phút</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-500">Phí nền tảng</span>
                <span className="font-semibold text-on-surface-900">
                  {Math.round(protocol.platformFeeRate * 100)}%
                </span>
              </div>
            </div>
          </section>

          {/* Loại câu hỏi cho phép */}
          <section className="rounded-2xl border border-rule-dark bg-surface-900 p-5">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-500 mb-3">
              Loại câu hỏi người đăng có thể thêm
            </h2>
            <div className="flex flex-wrap gap-2">
              {['TEXT', 'NUMBER', 'CHOICE', 'CHECKBOX'].map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-full bg-surface-800 border border-rule-dark text-[11px] font-semibold text-on-surface-700"
                >
                  {REQ_TYPE_LABEL[t]}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-on-surface-500 mt-3 leading-relaxed">
              Người đăng soạn vài câu để chắc người làm hiểu việc — không phải bài kiểm tra nền tảng.
            </p>
          </section>

          <div className="flex items-start gap-2 rounded-2xl bg-surface-800 border border-rule-dark p-4">
            <Info className="w-4 h-4 text-on-surface-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-on-surface-500 leading-relaxed">
              Thay đổi chỉ được giữ trong phiên làm việc hiện tại. Tin đã đăng vẫn giữ nguyên yêu cầu tại thời điểm đăng.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
