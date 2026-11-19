'use client'

import { useRef, useState, type FormEvent } from 'react'
import { CheckCircle2, Clock, Link2Off, UserCheck } from 'lucide-react'
import { Banner } from '@/components/ui/banner'
import { Field } from '@/components/ui/field'
import { LinkButton } from '@/components/ui/button'
import { acceptInvitationAction } from '@/server/actions/invitation.actions'
import { AuthCard, AuthFooter, AuthHeader, PASSWORD_HINT, PasswordField, StatePanel, SubmitButton, focusFirstInvalid, linkClass, v } from './auth-shell'

export interface InviteDetails {
  company: string
  estate: string
  role: string
  email: string
}

export type InviteStatus = 'ready' | 'invalid' | 'expired' | 'used'

export function AcceptInvite({ status, invite, token }: { status: InviteStatus; invite: InviteDetails; token: string }) {
  if (status === 'invalid') return <InvalidLink />
  if (status === 'expired') return <ExpiredLink invite={invite} />
  if (status === 'used') return <UsedLink invite={invite} />
  return <AcceptForm invite={invite} token={token} />
}

/* ------------------------------------------------------------------ */
/* Valid invite                                                        */
/* ------------------------------------------------------------------ */
function AcceptForm({ invite, token }: { invite: InviteDetails; token: string }) {
  const ref = useRef<HTMLFormElement>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const destination = invite.estate || invite.company

  const errors = {
    password: submitted ? v.newPassword(password) : undefined,
    confirm: submitted ? v.confirm(password)(confirm) : undefined,
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    if (v.newPassword(password) || v.confirm(password)(confirm)) return focusFirstInvalid(ref.current)
    setServerError(null)
    setBusy(true)
    const result = await acceptInvitationAction({ token, password })
    setBusy(false)
    if (result.error) {
      setServerError(result.error.message)
      return
    }
    setDone(true)
  }

  if (done)
    return (
      <AuthCard>
        <StatePanel icon={CheckCircle2} tone="success" title={`Welcome to ${destination}`} actions={<LinkButton href="/dashboard">Continue</LinkButton>}>
          Your account is ready.
        </StatePanel>
      </AuthCard>
    )

  return (
    <AuthCard>
      <AuthHeader title={`Join ${destination}`} compact />
      <p className="mb-6 rounded-control bg-surface-2 px-3.5 py-3 text-[15px] text-ink-2">
        <strong className="font-semibold text-ink">{invite.company}</strong> invited you to join{' '}
        <strong className="font-semibold text-ink">{destination}</strong> as <strong className="font-semibold text-ink">{invite.role}</strong>.
      </p>
      <form ref={ref} onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {serverError && <Banner title="Couldn’t create your account">{serverError}</Banner>}
        <Field label="Email" type="email" value={invite.email} readOnly disabled hint="Your invite was sent to this address." />
        <PasswordField
          label="Create a password"
          name="new-password"
          autoComplete="new-password"
          hint={PASSWORD_HINT}
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <PasswordField
          label="Confirm password"
          name="confirm-password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
        />
        <SubmitButton busy={busy} busyLabel="Joining…" className="mt-2">
          Join estate
        </SubmitButton>
      </form>
      <AuthFooter>
        Already have an account?{' '}
        <a href="/sign-in" className={linkClass}>
          Sign in
        </a>
      </AuthFooter>
    </AuthCard>
  )
}

/* ------------------------------------------------------------------ */
/* Dead-link states: each explains why and offers a way forward        */
/* ------------------------------------------------------------------ */
function InvalidLink() {
  return (
    <AuthCard>
      <StatePanel
        icon={Link2Off}
        title="This invite link isn’t valid"
        actions={<LinkButton href="/sign-in" variant="ghost">Go to sign in</LinkButton>}
        aside={
          <>
            Think this is a mistake?{' '}
            <a href="mailto:support@gatepass.ng?subject=Invite%20link%20problem" className={linkClass}>
              Contact support
            </a>
          </>
        }
      >
        The link may have been cut off when it was copied. Open the original email and tap the button again, or ask your estate manager to send a new
        invite.
      </StatePanel>
    </AuthCard>
  )
}

function ExpiredLink({ invite }: { invite: InviteDetails }) {
  const destination = invite.estate || invite.company
  return (
    <AuthCard>
      <StatePanel
        icon={Clock}
        tone="warning"
        title="This invite has expired"
        actions={<LinkButton href="/sign-in" variant="ghost">Back to sign in</LinkButton>}
        aside={
          <>
            Already set up your account?{' '}
            <a href="/sign-in" className={linkClass}>
              Sign in
            </a>
          </>
        }
      >
        Invite links for {destination} are valid for 7 days. Ask {invite.company || 'your company admin'} to send you a new one from Pending invites.
      </StatePanel>
    </AuthCard>
  )
}

function UsedLink({ invite }: { invite: InviteDetails }) {
  const destination = invite.estate || invite.company
  return (
    <AuthCard>
      <StatePanel
        icon={UserCheck}
        title="This invite has already been used"
        actions={<LinkButton href="/sign-in" variant="ghost">Sign in</LinkButton>}
        aside={
          <>
            Forgot your password?{' '}
            <a href="/forgot-password" className={linkClass}>
              Reset it
            </a>
          </>
        }
      >
        An account was already created with this invite. Sign in to continue to {destination}.
      </StatePanel>
    </AuthCard>
  )
}

