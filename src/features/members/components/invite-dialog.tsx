'use client'

import { useState, type FormEvent } from 'react'
import { Check, Copy } from 'lucide-react'
import { Banner } from '@/components/ui/banner'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Modal } from '@/components/ui/overlay'
import { Select } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { inviteMemberAction } from '@/server/actions/invitation.actions'
import { INVITE_ROLES, type InviteRoleValue } from '@/lib/validation/invitation.schema'

const ROLE_LABEL: Record<InviteRoleValue, string> = {
  COMPANY_ADMIN: 'Company admin',
  MANAGER: 'Estate manager',
  RESIDENT: 'Resident',
  GUARD: 'Guard',
}

export interface InviteEstateOption {
  id: string
  name: string
}

export function InviteDialog({
  open,
  onClose,
  companyId,
  estates,
}: {
  open: boolean
  onClose: () => void
  companyId: string
  estates: InviteEstateOption[]
}) {
  // Remount on open so the form always starts clean.
  return open ? <InviteDialogBody onClose={onClose} companyId={companyId} estates={estates} /> : null
}

function InviteDialogBody({ onClose, companyId, estates }: { onClose: () => void; companyId: string; estates: InviteEstateOption[] }) {
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<InviteRoleValue>('MANAGER')
  const [estateId, setEstateId] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [link, setLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const allEstates = role === 'COMPANY_ADMIN'

  const e = email.trim()
  const errors = {
    email: !e
      ? 'Enter their email address.'
      : !/^\S+@\S+\.\S+$/.test(e)
        ? 'Enter a valid email address, like name@company.ng.'
        : undefined,
    estate: allEstates || estateId ? undefined : estates.length ? 'Choose an estate.' : 'Register an estate first.',
  }
  const show = submitted ? errors : ({} as Partial<typeof errors>)

  async function submit(ev: FormEvent) {
    ev.preventDefault()
    setSubmitted(true)
    if (errors.email || errors.estate) return
    setServerError(null)
    setBusy(true)
    const result = await inviteMemberAction(companyId, { email: e, role, estateId: allEstates ? undefined : estateId })
    setBusy(false)
    if (result.error) {
      setServerError(result.error.message)
      return
    }
    setLink(`${window.location.origin}/accept-invite/${result.data.token}`)
  }

  function copyLink() {
    if (!link) return
    void navigator.clipboard.writeText(link)
    setCopied(true)
    toast({ tone: 'success', title: 'Link copied' })
  }

  if (link)
    return (
      <Modal
        open
        onClose={onClose}
        title="Invite link ready"
        description="Share this with them yourself — it’s shown once and won’t be shown again. Resend from Pending invites to get a fresh one."
        footer={
          <Button variant="filled" onClick={onClose}>
            Done
          </Button>
        }
      >
        <div className="flex items-center gap-2 rounded-control border border-field bg-surface-2 px-3.5 py-3">
          <code className="min-w-0 flex-1 truncate text-[13px] text-ink">{link}</code>
          <Button variant="ghost" className="!h-9 !px-3 !text-sm shrink-0" icon={copied ? <Check /> : <Copy />} onClick={copyLink}>
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </Modal>
    )

  return (
    <Modal
      open
      onClose={onClose}
      title="Invite member"
      description="Creates a link you share with them yourself — there’s no email involved. Links are valid for 7 days."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="filled" type="submit" form="invite-form" loading={busy}>
            {busy ? 'Creating…' : 'Create invite'}
          </Button>
        </>
      }
    >
      <form id="invite-form" onSubmit={submit} noValidate className="flex flex-col gap-4 pb-2">
        {serverError && <Banner title="Couldn’t create the invite">{serverError}</Banner>}
        <Field label="Email" type="email" inputMode="email" autoFocus placeholder="name@company.ng" value={email} onChange={(ev) => setEmail(ev.target.value)} error={show.email} />
        <Select label="Role" value={role} onChange={(ev) => setRole(ev.target.value as InviteRoleValue)}>
          {INVITE_ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABEL[r]}
            </option>
          ))}
        </Select>
        {allEstates ? (
          <Select label="Estate" value="" disabled hint="Company admins can see every estate.">
            <option value="">All estates</option>
          </Select>
        ) : (
          <Select label="Estate" value={estateId} onChange={(ev) => setEstateId(ev.target.value)} error={show.estate}>
            <option value="">Choose an estate</option>
            {estates.map((es) => (
              <option key={es.id} value={es.id}>
                {es.name}
              </option>
            ))}
          </Select>
        )}
      </form>
    </Modal>
  )
}
