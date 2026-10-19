'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ActionButton from '../ActionButton';
import { getActiveCategories } from '@/lib/data/categories';
import { useAuth } from '@/components/auth/AuthContext';

export default function HeroSection() {
  const root = useRef(null);
  const { currentUser } = useAuth();

  // Nhãn việc lấy thẳng từ tầng dữ liệu — không gõ cứng.
  const preview = getActiveCategories().slice(0, 7);

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
          stagger: 0.08,
        });

        gsap.from('.hero-visual-card', {
          scale: 0.94,
          opacity: 0,
          duration: 0.7,
          delay: 0.1,
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
      {/* Vầng sáng ngọc dịu phía sau */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 right-0 h-[700px] w-[700px] rounded-full bg-accent/15 blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-48 left-1/4 h-[450px] w-[450px] rounded-full bg-accent-blue/10 blur-[120px]"
      />

      <div className="mx-auto max-w-[1600px] relative z-10">
        {/* LƯỚI 12 CỘT BẤT ĐỐI XỨNG: 7 / 5 */}
        <div className="grid grid-cols-12 items-center gap-y-12 lg:gap-x-12">
          {/* CỘT NỘI DUNG (7 CỘT) */}
          <div className="col-span-12 flex flex-col items-start lg:col-span-7">
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-accent/25 bg-accent-quiet px-4 py-1.5 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span className="label text-accent font-semibold">
                CHỢ LAO ĐỘNG · AI RẢNH THÌ NHẬN VIỆC
              </span>
            </div>

            {/* Tiêu đề Hero — TYP-03: ≤ 7 từ */}
            <h1 className="display-xl font-bold tracking-tight text-ink-900">
              <span className="hero-headline-line block">Việc gì cũng có</span>
              <span className="hero-headline-line block text-accent">người nhận.</span>
            </h1>

            <p className="hero-meta body-lg mt-6 max-w-[620px] text-ink-700">
              Ai có nhu cầu thì đăng tin thuê người, ai rảnh thì nhận việc. Chỉ cần
              duyệt hồ sơ là bắt đầu được — không cấp bậc, không chứng chỉ.
            </p>

            {/* Cụm CTA: hai phía người dùng */}
            <div className="hero-meta mt-10 flex flex-wrap items-center gap-4">
              <ActionButton
                variant="primary"
                onClick={() => {
                  if (!currentUser) {
                    window.location.href = '/login?redirect=/client/campaigns/new';
                  } else {
                    window.location.href = '/client/campaigns/new';
                  }
                }}
              >
                Đăng tin thuê người
              </ActionButton>
              <ActionButton
                variant="ghost"
                onClick={() => {
                  if (!currentUser) {
                    window.location.href = '/login?redirect=/looker';
                  } else {
                    window.location.href = '/looker';
                  }
                }}
              >
                Nhận việc kiếm tiền
              </ActionButton>
            </div>

            {/* Dải việc phổ biến — lấy thật từ CATEGORIES */}
            <div className="hero-meta mt-12 w-full max-w-[660px]">
              <span className="label text-ink-500 font-semibold block">
                VIỆC ĐANG CÓ TRÊN CHỢ
              </span>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {preview.map((cat) => (
                  <span
                    key={cat.id}
                    className="card-tinted px-3.5 py-2 text-xs font-semibold text-ink-700"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* CỘT THỊ GIÁC (5 CỘT) */}
          <div className="col-span-12 relative lg:col-span-5">
            <div className="relative p-2 md:p-4">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[420px] w-[420px] rounded-full bg-accent/20 blur-[75px]"
              />

              <div className="hero-visual-card card-float relative overflow-hidden p-3.5">
                <img
                  src="/images/hero-mockup.png"
                  alt="Ứng dụng Im-Here — đăng tin thuê người và nhận việc"
                  className="w-full rounded-2xl object-cover transition-[transform] duration-500 hover:scale-[1.02]"
                  loading="eager"
                />
              </div>

              {/* Badge nổi 1: điều kiện tham gia thật */}
              <div className="hero-floating-badge card-float absolute -bottom-6 -left-6 z-20 max-w-[290px] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-paper-000">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M9 12l2 2 4-4" />
                      <path d="M12 3l7 4v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4z" />
                    </svg>
                  </div>
                  <div>
                    <span className="label block text-[0.625rem] text-accent font-bold">ĐIỀU KIỆN DUY NHẤT</span>
                    <span className="font-display text-sm font-bold text-ink-900 block mt-0.5">
                      Duyệt hồ sơ là làm
                    </span>
                    <span className="text-[0.625rem] text-ink-500">Không cấp bậc · Không chứng chỉ</span>
                  </div>
                </div>
              </div>

              {/* Badge nổi 2: hai phía của chợ */}
              <div className="hero-floating-badge card-float absolute -top-5 -right-5 z-20 hidden sm:block px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-accent-blue" />
                  <div>
                    <span className="label block text-[0.5625rem] text-ink-500">HAI PHÍA GẶP NHAU</span>
                    <span className="font-mono text-xs font-bold text-accent-blue tabular">
                      Người đăng · Người nhận
                    </span>
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
