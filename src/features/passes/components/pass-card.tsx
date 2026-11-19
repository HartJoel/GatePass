'use client'

import { Clock, Home } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatAgo, formatRemaining, formatWindow } from '@/lib/format'
import { useNow } from '@/lib/use-now'
import { StatusBadge, type Status } from '@/components/ui/status-badge'
import { QrCode } from '@/components/ui/qr-code'
import { Skeleton } from '@/components/ui/skeleton'

export interface Pass {
  id: string
  code: string
  visitor: string
  unit: string
  start: Date
  end: Date
  status: Status
}

/** Compact countdown. Caution (amber) only inside the last 15 minutes, always with text. */
export function Countdown({ pass, className }: { pass: Pass; className?: string }) {
  const now = useNow()
  const left = pass.end.getTime() - now
  let text: string
  let soon = false
  if (pass.status === 'active' && left > 0) {
    text = `${formatRemaining(left)} left`
    soon = left < 15 * 60_000
  } else if (pass.status === 'active') text = 'Ending now'
  else if (pass.status === 'expired') text = `Ended ${formatAgo(now - pass.end.getTime())}`
  else if (pass.status === 'used') text = `Used ${formatAgo(now - pass.start.getTime())}`
  else if (pass.status === 'revoked') text = 'Cancelled before use'
  else text = 'Not valid'
  return (
    <span className={cn('tnum inline-flex items-center gap-1.5 text-[13px] font-medium', soon ? 'text-warning-fg' : 'text-ink-2', className)}>
      <Clock className="size-3.5" aria-hidden />
      {text}
    </span>
  )
}

export function PassCard({
  pass,
  onClick,
  detail,
}: {
  pass: Pass
  onClick?: () => void
  /** Detail view only: shows the QR code and share code. */
  detail?: boolean
}) {
  const Wrapper = onClick ? 'button' : 'div'
  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'flex w-full flex-col gap-3 rounded-card border border-line bg-surface p-5 text-left transition-shadow duration-200 ease-calm',
        onClick && 'hover:shadow-hover',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="type-h3 truncate text-ink">{pass.visitor}</h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-2">
            <Home className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{pass.unit}</span>
          </p>
        </div>
        <StatusBadge status={pass.status} />
      </div>
      <p className="tnum text-sm text-ink">{formatWindow(pass.start, pass.end)}</p>
      <Countdown pass={pass} />
      {detail && (
        <div className="mt-2 flex flex-col items-center gap-3 border-t border-line pt-6">
          <QrCode value={pass.code} />
          <p className="tnum text-[28px] font-semibold tracking-[0.25em] text-ink">{pass.code}</p>
          <p className="type-caption text-ink-2">Show this code to the guard at the gate</p>
        </div>
      )}
    </Wrapper>
  )
}

/** Mirrors PassCard: name + badge, unit, window, countdown. */
export function PassCardSkeleton() {
  return (
    <div role="status" aria-label="Loading pass" className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-56 max-w-full" />
      <Skeleton className="h-4 w-24" />
    </div>
  )
}
