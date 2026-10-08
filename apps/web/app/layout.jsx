import { Bricolage_Grotesque } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';

import SmoothScrollProvider from '@/components/SmoothScrollProvider';

import './globals.css';

/**
 * IM-HERE 9PAY FINTECH THEME
 * Display: Bricolage Grotesque (Display cá tính mạnh, tiếng Việt đầy đủ)
 * Body: Geist Sans (Sans hình học chính xác cao)
 */

const bricolage = Bricolage_Grotesque({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-clash',
  adjustFontFallback: 'Arial',
});

export const metadata = {
  title: 'Im-Here — Nền Tảng Kiểm Định Thực Địa & Thu Thập Dữ Liệu Tức Thì',
  description: 'Mạng lưới cộng tác viên thực địa khắp 63 tỉnh thành Việt Nam. Xác minh tài sản, kiểm toán bán lẻ và xác thực KYC theo chuẩn bảo mật Fintech.',
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="vi"
      className={`${bricolage.variable} ${GeistSans.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased bg-paper-000 text-ink-900 selection:bg-accent-quiet selection:text-ink-900">
        {/* STA-03 — skip link cho trợ năng bàn phím */}
        <a href="#main" className="skip-link">
          Bỏ qua tới nội dung chính
        </a>

        {/* MOT-01 — Lenis + GSAP gộp một vòng lặp RAF */}
        <SmoothScrollProvider>
          <main id="main">{children}</main>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
