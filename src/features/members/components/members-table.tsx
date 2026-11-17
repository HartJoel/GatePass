'use client'

import { useMemo, useState } from 'react'
import { Search, Users } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { DataTable, type Column } from '@/components/data/data-table'
import { EmptyState } from '@/components/ui/empty-state'
import { StatusBadge } from '@/components/ui/status-badge'
import type { Member } from '@/features/companies/demo-data'
import { useCompanyData } from '@/features/companies/components/company-data-provider'

export function MembersTable() {
  const { members, estateName } = useCompanyData()
  const [q, setQ] = useState('')
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase()
    return s ? members.filter((m) => m.name.toLowerCase().includes(s) || m.email.toLowerCase().includes(s)) : members
  }, [members, q])

  const columns: Column<Member>[] = [
    {
      key: 'name',
      header: 'Name',
      skeleton: 'w-40',
      cell: (m) => (
        <div className="flex items-center gap-3">
          <Avatar name={m.name} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">{m.name}</p>
            <p className="truncate text-sm text-ink-2">{m.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'role', header: 'Role', cell: (m) => <span className="text-ink">{m.role}</span> },
    {
      key: 'estates',
      header: 'Estates',
      cell: (m) => {
        if (m.estateIds === 'all') return <span className="text-ink-2">All estates</span>
        const [first, ...rest] = m.estateIds
        return (
          <span className="text-ink">
            {estateName(first)}
            {rest.length > 0 && <span className="ml-1.5 text-ink-2">+{rest.length} more</span>}
          </span>
        )
      },
    },
    { key: 'status', header: 'Status', cell: (m) => <StatusBadge status={m.status} /> },
  ]

  return (
    <div className="flex flex-col gap-4">
      <label className="relative block max-w-sm">
        <span className="sr-only">Search members</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or email"
          className="h-11 w-full rounded-control border border-field bg-surface pl-9 pr-3 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-3 hover:border-ink-2 focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
      </label>
      <DataTable
        label="Members"
        columns={columns}
        rows={rows}
        selectable={false}
        pageSize={8}
        empty={<EmptyState icon={Users} message={q ? `No members match “${q.trim()}”.` : 'No members yet. Invite your first one.'} />}
      />
    </div>
  )
}
