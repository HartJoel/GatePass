'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Building2, ChevronLeft, PauseCircle, Play } from 'lucide-react'
import { Banner } from '@/components/ui/banner'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Modal } from '@/components/ui/overlay'
import { StatusBadge } from '@/components/ui/status-badge'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import { formatDate } from '@/features/platform/demo-data'
import { usePlatformData } from '@/features/platform/components/platform-data-provider'

export function CompanyDetail({ companyId }: { companyId: string }) {
  const { companies, suspend, reactivate } = usePlatformData()
  const toast = useToast()
  const company = companies.find((c) => c.id === companyId)
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (!company) {
    return (
      <>
        <Link href="/platform/companies" className="-ml-1 mb-2 inline-flex items-center gap-0.5 rounded-sm text-sm font-medium text-ink-2 transition-colors hover:text-ink">
          <ChevronLeft className="size-4" aria-hidden />
          Companies
        </Link>
        <h1 className="type-h1 mb-6 text-ink">Company not found</h1>
        <Banner tone="info" title="We couldn’t find that company">
          It may have been removed. Go back to Companies to pick another.
        </Banner>
      </>
    )
  }

  const suspended = company.status === 'suspended'
  const liveEstates = company.estates.filter((e) => e.status === 'active').length
  const units = company.estates.reduce((n, e) => n + e.units, 0)
  const reasonError = submitted && !reason.trim() ? 'Enter a reason. It’s recorded against this company.' : undefined

  const close = () => {
    setOpen(false)
    setReason('')
    setSubmitted(false)
  }
  function confirm() {
    setSubmitted(true)
    if (!reason.trim() || !company) return
    suspend(company.id, reason)
    toast({ tone: 'neutral', title: 'Company suspended', description: company.name })
    close()
  }

  const rows: [string, string][] = [
    ['Primary contact', company.contactName],
    ['Email', company.contactEmail],
    ['Phone', `+234 ${company.phone}`],
    ['City', company.city],
    ['CAC number', company.rcNumber],
    ['Created', formatDate(company.createdAt)],
  ]

  return (
    <>
      <header className="mb-6">
        <Link href="/platform/companies" className="-ml-1 mb-2 inline-flex items-center gap-0.5 rounded-sm text-sm font-medium text-ink-2 transition-colors hover:text-ink">
          <ChevronLeft className="size-4" aria-hidden />
          Companies
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="type-h1 truncate text-ink">{company.name}</h1>
              <StatusBadge status={company.status} />
            </div>
            <p className="mt-1 text-sm text-ink-2">
              {company.estates.length} {company.estates.length === 1 ? 'estate' : 'estates'} · {company.users.toLocaleString('en-NG')} {company.users === 1 ? 'user' : 'users'}
            </p>
          </div>
          {suspended ? (
            <Button
              variant="filled"
              icon={<Play />}
              onClick={() => {
                reactivate(company.id)
                toast({ tone: 'success', title: 'Company reactivated', description: `${company.name} has access again.` })
              }}
            >
              Reactivate
            </Button>
          ) : (
            <Button variant="destructive-ghost" icon={<PauseCircle />} onClick={() => setOpen(true)}>
              Suspend company
            </Button>
          )}
        </div>
      </header>

      {suspended && company.suspension && (
        <Banner tone="warning" icon={PauseCircle} title="This company is suspended" className="mb-6">
          <p>
            Access is paused for all {company.estates.length} {company.estates.length === 1 ? 'estate' : 'estates'}: residents, guards and managers can’t
            sign in, and passes won’t work at the gate. Data is kept.
          </p>
          <p className="mt-2">
            <span className="font-medium text-ink">Reason:</span> {company.suspension.reason}
          </p>
          <p className="mt-0.5 text-[13px]">
            Suspended {formatDate(company.suspension.at)} by {company.suspension.by}
          </p>
        </Banner>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <section className="rounded-card border border-line bg-surface">
          <div className="border-b border-line px-6 py-4">
            <h2 className="type-h3">Summary</h2>
          </div>
          <dl className="divide-y divide-line text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-6 px-6 py-2.5">
                <dt className="text-ink-2">{k}</dt>
                <dd className="min-w-0 truncate text-right font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="grid grid-cols-3 divide-x divide-line border-t border-line text-center">
            {(
              [
                ['Estates', company.estates.length],
                ['Units', units],
                ['Users', company.users],
              ] as const
            ).map(([k, v]) => (
              <div key={k} className="px-3 py-3">
                <p className="tnum text-lg font-semibold text-ink">{v.toLocaleString('en-NG')}</p>
                <p className="type-caption text-ink-2">{k}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-card border border-line bg-surface">
          <div className="border-b border-line px-6 py-4">
            <h2 className="type-h3">Estates</h2>
            {company.estates.length > 0 && <p className="mt-0.5 text-sm text-ink-2">{liveEstates} of {company.estates.length} active</p>}
          </div>
          {company.estates.length === 0 ? (
            <EmptyState icon={Building2} message="No estates registered yet. This company signed up recently." className="py-10" />
          ) : (
            <ul className="divide-y divide-line">
              {company.estates.map((e) => (
                <li key={e.id} className="flex items-center gap-4 px-6 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium text-ink">{e.name}</p>
                    <p className="text-[13px] text-ink-2">{e.city}</p>
                  </div>
                  <span className="tnum w-24 shrink-0 text-right text-sm text-ink-2">{e.units ? `${e.units} units` : 'Units not set'}</span>
                  <span className="flex w-28 shrink-0 justify-end">
                    <StatusBadge status={e.status} size="sm" />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Modal
        open={open}
        onClose={close}
        title={`Suspend ${company.name}?`}
        description={`Residents, guards and managers at all ${company.estates.length} ${company.estates.length === 1 ? 'estate' : 'estates'} lose access straight away and visitor passes stop working at the gate. Nothing is deleted, and you can reactivate at any time.`}
        footer={
          <>
            <Button variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button variant="destructive-ghost" onClick={confirm}>
              Suspend company
            </Button>
          </>
        }
      >
        <div className="pb-2">
          <Textarea
            label="Reason (required)"
            autoFocus
            placeholder="e.g. Unpaid subscription, invoice INV-2291"
            hint="Recorded against the company and shown to platform staff."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            error={reasonError}
          />
        </div>
      </Modal>
    </>
  )
}
