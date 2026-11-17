'use client'

import { useRef, useState, type FormEvent } from 'react'
import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { Banner } from '@/components/ui/banner'
import { Field } from '@/components/ui/field'
import { LinkButton } from '@/components/ui/button'
import { AuthCard, AuthFooter, AuthHeader, PasswordField, StatePanel, SubmitButton, focusFirstInvalid, linkClass, v } from './auth-shell'

export function LoginForm() {
  const ref = useRef<HTMLFormElement>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [wrong, setWrong] = useState(false)
  const [done, setDone] = useState(false)

  const errors = {
    email: submitted ? v.email(email) : undefined,
    password: submitted && !password ? 'Enter your password.' : undefined,
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    if (v.email(email) || !password) return focusFirstInvalid(ref.current)
    setWrong(false)
    setBusy(true)
    // TODO(phase 5, slice A): call the sign-in Server Action against Better Auth.
    await new Promise((r) => setTimeout(r, 700))
    setBusy(false)
    setDone(true)
  }

  if (done)
    return (
      <AuthCard>
        <StatePanel icon={CheckCircle2} tone="success" title="You’re signed in" actions={<LinkButton href="/dashboard">Continue to dashboard</LinkButton>}>
          Welcome back. Pick up where you left off.
        </StatePanel>
      </AuthCard>
    )

  return (
    <AuthCard>
      <AuthHeader title="Sign in">Welcome back to GatePass.</AuthHeader>
      <form ref={ref} onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {wrong && (
          <Banner title="Email or password is incorrect">
            Check your details and try again, or{' '}
            <Link href="/forgot-password" className="rounded-sm text-ink underline">
              reset your password
            </Link>
            .
          </Banner>
        )}
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
          error={errors.email}
        />
        <PasswordField
          label="Password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          labelAction={
            <Link href="/forgot-password" className={linkClass + ' text-[13px]'}>
              Forgot password?
            </Link>
          }
        />
        <SubmitButton busy={busy} busyLabel="Signing in…" className="mt-2">
          Sign in
        </SubmitButton>
      </form>
      <AuthFooter>
        New to GatePass?{' '}
        <Link href="/register" className={linkClass}>
          Register your company
        </Link>
      </AuthFooter>
    </AuthCard>
  )
}
