'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function PauseEditorialSection() {
  const root = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.quote-content', {
          y: 35,
          opacity: 0,
          duration: 1.1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: root.current,
            start: 'top 75%',
            once: true,
          },
        });
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      className="relative overflow-hidden bg-surface-950 px-[6vw] py-24 md:py-32 text-center"
    >
      {/* Hiệu ứng mạng lưới hạt phát sáng (Glowing network particles) và vầng sáng ngọc */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-accent/20 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_center,oklch(0.68_0.198_152/0.4),transparent_70%)]"
      />

      {/* Decorative Network Grid Lines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-10 bg-[linear-gradient(to_right,oklch(1_0_0/0.1)_1px,transparent_1px),linear-gradient(to_bottom,oklch(1_0_0/0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]"
      />

      <div className="quote-content mx-auto max-w-[1200px] relative z-10">
        {/* Quote Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/15 px-4 py-1.5">
          <span className="font-mono text-xs font-bold text-accent">TRIẾT LÝ DỮ LIỆU THỰC ĐỊA</span>
        </div>

        {/* Big Stylized Quote Marks */}
        <div className="mt-8 font-serif [font-size:clamp(3.5rem,8vw,6rem)] text-accent/30 leading-none select-none">
          “
        </div>

        {/* Grand Quote Statement in High-Contrast White & Emerald */}
        <blockquote className="display-lg -mt-6 md:-mt-8 font-bold leading-tight tracking-tight text-on-surface-900 max-w-[1000px] mx-auto">
          Dữ liệu số chỉ thật sự có giá trị khi <span className="text-accent">phản ánh chuẩn xác</span> từng mét vuông hiện trường.
        </blockquote>

        {/* Attribution & Location Coordinate */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 border-t border-rule-dark pt-8 text-on-surface-500">
          <span className="font-mono text-xs uppercase tracking-widest text-accent font-semibold">
            21°01′40″B · 105°51′08″Đ — TỌA ĐỘ TIN CẬY
          </span>
          <span className="hidden sm:inline text-on-surface-700">|</span>
          <span className="font-mono text-xs uppercase tracking-wider text-on-surface-700">
            Im-Here Field Verification Infrastructure · ISO 27001 Certified
          </span>
        </div>
      </div>
    </section>
  );
}
