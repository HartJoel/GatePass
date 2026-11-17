'use client'

import { useRef, useState, type FormEvent } from 'react'
import { MailCheck } from 'lucide-react'
import Link from 'next/link'
import { Field } from '@/components/ui/field'
import { LinkButton } from '@/components/ui/button'
import { AuthCard, AuthFooter, AuthHeader, StatePanel, SubmitButton, focusFirstInvalid, linkClass, useCountdown, v } from './auth-shell'

export function ForgotPasswordForm() {
  const ref = useRef<HTMLFormElement>(null)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [cooldown, restart] = useCountdown(30)
  const [resent, setResent] = useState(false)

  const error = submitted ? v.email(email) : undefined

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    if (v.email(email)) return focusFirstInvalid(ref.current)
    setBusy(true)
    // TODO(phase 5, slice A): send the reset email. Same response whether or not the address exists.
    await new Promise((r) => setTimeout(r, 700))
    setBusy(false)
    setSent(true)
  }

  if (sent)
    return (
      <AuthCard>
        <StatePanel
          icon={MailCheck}
          tone="accent"
          title="Check your email"
          actions={<LinkButton href="/sign-in" variant="ghost">Back to sign in</LinkButton>}
          aside={
            cooldown > 0 ? (
              <span>
                Didn’t get it? Check your spam folder, or resend in <span className="tnum font-medium text-ink">0:{String(cooldown).padStart(2, '0')}</span>.
              </span>
            ) : (
              <span>
                Didn’t get it? Check your spam folder or{' '}
                <button
                  type="button"
                  className={linkClass}
                  onClick={() => {
                    restart()
                    setResent(true)
                  }}
                >
                  resend the link
                </button>
                .
              </span>
            )
          }
        >
          If an account exists for <span className="break-all font-medium text-ink">{email.trim()}</span>, we’ve sent a link to reset your password. It
          expires in 60 minutes.
          {resent && <span className="mt-3 block text-success-fg">We’ve sent it again.</span>}
        </StatePanel>
        <p className="mt-4 text-center text-sm text-ink-2">
          Wrong address?{' '}
          <button
            type="button"
            className={linkClass}
            onClick={() => {
              setSent(false)
              setResent(false)
              restart()
            }}
          >
            Use a different email
          </button>
        </p>
      </AuthCard>
    )

  return (
    <AuthCard>
      <AuthHeader title="Forgot your password?">Enter your email and we’ll send you a link to reset it.</AuthHeader>
      <form ref={ref} onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Field
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder="name@company.ng"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
        />
        <SubmitButton busy={busy} busyLabel="Sending…" className="mt-2">
          Send reset link
        </SubmitButton>
      </form>
      <AuthFooter>
        Remembered it?{' '}
        <Link href="/sign-in" className={linkClass}>
          Back to sign in
        </Link>
      </AuthFooter>
    </AuthCard>
  )
}
