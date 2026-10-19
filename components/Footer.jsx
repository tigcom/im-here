'use client';

import { CATEGORY_GROUP, CATEGORY_GROUP_LABEL } from '@/lib/constants';
import { useAuth } from '@/components/auth/AuthContext';

export default function Footer() {
  const { currentUser } = useAuth();
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative border-t border-rule-subtle bg-paper-100 px-[6vw] pt-16 pb-12 text-ink-500">
      <div className="mx-auto max-w-[1600px]">
        {/* LƯỚI CỘT */}
        <div className="grid grid-cols-12 gap-y-12 lg:gap-x-12">
          {/* CỘT 1: THƯƠNG HIỆU (5 CỘT) */}
          <div className="col-span-12 lg:col-span-5">
            <div className="flex items-center gap-3">
              <img
                src="/android-chrome-192x192.png"
                alt="Im-Here Logo"
                className="h-10 w-10 object-contain"
              />
              <span className="font-display text-2xl font-bold tracking-tight text-ink-900">
                Im-Here<span className="text-accent">.</span>
              </span>
            </div>

            <p className="mt-4 max-w-[400px] text-xs leading-relaxed text-ink-700">
              Chợ lao động: ai có nhu cầu thì đăng tin thuê người, ai rảnh thì nhận
              việc. Từ việc vặt trong ngày tới kiểm định chuyên sâu — chỉ cần duyệt
              hồ sơ là làm được.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rule-subtle bg-paper-000 px-3 py-1 font-mono text-[0.6875rem] font-bold text-accent">
                Không cấp bậc
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rule-subtle bg-paper-000 px-3 py-1 font-mono text-[0.6875rem] font-bold text-accent-blue">
                Không chứng chỉ
              </span>
            </div>
          </div>

          {/* CỘT 2: NGƯỜI ĐĂNG TIN (3 CỘT) */}
          <div className="col-span-6 lg:col-span-3">
            <span className="label text-[0.6875rem] text-accent font-semibold block">NGƯỜI ĐĂNG TIN</span>
            <ul className="mt-4 space-y-3 text-xs">
              <li>
                <a
                  href={currentUser ? '/client/campaigns/new' : '/login?redirect=/client/campaigns/new'}
                  className="text-ink-700 transition-[color] duration-160 hover:text-accent"
                >
                  Đăng tin thuê người
                </a>
              </li>
              <li>
                <a href="#cach-hoat-dong" className="text-ink-700 transition-[color] duration-160 hover:text-accent">
                  Cách hoạt động
                </a>
              </li>
              <li>
                <a href="#viec-gi-cung-co" className="text-ink-700 transition-[color] duration-160 hover:text-accent">
                  Các loại việc
                </a>
              </li>
              <li>
                <a href="#bat-dau" className="text-ink-700 transition-[color] duration-160 hover:text-accent">
                  Bắt đầu
                </a>
              </li>
            </ul>
          </div>

          {/* CỘT 3: NGƯỜI NHẬN VIỆC (2 CỘT) */}
          <div className="col-span-6 lg:col-span-2">
            <span className="label text-[0.6875rem] text-accent font-semibold block">NGƯỜI NHẬN VIỆC</span>
            <ul className="mt-4 space-y-3 text-xs">
              <li>
                <a
                  href={currentUser ? '/looker' : '/login?redirect=/looker'}
                  className="text-ink-700 transition-[color] duration-160 hover:text-accent"
                >
                  Nhận việc kiếm tiền
                </a>
              </li>
              <li>
                <a href="/register" className="text-ink-700 transition-[color] duration-160 hover:text-accent">
                  Gửi hồ sơ tham gia
                </a>
              </li>
              <li>
                <a href="#nguoi-nhan-viec" className="text-ink-700 transition-[color] duration-160 hover:text-accent">
                  Vì sao nên tham gia
                </a>
              </li>
              <li>
                <a href="#cach-hoat-dong" className="text-ink-700 transition-[color] duration-160 hover:text-accent">
                  Nhận tiền thế nào
                </a>
              </li>
            </ul>
          </div>

          {/* CỘT 4: VIỆC TRÊN CHỢ (2 CỘT) */}
          <div className="col-span-12 lg:col-span-2">
            <span className="label text-[0.6875rem] text-accent font-semibold block">VIỆC TRÊN CHỢ</span>
            <ul className="mt-4 space-y-3 text-xs">
              {Object.values(CATEGORY_GROUP).map((g) => (
                <li key={g}>
                  <a href="#viec-gi-cung-co" className="text-ink-700 transition-[color] duration-160 hover:text-accent">
                    {CATEGORY_GROUP_LABEL[g]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-rule-subtle pt-8 text-xs sm:flex-row">
          <div>© 2026 Im-Here. Bản quyền thuộc về Im-Here Vietnam.</div>
          <div className="flex flex-wrap items-center gap-6 text-xs text-ink-700">
            <a href="#main" className="transition-[color] duration-160 hover:text-accent">
              Điều khoản dịch vụ
            </a>
            <a href="#main" className="transition-[color] duration-160 hover:text-accent">
              Chính sách bảo mật
            </a>
            <a href="#main" className="transition-[color] duration-160 hover:text-accent">
              Liên hệ
            </a>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-2 rounded-full border border-rule-subtle bg-paper-000 px-4 py-2 text-xs font-bold text-ink-900 transition-[transform,border-color,background-color] duration-160 hover:border-accent hover:bg-paper-200 hover:-translate-y-0.5 active:scale-[0.97]"
          >
            <span>Lên đầu trang</span>
            <span>↑</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
