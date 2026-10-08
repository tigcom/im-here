'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ActionButton from '../ActionButton';

export default function HeroSection() {
  const root = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.hero-headline-line', {
          y: 40,
          opacity: 0,
          duration: 0.9,
          ease: 'expo.out',
          stagger: 0.12,
        });

        gsap.from('.hero-meta', {
          y: 24,
          opacity: 0,
          duration: 0.8,
          delay: 0.25,
          ease: 'expo.out',
        });

        gsap.from('.hero-visual-card', {
          scale: 0.94,
          opacity: 0,
          duration: 1.1,
          delay: 0.2,
          ease: 'expo.out',
        });

        gsap.from('.hero-floating-badge', {
          y: 28,
          opacity: 0,
          duration: 0.8,
          delay: 0.5,
          ease: 'back.out(1.5)',
          stagger: 0.15,
        });
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      className="relative overflow-hidden bg-gradient-to-b from-paper-100 via-paper-000 to-paper-000 px-[6vw] pt-14 pb-20 md:pt-24 md:pb-28"
    >
      {/* Mesh gradient ánh xanh ngọc & xanh cyan nhẹ phía sau */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 right-0 h-[700px] w-[700px] rounded-full bg-accent/15 blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-48 left-1/4 h-[450px] w-[450px] rounded-full bg-accent-blue/10 blur-[120px]"
      />

      <div className="mx-auto max-w-[1600px] relative z-10">
        {/* LƯỚI 12 CỘT BẤT ĐỐI XỨNG: 7 CỘT TRÁI / 5 CỘT PHẢI */}
        <div className="grid grid-cols-12 items-center gap-y-12 lg:gap-x-12">
          {/* CỘT NỘI DUNG (7 CỘT) */}
          <div className="col-span-12 flex flex-col items-start lg:col-span-7">
            {/* Pill Badge nổi bật với chấm xanh ngọc */}
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-accent/25 bg-accent-quiet px-4 py-1.5 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span className="label text-accent font-semibold">
                NỀN TẢNG KIỂM ĐỊNH THỰC ĐỊA THẾ HỆ MỚI
              </span>
            </div>

            {/* Tiêu đề Hero — TYP-03: ≤ 7 từ, ≤ 50 ký tự */}
            <h1 className="display-xl font-bold tracking-tight text-ink-900">
              <span className="hero-headline-line block">Thu Thập Dữ Liệu</span>
              <span className="hero-headline-line block text-accent">Thực Địa Chuẩn Xác</span>
            </h1>

            {/* Sub-headline súc tích, độ tương phản cao */}
            <p className="hero-meta body-lg mt-6 max-w-[620px] text-ink-700">
              Kích hoạt mạng lưới hơn 50.000 cộng tác viên thẩm định tài sản, kiểm toán trưng bày bán lẻ và xác minh hiện trường khắp 63 tỉnh thành Việt Nam trong chưa đầy 24 giờ.
            </p>

            {/* Cụm Nút CTA bo tròn Pill phong cách Fintech cao cấp */}
            <div className="hero-meta mt-10 flex flex-wrap items-center gap-4">
              <ActionButton
                variant="primary"
                onClick={() => {
                  const el = document.getElementById('lien-he');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Khởi Tạo Chiến Dịch B2B
              </ActionButton>
              <ActionButton
                variant="ghost"
                onClick={() => {
                  const el = document.getElementById('cong-tac-vien');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Trở Thành Looker Đối Tác
              </ActionButton>
            </div>

            {/* 3 DISTINCT CARDS CÓ BO GÓC 20px, METRICS NỔI BẬT & TREND ARROWS */}
            <div className="hero-meta mt-14 flex flex-wrap gap-4 w-full max-w-[650px]">
              {/* Card 1 */}
              <div className="card-tinted flex-1 min-w-[180px] p-5">
                <div className="flex items-center justify-between">
                  <span className="label text-[0.625rem] text-ink-500 font-semibold">MẠNG LƯỚI LOOKER</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[0.625rem] font-bold text-accent">
                    ↑ 18%
                  </span>
                </div>
                <div className="mt-2 font-display text-3xl font-bold tabular text-ink-900">
                  54.200<span className="text-accent">+</span>
                </div>
                <p className="mt-1 text-xs text-ink-500 font-medium">Đối tác đã KYC sẵn sàng</p>
              </div>

              {/* Card 2 */}
              <div className="card-tinted flex-1 min-w-[180px] p-5">
                <div className="flex items-center justify-between">
                  <span className="label text-[0.625rem] text-ink-500 font-semibold">ĐỘ PHỦ ĐỊA BÀN</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent-blue/15 px-2 py-0.5 text-[0.625rem] font-bold text-accent-blue">
                    100%
                  </span>
                </div>
                <div className="mt-2 font-display text-3xl font-bold tabular text-ink-900">
                  63<span className="text-accent-blue">/63</span>
                </div>
                <p className="mt-1 text-xs text-ink-500 font-medium">Tỉnh thành toàn quốc</p>
              </div>

              {/* Card 3 */}
              <div className="card-tinted flex-1 min-w-[180px] p-5">
                <div className="flex items-center justify-between">
                  <span className="label text-[0.625rem] text-ink-500 font-semibold">TỐC ĐỘ TIẾP CẬN</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent-orange/15 px-2 py-0.5 text-[0.625rem] font-bold text-accent-orange">
                    Hỏa tốc
                  </span>
                </div>
                <div className="mt-2 font-display text-3xl font-bold tabular text-ink-900">
                  &lt; 4h
                </div>
                <p className="mt-1 text-xs text-ink-500 font-medium">Có mặt tại mục tiêu</p>
              </div>
            </div>
          </div>

          {/* CỘT THỊ GIÁC (5 CỘT): MULTI-LAYERED PREVIEW VỚI FLOATING ELEMENTS */}
          <div className="col-span-12 relative lg:col-span-5">
            <div className="relative p-2 md:p-4">
              {/* Vầng hào quang xanh ngọc 3D phát sáng */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[420px] w-[420px] rounded-full bg-accent/25 blur-[75px]"
              />

              {/* Thẻ chính chứa Mockup với bóng đa tầng diffused depth */}
              <div className="hero-visual-card card-float relative overflow-hidden p-3.5">
                <img
                  src="/images/hero-mockup.png"
                  alt="Im-Here Giao diện Mobile Looker kết hợp Dashboard Doanh nghiệp"
                  className="w-full rounded-2xl object-cover transition-[transform] duration-500 hover:scale-[1.02]"
                  loading="eager"
                />
              </div>

              {/* Floating Badge 1: Góc dưới trái — GPS Xác thực thời gian thực */}
              <div className="hero-floating-badge card-float absolute -bottom-6 -left-6 z-20 max-w-[290px] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-paper-000">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <span className="label block text-[0.625rem] text-accent font-bold">GPS HARDWARE SHIELD</span>
                    <span className="font-display text-sm font-bold text-ink-900 block mt-0.5">
                      Chống Giả Mạo 100%
                    </span>
                    <span className="text-[0.625rem] text-ink-500">Mã hóa tọa độ vệ tinh live</span>
                  </div>
                </div>
              </div>

              {/* Floating Badge 2: Góc trên phải — Đối soát tự động 24/7 */}
              <div className="hero-floating-badge card-float absolute -top-5 -right-5 z-20 hidden sm:block px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-accent animate-ping" />
                  <div>
                    <span className="label block text-[0.5625rem] text-ink-500">ĐỐI SOÁT TỨC THÌ</span>
                    <span className="font-mono text-xs font-bold text-accent tabular">
                      Ví 9Pay Tự Động 24/7
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating Badge 3: Góc giữa lơ lửng — Độc quyền kiểm định */}
              <div className="hero-floating-badge glass-panel absolute top-1/3 -left-8 z-20 hidden md:flex items-center gap-2 px-3 py-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-orange text-paper-000 text-[0.625rem] font-bold">★</span>
                <span className="font-mono text-[0.6875rem] font-bold text-ink-900">Chuẩn WeGoLook VN</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
