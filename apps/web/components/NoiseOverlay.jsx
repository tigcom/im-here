'use client';

/**
 * NoiseOverlay — SRF-04
 *
 * Phá bỏ độ phẳng điện tử của nền đơn sắc. Mắt người chưa bao giờ thấy
 * một bề mặt tuyệt đối phẳng; thiếu hạt, nền trông như "dán" chứ không "nổi".
 *
 * Có hai chế độ:
 *   • tile (khuyến nghị) — ảnh PNG 128×128 lặp lại. Rẻ về GPU, dùng cho trang dài.
 *   • svg               — feTurbulence trực tiếp. Đẹp hơn nhưng tốn GPU,
 *                         chỉ nên dùng khi trang ngắn hoặc chỉ có một phân khu tối.
 *
 * Đặt component này MỘT LẦN ở layout gốc, ngay trước </body>.
 */

export default function NoiseOverlay({
  mode = 'tile',
  opacity = 0.035,
  blend = 'overlay',
}) {
  if (mode === 'svg') {
    return (
      <svg
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[60] h-full w-full"
        style={{ opacity, mixBlendMode: blend }}
      >
        <filter id="noise-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise-filter)" />
      </svg>
    );
  }

  return (
    <div
      aria-hidden="true"
      className="noise-layer pointer-events-none fixed inset-0 z-[60]"
      style={{ opacity, mixBlendMode: blend }}
    />
  );
}
