'use client';

/**
 * LoadingSpinner — Biểu tượng xoay tải dữ liệu nhạy bén (540ms loop)
 * Chuẩn Emil Kowalski: spinner xoay dứt khoát tạo cảm giác hệ thống xử lý cực nhanh.
 */
export default function LoadingSpinner({
  size = 'md',
  color = 'accent',
  label = 'Đang tải dữ liệu...',
  className = '',
}) {
  const sizeMap = {
    xs: 'w-3.5 h-3.5 border-[1.5px]',
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-9 h-9 border-[2.5px]',
    xl: 'w-12 h-12 border-3',
  };

  const colorMap = {
    accent: 'border-accent/25 border-t-accent text-accent',
    white: 'border-[oklch(0.98_0.008_235/0.3)] border-t-[oklch(0.98_0.008_235)] text-paper-000',
    paper: 'border-[oklch(0.98_0.008_235/0.3)] border-t-[oklch(0.98_0.008_235)] text-paper-000',
    muted: 'border-rule-subtle border-t-ink-700 text-ink-700',
    current: 'border-current/30 border-t-current',
  };

  return (
    <div
      role="status"
      aria-label={label}
      className={`inline-flex items-center justify-center ${className}`}
    >
      <div
        className={`rounded-full animate-spin-snappy ${sizeMap[size] || sizeMap.md} ${
          colorMap[color] || colorMap.accent
        }`}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
