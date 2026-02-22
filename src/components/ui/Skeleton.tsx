/**
 * Skeleton shimmer placeholders for lazy-loaded content.
 * Per user decision: skeletons are for IMAGES ONLY (text renders instantly from bundled config).
 */

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`bg-slate-200 animate-pulse rounded-xl ${className}`}
      aria-hidden="true"
    />
  )
}

export function PageSkeleton() {
  return (
    <div className="min-h-[60vh]">
      {/* Hero-sized skeleton */}
      <Skeleton className="h-[400px] w-full rounded-none" />
      {/* Content area skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    </div>
  )
}
