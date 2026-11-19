'use client'

import { useState } from 'react'
import { History } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { StatusBadge } from '@/components/ui/status-badge'
import { formatAgo } from '@/lib/format'
import type { AccessEventRow } from '@/server/services/gate.service'

export function GuardHistory({ events }: { events: AccessEventRow[] }) {
  const [now] = useState(() => Date.now())

  return (
    <>
      <header className="mb-6">
        <h1 className="type-h1 text-ink">Entry history</h1>
        <p className="mt-1.5 text-[15px] text-ink-2">Your decisions at this gate in the last 24 hours.</p>
      </header>
      {events.length === 0 ? (
        <EmptyState icon={History} message="No entries yet today." />
      ) : (
        <ul className="flex flex-col gap-3">
          {events.map((e) => (
            <li key={e.id} className="flex items-center gap-4 rounded-card border border-line bg-surface p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-ink">{e.visitor ?? 'Unknown visitor'}</p>
                <p className="mt-0.5 truncate text-sm text-ink-2">{e.unit ?? '—'}</p>
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
