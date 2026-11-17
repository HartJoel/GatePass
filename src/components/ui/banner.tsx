import type { ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Clock, Info, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Inline banner for form-level messages. Deliberately quiet: a soft tint, a
 * hairline in the tone colour and ordinary ink text. Colour lives in the icon
 * and the tint only, never in a solid block.
 */
export type BannerTone = 'error' | 'warning' | 'success' | 'info'

const tones: Record<BannerTone, { wrap: string; icon: string; Icon: LucideIcon }> = {
  error: { wrap: 'bg-danger-bg border-danger/25', icon: 'text-danger', Icon: AlertCircle },
  warning: { wrap: 'bg-warning-bg border-warning/25', icon: 'text-warning', Icon: Clock },
  success: { wrap: 'bg-success-bg border-success/25', icon: 'text-success', Icon: CheckCircle2 },
  info: { wrap: 'bg-surface-2 border-line', icon: 'text-ink-2', Icon: Info },
}

export function Banner({
  tone = 'error',
  title,
  children,
  icon,
  className,
}: {
  tone?: BannerTone
  title: string
  children?: ReactNode
  icon?: LucideIcon
  className?: string
}) {
  const t = tones[tone]
  const Icon = icon ?? t.Icon
  return (
    <div
      role={tone === 'error' || tone === 'warning' ? 'alert' : 'status'}
      className={cn('anim-fade flex items-start gap-3 rounded-control border px-3.5 py-3', t.wrap, className)}
    >
      <Icon className={cn('mt-0.5 size-[18px] shrink-0', t.icon)} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{title}</p>
        {children && <div className="mt-0.5 text-sm text-ink-2">{children}</div>}
      </div>
    </div>
  )
}

/** The one rate-limit message, shared by every auth form. */
export const RATE_LIMIT_MESSAGE = 'Too many attempts. Try again in a few minutes.'

export function RateLimitBanner({ className }: { className?: string }) {
  return <Banner tone="warning" title={RATE_LIMIT_MESSAGE} className={className} />
}
