'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Eye, EyeOff, Loader2, type LucideIcon } from 'lucide-react'
import { Logo } from '@/components/layout/navigation'
import { Button, type ButtonProps } from '@/components/ui/button'
import { Field, type FieldProps } from '@/components/ui/field'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */
/** One calm, centred column: small logo, ~400px card, quiet help line. No nav, no sidebar. */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:py-14">
      <div className="w-full max-w-[400px]">
        <div className="mb-6 flex justify-center">
          <Logo className="[&_svg]:size-5 [&>span]:text-[15px]" />
        </div>
        {children}
        <p className="mt-6 text-center text-[13px] text-ink-2">
          Need help?{' '}
          <a href="mailto:support@gatepass.ng" className={linkClass}>
            Contact support
          </a>
        </p>
      </div>
    </div>
  )
}

export function AuthCard({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn('anim-rise rounded-card border border-line bg-surface p-6 sm:p-8', className)}>{children}</section>
}

export function AuthHeader({ title, children, compact }: { title: string; children?: ReactNode; compact?: boolean }) {
  return (
    <header className={compact ? 'mb-4' : 'mb-6'}>
      <h1 className="type-h2 text-ink">{title}</h1>
      {children && <p className="mt-1.5 text-[15px] text-ink-2">{children}</p>}
    </header>
  )
}

/** Card footer for the secondary route, e.g. "Register your company". */
export function AuthFooter({ children }: { children: ReactNode }) {
  return <p className="mt-6 border-t border-line pt-5 text-center text-sm text-ink-2">{children}</p>
}

export const linkClass = 'rounded-sm font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-offset-4'

const toneCircle = {
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  neutral: 'bg-surface-2 text-ink-2',
  accent: 'bg-accent-soft text-accent',
} as const

/**
 * Full-card state (confirmation, success, dead link). Always carries at least
 * one action so a state is never a dead end. Focus moves to the title so
 * screen readers announce the change.
 */
export function StatePanel({
  icon: Icon,
  tone = 'neutral',
  title,
  children,
  actions,
  aside,
}: {
  icon: LucideIcon
  tone?: keyof typeof toneCircle
  title: string
  children: ReactNode
  actions: ReactNode
  aside?: ReactNode
}) {
  const ref = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    ref.current?.focus({ preventScroll: true })
  }, [])
  return (
    <div className="flex flex-col items-center text-center">
      <span className={cn('flex size-12 items-center justify-center rounded-full', toneCircle[tone])}>
        <Icon className="size-6" aria-hidden />
      </span>
      <h1 ref={ref} tabIndex={-1} className="type-h2 mt-5 text-ink outline-none">
        {title}
      </h1>
      <div className="mt-2 text-[15px] text-ink-2">{children}</div>
      <div className="mt-6 flex w-full flex-col gap-3">{actions}</div>
      {aside && <div className="mt-5 text-sm text-ink-2">{aside}</div>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Form pieces                                                         */
/* ------------------------------------------------------------------ */
export function SubmitButton({
  busy,
  busyLabel,
  children,
  type = 'submit',
  ...rest
}: { busy?: boolean; busyLabel: string } & Omit<ButtonProps, 'variant' | 'fullWidth' | 'icon'>) {
  return (
    <Button
      type={type}
      variant="filled"
      fullWidth
      aria-busy={busy}
      icon={busy ? <Loader2 className="animate-spin" aria-hidden /> : undefined}
      {...rest}
      disabled={busy || rest.disabled}
    >
      {busy ? busyLabel : children}
    </Button>
  )
}

export function PasswordField({ error, ...props }: Omit<FieldProps, 'type' | 'suffix'>) {
  const [shown, setShown] = useState(false)
  return (
    <Field
      {...props}
      error={error}
      type={shown ? 'text' : 'password'}
      autoCapitalize="none"
      spellCheck={false}
      suffix={
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          aria-label={shown ? 'Hide password' : 'Show password'}
          aria-pressed={shown}
          className="flex size-9 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
        >
          {shown ? <EyeOff className="size-[18px]" aria-hidden /> : <Eye className="size-[18px]" aria-hidden />}
        </button>
      }
    />
  )
}

/* ------------------------------------------------------------------ */
/* Validation + helpers                                                */
/* ------------------------------------------------------------------ */
export const MIN_PASSWORD = 8

export const v = {
  required: (label: string) => (val: string) => (val.trim() ? undefined : `Enter ${label}.`),
  email: (val: string) =>
    !val.trim()
      ? 'Enter your email address.'
      : /^\S+@\S+\.\S+$/.test(val.trim())
        ? undefined
        : 'Enter a valid email address, like name@company.ng.',
  newPassword: (val: string) =>
    !val ? 'Create a password.' : val.length < MIN_PASSWORD ? `Use at least ${MIN_PASSWORD} characters.` : undefined,
  confirm: (pw: string) => (val: string) => (!val ? 'Re-enter your password.' : val !== pw ? 'Passwords don’t match.' : undefined),
}

export const PASSWORD_HINT = `At least ${MIN_PASSWORD} characters.`

/** Move focus to the first invalid field after a failed submit. */
export function focusFirstInvalid(form: HTMLFormElement | null) {
  requestAnimationFrame(() => form?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
}

export function useCountdown(seconds: number) {
  const [left, setLeft] = useState(seconds)
  useEffect(() => {
    if (left <= 0) return
    const t = window.setTimeout(() => setLeft((l) => l - 1), 1000)
    return () => window.clearTimeout(t)
  }, [left])
  return [left, () => setLeft(seconds)] as const
}
