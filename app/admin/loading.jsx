import Skeleton from '@/components/common/Skeleton';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-render-reveal max-w-7xl mx-auto">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rule-dark pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-accent-amber uppercase tracking-wider font-bold">
              ĐANG TẢI DỮ LIỆU QUẢN TRỊ
            </span>
            <LoadingSpinner size="xs" color="accent" />
          </div>
          <Skeleton dark variant="title" className="w-72 h-8" />
          <Skeleton dark variant="text" className="w-96 h-4" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton dark variant="rectangular" className="w-32 h-9 rounded-xl" />
        </div>
      </div>

      {/* 4 Admin Stat Cards Skeleton */}
      <div className="grid grid-cols-12 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="col-span-12 sm:col-span-6 lg:col-span-3">
            <Skeleton dark variant="metric" />
          </div>
        ))}
      </div>

      {/* Main Grid: Live radar chart & Event log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          <Skeleton dark variant="text" className="w-48 h-5" />
          <Skeleton dark variant="rectangular" className="w-full h-80 rounded-2xl" />
        </div>

        <div className="lg:col-span-4 space-y-4">
          <Skeleton dark variant="text" className="w-36 h-5" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} dark variant="card" className="p-4" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
