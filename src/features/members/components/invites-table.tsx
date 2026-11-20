'use client'

import { useMemo, useState } from 'react'
import { Check, Copy, MailPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/data/data-table'
import { EmptyState } from '@/components/ui/empty-state'
import { Modal } from '@/components/ui/overlay'
import { StatusBadge } from '@/components/ui/status-badge'
import { useToast } from '@/components/ui/toast'
import { formatAgo } from '@/lib/format'
import { resendInvitationAction, cancelInvitationAction } from '@/server/actions/invitation.actions'
import type { InviteRoleValue } from '@/lib/validation/invitation.schema'

export interface InviteRow {
  id: string
  email: string
  role: InviteRoleValue
  estateId: string | null
  createdAt: Date
  expiresAt: Date
}

const ROLE_LABEL: Record<InviteRoleValue, string> = {
  COMPANY_ADMIN: 'Company admin',
  MANAGER: 'Estate manager',
  RESIDENT: 'Resident',
  GUARD: 'Guard',
}

function expiresIn(ms: number) {
  const hours = Math.ceil(ms / 3_600_000)
  if (hours < 24) return `in ${hours} ${hours === 1 ? 'hour' : 'hours'}`
  const days = Math.round(ms / 86_400_000)
  return `in ${days} ${days === 1 ? 'day' : 'days'}`
}

export function InvitesTable({ companyId, invites, estates }: { companyId: string; invites: InviteRow[]; estates: { id: string; name: string }[] }) {
  const toast = useToast()
  const [cancelling, setCancelling] = useState<InviteRow | null>(null)
  const [cancelBusy, setCancelBusy] = useState(false)
  const [resendingId, setResendingId] = useState<string | null>(null)
  const [link, setLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [now] = useState(() => Date.now())
  const estateName = useMemo(() => {
    const byId = new Map(estates.map((e) => [e.id, e.name]))
    return (id: string) => byId.get(id) ?? 'Unknown estate'
  }, [estates])

  async function resend(invite: InviteRow) {
    setResendingId(invite.id)
    const result = await resendInvitationAction(companyId, invite.id)
    setResendingId(null)
    if (result.error) {
      toast({ tone: 'danger', title: 'Couldn’t resend invite', description: result.error.message })
      return
    }
    setCopied(false)
    setLink(`${window.location.origin}/accept-invite/${result.data.token}`)
  }

  function copyLink() {
    if (!link) return
    void navigator.clipboard.writeText(link)
    setCopied(true)
    toast({ tone: 'success', title: 'Link copied' })
  }

  const columns: Column<InviteRow>[] = [
    { key: 'email', header: 'Email', skeleton: 'w-48', cell: (i) => <span className="font-semibold text-ink">{i.email}</span> },
    { key: 'role', header: 'Role', cell: (i) => ROLE_LABEL[i.role] },
    { key: 'estate', header: 'Estate', cell: (i) => (i.estateId ? estateName(i.estateId) : <span className="text-ink-2">All estates</span>) },
    { key: 'sent', header: 'Sent', cell: (i) => <span className="text-ink-2">{formatAgo(now - i.createdAt.getTime())}</span> },
    {
      key: 'expires',
      header: 'Expires',
      cell: (i) => (i.expiresAt.getTime() <= now ? <StatusBadge status="expired" size="sm" /> : <span className="tnum text-ink-2">{expiresIn(i.expiresAt.getTime() - now)}</span>),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      cell: (i) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            className="!h-9 !px-3 !text-sm"
            aria-label={`Resend invite to ${i.email}`}
            loading={resendingId === i.id}
            onClick={() => resend(i)}
          >
            {resendingId === i.id ? 'Resending…' : 'Resend'}
          </Button>
          <Button variant="destructive-ghost" className="!h-9 !px-3 !text-sm" aria-label={`Cancel invite for ${i.email}`} disabled={resendingId === i.id} onClick={() => setCancelling(i)}>
            Cancel
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <DataTable
        label="Pending invites"
        columns={columns}
        rows={invites}
        selectable={false}
        pageSize={8}
        empty={<EmptyState icon={MailPlus} message="No pending invites. Everyone you’ve invited has joined." />}
      />
      <Modal
        open={!!link}
        onClose={() => setLink(null)}
        title="Invite link ready"
        description="Share this with them yourself — it’s shown once and won’t be shown again."
        footer={
          <Button variant="filled" onClick={() => setLink(null)}>
            Done
          </Button>
        }
      >
        {link && (
          <div className="flex items-center gap-2 rounded-control border border-field bg-surface-2 px-3.5 py-3">
            <code className="min-w-0 flex-1 truncate text-[13px] text-ink">{link}</code>
            <Button variant="ghost" className="!h-9 !px-3 !text-sm shrink-0" icon={copied ? <Check /> : <Copy />} onClick={copyLink}>
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        )}
      </Modal>
      <Modal
        open={!!cancelling}
        onClose={() => setCancelling(null)}
        title="Cancel this invite?"
        description={cancelling ? `The link shared with ${cancelling.email} will stop working. You can invite them again later.` : undefined}
        footer={
          <>
            <Button variant="ghost" disabled={cancelBusy} onClick={() => setCancelling(null)}>
              Keep invite
            </Button>
            <Button
              variant="destructive-ghost"
              loading={cancelBusy}
              onClick={async () => {
                if (!cancelling) return
                const target = cancelling
                setCancelBusy(true)
                const result = await cancelInvitationAction(companyId, target.id)
                setCancelBusy(false)
                if (result.error) {
                  toast({ tone: 'danger', title: 'Couldn’t cancel invite', description: result.error.message })
                  return
                }
                toast({ tone: 'neutral', title: 'Invite cancelled', description: target.email })
                setCancelling(null)
              }}
            >
              {cancelBusy ? 'Cancelling…' : 'Cancel invite'}
            </Button>
          </>
        }
      />
    </>
  )
}
