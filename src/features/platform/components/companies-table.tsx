'use client'

import { useMemo, useState } from 'react'
import { Search, SearchX } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DataTable, type Column } from '@/components/data/data-table'
import { EmptyState } from '@/components/ui/empty-state'
import { StatusBadge } from '@/components/ui/status-badge'
import { SegmentedControl } from '@/components/ui/tabs'
import { formatDate, type PlatformCompany } from '@/features/platform/demo-data'
import { usePlatformData } from '@/features/platform/components/platform-data-provider'

type Filter = 'all' | 'active' | 'suspended'

export function CompaniesTable() {
  const { companies } = usePlatformData()
  const router = useRouter()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const counts = useMemo(
    () => ({
      all: companies.length,
      active: companies.filter((c) => c.status === 'active').length,
      suspended: companies.filter((c) => c.status === 'suspended').length,
    }),
    [companies],
  )
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase()
    return companies
      .filter((c) => filter === 'all' || c.status === filter)
      .filter((c) => !s || c.name.toLowerCase().includes(s) || c.contactEmail.toLowerCase().includes(s) || c.contactName.toLowerCase().includes(s))
      .sort((a, b) => b.createdAt - a.createdAt)
  }, [companies, q, filter])

  const columns: Column<PlatformCompany>[] = [
    {
      key: 'company',
      header: 'Company',
      skeleton: 'w-48',
      cell: (c) => (
        <Link href={`/platform/companies/${c.id}`} className="block truncate font-semibold text-ink underline-offset-4 hover:text-accent hover:underline" onClick={(e) => e.stopPropagation()}>
          {c.name}
        </Link>
      ),
    },
    { key: 'estates', header: 'Estates', align: 'right', width: '96px', cell: (c) => <span className="tnum">{c.estates.length}</span> },
    { key: 'users', header: 'Users', align: 'right', width: '96px', cell: (c) => <span className="tnum">{c.users.toLocaleString('en-NG')}</span> },
    { key: 'status', header: 'Status', width: '140px', cell: (c) => <StatusBadge status={c.status} size="sm" /> },
    { key: 'created', header: 'Created', width: '140px', cell: (c) => <span className="tnum text-ink-2">{formatDate(c.createdAt)}</span> },
  ]

  return (
    <>
      <header className="mb-6">
        <h1 className="type-h1 text-ink">Companies</h1>
        <p className="mt-1 text-sm text-ink-2">{companies.length} companies on the platform.</p>
      </header>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <label className="relative block w-full max-w-xs">
          <span className="sr-only">Search companies</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search company or contact"
            className="h-10 w-full rounded-control border border-field bg-surface pl-9 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-3 hover:border-ink-2 focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </label>
        <div className="w-fit">
          <SegmentedControl
            label="Filter by status"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: `All ${counts.all}` },
              { value: 'active', label: `Active ${counts.active}` },
              { value: 'suspended', label: `Suspended ${counts.suspended}` },
            ]}
          />
        </div>
      </div>
      <DataTable
        label="Companies"
        columns={columns}
        rows={rows}
        density="compact"
        selectable={false}
        pageSize={10}
        onRowClick={(c) => router.push(`/platform/companies/${c.id}`)}
        empty={<EmptyState icon={SearchX} message="No companies match those filters." />}
      />
    </>
  )
}
