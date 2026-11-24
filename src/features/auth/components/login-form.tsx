'use client'

import { useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Banner } from '@/components/ui/banner'
import { Field } from '@/components/ui/field'
import { AuthCard, AuthFooter, AuthHeader, PasswordField, SubmitButton, focusFirstInvalid, linkClass, v } from './auth-shell'
import { signInAction } from '@/server/actions/auth.actions'

export function LoginForm() {
  const ref = useRef<HTMLFormElement>(null)
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [wrong, setWrong] = useState(false)

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
    const result = await signInAction({ email, password })
    if (result.error) {
      setBusy(false)
      setWrong(true)
      return
    }
    // Stay busy through the redirect so the button doesn't flash back to idle.
    // replace, not push: signing in shouldn't leave the sign-in form in back-button history.
    router.replace('/dashboard')
  }

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
