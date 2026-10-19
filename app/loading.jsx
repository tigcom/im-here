import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function RootLoading() {
  return (
    <div className="min-h-dvh w-full flex flex-col items-center justify-center bg-paper-000 text-ink-900 p-6 selection:bg-accent-quiet">
      <div className="flex flex-col items-center gap-4 max-w-sm text-center">
        {/* Brand Icon & Glow */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-paper-100 border border-rule-subtle shadow-xs flex items-center justify-center overflow-hidden">
            <img
              src="/android-chrome-192x192.png"
              alt="Im-Here"
              className="w-10 h-10 object-contain animate-pulse-subtle"
            />
          </div>
          <div className="absolute -inset-2 rounded-2xl bg-accent/15 blur-lg pointer-events-none" />
        </div>

        {/* Brand Name */}
        <div className="space-y-1">
          <h1 className="font-display text-xl font-bold tracking-tight text-ink-900">
            Im-Here<span className="text-accent">.</span>
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-500">
            Chợ lao động thực địa
          </p>
        </div>

        {/* Spinner & Polite Status */}
        <div className="flex items-center gap-2.5 pt-2">
          <LoadingSpinner size="sm" color="accent" label="Đang tải trang..." />
          <span className="text-xs font-medium text-ink-700 font-mono">
            Đang tải dữ liệu...
          </span>
        </div>
      </div>
    </div>
  );
}
