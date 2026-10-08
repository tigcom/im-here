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
      className="relative bg-paper-100/50 px-[6vw] py-24 md:py-32"
    >
      <div className="mx-auto max-w-[1600px]">
        {/* 2-COLUMN CONFIGURATION (4 CỘT TRÁI / 8 CỘT PHẢI) */}
        <div className="grid grid-cols-12 items-center gap-y-12 lg:gap-x-12">
          {/* CỘT TRÁI: 3D STYLE PADLOCK TRÊN SUBTLE CARD CÓ BADGE PCI-DSS */}
          <div className="col-span-12 lg:col-span-4">
            <div className="card-float overflow-hidden p-8 text-center">
              <div className="mx-auto max-w-[260px]">
                <img
                  src="/images/trust-security-padlock.png"
                  alt="Hệ thống bảo mật dữ liệu cấp Fintech Im-Here"
                  className="w-full object-contain"
                  loading="lazy"
                />
              </div>
              <div className="mt-8 border-t border-rule-subtle pt-6 space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 font-mono text-xs font-bold text-accent">
                  ✓ FINTECH-GRADE SECURITY
                </span>
                <span className="font-display text-base font-bold text-ink-900 block">
                  100% Bảo Mật &amp; PCI-DSS Ready
                </span>
                <p className="text-xs text-ink-500">
                  Chuẩn mã hóa ngân hàng liên kết trực tiếp cổng 9Pay
                </p>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: DISTINCTLY SEPARATED CARD-STYLE ROWS */}
          <div className="col-span-12 lg:col-span-8">
            <span className="label text-accent font-semibold block">06 — AN TOÀN DỮ LIỆU</span>
            <h2 className="display-lg mt-3 font-bold text-ink-900">
              Hàng Rào Bảo Mật Tiêu Chuẩn Fintech
            </h2>
            <p className="body-md mt-4 text-ink-700">
              Trong thu thập dữ liệu hiện trường, một tấm ảnh giả mạo có thể làm sai lệch quyết định tín dụng hàng tỷ đồng. Im-Here triển khai 3 lớp phòng vệ tuyệt đối:
            </p>

            <div className="mt-8 space-y-4">
              {/* Row 1: Anti-Spoofing Shield with Custom Emerald Icon Badge */}
              <div className="security-card-row card-float p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-accent border border-accent/20">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-display text-lg font-bold text-ink-900">
                        Chống Giả Mạo Vị Trí Cấp Phần Cứng (Anti-Spoofing Shield)
                      </h3>
                      <span className="hidden sm:inline-flex rounded-full bg-accent/15 px-2.5 py-0.5 font-mono text-[0.625rem] font-bold text-accent">
                        HARDWARE-LOCK
                      </span>
                    </div>
                    <p className="body-md mt-1.5 text-ink-700">
                      Tự động chặn đứng các ứng dụng Fake GPS, máy ảo giả lập Android, và phân tích độ trễ tín hiệu đa trạm phát sóng di động (Cell Towers) để đảm bảo Looker đang đứng đúng toạ độ thực.
                    </p>
                  </div>
                </div>
              </div>

              {/* Row 2: Strict Live Camera with Custom Royal Blue Icon Badge */}
              <div className="security-card-row card-float p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-blue/15 text-accent-blue border border-accent-blue/20">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2.2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" strokeWidth="2.2" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-display text-lg font-bold text-ink-900">
                        Camera Live Chống Tải Ảnh Thư Viện (Strict Live Camera)
                      </h3>
                      <span className="hidden sm:inline-flex rounded-full bg-accent-blue/15 px-2.5 py-0.5 font-mono text-[0.625rem] font-bold text-accent-blue">
                        SHA-256 EXIF
                      </span>
                    </div>
                    <p className="body-md mt-1.5 text-ink-700">
                      Vô hiệu hóa tính năng chọn ảnh từ bộ sưu tập điện thoại. Hình ảnh chụp được tự động nhúng Watermark mã hóa toạ độ, timestamp và chữ ký số SHA-256 chống photoshop.
                    </p>
                  </div>
                </div>
              </div>

              {/* Row 3: Hạch toán 9Pay with Custom Orange/Gold Icon Badge */}
              <div className="security-card-row card-float p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-orange/15 text-accent-orange border border-accent-orange/20">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <rect x="2" y="4" width="20" height="16" rx="2" strokeWidth="2.2" />
                      <path d="M2 10h20M7 15h2" strokeWidth="2.2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-display text-lg font-bold text-ink-900">
                        Hạch Toán &amp; Đối Soát Tức Thì Qua Cổng 9Pay
                      </h3>
                      <span className="hidden sm:inline-flex rounded-full bg-accent-orange/15 px-2.5 py-0.5 font-mono text-[0.625rem] font-bold text-accent-orange">
                        VAT ĐIỆN TỬ
                      </span>
                    </div>
                    <p className="body-md mt-1.5 text-ink-700">
                      Mọi luồng tiền được bảo chứng bởi đơn vị trung gian thanh toán uy tín. Doanh nghiệp nhận hóa đơn điện tử đầy đủ hợp lệ, Looker được khấu trừ thuế TNCN tự động, không rủi ro pháp lý.
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
