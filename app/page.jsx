import Header from '@/components/Header';
import HeroSection from '@/components/sections/HeroSection';
import SocialProofSection from '@/components/sections/SocialProofSection';
import CategoriesSection from '@/components/sections/CategoriesSection';
import EditorialShowcaseSection from '@/components/sections/EditorialShowcaseSection';
import PauseEditorialSection from '@/components/sections/PauseEditorialSection';
import HowItWorksSection from '@/components/sections/HowItWorksSection';
import GigWorkerSection from '@/components/sections/GigWorkerSection';
import TrustSecuritySection from '@/components/sections/TrustSecuritySection';
import CTASection from '@/components/sections/CTASection';
import Footer from '@/components/Footer';

/**
 * IM-HERE — NỀN TẢNG KIỂM ĐỊNH THỰC ĐỊA & CHỢ LAO ĐỘNG TỨC THỜI
 *
 * Đồng bộ 100% Light/Emerald Paper Fintech Theme:
 * - Hệ lưới 12 cột bất đối xứng (7/5, 2/10, 8/4)
 * - Tương tác Pin + Scrub bản đồ thực địa 63 tỉnh thành (MOT-04)
 * - Màu OKLCH: Emerald Green + Paper Ivory
 * - Nhịp điệu lặng -> nén xen kẽ chuẩn mực
 * - Chống Fake GPS, Watermark SHA-256, đối soát 9Pay
 */

export default function Home() {
  return (
    <div className="relative min-h-dvh bg-paper-000 text-ink-900">
      <Header />

      {/* 01 — HERO (Lưới 7/5) */}
      <HeroSection />

      {/* 02 — BẢO CHỨNG NIỀM TIN (Lưới 2/10 + 4 chỉ số thực địa) */}
      <SocialProofSection />

      {/* 03 — VIỆC GÌ CŨNG CÓ (Lưới 7/5 · 8/4) */}
      <CategoriesSection />

      {/* 04 — SHOWCASE PIN + SCRUB (Bản đồ Geo-Radar 3D 63 tỉnh thành) */}
      <EditorialShowcaseSection />

      {/* 05 — KHOẢNG LẶNG BIÊN TẬP (Statement Card Fintech) */}
      <PauseEditorialSection />

      {/* 06 — CÁCH HOẠT ĐỘNG (Quy trình 4 bước thực địa) */}
      <HowItWorksSection />

      {/* 07 — DÀNH CHO NGƯỜI NHẬN VIỆC (Lưới 7/5, nhịp lặng) */}
      <GigWorkerSection />

      {/* 08 — BẢO MẬT & TÍN NHIỆM (3 Lớp phòng vệ Fintech 9Pay) */}
      <TrustSecuritySection />

      {/* 09 — CTA KHỞI TẠO (Lưới 7/5) */}
      <CTASection />

      {/* FOOTER ĐỒNG BỘ LIGHT THEME */}
      <Footer />

    </div>
  );
}
