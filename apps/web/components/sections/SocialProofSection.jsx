'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function SocialProofSection() {
  const root = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.proof-item', {
          y: 20,
          opacity: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: root.current,
            start: 'top 85%',
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
      className="border-y border-rule-subtle bg-paper-100/40 px-[6vw] py-14"
    >
      <div className="mx-auto max-w-[1600px]">
        {/* LƯỚI BẤT ĐỐI XỨNG 2/10 */}
        <div className="grid grid-cols-12 items-center gap-y-10 lg:gap-x-12">
          {/* 2 CỘT: TRỤC TỌA ĐỘ */}
          <div className="col-span-12 lg:col-span-2 border-l-2 border-accent pl-4">
            <span className="label block text-ink-500">02 — BẢO CHỨNG</span>
            <span className="font-display text-base font-bold text-ink-900 mt-1 block">
              Mạng Lưới Kiểm Định Toàn Diện
            </span>
          </div>

          {/* 10 CỘT: SÂN KHẤU DỮ LIỆU */}
          <div className="col-span-12 lg:col-span-10">
            <div className="flex flex-wrap gap-6">
              <div className="proof-item panel-card flex-1 min-w-[200px] p-5">
                <span className="label text-[0.625rem] text-accent font-semibold block">TỶ LỆ PHỦ SÓNG</span>
                <div className="mt-2 font-display text-3xl font-bold tabular text-ink-900">
                  63 / 63
                </div>
                <p className="mt-1 text-xs text-ink-500">
                  Tỉnh thành có Lookers trực chiến 24/7
                </p>
              </div>

              <div className="proof-item panel-card flex-1 min-w-[200px] p-5">
                <span className="label text-[0.625rem] text-accent font-semibold block">ĐỘ CHÍNH XÁC GPS</span>
                <div className="mt-2 font-display text-3xl font-bold tabular text-ink-900">
                  ± 3 mét
                </div>
                <p className="mt-1 text-xs text-ink-500">
                  Thuật toán đối chiếu đa vệ tinh
                </p>
              </div>

              <div className="proof-item panel-card flex-1 min-w-[200px] p-5">
                <span className="label text-[0.625rem] text-accent font-semibold block">SLA TRẢ DỮ LIỆU</span>
                <div className="mt-2 font-display text-3xl font-bold tabular text-ink-900">
                  &lt; 24 giờ
                </div>
                <p className="mt-1 text-xs text-ink-500">
                  Từ lúc khởi tạo tới duyệt hoàn tất
                </p>
              </div>

              <div className="proof-item panel-card flex-1 min-w-[200px] p-5">
                <span className="label text-[0.625rem] text-accent font-semibold block">TIÊU CHUẨN ĐỐI SOÁT</span>
                <div className="mt-2 font-display text-3xl font-bold tabular text-ink-900">
                  100%
                </div>
                <p className="mt-1 text-xs text-ink-500">
                  Đối soát ví điện tử qua cổng 9Pay
                </p>
              </div>
            </div>

            {/* Dải đối tác các ngành công nghiệp */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-6 border-t border-rule-subtle pt-6 text-ink-500">
              <span className="label text-[0.625rem]">ỨNG DỤNG CHO CÁC KHỐI NGÀNH:</span>
              <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-ink-700">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                  Ngân Hàng &amp; Cho Vay Tiêu Dùng
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                  Chuỗi Bán Lẻ &amp; FMCG Toàn Quốc
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                  Thẩm Định &amp; Định Giá Bất Động Sản
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                  Giám Định Hiện Trường Bảo Hiểm
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
