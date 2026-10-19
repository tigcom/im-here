import { Bricolage_Grotesque } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';

import { Suspense } from 'react';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';
import { AuthProvider } from '@/components/auth/AuthContext';
import RouteProgressBar from '@/components/common/RouteProgressBar';

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
  title: 'Im-Here — Chợ Lao Động: Đăng Tin Thuê Người, Nhận Việc Kiếm Tiền',
  description:
    'Im-Here là chợ lao động: ai có nhu cầu thì đăng tin thuê người, ai rảnh thì nhận việc. Từ việc vặt trong ngày tới kiểm định chuyên sâu — chỉ cần duyệt hồ sơ là làm được.',
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

        {/* Thanh tiến độ tải trang khi chuyển route */}
        <Suspense fallback={null}>
          <RouteProgressBar />
        </Suspense>

        <AuthProvider>
          {/* MOT-01 — Lenis + GSAP gộp một vòng lặp RAF */}
          <SmoothScrollProvider>
            <main id="main">{children}</main>
          </SmoothScrollProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
