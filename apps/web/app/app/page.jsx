import LookerApp from '@/components/mobile/LookerApp';

export const metadata = {
  title: 'Looker App | Im-Here',
  description: 'Giao diện web app responsive dành cho đối tác Looker',
};

export default function LookerAppPage() {
  return (
    <div className="min-h-screen bg-surface-950 flex flex-col w-full h-full">
      <LookerApp />
    </div>
  );
}
