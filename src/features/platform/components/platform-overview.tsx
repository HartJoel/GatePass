import Link from 'next/link'
import { Briefcase, Building2, ChevronRight, PauseCircle } from 'lucide-react'
import { StatCard } from '@/components/ui/stat-card'
import { StatusBadge } from '@/components/ui/status-badge'
import { formatAgo } from '@/lib/format'
import { nowMs } from '@/lib/utils'
import type { PlatformOverviewStats } from '@/server/services/platform.service'

export function PlatformOverview({ stats }: { stats: PlatformOverviewStats }) {
  const now = nowMs()
  const { companyCount, activeCompanyCount, suspendedCompanyCount, estateCount, liveEstateCount, recentCompanies } = stats

  return (
    <>
      <header className="mb-6">
        <h1 className="type-h1 text-ink">Overview</h1>
        <p className="mt-1 text-sm text-ink-2">Platform-wide health across every company on GatePass.</p>
      </header>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Companies" icon={Briefcase} value={String(companyCount)} caption={`${activeCompanyCount} active`} />
        <StatCard label="Estates" icon={Building2} value={String(estateCount)} caption={`${liveEstateCount} live at the gate`} />
        <StatCard
          label="Suspended companies"
          icon={PauseCircle}
          value={String(suspendedCompanyCount)}
          caption={suspendedCompanyCount ? 'Access paused for all their estates' : 'None'}
        />
      </div>

      <div className="mb-3 mt-8 flex items-end justify-between">
        <h2 className="type-h3">Recent signups</h2>
        <Link href="/platform/companies" className="rounded-sm text-sm font-medium text-accent underline-offset-4 hover:underline">
          View all companies
        </Link>
      </div>
      <section className="rounded-card border border-line bg-surface">
        {recentCompanies.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-ink-2">No companies have registered yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {recentCompanies.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/platform/companies/${c.id}`}
                  className="group flex w-full items-center gap-4 px-4 py-3 text-left transition-colors duration-150 ease-calm first:rounded-t-card last:rounded-b-card hover:bg-surface-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold text-ink">{c.name}</p>
                    <p className="truncate text-sm text-ink-2">{c.contactEmail ?? 'No contact email on file'}</p>
                  </div>
                  <span className="tnum hidden w-28 shrink-0 text-sm text-ink-2 sm:block">
                    {c.estateCount} {c.estateCount === 1 ? 'estate' : 'estates'}
                  </span>
                  <span className="flex w-28 shrink-0 justify-end">{c.status === 'SUSPENDED' && <StatusBadge status="suspended" size="sm" />}</span>
                  <span className="tnum w-20 shrink-0 text-right text-sm text-ink-2">{formatAgo(now - c.createdAt.getTime())}</span>
                  <ChevronRight className="size-4 shrink-0 text-ink-3 transition-transform duration-150 ease-calm group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
