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
      className="relative px-[6vw] py-20 md:py-28 bg-paper-100/50"
    >
      <div className="mx-auto max-w-[1400px]">
        {/* TẤM THẺ STATEMENT CARD FINTECH NGUYÊN KHỐI */}
        <div className="relative overflow-hidden rounded-[32px] bg-ink-900 text-paper-000 px-8 py-16 md:px-16 md:py-24 text-center shadow-card border border-rule-subtle">
          {/* Hiệu ứng hạt phát sáng và quầng sáng ngọc */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-accent/25 blur-[120px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,oklch(0.68_0.198_152/0.4),transparent_70%)]"
          />

          <div className="quote-content relative z-10 mx-auto max-w-[1000px]">
            {/* Quote Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/15 px-4 py-1.5">
              <span className="font-mono text-xs font-bold text-accent uppercase tracking-wider">
                TRIẾT LÝ DỮ LIỆU THỰC ĐỊA
              </span>
            </div>

            {/* Big Stylized Quote Marks */}
            <div className="mt-6 font-serif [font-size:clamp(3rem,6vw,5rem)] text-accent/30 leading-none select-none">
              “
            </div>

            {/* Grand Quote Statement */}
            <blockquote className="font-display [font-size:clamp(1.5rem,3.2vw,2.5rem)] -mt-4 md:-mt-6 font-bold leading-snug tracking-tight text-paper-000 max-w-[900px] mx-auto">
              Dữ liệu số chỉ thật sự có giá trị khi <span className="text-accent">phản ánh chuẩn xác</span> từng mét vuông hiện trường.
            </blockquote>

            {/* Attribution & Location Coordinate */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6 border-t border-paper-000/10 pt-8 text-paper-000/70 text-xs font-mono">
              <span className="uppercase tracking-widest text-accent font-semibold">
                21°01′40″B · 105°51′08″Đ — TỌA ĐỘ TIN CẬY
              </span>
              <span className="hidden sm:inline text-paper-000/30">|</span>
              <span className="uppercase tracking-wider">
                Im-Here Field Verification Infrastructure · ISO 27001
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
