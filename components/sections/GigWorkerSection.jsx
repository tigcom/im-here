'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ActionButton from '../ActionButton';
import { useAuth } from '@/components/auth/AuthContext';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const PILLARS = [
  {
    tag: 'TỰ DO',
    accent: 'text-accent',
    title: 'Không áp chỉ tiêu',
    text: 'Bật ứng dụng khi rảnh, tắt khi bận. Không KPI, không ca cứng.',
  },
  {
    tag: 'NHẬN TIỀN',
    accent: 'text-accent-blue',
    title: 'Tiền vào ví',
    text: 'Người đăng xác nhận là tiền vào ví, rút về ngân hàng bất cứ lúc nào.',
  },
  {
    tag: 'ĐƠN GIẢN',
    accent: 'text-accent-orange',
    title: 'Duyệt hồ sơ là làm',
    text: 'Gửi hồ sơ một lần, duyệt xong là nhận việc được ngay.',
  },
];

export default function GigWorkerSection() {
  const root = useRef(null);
  const { currentUser } = useAuth();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.gig-content-col', {
          y: 35,
          opacity: 0,
          duration: 0.9,
          ease: 'expo.out',
          scrollTrigger: { trigger: root.current, start: 'top 75%', once: true },
        });

        gsap.from('.gig-visual-col', {
          scale: 0.95,
          opacity: 0,
          duration: 1,
          delay: 0.15,
          ease: 'expo.out',
          scrollTrigger: { trigger: root.current, start: 'top 75%', once: true },
        });
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section
      id="nguoi-nhan-viec"
      ref={root}
      className="relative overflow-hidden bg-gradient-to-b from-paper-000 via-paper-100/60 to-paper-000 px-[6vw] py-40 md:py-56"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 h-[550px] w-[550px] rounded-full bg-accent/15 blur-[120px]"
      />

      <div className="mx-auto max-w-[1600px] relative z-10">
        {/* LƯỚI 7 / 5 */}
        <div className="grid grid-cols-12 items-center gap-y-12 lg:gap-x-12">
          {/* CỘT TRÁI: NỘI DUNG */}
          <div className="gig-content-col col-span-12 lg:col-span-7">
            <span className="label text-accent font-semibold block">04 — DÀNH CHO NGƯỜI NHẬN VIỆC</span>

            <h2 className="display-lg mt-3 font-bold text-ink-900">
              Rảnh lúc nào, kiếm lúc đó.
            </h2>

            <p className="body-lg mt-6 max-w-[620px] text-ink-700">
              Bạn có thời gian trống và muốn kiếm thêm? Mở chợ việc của Im-Here, chọn
              việc gần nhà đúng lúc bạn rảnh — đi chợ dùm, chở đồ, trông coi nhà,
              hay kiểm định nếu bạn thích. Không ai ép bạn nhận việc nào.
            </p>

            {/* Ba trụ cột */}
            <div className="mt-8 flex flex-wrap gap-4">
              {PILLARS.map((p) => (
                <div key={p.title} className="card-tinted flex-1 min-w-[180px] p-4">
                  <span className={`font-mono text-xs font-bold ${p.accent}`}>{p.tag}</span>
                  <h4 className="mt-1 font-display text-base font-bold text-ink-900">
                    {p.title}
                  </h4>
                  <p className="mt-1 text-xs text-ink-500">{p.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <ActionButton
                variant="primary"
                onClick={() => {
                  if (!currentUser) {
                    window.location.href = '/login?redirect=/looker';
                  } else {
                    window.location.href = '/looker';
                  }
                }}
              >
                Bắt đầu nhận việc
              </ActionButton>
              <ActionButton
                variant="ghost"
                onClick={() => {
                  if (!currentUser) {
                    window.location.href = '/register';
                  } else {
                    window.location.href = '/looker';
                  }
                }}
              >
                Gửi hồ sơ tham gia
              </ActionButton>
            </div>
          </div>

          {/* CỘT PHẢI: ẢNH */}
          <div className="gig-visual-col col-span-12 relative lg:col-span-5">
            <div className="relative p-2 md:p-4">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-accent/20 blur-[80px]"
              />

              <div className="card-float relative overflow-hidden p-3.5">
                <img
                  src="/images/b2c-gig-worker-happy.png"
                  alt="Người nhận việc Im-Here nhận thù lao qua ví"
                  className="w-full rounded-2xl object-cover transition-[transform] duration-500 hover:scale-[1.02]"
                  loading="lazy"
                />
              </div>

              {/* Badge nổi: nhận tiền vào ví */}
              <div className="card-float absolute -bottom-6 -left-6 z-20 max-w-[300px] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-paper-000">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <div>
                    <span className="label block text-[0.5625rem] text-accent font-bold">TIỀN VÀO VÍ</span>
                    <span className="font-mono text-base font-bold text-accent tabular">
                      +120.000 đ
                    </span>
                    <span className="block text-[0.6875rem] text-ink-500 font-medium">
                      Việc: Giao hàng nội thành
                    </span>
                  </div>
                </div>
              </div>

              {/* Badge nổi: tự do */}
              <div className="glass-panel absolute -top-4 right-4 z-20 hidden sm:flex items-center gap-2 px-3.5 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                <span className="font-mono text-xs font-bold text-ink-900">Tự chọn việc · Tự chọn giờ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
