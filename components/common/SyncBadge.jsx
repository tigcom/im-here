'use client';

import LoadingSpinner from './LoadingSpinner';

/**
 * SyncBadge — Huy hiệu hiển thị trạng thái đồng bộ thời gian thực
 */
export default function SyncBadge({
  isSyncing = false,
  label = 'Đang đồng bộ...',
  idleLabel = 'Thời gian thực',
  dark = false,
  className = '',
}) {
  if (isSyncing) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
          dark
            ? 'bg-accent/15 border-accent/30 text-accent'
            : 'bg-accent-quiet border-accent/20 text-accent'
        } ${className}`}
      >
        <LoadingSpinner size="xs" color="accent" />
        <span className="font-mono text-[10px] uppercase tracking-wider">{label}</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
        dark
          ? 'bg-surface-800 border-rule-dark text-on-surface-500'
          : 'bg-paper-100 border-rule-subtle text-ink-500'
      } ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
      <span className="font-mono text-[10px] uppercase tracking-wider">{idleLabel}</span>
    </div>
  );
}
