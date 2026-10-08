'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ActionButton from '../ActionButton';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function GigWorkerSection() {
  const root = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.gig-content-col', {
          y: 35,
          opacity: 0,
          duration: 0.9,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: root.current,
            start: 'top 75%',
            once: true,
          },
        });

        gsap.from('.gig-visual-col', {
          scale: 0.95,
          opacity: 0,
          duration: 1,
          delay: 0.15,
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
      id="cong-tac-vien"
      ref={root}
      className="relative overflow-hidden bg-gradient-to-b from-paper-000 via-paper-100/60 to-paper-000 px-[6vw] py-24 md:py-32"
    >
      {/* Vùng ánh sáng ngọc dịu dàng tạo cảm giác mở */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 h-[550px] w-[550px] rounded-full bg-accent/15 blur-[120px]"
      />

      <div className="mx-auto max-w-[1600px] relative z-10">
        {/* 2-COLUMN SPREAD (7 CỘT TRÁI / 5 CỘT PHẢI) */}
        <div className="grid grid-cols-12 items-center gap-y-12 lg:gap-x-12">
          {/* CỘT TRÁI: TIÊU ĐỀ, LIST ITEMS, BUTTON & 3D INCOME MOCKUP */}
          <div className="gig-content-col col-span-12 lg:col-span-7">
            <span className="label text-accent font-semibold block">05 — DÀNH CHO CỘNG TÁC VIÊN</span>

            {/* Tiêu đề — TYP-03: ≤ 7 từ */}
            <h2 className="display-lg mt-3 font-bold text-ink-900">
              Biến Thời Gian Rảnh Thành Thu Nhập
            </h2>

            <p className="body-lg mt-6 max-w-[620px] text-ink-700">
              Bạn thường xuyên di chuyển ngoài đường? Hãy trở thành một Looker của Im-Here. Nhận nhiệm vụ chụp ảnh trên đường đi làm hoặc quanh khu vực bạn sinh sống và nhận thù lao ngay trong ngày.
            </p>

            {/* 3 Thẻ Trụ Cột Đãi Ngộ */}
            <div className="mt-8 flex flex-wrap gap-4">
              <div className="card-tinted flex-1 min-w-[170px] p-4">
                <span className="font-mono text-xs text-accent font-bold">50K - 350K Đ</span>
                <h4 className="mt-1 font-display text-base font-bold text-ink-900">
                  Thù Lao Mỗi Task
                </h4>
                <p className="mt-1 text-xs text-ink-500">
                  Chỉ mất 5–15 phút chụp ảnh tại điểm đến.
                </p>
              </div>

              <div className="card-tinted flex-1 min-w-[170px] p-4">
                <span className="font-mono text-xs text-accent-blue font-bold">TỨC THÌ 24/7</span>
                <h4 className="mt-1 font-display text-base font-bold text-ink-900">
                  Ví 9Pay Tự Động
                </h4>
                <p className="mt-1 text-xs text-ink-500">
                  Rút về mọi ngân hàng trong 30 giây.
                </p>
              </div>

              <div className="card-tinted flex-1 min-w-[170px] p-4">
                <span className="font-mono text-xs text-accent-orange font-bold">TỰ DO 100%</span>
                <h4 className="mt-1 font-display text-base font-bold text-ink-900">
                  Không Áp Chỉ Tiêu
                </h4>
                <p className="mt-1 text-xs text-ink-500">
                  Chủ động bật tắt ứng dụng theo lịch rảnh.
                </p>
              </div>
            </div>

            {/* Quy trình 3 bước gia nhập */}
            <div className="card-float mt-8 p-6">
              <span className="label text-[0.625rem] text-ink-500 font-semibold">QUY TRÌNH 3 BƯỚC THAM GIA</span>
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div className="flex flex-1 min-w-[160px] items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-paper-000 font-mono text-xs font-bold">1</span>
                  <div>
                    <span className="block font-bold text-ink-900">Tải App Im-Here</span>
                    <span className="text-xs text-ink-500">Định danh CCCD 2 phút</span>
                  </div>
                </div>
                <div className="flex flex-1 min-w-[160px] items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-blue text-paper-000 font-mono text-xs font-bold">2</span>
                  <div>
                    <span className="block font-bold text-ink-900">Làm Test 5 Phút</span>
                    <span className="text-xs text-ink-500">Học quy tắc chụp ảnh</span>
                  </div>
                </div>
                <div className="flex flex-1 min-w-[160px] items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-orange text-paper-000 font-mono text-xs font-bold">3</span>
                  <div>
                    <span className="block font-bold text-ink-900">Bật Định Vị Live</span>
                    <span className="text-xs text-ink-500">Nhận tiền ngay khi duyệt</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Nút hành động nổi bật */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <ActionButton
                variant="primary"
                onClick={() => {
                  window.location.href = '/app';
                }}
              >
                Mở Giao Diện App Looker (Demo)
              </ActionButton>
              <ActionButton
                variant="ghost"
                onClick={() => {
                  const el = document.getElementById('lien-he');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Đăng Ký Looker Đối Tác
              </ActionButton>
              <span className="text-xs text-ink-500 font-medium">
                Miễn phí 100% · Hỗ trợ 24/7 qua cộng đồng Zalo/Telegram Looker
              </span>
            </div>
          </div>

          {/* CỘT PHẢI: FRAMED PHOTOGRAPH CỦA LOOKER VỚI 3D ACTIVE OVERLAPS */}
          <div className="gig-visual-col col-span-12 relative lg:col-span-5">
            <div className="relative p-2 md:p-4">
              {/* Vầng hào quang phát sáng sau ảnh chân dung */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-accent/20 blur-[80px]"
              />

              {/* Ảnh Looker vui vẻ framed trong thẻ card-float */}
              <div className="card-float relative overflow-hidden p-3.5">
                <img
                  src="/images/b2c-gig-worker-happy.png"
                  alt="Cộng tác viên Looker Im-Here nhận thù lao nhanh chóng"
                  className="w-full rounded-2xl object-cover transition-[transform] duration-500 hover:scale-[1.02]"
                  loading="lazy"
                />
              </div>

              {/* 3D BADGE OVERLAP 1: Thông báo biến động số dư ví 9Pay */}
              <div className="card-float absolute -bottom-6 -left-6 z-20 max-w-[310px] p-4.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-paper-000">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <div>
                    <span className="label block text-[0.5625rem] text-accent font-bold">TIỀN VỀ VÍ 9PAY</span>
                    <span className="font-mono text-base font-bold text-accent tabular">
                      +120.000 đ
                    </span>
                    <span className="block text-[0.6875rem] text-ink-500 font-medium">Task: Khảo sát quầy VinMart Q.1</span>
                  </div>
                </div>
              </div>

              {/* 3D BADGE OVERLAP 2: Đánh giá uy tín Looker 5 sao */}
              <div className="glass-panel absolute -top-4 right-4 z-20 hidden sm:flex items-center gap-2 px-3.5 py-2">
                <span className="text-accent-amber text-sm">★★★★★</span>
                <span className="font-mono text-xs font-bold text-ink-900">4.98 / 5.0 Rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
