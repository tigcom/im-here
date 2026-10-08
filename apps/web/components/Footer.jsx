'use client';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative border-t border-rule-dark bg-surface-950 px-[6vw] pt-16 pb-12 text-on-surface-500">
      <div className="mx-auto max-w-[1600px]">
        {/* STRUCTURED MULTIPLE COLUMNS */}
        <div className="grid grid-cols-12 gap-y-12 lg:gap-x-12">
          {/* CỘT 1: THƯƠNG HIỆU & GIỚI THIỆU (5 CỘT) */}
          <div className="col-span-12 lg:col-span-5">
            <div className="flex items-center gap-3">
              <img 
                src="/android-chrome-192x192.png" 
                alt="Im-Here Logo" 
                className="h-10 w-10 object-contain" 
              />
              <span className="font-display text-2xl font-bold tracking-tight text-on-surface-900">
                Im-Here<span className="text-accent">.</span>
              </span>
            </div>

            <p className="mt-4 max-w-[400px] text-xs leading-relaxed text-on-surface-500">
              Nền tảng Gig-economy kết nối mạng lưới cộng tác viên thu thập dữ liệu và kiểm định thực địa hàng đầu Việt Nam. Tích hợp thanh toán và giải ngân tức thì chuẩn Fintech 9Pay.
            </p>

            {/* Social Icons & Partner Trust */}
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rule-dark bg-surface-900 px-3 py-1 font-mono text-[0.6875rem] text-accent">
                ✓ 9Pay Fintech Partner
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rule-dark bg-surface-900 px-3 py-1 font-mono text-[0.6875rem] text-accent-blue">
                GPS Shield v2.4
              </span>
            </div>
          </div>

          {/* CỘT 2: GIẢI PHÁP DOANH NGHIỆP (3 CỘT) */}
          <div className="col-span-6 lg:col-span-3">
            <span className="label text-[0.6875rem] text-accent font-semibold block">GIẢI PHÁP DOANH NGHIỆP</span>
            <ul className="mt-4 space-y-3 text-xs">
              <li>
                <a href="#giai-phap" className="text-on-surface-700 transition-[color] duration-160 hover:text-accent">
                  Kiểm định tài sản &amp; xe cộ thế chấp
                </a>
              </li>
              <li>
                <a href="#giai-phap" className="text-on-surface-700 transition-[color] duration-160 hover:text-accent">
                  Khảo sát quầy kệ siêu thị &amp; FMCG
                </a>
              </li>
              <li>
                <a href="#giai-phap" className="text-on-surface-700 transition-[color] duration-160 hover:text-accent">
                  Xác minh địa chỉ &amp; KYC thực tế
                </a>
              </li>
              <li>
                <a href="#giai-phap" className="text-on-surface-700 transition-[color] duration-160 hover:text-accent">
                  Kiểm toán hiện trường theo yêu cầu riêng
                </a>
              </li>
            </ul>
          </div>

          {/* CỘT 3: CỘNG TÁC VIÊN (2 CỘT) */}
          <div className="col-span-6 lg:col-span-2">
            <span className="label text-[0.6875rem] text-accent font-semibold block">DÀNH CHO LOOKERS</span>
            <ul className="mt-4 space-y-3 text-xs">
              <li>
                <a href="#cong-tac-vien" className="text-on-surface-700 transition-[color] duration-160 hover:text-accent">
                  Tải ứng dụng Looker App
                </a>
              </li>
              <li>
                <a href="#cong-tac-vien" className="text-on-surface-700 transition-[color] duration-160 hover:text-accent">
                  Chính sách thù lao &amp; ví 9Pay
                </a>
              </li>
              <li>
                <a href="#cong-tac-vien" className="text-on-surface-700 transition-[color] duration-160 hover:text-accent">
                  Cẩm nang đào tạo nghiệp vụ
                </a>
              </li>
              <li>
                <a href="#cong-tac-vien" className="text-on-surface-700 transition-[color] duration-160 hover:text-accent">
                  Cộng đồng hỗ trợ Zalo/Telegram
                </a>
              </li>
            </ul>
          </div>

          {/* CỘT 4: HỆ SINH THÁI DEMO & CHỨNG NHẬN (2 CỘT) */}
          <div className="col-span-12 lg:col-span-2">
            <span className="label text-[0.6875rem] text-accent font-semibold block">CHỨNG NHẬN &amp; PHÁP LÝ</span>
            
            {/* OFFICIAL LICENSE BADGE: "ĐÃ ĐĂNG KÝ BỘ CÔNG THƯƠNG" IN AUTHENTIC GRAPHIC STYLE */}
            <div className="mt-4 rounded-xl border border-accent/30 bg-surface-900/80 p-3 inline-block">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-paper-000 text-xs font-bold">✓</span>
                <div>
                  <span className="block font-mono text-[0.5625rem] font-bold text-accent uppercase">
                    ĐÃ ĐĂNG KÝ
                  </span>
                  <span className="block font-display text-[0.6875rem] font-bold text-on-surface-900">
                    BỘ CÔNG THƯƠNG
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 text-[0.6875rem] text-on-surface-500">
              Mã số DN: 0108923482 do Sở KH&amp;ĐT TP. Hà Nội cấp.
            </div>
          </div>
        </div>

        {/* BOTTOM BAR: COPYRIGHT, POLICIES & RETURN-TO-TOP BUTTON */}
        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-rule-dark pt-8 text-xs sm:flex-row">
          <div>
            © 2026 Im-Here Technology Platform. Bản quyền thuộc về Im-Here Vietnam.
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs text-on-surface-700">
            <a href="#main" className="transition-[color] duration-160 hover:text-accent">
              Điều khoản dịch vụ
            </a>
            <a href="#main" className="transition-[color] duration-160 hover:text-accent">
              Chính sách bảo mật dữ liệu
            </a>
            <a href="#main" className="transition-[color] duration-160 hover:text-accent">
              Tiêu chuẩn Looker
            </a>
          </div>

          {/* RETURN-TO-TOP BUTTON */}
          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-2 rounded-full border border-rule-dark bg-surface-900 px-4 py-2 text-xs font-bold text-on-surface-900 transition-[transform] duration-160 hover:scale-[1.05] hover:border-accent"
          >
            <span>Lên đầu trang</span>
            <span>↑</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
