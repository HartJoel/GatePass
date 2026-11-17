'use client'

import { useState } from 'react'
import { MailPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/data/data-table'
import { EmptyState } from '@/components/ui/empty-state'
import { Modal } from '@/components/ui/overlay'
import { StatusBadge } from '@/components/ui/status-badge'
import { useToast } from '@/components/ui/toast'
import { formatAgo } from '@/lib/format'
import type { Invite } from '@/features/companies/demo-data'
import { useCompanyData } from '@/features/companies/components/company-data-provider'

function expiresIn(ms: number) {
  const hours = Math.ceil(ms / 3_600_000)
  if (hours < 24) return `in ${hours} ${hours === 1 ? 'hour' : 'hours'}`
  const days = Math.round(ms / 86_400_000)
  return `in ${days} ${days === 1 ? 'day' : 'days'}`
}

export function InvitesTable() {
  const { invites, estateName, resendInvite, cancelInvite } = useCompanyData()
  const toast = useToast()
  const [cancelling, setCancelling] = useState<Invite | null>(null)
  const [now] = useState(() => Date.now())

  const columns: Column<Invite>[] = [
    { key: 'email', header: 'Email', skeleton: 'w-48', cell: (i) => <span className="font-semibold text-ink">{i.email}</span> },
    { key: 'role', header: 'Role', cell: (i) => i.role },
    { key: 'estate', header: 'Estate', cell: (i) => (i.estateId ? estateName(i.estateId) : <span className="text-ink-2">All estates</span>) },
    { key: 'sent', header: 'Sent', cell: (i) => <span className="text-ink-2">{formatAgo(now - i.sentAt)}</span> },
    {
      key: 'expires',
      header: 'Expires',
      cell: (i) => (i.expiresAt <= now ? <StatusBadge status="expired" size="sm" /> : <span className="tnum text-ink-2">{expiresIn(i.expiresAt - now)}</span>),
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
            onClick={() => {
              resendInvite(i.id)
              toast({ tone: 'success', title: 'Invite resent', description: i.email })
            }}
          >
            Resend
          </Button>
          <Button variant="destructive-ghost" className="!h-9 !px-3 !text-sm" aria-label={`Cancel invite for ${i.email}`} onClick={() => setCancelling(i)}>
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
        open={!!cancelling}
        onClose={() => setCancelling(null)}
        title="Cancel this invite?"
        description={cancelling ? `The link sent to ${cancelling.email} will stop working. You can invite them again later.` : undefined}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCancelling(null)}>
              Keep invite
            </Button>
            <Button
              variant="destructive-ghost"
              onClick={() => {
                if (!cancelling) return
                cancelInvite(cancelling.id)
                toast({ tone: 'neutral', title: 'Invite cancelled', description: cancelling.email })
                setCancelling(null)
              }}
            >
              Cancel invite
            </Button>
          </>
        }
      />
    </>
  )
}
