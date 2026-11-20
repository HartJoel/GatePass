import type { ButtonHTMLAttributes, ReactNode } from 'react'
import Link from 'next/link'
import { Check, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Three variants only. `filled` is the single accent action in a view.
 * Large = 60px tall, for the guard interface.
 */
type Variant = 'filled' | 'ghost' | 'destructive-ghost'
type Size = 'default' | 'large'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: ReactNode
  fullWidth?: boolean
  /** Shows a spinner in place of `icon` and disables the button while an action is in flight. */
  loading?: boolean
}

const base =
  'inline-flex items-center justify-center gap-2 font-semibold select-none whitespace-nowrap rounded-control transition-colors duration-150 ease-calm disabled:opacity-45 active:translate-y-px'

const variants: Record<Variant, string> = {
  filled: 'bg-accent text-accent-fg hover:bg-accent-hover disabled:hover:bg-accent',
  ghost: 'border border-line text-ink hover:bg-surface-2 disabled:hover:bg-transparent',
  'destructive-ghost':
    'border border-transparent text-danger-fg hover:bg-danger-bg disabled:hover:bg-transparent',
}

const sizes: Record<Size, string> = {
  default: 'h-11 px-4 text-[15px] [&_svg]:size-[18px]',
  large: 'h-[60px] px-7 text-xl [&_svg]:size-6 rounded-[14px]',
}

export function Button({ variant = 'ghost', size = 'default', icon, fullWidth, loading, disabled, className, children, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
    >
      {loading ? <Loader2 className="animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  )
}

const buttonLinkClass = (variant: 'filled' | 'ghost') =>
  cn(
    'inline-flex h-11 w-full items-center justify-center gap-2 rounded-control px-4 text-[15px] font-semibold transition-colors duration-150 ease-calm active:translate-y-px',
    variant === 'filled' ? 'bg-accent text-accent-fg hover:bg-accent-hover' : 'border border-line text-ink hover:bg-surface-2',
  )

/** A button-styled link. Renders an <a> via next/link, so it works from a Server Component. */
export function LinkButton({ href, children, variant = 'filled', className }: { href: string; children: ReactNode; variant?: 'filled' | 'ghost'; className?: string }) {
  return (
    <Link href={href} className={cn(buttonLinkClass(variant), className)}>
      {children}
    </Link>
  )
}

/**
 * The guard's Approve / Reject pair: the ONLY place two filled buttons may
 * share a view. Colour follows meaning (green = approve, red = reject) and
 * every button carries an icon and a label.
 */
export function DecisionPair({
  onApprove,
  onReject,
  disabled,
  loading,
}: {
  onApprove?: () => void
  onReject?: () => void
  disabled?: boolean
  loading?: boolean
}) {
  const shared =
    'inline-flex h-16 flex-1 items-center justify-center gap-3 rounded-[14px] text-[22px] font-semibold text-on-solid transition-[filter] duration-150 ease-calm hover:brightness-110 active:translate-y-px disabled:opacity-45 disabled:hover:brightness-100'
  return (
    <div className="grid grid-cols-2 gap-3">
      <button type="button" disabled={disabled || loading} aria-busy={loading || undefined} onClick={onReject} className={cn(shared, 'bg-danger')}>
        {loading ? <Loader2 className="size-7 animate-spin" aria-hidden /> : <X className="size-7" strokeWidth={2.5} aria-hidden />}
        Reject
      </button>
      <button type="button" disabled={disabled || loading} aria-busy={loading || undefined} onClick={onApprove} className={cn(shared, 'bg-success')}>
        {loading ? <Loader2 className="size-7 animate-spin" aria-hidden /> : <Check className="size-7" strokeWidth={2.5} aria-hidden />}
        Approve
      </button>
    </div>
  )
}
