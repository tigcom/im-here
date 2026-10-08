'use client';

/**
 * ActionButton — STA-01 (đủ 8 trạng thái) + STA-02 (focus-visible) + STA-03 (vùng chạm 44px)
 *
 * AI gần như luôn chỉ sinh default + hover. Đó là lý do giao diện trông như
 * "demo" chứ không phải "sản phẩm". Component này định nghĩa đủ:
 *
 *   1. default   2. hover      3. focus-visible   4. active
 *   5. disabled  6. loading    7. error           8. success
 *
 * Cách dùng:
 *   <ActionButton>Gửi yêu cầu</ActionButton>
 *   <ActionButton state="loading">Đang gửi</ActionButton>
 *   <ActionButton state="error">Thử lại</ActionButton>
 *   <ActionButton variant="ghost">Tải hồ sơ</ActionButton>
 */

export default function ActionButton({
  children,
  variant = 'primary',   // primary | ghost
  state = 'idle',        // idle | loading | error | success
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) {
  const isLoading = state === 'loading';
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      aria-invalid={state === 'error' || undefined}
      data-variant={variant}
      data-state={state}
      className={`btn ${className}`}
      {...props}
    >
      <span className="btn__label">{children}</span>

      {isLoading && <span className="btn__spinner" aria-hidden="true" />}

      {state === 'success' && (
        <svg
          className="btn__icon"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3.5 8.5l3 3 6-7"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {/* Thông báo cho trình đọc màn hình — trạng thái không chỉ thể hiện bằng màu */}
      <span className="sr-only" role="status" aria-live="polite">
        {isLoading ? 'Đang xử lý' : ''}
        {state === 'success' ? 'Thành công' : ''}
        {state === 'error' ? 'Có lỗi xảy ra' : ''}
      </span>
    </button>
  );
}
