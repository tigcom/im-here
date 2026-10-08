'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function HowItWorksSection() {
  const root = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.process-cluster-card', {
          y: 40,
          opacity: 0,
          duration: 0.85,
          stagger: 0.18,
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
      id="quy-trinh"
      ref={root}
      className="relative bg-paper-100/50 px-[6vw] py-24 md:py-32"
    >
      <div className="mx-auto max-w-[1600px]">
        {/* Tiêu đề phân khu */}
        <div className="mb-16 grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 lg:col-span-8">
            <span className="label text-accent font-semibold block">04 — QUY TRÌNH HOẠT ĐỘNG</span>
            <h2 className="display-lg mt-3 font-bold text-ink-900">
              Vận Hành Tự Động Khép Kín
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-4">
            <p className="body-md text-ink-700">
              Từ lúc khởi tạo chiến dịch đến khi nhận báo cáo kiểm định hoàn tất, mọi bước diễn ra tự động trên hệ sinh thái Im-Here.
            </p>
          </div>
        </div>

        {/* ELEGANT CARD CLUSTERS: 4 BƯỚC VỚI VISUAL DEPTH & LARGE COLORED STEP NUMBERS */}
        <div className="space-y-12 lg:space-y-16">
          {/* Cụm Bước 1 & 2 */}
          <div className="grid grid-cols-12 gap-8 items-start">
            {/* BƯỚC 01 */}
            <div className="process-cluster-card card-float col-span-12 lg:col-span-6 p-8 md:p-10">
              <div className="flex items-center justify-between border-b border-rule-subtle pb-5">
                <span className="inline-flex items-center rounded-full bg-accent px-3.5 py-1 font-mono text-xs font-bold text-paper-000">
                  BƯỚC 01
                </span>
                <span className="font-mono text-xs font-semibold text-ink-500">CAMPAIGN BUILDER</span>
              </div>
              <h3 className="display-md mt-6 font-bold text-ink-900">
                Khởi Tạo Chiến Dịch Thực Địa
              </h3>
              <p className="body-md mt-3 text-ink-700">
                Doanh nghiệp nhập danh sách địa chỉ cần kiểm tra (hàng chục đến hàng nghìn điểm), thiết lập bảng câu hỏi khảo sát, yêu cầu góc chụp ảnh và đặt mức thù lao cho từng tác vụ.
              </p>
              <div className="mt-6 overflow-hidden rounded-2xl border border-rule-subtle bg-paper-100 p-2.5">
                <img
                  src="/images/how-it-works-1-campaign.png"
                  alt="Khởi tạo chiến dịch trên Im-Here Admin"
                  className="w-full rounded-xl object-cover transition-[transform] duration-500 hover:scale-[1.02]"
                  loading="lazy"
                />
              </div>
              <div className="mt-6 pt-4 border-t border-rule-subtle flex items-center justify-between">
                <span className="text-xs text-ink-500">Thời gian tạo: Dưới 5 phút</span>
                <a href="#lien-he" className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
                  Xem Campaign Builder Demo →
                </a>
              </div>
            </div>

            {/* BƯỚC 02 (LƯỚI LỆCH TRỤC) */}
            <div className="process-cluster-card card-float col-span-12 lg:col-span-6 lg:translate-y-10 p-8 md:p-10">
              <div className="flex items-center justify-between border-b border-rule-subtle pb-5">
                <span className="inline-flex items-center rounded-full bg-accent-blue px-3.5 py-1 font-mono text-xs font-bold text-paper-000">
                  BƯỚC 02
                </span>
                <span className="font-mono text-xs font-semibold text-ink-500">GEO-RADAR DISPATCH</span>
              </div>
              <h3 className="display-md mt-6 font-bold text-ink-900">
                Bắn Yêu Cầu Tới Lookers Gần Nhất
              </h3>
              <p className="body-md mt-3 text-ink-700">
                Hệ thống tự động quét bán kính toạ độ và thông báo tới những cộng tác viên có điểm tín nhiệm cao trong phạm vi 3–5 km. Looker bấm nhận việc tức thì qua điện thoại.
              </p>
              <div className="mt-6 overflow-hidden rounded-2xl border border-rule-subtle bg-paper-100 p-2.5">
                <img
                  src="/images/how-it-works-2-network.png"
                  alt="Thuật toán toả sóng phát lệnh tới Lookers"
                  className="w-full rounded-xl object-cover transition-[transform] duration-500 hover:scale-[1.02]"
                  loading="lazy"
                />
              </div>
              <div className="mt-6 pt-4 border-t border-rule-subtle flex items-center justify-between">
                <span className="text-xs text-ink-500">Tốc độ bắt nhận: &lt; 90 giây</span>
                <a href="#giai-phap" className="text-xs font-bold text-accent-blue hover:underline flex items-center gap-1">
                  Khám phá Radar Định vị →
                </a>
              </div>
            </div>
          </div>

          {/* Cụm Bước 3 & 4 */}
          <div className="grid grid-cols-12 gap-8 items-start pt-6 lg:pt-10">
            {/* BƯỚC 03 */}
            <div className="process-cluster-card card-float col-span-12 lg:col-span-7 p-8 md:p-10">
              <div className="flex items-center justify-between border-b border-rule-subtle pb-5">
                <span className="inline-flex items-center rounded-full bg-accent-orange px-3.5 py-1 font-mono text-xs font-bold text-paper-000">
                  BƯỚC 03
                </span>
                <span className="font-mono text-xs font-semibold text-ink-500">WATERMARK EXIF GPS</span>
              </div>
              <h3 className="display-md mt-6 font-bold text-ink-900">
                Thực Thi Báo Cáo Qua Ứng Dụng
              </h3>
              <p className="body-md mt-3 text-ink-700">
                Looker di chuyển tới địa điểm mục tiêu. App khóa camera bắt buộc chụp trực tiếp tại toạ độ, tự động chèn Watermark toạ độ GPS, mốc thời gian ISO và chữ ký số chống chỉnh sửa.
              </p>
              <div className="mt-6 overflow-hidden rounded-2xl border border-rule-subtle bg-paper-100 p-2.5">
                <img
                  src="/images/how-it-works-3-worker.png"
                  alt="Looker chụp ảnh hiện trường gắn GPS"
                  className="w-full rounded-xl object-cover transition-[transform] duration-500 hover:scale-[1.02]"
                  loading="lazy"
                />
              </div>
              <div className="mt-6 pt-4 border-t border-rule-subtle flex items-center justify-between">
                <span className="text-xs text-ink-500">Thời gian chụp: 5–15 phút</span>
                <a href="#bao-mat" className="text-xs font-bold text-accent-orange hover:underline flex items-center gap-1">
                  Tiêu chuẩn chống giả mạo →
                </a>
              </div>
            </div>

            {/* BƯỚC 04 (LƯỚI LỆCH TRỤC) */}
            <div className="process-cluster-card card-float col-span-12 lg:col-span-5 lg:-translate-y-8 p-8 md:p-10">
              <div className="flex items-center justify-between border-b border-rule-subtle pb-5">
                <span className="inline-flex items-center rounded-full bg-accent px-3.5 py-1 font-mono text-xs font-bold text-paper-000">
                  BƯỚC 04
                </span>
                <span className="font-mono text-xs font-semibold text-ink-500">AI AUDIT &amp; 9PAY</span>
              </div>
              <h3 className="display-md mt-6 font-bold text-ink-900">
                Kiểm Duyệt Kép &amp; Giải Ngân
              </h3>
              <p className="body-md mt-3 text-ink-700">
                AI quét độ sắc nét, nhận diện biển số/quầy kệ. Đội QA xác thực bước cuối. Doanh nghiệp nhận báo cáo đạt chuẩn, thù lao chuyển thẳng vào ví Looker chỉ sau 30 giây.
              </p>
              <div className="mt-6 overflow-hidden rounded-2xl border border-rule-subtle bg-paper-100 p-2.5">
                <img
                  src="/images/how-it-works-4-ai-qa.png"
                  alt="AI và QA kiểm duyệt dữ liệu bàn giao"
                  className="w-full rounded-xl object-cover transition-[transform] duration-500 hover:scale-[1.02]"
                  loading="lazy"
                />
              </div>
              <div className="mt-6 pt-4 border-t border-rule-subtle flex items-center justify-between">
                <span className="text-xs text-ink-500">Giải ngân: Tức thì qua ví 9Pay</span>
                <a href="#cong-tac-vien" className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
                  Cơ chế ví điện tử 9Pay →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
