import Skeleton from '@/components/common/Skeleton';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function ClientLoading() {
  return (
    <div className="space-y-8 animate-render-reveal max-w-7xl mx-auto">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rule-subtle pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton variant="text" className="w-24 h-5" />
            <LoadingSpinner size="xs" color="accent" />
          </div>
          <Skeleton variant="title" className="w-64 h-8" />
          <Skeleton variant="text" className="w-80 h-4" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton variant="rectangular" className="w-32 h-10 rounded-xl" />
          <Skeleton variant="rectangular" className="w-36 h-10 rounded-xl" />
        </div>
      </div>

      {/* 4 Metrics Cards Skeleton */}
      <div className="grid grid-cols-12 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="col-span-12 sm:col-span-6 lg:col-span-3">
            <Skeleton key={i} variant="metric" />
          </div>
        ))}
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Recent Listings */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton variant="text" className="w-40 h-5" />
            <Skeleton variant="text" className="w-20 h-4" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="card" />
            ))}
          </div>
        </div>

        {/* Right column: Wallet & Quick Actions */}
        <div className="lg:col-span-4 space-y-4">
          <Skeleton variant="text" className="w-32 h-5" />
          <Skeleton variant="rectangular" className="w-full h-48 rounded-2xl" />
          <Skeleton variant="card" />
        </div>
      </div>
    </div>
  );
}
