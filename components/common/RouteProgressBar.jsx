'use client';

import { useEffect, useState, useTransition } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * RouteProgressBar — Thanh tiến độ điều hướng mượt mà ở đỉnh trang (Fintech Emerald)
 *
 * Tự động kích hoạt khi người dùng click vào các liên kết nội bộ hoặc chuyển trang.
 * Tuân thủ triết lý Emil Kowalski: phản hồi tức thì, không giật, tự ẩn êm dịu khi render xong.
 */
export default function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Khi pathname hoặc searchParams đổi -> route transition hoàn thành -> 100% rồi ẩn
  useEffect(() => {
    if (progress > 0) {
      setProgress(100);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    // Lắng nghe click trên toàn bộ liên kết nội bộ
    const handleClick = (e) => {
      const target = e.target.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      // Bỏ qua external links, anchors (#), downloads, new tab links
      if (
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#') ||
        target.target === '_blank' ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // Nếu đang chuyển sang trang mới
      const currentUrl = window.location.pathname + window.location.search;
      if (href !== currentUrl) {
        setIsVisible(true);
        setProgress(25);

        const timer1 = setTimeout(() => {
          setProgress((prev) => (prev >= 25 && prev < 70 ? 70 : prev));
        }, 150);

        const timer2 = setTimeout(() => {
          setProgress((prev) => (prev >= 70 && prev < 90 ? 90 : prev));
        }, 400);

        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
        };
      }
    };

    document.addEventListener('click', handleClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
    };
  }, []);

  if (!isVisible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="route-progress-bar"
      style={{
        transform: `scaleX(${progress / 100})`,
        opacity: isVisible || progress < 100 ? 1 : 0,
      }}
    />
  );
}
