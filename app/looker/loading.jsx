import Skeleton from '@/components/common/Skeleton';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function LookerLoading() {
  return (
    <div className="min-h-dvh bg-surface-950 text-on-surface-900 flex flex-col justify-between max-w-md mx-auto relative overflow-hidden animate-render-reveal">
      {/* Mobile Top Header */}
      <div className="p-4 border-b border-rule-dark flex items-center justify-between bg-surface-900/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Skeleton dark variant="circular" className="w-10 h-10" />
          <div className="space-y-1.5">
            <Skeleton dark variant="text" className="w-24 h-4" />
            <Skeleton dark variant="text" className="w-32 h-3" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LoadingSpinner size="xs" color="accent" />
          <Skeleton dark variant="rectangular" className="w-20 h-7 rounded-full" />
        </div>
      </div>

      {/* Map View Placeholder with Radar Pulse */}
      <div className="flex-1 relative bg-surface-900/40 flex flex-col items-center justify-center p-6 min-h-[350px]">
        <div className="relative flex items-center justify-center">
          <div className="w-28 h-28 rounded-full border border-accent/20 animate-ping absolute" />
          <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center">
            <LoadingSpinner size="md" color="accent" />
          </div>
        </div>
        <p className="font-mono text-xs font-bold text-accent mt-4 uppercase tracking-wider">
          Đang quét việc làm gần bạn...
        </p>
        <p className="text-[11px] text-on-surface-500 mt-1">
          Hệ thống GPS đang định vị toạ độ thực tế
        </p>
      </div>

      {/* Bottom Sheet Cards Skeleton */}
      <div className="p-4 bg-surface-900 rounded-t-3xl border-t border-rule-dark space-y-3 shadow-[0_0_0_1px_oklch(1_0_0/0.06),0_20px_50px_-20px_oklch(0_0_0/0.5)]">
        <div className="w-12 h-1 bg-surface-700 rounded-full mx-auto mb-2" />
        <div className="flex items-center justify-between mb-2">
          <Skeleton dark variant="text" className="w-28 h-4" />
          <Skeleton dark variant="text" className="w-16 h-4" />
        </div>
        {[1, 2].map((i) => (
          <Skeleton key={i} dark variant="card" className="p-4" />
        ))}
      </div>

      {/* Bottom Navigation Skeleton */}
      <div className="h-16 border-t border-rule-dark bg-surface-950 flex items-center justify-around px-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} dark variant="circular" className="w-9 h-9" />
        ))}
      </div>
    </div>
  );
}
