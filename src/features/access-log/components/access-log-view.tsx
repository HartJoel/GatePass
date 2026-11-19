import Link from 'next/link'
import { ChevronLeft, ClipboardList } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { StatusBadge } from '@/components/ui/status-badge'
import { formatAgo } from '@/lib/format'
import { nowMs } from '@/lib/utils'
import { LogFilters } from '@/features/access-log/components/log-filters'
import type { AccessLogRow } from '@/server/services/access-log.service'

const REASON_LABEL: Record<string, string> = {
  NOT_FOUND: 'Unknown code',
  NOT_YET_VALID: 'Not yet valid',
  EXPIRED: 'Expired',
  REVOKED: 'Revoked',
  ALREADY_USED: 'Already used',
  GUARD_REJECTED: 'Rejected by guard',
}

export function AccessLogView({
  companyId,
  estateId,
  estateName,
  events,
}: {
  companyId: string
  estateId: string
  estateName: string
  events: AccessLogRow[]
}) {
  const now = nowMs()

  return (
    <>
      <header className="mb-6">
        <Link
          href={`/companies/${companyId}/estates/${estateId}`}
          className="-ml-1 mb-3 inline-flex items-center gap-0.5 rounded-sm text-sm font-medium text-ink-2 transition-colors hover:text-ink"
        >
          <ChevronLeft className="size-4" aria-hidden />
          {estateName}
        </Link>
        <h1 className="type-h1 text-ink">Access log</h1>
        <p className="mt-1.5 text-[15px] text-ink-2">Every gate decision at {estateName}.</p>
      </header>

      <LogFilters />

      {events.length === 0 ? (
        <EmptyState icon={ClipboardList} message="No entries match these filters." />
      ) : (
        <ul className="flex flex-col gap-3">
          {events.map((e) => (
            <li key={e.id} className="flex items-center gap-4 rounded-card border border-line bg-surface p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-ink">{e.visitor ?? 'Unknown visitor'}</p>
                <p className="mt-0.5 truncate text-sm text-ink-2">
                  {e.unit ?? '—'} · Guard: {e.guard}
                </p>
                {e.decision === 'rejected' && e.reason && <p className="mt-0.5 text-sm text-ink-2">{REASON_LABEL[e.reason] ?? e.reason}</p>}
                {e.note && <p className="mt-0.5 text-sm text-ink-2">“{e.note}”</p>}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <StatusBadge status={e.decision} size="sm" />
                <span className="tnum text-[13px] text-ink-2">{formatAgo(now - e.at.getTime())}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
