'use client';

import { useState } from 'react';

export default function CTASection() {
  const [formState, setFormState] = useState('idle');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [need, setNeed] = useState('retail');

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormState('loading');
    setTimeout(() => {
      setFormState('success');
    }, 1000);
  };

  return (
    <section
      id="lien-he"
      className="relative bg-paper-000 px-[6vw] py-24 md:py-32"
    >
      <div className="mx-auto max-w-[1600px]">
        {/* VIBRANT EMERALD-TO-BLUE-GREEN GRADIENT SECTION VỚI RICH WHITE TYPOGRAPHY */}
        <div className="panel-cta-gradient overflow-hidden p-8 md:p-14 text-paper-000">
          <div className="grid grid-cols-12 gap-y-10 lg:gap-x-12 items-center">
            {/* 7 CỘT: TIÊU ĐỀ & FORM DOANH NGHIỆP */}
            <div className="col-span-12 lg:col-span-7">
              <span className="label font-semibold text-paper-000/90 block">
                07 — KÍCH HOẠT DỮ LIỆU
              </span>

              {/* TYP-03: Tiêu đề ≤ 7 từ */}
              <h2 className="display-lg mt-3 font-bold text-paper-000">
                Sẵn Sàng Triển Khai Thực Địa Toàn Quốc
              </h2>

              <p className="body-md mt-4 text-paper-000/90 max-w-[580px]">
                Để lại thông tin chiến dịch để chuyên viên giải pháp của Im-Here liên hệ tư vấn cấu hình dashboard mẫu và tính toán dự toán thù lao trong vòng 15 phút.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[220px]">
                    <label htmlFor="company" className="block text-xs font-semibold text-paper-000/90">
                      Tên Doanh Nghiệp / Tổ Chức
                    </label>
                    <input
                      id="company"
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="VD: Ngân hàng ACB, Vinamilk..."
                      className="mt-2 w-full rounded-xl border border-rule-subtle bg-paper-000 px-4 py-3 text-sm text-ink-900 placeholder:text-ink-300 transition-[border-color] duration-160 focus-visible:outline-none"
                    />
                  </div>

                  <div className="flex-1 min-w-[220px]">
                    <label htmlFor="phone" className="block text-xs font-semibold text-paper-000/90">
                      Số Điện Thoại / Zalo
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="VD: 0988 123 456"
                      className="mt-2 w-full rounded-xl border border-rule-subtle bg-paper-000 px-4 py-3 text-sm text-ink-900 placeholder:text-ink-300 transition-[border-color] duration-160 focus-visible:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="need" className="block text-xs font-semibold text-paper-000/90">
                    Nhu Cầu Khảo Sát Chính
                  </label>
                  <select
                    id="need"
                    value={need}
                    onChange={(e) => setNeed(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-rule-subtle bg-paper-000 px-4 py-3 text-sm text-ink-900 transition-[border-color] duration-160 focus-visible:outline-none"
                  >
                    <option value="asset">Thẩm định tài sản bảo đảm (Ô tô / Bất động sản)</option>
                    <option value="retail">Khảo sát chuỗi bán lẻ &amp; Quầy kệ siêu thị</option>
                    <option value="kyc">Xác minh địa chỉ cư trú &amp; Doanh nghiệp (Field KYC)</option>
                    <option value="custom">Nhu cầu thu thập dữ liệu hiện trường đặc thù khác</option>
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={formState === 'loading' || formState === 'success'}
                    className="flex min-h-[50px] items-center justify-center rounded-xl bg-surface-950 px-8 py-3 text-sm font-bold text-paper-000 transition-[transform] duration-160 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {formState === 'success' ? '✓ Đã Gửi Thành Công' : 'Nhận Báo Giá & Tư Vấn Ngay'}
                  </button>
                  {formState === 'success' && (
                    <span className="text-sm font-bold text-paper-000">
                      Cảm ơn quý doanh nghiệp! Chúng tôi sẽ gọi lại ngay.
                    </span>
                  )}
                </div>
              </form>
            </div>

            {/* 5 CỘT: KHỐI TẢI APP LOOKER VỚI QR CODE & STORE BUTTONS BÊN PHẢI */}
            <div className="col-span-12 lg:col-span-5">
              <div className="card-float p-7 text-ink-900">
                <div className="flex items-center justify-between">
                  <span className="label text-accent font-semibold">DÀNH CHO LOOKERS</span>
                  <span className="inline-flex rounded-full bg-accent/15 px-2.5 py-0.5 font-mono text-[0.625rem] font-bold text-accent">
                    FREE APP
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-ink-900 mt-2">
                  Tải Ứng Dụng Im-Here
                </h3>
                <p className="text-xs text-ink-500 mt-1">
                  Quét mã QR để cài đặt ứng dụng trên iOS &amp; Android.
                </p>

                {/* QR Code Container với thiết kế nổi bật */}
                <div className="mt-5 flex flex-col items-center justify-center rounded-2xl border border-rule-subtle bg-paper-100 p-5">
                  <svg className="h-32 w-32 text-ink-900" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h4v2h-4v-2zm0 4h4v2h-4v-2zm-4-4h2v6h-2v-6zm6-6h2v4h-2V10zm-6 2h4v2h-4v-2zM5 5h2v2H5V5zm12 0h2v2h-2V5zM5 17h2v2H5v-2z" />
                  </svg>
                  <span className="mt-2 font-mono text-[0.625rem] text-ink-700 uppercase font-bold">
                    Quét mã cài đặt trên điện thoại
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    className="flex-1 rounded-xl border border-rule-subtle bg-paper-000 py-3 text-xs font-bold text-ink-900 transition-[border-color] duration-160 hover:border-accent"
                  >
                    App Store (iOS)
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-xl border border-rule-subtle bg-paper-000 py-3 text-xs font-bold text-ink-900 transition-[border-color] duration-160 hover:border-accent"
                  >
                    Google Play (Android)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
