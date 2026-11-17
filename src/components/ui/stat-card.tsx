import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  caption,
  trend,
  icon: Icon,
  className,
}: {
  label: string
  value: string
  caption?: string
  trend?: 'up' | 'down' | 'flat'
  icon?: LucideIcon
  className?: string
}) {
  const T = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus
  return (
    <div className={cn('flex flex-col gap-1 rounded-card border border-line bg-surface p-5', className)}>
      <div className="flex items-center justify-between gap-2 text-ink-2">
        <span className="type-caption">{label}</span>
        {Icon && <Icon className="size-4" aria-hidden />}
      </div>
      <p className="tnum type-h1 mt-1 text-ink">{value}</p>
      {caption && (
        <p className="flex items-center gap-1 text-[13px] text-ink-2">
          {trend && <T className="size-3.5" aria-hidden />}
          {caption}
        </p>
      )}
    </div>
  )
}
