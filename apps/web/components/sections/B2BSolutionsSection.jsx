'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function B2BSolutionsSection() {
  const root = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.solution-card', {
          y: 35,
          opacity: 0,
          duration: 0.9,
          stagger: 0.15,
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
      id="giai-phap"
      ref={root}
      className="relative bg-paper-000 px-[6vw] py-24 md:py-32"
    >
      <div className="mx-auto max-w-[1600px]">
        {/* INTRO BLOCK: Horizontal pill-shaped tag lists with emerald bullet points */}
        <div className="mb-14 flex flex-wrap items-center justify-between gap-6 border-b border-rule-subtle pb-8">
          <div>
            <span className="label text-accent font-semibold block">03 — GIẢI PHÁP DOANH NGHIỆP</span>
            <h2 className="display-lg mt-3 font-bold text-ink-900">
              Ba Trụ Cột Kiểm Định Hiện Trường
            </h2>
          </div>
          {/* Horizontal pill-shaped tag list */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-rule-subtle bg-paper-100 px-4 py-2 text-xs font-semibold text-ink-700">
              <span className="h-2 w-2 rounded-full bg-accent" />
              Ngân Hàng &amp; Tài Chính
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-rule-subtle bg-paper-100 px-4 py-2 text-xs font-semibold text-ink-700">
              <span className="h-2 w-2 rounded-full bg-accent-blue" />
              Bán Lẻ &amp; FMCG
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-rule-subtle bg-paper-100 px-4 py-2 text-xs font-semibold text-ink-700">
              <span className="h-2 w-2 rounded-full bg-accent-orange" />
              Bất Động Sản &amp; Bảo Hiểm
            </span>
          </div>
        </div>

        {/* CARD GRID: High contrast, thick white background, generous padding, card-float */}
        <div className="grid grid-cols-12 gap-8 items-start">
          {/* TRỤ CỘT 1 (7 CỘT): KIỂM ĐỊNH TÀI SẢN */}
          <div className="solution-card card-float col-span-12 lg:col-span-7 overflow-hidden p-8 md:p-10">
            <div className="flex flex-col h-full justify-between gap-8">
              <div>
                <div className="flex items-center justify-between">
                  <span className="label text-accent font-semibold">03.1 — THẨM ĐỊNH TÀI SẢN</span>
                  {/* Eye-catching pill tag */}
                  <span className="inline-flex items-center rounded-full bg-accent/15 px-3 py-1 font-mono text-xs font-bold text-accent">
                    28 ĐIỂM KIỂM SOÁT
                  </span>
                </div>
                <h3 className="display-md mt-4 font-bold text-ink-900">
                  Kiểm Định Phương Tiện &amp; Bất Động Sản
                </h3>
                <p className="body-md mt-3 text-ink-700">
                  Dành cho ngân hàng, tổ chức tài chính và đơn vị bảo hiểm. Lookers tiếp cận tài sản bảo đảm, chụp ảnh số khung số máy, kiểm tra hiện trạng thực tế, đo đạc kích thước và quay video hiện trường 360 độ.
                </p>

                {/* Bullet checklists with custom check-badges */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-rule-subtle bg-paper-100 px-4 py-2 text-xs font-semibold text-ink-700">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent/20 text-accent text-[0.625rem] font-bold">✓</span>
                    Chụp chi tiết ODO &amp; Khung xe
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-rule-subtle bg-paper-100 px-4 py-2 text-xs font-semibold text-ink-700">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent/20 text-accent text-[0.625rem] font-bold">✓</span>
                    Xác nhận ranh giới Bất động sản
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-rule-subtle bg-paper-100 px-4 py-2 text-xs font-semibold text-ink-700">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent/20 text-accent text-[0.625rem] font-bold">✓</span>
                    Kiểm tra tình trạng thế chấp
                  </span>
                </div>
              </div>

              {/* Photo masked nicely within rounded 16px frame */}
              <div className="relative overflow-hidden rounded-2xl border border-rule-subtle bg-paper-100/60 p-2.5">
                <img
                  src="/images/b2b-asset-inspection.png"
                  alt="Kiểm định tài sản thực địa Im-Here"
                  className="w-full rounded-xl object-cover transition-[transform] duration-500 hover:scale-[1.02]"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* TRỤ CỘT 2 (5 CỘT - DỊCH TRỤC DỌC): KHẢO SÁT BÁN LẺ */}
          <div className="solution-card card-float col-span-12 lg:col-span-5 lg:translate-y-10 overflow-hidden p-8 md:p-10">
            <div className="flex flex-col h-full justify-between gap-8">
              <div>
                <div className="flex items-center justify-between">
                  <span className="label text-accent font-semibold">03.2 — ĐO LƯỜNG ĐIỂM BÁN</span>
                  {/* Eye-catching pill tag */}
                  <span className="inline-flex items-center rounded-full bg-accent-blue/15 px-3 py-1 font-mono text-xs font-bold text-accent-blue">
                    SLA 4H HỎA TỐC
                  </span>
                </div>
                <h3 className="display-md mt-4 font-bold text-ink-900">
                  Khảo Sát Bán Lẻ &amp; Quầy Kệ FMCG
                </h3>
                <p className="body-md mt-3 text-ink-700">
                  Giúp nhãn hàng và nhà phân phối giám sát việc thực thi chương trình khuyến mãi, tình trạng hết hàng quầy kệ (Out-of-stock), và đối chiếu giá bán lẻ thực tế tại hàng nghìn điểm tạp hóa / siêu thị.
                </p>

                {/* Bullet checklists */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-rule-subtle bg-paper-100 px-4 py-2 text-xs font-semibold text-ink-700">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent-blue/20 text-accent-blue text-[0.625rem] font-bold">✓</span>
                    Đo độ phủ POSM trưng bày
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-rule-subtle bg-paper-100 px-4 py-2 text-xs font-semibold text-ink-700">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent-blue/20 text-accent-blue text-[0.625rem] font-bold">✓</span>
                    Kiểm tra giá niêm yết
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-rule-subtle bg-paper-100 px-4 py-2 text-xs font-semibold text-ink-700">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent-blue/20 text-accent-blue text-[0.625rem] font-bold">✓</span>
                    Phát hiện hàng cận date
                  </span>
                </div>
              </div>

              {/* Photo masked nicely within rounded 16px frame */}
              <div className="relative overflow-hidden rounded-2xl border border-rule-subtle bg-paper-100/60 p-2.5">
                <img
                  src="/images/b2b-retail-audit.png"
                  alt="Khảo sát quầy kệ siêu thị và bán lẻ Im-Here"
                  className="w-full rounded-xl object-cover transition-[transform] duration-500 hover:scale-[1.02]"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* TRỤ CỘT 3 (12 CỘT — EDITORIAL SPLIT): XÁC MINH DANH TÍNH */}
          <div className="solution-card card-float col-span-12 mt-4 lg:mt-6 overflow-hidden p-8 md:p-10">
            <div className="grid grid-cols-12 items-center gap-8">
              <div className="col-span-12 lg:col-span-5">
                <div className="flex items-center gap-3">
                  <span className="label text-accent font-semibold">03.3 — XÁC THỰC HIỆN TRƯỜNG</span>
                  <span className="inline-flex items-center rounded-full bg-accent-orange/15 px-3 py-1 font-mono text-xs font-bold text-accent-orange">
                    ĐỘC LẬP 100%
                  </span>
                </div>
                <h3 className="display-md mt-4 font-bold text-ink-900">
                  Xác Minh Địa Chỉ &amp; Nơi Cư Trú Thực Tế
                </h3>
                <p className="body-md mt-4 text-ink-700">
                  Giải pháp then chốt cho hồ sơ mở thẻ tín dụng, vay tiêu dùng và mở tài khoản doanh nghiệp. Looker đóng vai trò trinh sát viên độc lập: xác minh sự hiện diện của người vay, điều kiện sống, và xác nhận tình trạng hoạt động của trụ sở công ty.
                </p>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 rounded-xl border border-rule-subtle bg-paper-100/80 p-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent font-bold text-xs">✓</span>
                    <span className="text-sm font-semibold text-ink-900">Loại trừ 100% hồ sơ địa chỉ ma và sim rác</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-rule-subtle bg-paper-100/80 p-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent font-bold text-xs">✓</span>
                    <span className="text-sm font-semibold text-ink-900">Chụp bảng hiệu công ty và giấy phép kinh doanh</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-rule-subtle bg-paper-100/80 p-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent font-bold text-xs">✓</span>
                    <span className="text-sm font-semibold text-ink-900">Xác nhận tình trạng cư trú thực tế của người vay</span>
                  </div>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-7">
                <div className="relative overflow-hidden rounded-2xl border border-rule-subtle bg-paper-100/60 p-2.5">
                  <img
                    src="/images/b2b-kyc-verify.png"
                    alt="Xác thực danh tính và địa chỉ KYC hiện trường"
                    className="w-full rounded-xl object-cover transition-[transform] duration-500 hover:scale-[1.02]"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
