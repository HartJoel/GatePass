import { Skeleton } from '@/components/ui/skeleton'
import { PassCardSkeleton } from '@/features/passes/components/pass-card'

/** Shown the instant you tap a bottom-tab, while the destination page's data loads — the shell
 * (header, tab bar) stays mounted and interactive; only this content area is replaced. */
export default function ResidentAreaLoading() {
  return (
    <div aria-busy="true" aria-label="Loading" className="flex flex-col gap-6">
      <div>
        <Skeleton className="h-7 w-40" />
        <Skeleton className="mt-2 h-4 w-56" />
      </div>
      <Skeleton className="h-12 w-full rounded-control" />
      <div className="flex flex-col gap-3">
        <PassCardSkeleton />
        <PassCardSkeleton />
      </div>
    </div>
  )
}
