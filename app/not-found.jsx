import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="noise-texture relative isolate min-h-screen overflow-hidden bg-surface-950 text-on-surface-900 flex flex-col items-center justify-center p-6 text-center">
      <div className="relative z-10 w-16 h-16 rounded-2xl bg-surface-900 border border-rule-dark flex items-center justify-center mb-6 shadow-elevated">
        <span className="text-2xl font-bold text-accent">404</span>
      </div>
      <h1 className="relative z-10 display-md font-bold tracking-tight mb-2">Trang không tồn tại</h1>
      <p className="relative z-10 text-on-surface-500 max-w-md mb-8">
        Đường dẫn bạn yêu cầu không tìm thấy hoặc đã được di chuyển.
      </p>
      <Link
        href="/"
        className="relative z-10 px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-paper-000 font-medium text-sm transition-colors duration-200 shadow-elevated"
      >
        Về trang chủ
      </Link>
    </div>
  );
}
