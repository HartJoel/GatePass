'use client'

import { useRef, useState, type FormEvent } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { LinkButton } from '@/components/ui/button'
import { AuthCard, AuthFooter, AuthHeader, PASSWORD_HINT, PasswordField, StatePanel, SubmitButton, focusFirstInvalid, v } from './auth-shell'

export function ResetPasswordForm() {
  const ref = useRef<HTMLFormElement>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  const errors = {
    password: submitted ? v.newPassword(password) : undefined,
    confirm: submitted ? v.confirm(password)(confirm) : undefined,
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    if (v.newPassword(password) || v.confirm(password)(confirm)) return focusFirstInvalid(ref.current)
    setBusy(true)
    // TODO(phase 5, slice A): consume the single-use reset token, update the password, revoke sessions.
    await new Promise((r) => setTimeout(r, 700))
    setBusy(false)
    setDone(true)
  }

  if (done)
    return (
      <AuthCard>
        <StatePanel icon={CheckCircle2} tone="success" title="Password updated" actions={<LinkButton href="/sign-in">Sign in</LinkButton>}>
          Your password has been changed. Sign in with your new password.
        </StatePanel>
      </AuthCard>
    )

  return (
    <AuthCard>
      <AuthHeader title="Set a new password">Choose a password you haven’t used before.</AuthHeader>
      <form ref={ref} onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <PasswordField
          label="New password"
          name="new-password"
          autoComplete="new-password"
          hint={PASSWORD_HINT}
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <PasswordField
          label="Confirm new password"
          name="confirm-password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
        />
        <SubmitButton busy={busy} busyLabel="Updating…" className="mt-2">
          Update password
        </SubmitButton>
      </form>
      <AuthFooter>
        <LinkButton href="/sign-in" variant="ghost">
          Back to sign in
        </LinkButton>
      </AuthFooter>
    </AuthCard>
  )
}
