import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Icon + one line + one action. Nothing else. */
export function EmptyState({
  icon: Icon,
  message,
  action,
  className,
}: {
  icon: LucideIcon
  message: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center gap-4 px-6 py-12 text-center', className)}>
      <span className="flex size-12 items-center justify-center rounded-full bg-surface-2 text-ink-2">
        <Icon className="size-6" aria-hidden />
      </span>
      <p className="max-w-xs text-[15px] text-ink-2">{message}</p>
      {action}
    </div>
  )
}
