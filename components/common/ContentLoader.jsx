'use client';

import LoadingSpinner from './LoadingSpinner';

/**
 * ContentLoader — Trình nạp khối nội dung trong trang khi đang fetching
 * Sử dụng khi tải các danh sách, bảng hoặc chi tiết tác vụ
 */
export default function ContentLoader({
  text = 'Đang tải dữ liệu...',
  subtext = 'Vui lòng chờ trong giây lát',
  minHeight = 'min-h-[220px]',
  dark = false,
  className = '',
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`w-full flex flex-col items-center justify-center p-8 rounded-2xl border ${
        dark
          ? 'bg-surface-900/60 border-rule-dark text-on-surface-700'
          : 'bg-paper-100/70 border-rule-subtle text-ink-700'
      } ${minHeight} ${className}`}
    >
      <div className="relative mb-3 flex items-center justify-center">
        <LoadingSpinner size="lg" color="accent" label={text} />
        <div className="absolute inset-0 rounded-full bg-accent/10 blur-sm pointer-events-none" />
      </div>
      <p className={`font-display text-xs font-bold ${dark ? 'text-on-surface-900' : 'text-ink-900'}`}>
        {text}
      </p>
      {subtext && (
        <p className={`text-[11px] mt-0.5 ${dark ? 'text-on-surface-500' : 'text-ink-500'}`}>
          {subtext}
        </p>
      )}
    </div>
  );
}
