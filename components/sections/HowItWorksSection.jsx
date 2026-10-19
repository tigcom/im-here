'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ActionButton from '../ActionButton';
import { useAuth } from '@/components/auth/AuthContext';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const HIRER_STEPS = [
  {
    n: '01',
    title: 'Đăng tin',
    text: 'Mô tả việc cần làm, địa điểm và mức thù lao bạn muốn trả. Ảnh hay hướng dẫn thêm là tuỳ bạn.',
  },
  {
    n: '02',
    title: 'Chọn người nhận',
    text: 'Xem hồ sơ những người nhận gần đó và chọn người bạn thấy phù hợp. Tiền được giữ an toàn tới khi xong việc.',
  },
  {
    n: '03',
    title: 'Xác nhận hoàn thành',
    text: 'Nhận kết quả, xác nhận đã xong và thù lao được giải phóng cho người nhận.',
  },
];

const WORKER_STEPS = [
  {
    n: '01',
    title: 'Tìm việc gần bạn',
    text: 'Mở chợ việc, lọc theo khu vực và thời gian rảnh. Nhận việc chỉ bằng một chạm.',
  },
  {
    n: '02',
    title: 'Làm và gửi kết quả',
    text: 'Thực hiện theo mô tả, gửi kết quả hoặc ảnh xác nhận cho người đăng.',
  },
  {
    n: '03',
    title: 'Nhận tiền vào ví',
    text: 'Người đăng xác nhận là tiền vào ví. Rút về ngân hàng bất cứ lúc nào.',
  },
];

export default function HowItWorksSection() {
  const root = useRef(null);
  const { currentUser } = useAuth();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.process-cluster-card', {
          y: 40,
          opacity: 0,
          duration: 0.85,
          stagger: 0.16,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: root.current,
            start: 'top 72%',
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
      id="cach-hoat-dong"
      ref={root}
      className="relative bg-paper-000 px-[6vw] py-20 md:py-28"
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-14 grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 lg:col-span-8">
            <span className="label text-accent font-semibold block">03 — CÁCH HOẠT ĐỘNG</span>
            <h2 className="display-lg mt-3 font-bold text-ink-900">
              Ba bước cho mỗi phía.
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-4">
            <p className="body-md text-ink-700">
              Im-Here chỉ làm một việc: nối người cần thuê với người rảnh. Không bước
              thừa, không thủ tục rườm rà.
            </p>
          </div>
        </div>

        {/* Lưới bất đối xứng 7/5 */}
        <div className="grid grid-cols-12 gap-8 items-start">
          {/* NGƯỜI ĐĂNG TIN (7 CỘT) */}
          <div className="process-cluster-card card-float col-span-12 lg:col-span-7 p-8 md:p-10">
            <div className="flex items-center justify-between border-b border-rule-subtle pb-5">
              <span className="inline-flex items-center rounded-full bg-accent px-3.5 py-1 font-mono text-xs font-bold text-paper-000">
                NẾU BẠN CẦN THUÊ NGƯỜI
              </span>
              <span className="font-mono text-xs font-semibold text-ink-500">NGƯỜI ĐĂNG TIN</span>
            </div>

            <ol className="mt-6 space-y-6">
              {HIRER_STEPS.map((s) => (
                <li key={s.n} className="flex items-start gap-4">
                  <span className="font-display text-2xl font-bold text-accent tabular shrink-0">
                    {s.n}
                  </span>
                  <div>
                    <h3 className="display-md font-bold text-ink-900">{s.title}</h3>
                    <p className="body-md mt-1.5 text-ink-700">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-8">
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
            </div>
          </div>

          {/* NGƯỜI NHẬN VIỆC (5 CỘT, LỆCH TRỤC) */}
          <div className="process-cluster-card card-float col-span-12 lg:col-span-5 lg:translate-y-10 p-8 md:p-10">
            <div className="flex items-center justify-between border-b border-rule-subtle pb-5">
              <span className="inline-flex items-center rounded-full bg-accent-blue px-3.5 py-1 font-mono text-xs font-bold text-paper-000">
                NẾU BẠN MUỐN NHẬN VIỆC
              </span>
              <span className="font-mono text-xs font-semibold text-ink-500">NGƯỜI NHẬN</span>
            </div>

            <ol className="mt-6 space-y-6">
              {WORKER_STEPS.map((s) => (
                <li key={s.n} className="flex items-start gap-4">
                  <span className="font-display text-2xl font-bold text-accent-blue tabular shrink-0">
                    {s.n}
                  </span>
                  <div>
                    <h3 className="display-md font-bold text-ink-900">{s.title}</h3>
                    <p className="body-md mt-1.5 text-ink-700">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-8">
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
          </div>
        </div>
      </div>
    </section>
  );
}
