'use client'

import { useRef, useState, type FormEvent } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { Banner } from '@/components/ui/banner'
import { Field } from '@/components/ui/field'
import { LinkButton } from '@/components/ui/button'
import { AuthCard, AuthFooter, AuthHeader, PASSWORD_HINT, PasswordField, StatePanel, SubmitButton, focusFirstInvalid, linkClass, v } from './auth-shell'

export function RegisterForm() {
  const ref = useRef<HTMLFormElement>(null)
  const [company, setCompany] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [taken, setTaken] = useState(false)
  const [done, setDone] = useState(false)

  const errors = {
    company: submitted ? v.required('your company name')(company) : undefined,
    name: submitted ? v.required('your full name')(name) : undefined,
    email: submitted ? v.email(email) : undefined,
    password: submitted ? v.newPassword(password) : undefined,
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    if (v.required('your company name')(company) || v.required('your full name')(name) || v.email(email) || v.newPassword(password)) {
      return focusFirstInvalid(ref.current)
    }
    setTaken(false)
    setBusy(true)
    // TODO(phase 5, slice A): registerCompanyAction — create the Better Auth user, then
    // Company + COMPANY_ADMIN membership in one transaction, then send the verification email.
    await new Promise((r) => setTimeout(r, 900))
    setBusy(false)
    setDone(true)
  }

  if (done)
    return (
      <AuthCard>
        <StatePanel
          icon={CheckCircle2}
          tone="success"
          title={`${company.trim()} is registered`}
          actions={
            <LinkButton href="/dashboard">
              Register your first estate <ArrowRight className="size-[18px]" aria-hidden />
            </LinkButton>
          }
        >
          Next, you’ll add your estates, then invite managers, residents and guards.
        </StatePanel>
      </AuthCard>
    )

  return (
    <AuthCard>
      <AuthHeader title="Register your company">Create your company account. Next, you’ll register your estates.</AuthHeader>
      <form ref={ref} onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {taken && (
          <Banner title="An account with this email already exists">
            <Link href="/sign-in" className="rounded-sm text-ink underline">
              Sign in
            </Link>{' '}
            or{' '}
            <Link href="/forgot-password" className="rounded-sm text-ink underline">
              reset your password
            </Link>
            .
          </Banner>
        )}
        <Field
          label="Company name"
          name="company"
          autoComplete="organization"
          placeholder="Crestview Property Management"
          autoFocus
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          error={errors.company}
        />
        <Field
          label="Your full name"
          name="name"
          autoComplete="name"
          placeholder="Ada Okafor"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <Field
          label="Work email"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder="name@company.ng"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <PasswordField
          label="Password"
          name="new-password"
          autoComplete="new-password"
          hint={PASSWORD_HINT}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <SubmitButton busy={busy} busyLabel="Creating account…" className="mt-2">
          Create company account
        </SubmitButton>
      </form>
      <AuthFooter>
        Already registered?{' '}
        <Link href="/sign-in" className={linkClass}>
          Sign in
        </Link>
      </AuthFooter>
    </AuthCard>
  )
}
