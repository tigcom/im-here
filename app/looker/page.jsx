import LookerApp from '@/components/mobile/LookerApp';

export const metadata = {
  title: 'Im-Here — Chợ lao động gần bạn',
  description:
    'Nhận việc gần bạn: đi chợ, giao hàng, trông coi, phụ việc. Duyệt hồ sơ là làm được, nhận thù lao ngay khi người đăng xác nhận hoàn thành.',
};

export default function LookerPage() {
  return (
    <div className="min-h-dvh bg-surface-950 flex flex-col w-full h-full">
      <LookerApp />
    </div>
  );
}
