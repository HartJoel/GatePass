import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('anim-skeleton rounded-md bg-surface-2', className)} />
}

/** Mirrors StatCard: label, value, caption. */
export function StatCardSkeleton() {
  return (
    <div role="status" aria-label="Loading figure" className="flex flex-col gap-3 rounded-card border border-line bg-surface p-5">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-9 w-20" />
      <Skeleton className="h-4 w-32" />
    </div>
  )
}
