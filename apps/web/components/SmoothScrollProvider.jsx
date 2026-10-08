'use client';

/**
 * SmoothScrollProvider — MOT-01
 *
 * Gộp Lenis và GSAP ScrollTrigger về MỘT vòng lặp RAF duy nhất.
 *
 * Vấn đề gốc: trình duyệt cuộn bất đồng bộ (off main thread) từ Chrome 61,
 * còn ScrollTrigger/WebGL chạy trên main thread → nhận scrollY trễ 1 frame
 * → giật, parallax lệch pha.
 *
 * Giải pháp: để gsap.ticker điều khiển lenis.raf(), KHÔNG tự chạy RAF riêng.
 *
 * Lưu ý bắt buộc: options.autoRaf phải là false, nếu không Lenis sẽ tự chạy
 * vòng lặp thứ hai song song.
 */

import { useEffect } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScrollProvider({ children }) {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    // ── Vòng lặp duy nhất ────────────────────────────────────────────────
    const tick = (time) => lenis.raf(time * 1000); // gsap.ticker tính bằng giây
    gsap.ticker.add(tick);

    // lagSmoothing bù trễ khi tab bị ẩn → gây nhảy cóc khi quay lại tab.
    // Với scrub/pin, tắt nó đi để chuyển động liền mạch.
    gsap.ticker.lagSmoothing(0);

    // ── Đồng bộ hai chiều ────────────────────────────────────────────────
    const onLenisScroll = () => ScrollTrigger.update();
    lenis.on('scroll', onLenisScroll);

    // Ảnh/font tải xong làm đổi chiều cao trang → phải tính lại điểm trigger
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    const ro = new ResizeObserver(refresh);
    ro.observe(document.documentElement);

    return () => {
      gsap.ticker.remove(tick);
      lenis.off('scroll', onLenisScroll);
      window.removeEventListener('load', refresh);
      ro.disconnect();
    };
  }, [lenis]);

  // Người dùng yêu cầu giảm chuyển động → trả về cuộn gốc (MOT-05)
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <ReactLenis
      root
      options={{
        autoRaf: false,          // BẮT BUỘC — ta tự chạy RAF qua gsap.ticker
        lerp: 0.08,              // 0.05 mượt/trôi · 0.12 nhanh/gần native
        duration: 1.2,
        smoothWheel: !prefersReduced,
        syncTouch: !prefersReduced,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
      }}
    >
      {children}
    </ReactLenis>
  );
}
