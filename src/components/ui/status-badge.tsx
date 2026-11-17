import type { LucideIcon } from 'lucide-react'
import { Ban, Check, Clock, History, Mail, PauseCircle, PowerOff, ShieldCheck, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type Status =
  | 'active'
  | 'used'
  | 'expired'
  | 'revoked'
  | 'approved'
  | 'rejected'
  | 'invited'
  | 'deactivated'
  | 'suspended'

type Tone = 'success' | 'danger' | 'warning' | 'neutral'

/** Meaning lives in tone + icon + label. Never colour alone. */
export const STATUS: Record<Status, { label: string; tone: Tone; icon: LucideIcon; meaning: string }> = {
  active: { label: 'Active', tone: 'success', icon: ShieldCheck, meaning: 'Pass is valid right now' },
  approved: { label: 'Approved', tone: 'success', icon: Check, meaning: 'Entry or request granted' },
  used: { label: 'Used', tone: 'neutral', icon: History, meaning: 'Pass was scanned in; closed' },
  invited: { label: 'Invited', tone: 'neutral', icon: Mail, meaning: 'Invite sent, not yet accepted' },
  deactivated: { label: 'Deactivated', tone: 'neutral', icon: PowerOff, meaning: 'Account switched off' },
  expired: { label: 'Expired', tone: 'warning', icon: Clock, meaning: 'Validity window has ended' },
  suspended: { label: 'Suspended', tone: 'warning', icon: PauseCircle, meaning: 'Paused pending review' },
  revoked: { label: 'Revoked', tone: 'danger', icon: Ban, meaning: 'Cancelled by a manager or resident' },
  rejected: { label: 'Rejected', tone: 'danger', icon: XCircle, meaning: 'Entry or request denied' },
}

const tones: Record<Tone, string> = {
  success: 'bg-success-bg text-success-fg',
  danger: 'bg-danger-bg text-danger-fg',
  warning: 'bg-warning-bg text-warning-fg',
  neutral: 'bg-neutral-bg text-neutral-fg',
}

const sizes = {
  sm: 'h-6 gap-1 px-2 text-xs [&_svg]:size-3.5',
  default: 'h-7 gap-1.5 px-2.5 text-[13px] [&_svg]:size-4',
  lg: 'h-12 gap-2.5 px-5 text-2xl [&_svg]:size-7',
}

export function StatusBadge({
  status,
  size = 'default',
  className,
}: {
  status: Status
  size?: keyof typeof sizes
  className?: string
}) {
  const s = STATUS[status]
  const Icon = s.icon
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full font-semibold leading-none whitespace-nowrap',
        tones[s.tone],
        sizes[size],
        className,
      )}
    >
      <Icon aria-hidden strokeWidth={size === 'lg' ? 2.5 : 2.25} />
      {s.label}
    </span>
  )
}
