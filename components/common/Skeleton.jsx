'use client';

/**
 * Skeleton — Hiệu ứng nạp khung xương cao cấp (Shimmer GPU Accelerated)
 *
 * Tuân thủ quy chuẩn thiết kế:
 * - 100% OKLCH variables (--paper-200, --surface-800)
 * - Tự động thích ứng theme Sáng / Tối
 * - Tránh giật layout (Cumulative Layout Shift = 0)
 */
export default function Skeleton({
  variant = 'text',
  className = '',
  dark = false,
  ...props
}) {
  const shimmerClass = dark ? 'skeleton-shimmer-dark' : 'skeleton-shimmer';

  if (variant === 'circular') {
    return (
      <div
        aria-hidden="true"
        className={`rounded-full flex-shrink-0 ${shimmerClass} ${className}`}
        {...props}
      />
    );
  }

  if (variant === 'title') {
    return (
      <div
        aria-hidden="true"
        className={`h-7 w-3/4 rounded-lg ${shimmerClass} ${className}`}
        {...props}
      />
    );
  }

  if (variant === 'text') {
    return (
      <div
        aria-hidden="true"
        className={`h-4 w-full rounded-md ${shimmerClass} ${className}`}
        {...props}
      />
    );
  }

  if (variant === 'card') {
    return (
      <div
        aria-hidden="true"
        className={`p-5 rounded-2xl border ${
          dark
            ? 'bg-surface-900 border-rule-dark'
            : 'bg-paper-000 border-rule-subtle shadow-xs'
        } space-y-4 ${className}`}
        {...props}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl ${shimmerClass} flex-shrink-0`}
          />
          <div className="space-y-2 flex-1">
            <div className={`h-4 w-1/2 rounded ${shimmerClass}`} />
            <div className={`h-3 w-1/3 rounded ${shimmerClass}`} />
          </div>
        </div>
        <div className="space-y-2 pt-2">
          <div className={`h-3.5 w-full rounded ${shimmerClass}`} />
          <div className={`h-3.5 w-4/5 rounded ${shimmerClass}`} />
        </div>
      </div>
    );
  }

  if (variant === 'metric') {
    return (
      <div
        aria-hidden="true"
        className={`p-5 rounded-2xl border ${
          dark
            ? 'bg-surface-900 border-rule-dark'
            : 'bg-paper-000 border-rule-subtle'
        } space-y-3 ${className}`}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div className={`h-3.5 w-24 rounded ${shimmerClass}`} />
          <div className={`w-8 h-8 rounded-lg ${shimmerClass}`} />
        </div>
        <div className={`h-8 w-28 rounded-lg ${shimmerClass}`} />
        <div className={`h-3 w-36 rounded ${shimmerClass}`} />
      </div>
    );
  }

  // Rectangular mặc định
  return (
    <div
      aria-hidden="true"
      className={`rounded-xl ${shimmerClass} ${className}`}
      {...props}
    />
  );
}
