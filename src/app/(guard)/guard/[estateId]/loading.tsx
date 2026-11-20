import { Skeleton } from '@/components/ui/skeleton'

/** Shown the instant you tap a bottom-tab, while the destination page's data loads — the shell
 * (header, tab bar) stays mounted and interactive; only this content area is replaced. */
export default function GuardAreaLoading() {
  return (
    <div aria-busy="true" aria-label="Loading" className="flex flex-col items-center gap-5 pt-6">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-[60px] w-full rounded-[14px]" />
      <Skeleton className="h-14 w-full rounded-control" />
    </div>
  )
}
