import { Skeleton, StatCardSkeleton } from '@/components/ui/skeleton'

/** Shown the instant you click a nav item, while the destination page's data loads — the shell
 * (sidebar, header) stays mounted and interactive; only this content area is replaced. */
export default function PlatformAreaLoading() {
  return (
    <div aria-busy="true" aria-label="Loading" className="flex flex-col gap-8">
      <div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <div className="rounded-card border border-line bg-surface p-6">
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
