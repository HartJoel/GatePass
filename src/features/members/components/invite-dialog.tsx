'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Modal } from '@/components/ui/overlay'
import { Select } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { ROLES, type Role } from '@/features/companies/demo-data'
import { useCompanyData } from '@/features/companies/components/company-data-provider'

export function InviteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  // Remount on open so the form always starts clean.
  return open ? <InviteDialogBody onClose={onClose} /> : null
}

function InviteDialogBody({ onClose }: { onClose: () => void }) {
  const { estates, members, invites, addInvite } = useCompanyData()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('Estate manager')
  const [estateId, setEstateId] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [now] = useState(() => Date.now())
  const active = estates.filter((e) => e.status === 'active')
  const allEstates = role === 'Company admin'

  const e = email.trim().toLowerCase()
  const errors = {
    email: !e
      ? 'Enter their email address.'
      : !/^\S+@\S+\.\S+$/.test(e)
        ? 'Enter a valid email address, like name@company.ng.'
        : members.some((m) => m.email.toLowerCase() === e)
          ? 'This person is already a member.'
          : invites.some((i) => i.email === e && i.expiresAt > now)
            ? 'This person already has a pending invite. Resend it from Pending invites.'
            : undefined,
    estate: allEstates || estateId ? undefined : active.length ? 'Choose an estate.' : 'Register an estate first.',
  }
  const show = submitted ? errors : ({} as Partial<typeof errors>)

  function submit(ev: FormEvent) {
    ev.preventDefault()
    setSubmitted(true)
    if (errors.email || errors.estate) return
    addInvite({ email, role, estateId: allEstates ? undefined : estateId })
    toast({ tone: 'success', title: 'Invite sent', description: `${email.trim()} · ${role}` })
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Invite member"
      description="They’ll get an email with a link to set a password and join. Invites are valid for 7 days."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="filled" type="submit" form="invite-form">
            Send invite
          </Button>
        </>
      }
    >
      <form id="invite-form" onSubmit={submit} noValidate className="flex flex-col gap-4 pb-2">
        <Field label="Email" type="email" inputMode="email" autoFocus placeholder="name@company.ng" value={email} onChange={(ev) => setEmail(ev.target.value)} error={show.email} />
        <Select label="Role" value={role} onChange={(ev) => setRole(ev.target.value as Role)}>
          {ROLES.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </Select>
        {allEstates ? (
          <Select label="Estate" value="" disabled hint="Company admins can see every estate.">
            <option value="">All estates</option>
          </Select>
        ) : (
          <Select label="Estate" value={estateId} onChange={(ev) => setEstateId(ev.target.value)} error={show.estate}>
            <option value="">Choose an estate</option>
            {active.map((es) => (
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
