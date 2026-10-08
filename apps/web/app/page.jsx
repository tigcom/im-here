import Header from '@/components/Header';
import HeroSection from '@/components/sections/HeroSection';
import SocialProofSection from '@/components/sections/SocialProofSection';
import B2BSolutionsSection from '@/components/sections/B2BSolutionsSection';
import EditorialShowcaseSection from '@/components/sections/EditorialShowcaseSection';
import PauseEditorialSection from '@/components/sections/PauseEditorialSection';
import HowItWorksSection from '@/components/sections/HowItWorksSection';
import GigWorkerSection from '@/components/sections/GigWorkerSection';
import TrustSecuritySection from '@/components/sections/TrustSecuritySection';
import CTASection from '@/components/sections/CTASection';
import Footer from '@/components/Footer';
import DemoNavigator from '@/components/DemoNavigator';

/**
 * IM-HERE — NỀN TẢNG KIỂM ĐỊNH THỰC ĐỊA & DỮ LIỆU CROWDSOURCED
 * Tuân thủ chuẩn mực High-End UI:
 * - Hệ lưới 12 cột bất đối xứng (7/5, 2/10, 4/8, 8/4)
 * - Màu OKLCH: Emerald Green (#15ae62) + Dark Navy (#00293a)
 * - Nhịp điệu lặng -> nén -> lặng -> nén (2 chu kỳ chuẩn LAY-02)
 * - Bề mặt đa tầng với bóng âm & viền nội giáng
 * - Pin + Scrub tương tác thị sai (MOT-04)
 * - Font: Bricolage Grotesque (Display) + Geist Sans (Body)
 */

export default function Home() {
  return (
    <div className="relative min-h-screen bg-surface-950 text-on-surface-900">
      <Header />

      {/* 01 — HERO (Lưới 7/5 + Broken Grid) */}
      <HeroSection />

      {/* 02 — BẢO CHỨNG NIỀM TIN (Lưới 2/10 + Nhịp nén) */}
      <SocialProofSection />

      {/* 03 — GIẢI PHÁP DOANH NGHIỆP (Lưới bất đối xứng 7/5 + 4/8) */}
      <B2BSolutionsSection />

      {/* 03.5 — SHOWCASE PIN + SCRUB (MOT-04, Tỷ lệ 4/8) */}
      <EditorialShowcaseSection />

      {/* KHOẢNG LẶNG BIÊN TẬP (py 12rem — Chu kỳ lặng) */}
      <PauseEditorialSection />

      {/* 04 — QUY TRÌNH HOẠT ĐỘNG KHÉP KÍN (4 bước so le) */}
      <HowItWorksSection />

      {/* 05 — CỘNG TÁC VIÊN GIG WORKERS (Lưới 7/5 + Nền Dark Noise) */}
      <GigWorkerSection />

      {/* 06 — BẢO MẬT & TÍN NHIỆM (Fintech 9Pay Security) */}
      <TrustSecuritySection />

      {/* 07 — KẾT NỐI & KHỞI TẠO (Lưới 8/4 lệch trục) */}
      <CTASection />

      {/* FOOTER BIÊN TẬP */}
      <Footer />

      {/* FLOATING DEMO SUITE NAVIGATOR */}
      <DemoNavigator />
    </div>
  );
}
