'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function TrustSecuritySection() {
  const root = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.security-card-row', {
          y: 28,
          opacity: 0,
          duration: 0.8,
          stagger: 0.12,
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
      id="bao-mat"
      ref={root}
      className="relative bg-paper-100/50 px-[6vw] py-20 md:py-28 border-t border-rule-subtle"
    >
      <div className="mx-auto max-w-[1600px]">
        {/* 2-COLUMN CONFIGURATION (4 CỘT TRÁI / 8 CỘT PHẢI) */}
        <div className="grid grid-cols-12 items-center gap-y-12 lg:gap-x-12">
          {/* CỘT TRÁI: 3D STYLE PADLOCK TRÊN SUBTLE CARD CÓ BADGE PCI-DSS */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-paper-000 border border-rule-subtle shadow-card rounded-3xl overflow-hidden p-8 text-center">
              <div className="mx-auto max-w-[260px]">
                <img
                  src="/images/trust-security-padlock.png"
                  alt="Hệ thống bảo mật dữ liệu cấp Fintech Im-Here"
                  className="w-full object-contain"
                  loading="lazy"
                />
              </div>
              <div className="mt-8 border-t border-rule-subtle pt-6 space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-quiet px-3 py-1 font-mono text-xs font-bold text-accent">
                  ✓ KÝ QUỸ ESCROW ĐẢM BẢO
                </span>
                <span className="font-display text-base font-bold text-ink-900 block">
                  Bảo Vệ Quyền Lợi Hai Phía
                </span>
                <p className="text-xs text-ink-500">
                  Ký quỹ tạm giữ khi tạo việc, giải ngân tự động sau khi nghiệm thu
                </p>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: DISTINCTLY SEPARATED CARD-STYLE ROWS */}
          <div className="col-span-12 lg:col-span-8">
            <span className="label font-mono text-xs text-accent font-semibold block uppercase tracking-wider">
              08 — CƠ CHẾ BẢO ĐẢM
            </span>
            <h2 className="font-display [font-size:clamp(1.75rem,3.2vw,2.5rem)] mt-3 font-bold text-ink-900 leading-tight">
              Quy Trình Kiểm Soát Thực Địa Nghiêm Ngặt
            </h2>
            <p className="mt-4 text-sm text-ink-700 leading-relaxed max-w-2xl">
              Nền tảng Tôi Đây (Im-Here) vận hành theo ba nguyên tắc kiểm soát chất lượng cốt lõi:
            </p>

            <div className="mt-8 space-y-4">
              {/* Row 1: GPS Check-in 100m */}
              <div className="security-card-row bg-paper-000 border border-rule-subtle shadow-card rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-quiet text-accent border border-accent/20">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-display text-lg font-bold text-ink-900">
                        Kiểm Soát Bán Kính Thực Địa 100m
                      </h3>
                      <span className="hidden sm:inline-flex rounded-full bg-accent-quiet px-2.5 py-0.5 font-mono text-[0.625rem] font-bold text-accent">
                        ≤ 100M GPS
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-ink-700 leading-relaxed">
                      Bắt buộc Người nhận việc phải có mặt trong bán kính ≤ 100m so với tọa độ đích và bấm Check-in thành công mới mở khóa bước chụp ảnh và nộp báo cáo.
                    </p>
                  </div>
                </div>
              </div>

              {/* Row 2: 2-Stage Execution */}
              <div className="security-card-row bg-paper-000 border border-rule-subtle shadow-card rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-blue/10 text-accent-blue border border-accent-blue/20">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2.2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" strokeWidth="2.2" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-display text-lg font-bold text-ink-900">
                        Thực Thi 2 Chặng &amp; Hoàn Thành Checklist
                      </h3>
                      <span className="hidden sm:inline-flex rounded-full bg-accent-blue/10 px-2.5 py-0.5 font-mono text-[0.625rem] font-bold text-accent-blue">
                        2-STAGE AUDIT
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-ink-700 leading-relaxed">
                      Chặng 1 Check-in vị trí, Chặng 2 mở khóa form tải ảnh/video thực tế kèm checklist câu hỏi xác thực theo yêu cầu của Người thuê.
                    </p>
                  </div>
                </div>
              </div>

              {/* Row 3: Escrow */}
              <div className="security-card-row bg-paper-000 border border-rule-subtle shadow-card rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-orange/10 text-accent-orange border border-accent-orange/20">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <rect x="2" y="4" width="20" height="16" rx="2" strokeWidth="2.2" />
                      <path d="M2 10h20M7 15h2" strokeWidth="2.2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-display text-lg font-bold text-ink-900">
                        Ký Quỹ Đảm Bảo Escrow &amp; Sổ Cái Minh Bạch
                      </h3>
                      <span className="hidden sm:inline-flex rounded-full bg-accent-orange/10 px-2.5 py-0.5 font-mono text-[0.625rem] font-bold text-accent-orange">
                        INTERNAL ESCROW
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-ink-700 leading-relaxed">
                      Hệ thống tự động tạm giữ 100% thù lao khi đăng việc, giải ngân ngay khi người thuê nghiệm thu (hoặc tự động duyệt sau 24h), và hoàn tiền đầy đủ nếu hủy việc theo quy định.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
