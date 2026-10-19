'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function EditorialShowcaseSection() {
  const root = useRef(null);
  const leftGlass = useRef(null);
  const rightGlass = useRef(null);
  const centralMap = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: '+=130%',
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
          },
        });

        // Tấm bên trái bay nhẹ từ dưới lên và hơi nghiêng
        tl.fromTo(
          leftGlass.current,
          { y: 60, opacity: 0.85 },
          { y: -30, opacity: 1, ease: 'none' },
          0
        );

        // Tấm bên phải trôi ngược lên
        tl.fromTo(
          rightGlass.current,
          { y: 80, opacity: 0.85 },
          { y: -40, opacity: 1, ease: 'none' },
          0
        );

        // Khung bản đồ trung tâm mở rộng nhẹ nhàng
        tl.fromTo(
          centralMap.current,
          { scale: 0.96, borderRadius: '24px' },
          { scale: 1.02, borderRadius: '20px', ease: 'power2.inOut' },
          0
        );
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      className="relative h-dvh w-full overflow-hidden bg-gradient-to-b from-paper-000 via-paper-100/40 to-paper-000 border-y border-rule-subtle"
    >
      {/* Vùng phát sáng xanh ngọc ở giữa */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[650px] w-[650px] rounded-full bg-accent/15 blur-[120px]"
      />

      <div className="mx-auto flex h-full w-full max-w-[1700px] flex-col justify-center px-[6vw]">
        {/* TIÊU ĐỀ KHU VỰC VỚI STATUS BADGE */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent-quiet px-3.5 py-1">
              <span className="h-2 w-2 rounded-full bg-accent animate-ping" />
              <span className="font-mono text-xs text-accent font-semibold uppercase tracking-wider">
                GEO-RADAR DIRECT DISPATCH
              </span>
            </div>
            <h2 className="font-display [font-size:clamp(1.75rem,3.5vw,2.75rem)] mt-2 font-bold text-ink-900 leading-tight">
              Phủ Sóng Toàn Diện 63 Tỉnh Thành
            </h2>
          </div>
          <div className="hidden sm:flex items-center gap-3 rounded-full border border-rule-subtle bg-paper-000 px-4 py-2 shadow-card">
            <span className="h-2.5 w-2.5 rounded-full bg-accent" />
            <span className="font-mono text-xs font-bold text-ink-900">TRẠNG THÁI MẠNG LƯỚI: TRỰC CHIẾN 24/7</span>
          </div>
        </div>

        {/* BỐ CỤC 3 KHỐI: FLOATING GLASS LEFT + CENTRAL 3D MAP + FLOATING GLASS RIGHT */}
        <div className="relative grid grid-cols-12 items-center gap-6">
          {/* SIDEBAR FLOATING GLASS LEFT */}
          <div
            ref={leftGlass}
            className="col-span-12 md:col-span-3 z-20 p-6 space-y-5 bg-paper-000/90 backdrop-blur-xl border border-rule-subtle shadow-card rounded-2xl"
          >
            <div>
              <span className="font-mono text-[0.6875rem] uppercase tracking-wider block text-accent font-semibold">TỶ LỆ PHỦ SÓNG</span>
              <div className="mt-1 font-display text-4xl font-bold tabular text-ink-900">
                100<span className="text-accent">%</span>
              </div>
              <p className="mt-1 text-xs text-ink-700">
                Toàn bộ 63/63 tỉnh thành &amp; 705 quận huyện có Lookers trực tiếp.
              </p>
            </div>

            <div className="border-t border-rule-subtle pt-4">
              <span className="font-mono text-[0.6875rem] uppercase tracking-wider block text-accent-blue font-semibold">THỜI GIAN TIẾP CẬN</span>
              <div className="mt-1 font-display text-4xl font-bold tabular text-ink-900">
                &lt; 240 <span className="text-sm font-sans font-medium text-ink-500">Phút</span>
              </div>
              <p className="mt-1 text-xs text-ink-700">
                Từ lúc duyệt tin tới khi Looker đứng tại tọa độ mục tiêu.
              </p>
            </div>

            <div className="rounded-xl border border-rule-subtle bg-paper-100/80 p-3 text-xs font-semibold text-ink-700">
              ⚡ SLA hỏa tốc 60 phút cho các thành phố trực thuộc Trung ương
            </div>
          </div>

          {/* CENTRAL 3D HIGH-TECH MAP CỦA VIỆT NAM (1 VISUAL ANCHOR DUY NHẤT) */}
          <div className="col-span-12 md:col-span-6 relative">
            <div
              ref={centralMap}
              className="relative h-[480px] w-full overflow-hidden p-3 bg-paper-000 border border-rule-subtle shadow-card rounded-3xl"
            >
              <img
                src="/images/how-it-works-2-network.png"
                alt="Bản đồ mạng lưới thực địa 63 tỉnh thành Việt Nam"
                className="h-full w-full rounded-2xl object-cover"
                loading="lazy"
              />

              {/* OVERLAY PINS 3 ĐIỂM CỐT LÕI: HÀ NỘI, ĐÀ NẴNG, HỒ CHÍ MINH */}
              {/* Pin Hà Nội */}
              <div className="absolute top-[22%] left-[46%] z-30 flex items-center gap-2 rounded-full border border-rule-subtle bg-paper-000/95 px-3 py-1 shadow-card backdrop-blur-md">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
                </span>
                <span className="font-mono text-xs font-bold text-ink-900">HÀ NỘI · 18.400 Lookers</span>
              </div>

              {/* Pin Đà Nẵng */}
              <div className="absolute top-[48%] left-[58%] z-30 flex items-center gap-2 rounded-full border border-rule-subtle bg-paper-000/95 px-3 py-1 shadow-card backdrop-blur-md">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-blue opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent-blue" />
                </span>
                <span className="font-mono text-xs font-bold text-ink-900">ĐÀ NẴNG · 8.600 Lookers</span>
              </div>

              {/* Pin Hồ Chí Minh */}
              <div className="absolute bottom-[24%] left-[44%] z-30 flex items-center gap-2 rounded-full border border-rule-subtle bg-paper-000/95 px-3 py-1 shadow-card backdrop-blur-md">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-orange opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent-orange" />
                </span>
                <span className="font-mono text-xs font-bold text-ink-900">TP. HỒ CHÍ MINH · 27.200 Lookers</span>
              </div>

              {/* Dải gradient mờ ở đáy */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-paper-000/80 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* SIDEBAR FLOATING GLASS RIGHT */}
          <div
            ref={rightGlass}
            className="col-span-12 md:col-span-3 z-20 p-6 space-y-4 bg-paper-000/90 backdrop-blur-xl border border-rule-subtle shadow-card rounded-2xl"
          >
            <span className="font-mono text-[0.6875rem] uppercase tracking-wider block text-accent font-semibold">TÍNH NĂNG ĐỊNH VỊ</span>
            <h3 className="font-display text-base font-bold text-ink-900">
              Thuật Toán Quét Bán Kính Geo-Dispatch
            </h3>
            <p className="text-xs text-ink-700 leading-relaxed">
              Hệ thống tự động kích hoạt Looker gần nhất trong bán kính 3km, đảm bảo chi phí di chuyển tối thiểu và thời gian hoàn tất tác vụ thần tốc.
            </p>

            <div className="space-y-2 border-t border-rule-subtle pt-3 text-xs">
              <div className="flex items-center justify-between text-ink-700">
                <span>Sai số GPS định vị:</span>
                <span className="font-mono font-bold text-accent">± 3 mét</span>
              </div>
              <div className="flex items-center justify-between text-ink-700">
                <span>Chống Fake GPS:</span>
                <span className="font-mono font-bold text-accent">100% Khóa cứng</span>
              </div>
              <div className="flex items-center justify-between text-ink-700">
                <span>Kiểm tra Cell Tower:</span>
                <span className="font-mono font-bold text-accent-blue">Đa trạm BTS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
