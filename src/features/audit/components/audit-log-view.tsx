'use client'

import { ClipboardList } from 'lucide-react'
import { DataTable, type Column } from '@/components/data/data-table'
import { EmptyState } from '@/components/ui/empty-state'
import { formatAgo } from '@/lib/format'
import { nowMs } from '@/lib/utils'
import type { AuditEntry } from '@/features/access-log/demo-data'

export function AuditLogView({ entries }: { entries: AuditEntry[] }) {
  const now = nowMs()
  const rows = [...entries].sort((a, b) => b.at - a.at)

  const columns: Column<AuditEntry>[] = [
    { key: 'actor', header: 'Who', skeleton: 'w-32', cell: (e) => <span className="font-semibold text-ink">{e.actor}</span> },
    { key: 'action', header: 'Action', cell: (e) => <span className="text-ink">{e.action}</span> },
    { key: 'target', header: 'Target', skeleton: 'w-48', cell: (e) => <span className="text-ink-2">{e.target}</span> },
    { key: 'at', header: 'When', align: 'right', width: '120px', cell: (e) => <span className="tnum text-ink-2">{formatAgo(now - e.at)}</span> },
  ]

  return (
    <>
      <header className="mb-8">
        <h1 className="type-h1 text-ink">Audit log</h1>
        <p className="mt-1.5 max-w-xl text-[15px] text-ink-2">Every sensitive action taken across your estates.</p>
      </header>
      <DataTable
        label="Audit log"
        columns={columns}
        rows={rows}
        density="compact"
        selectable={false}
        pageSize={12}
        empty={<EmptyState icon={ClipboardList} message="Nothing recorded yet." />}
      />
    </>
  )
}
