import Link from 'next/link'
import { Building2, ChevronRight, Home, Plus, Ticket, Users } from 'lucide-react'
import { LinkButton } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { StatCard } from '@/components/ui/stat-card'
import { StatusBadge } from '@/components/ui/status-badge'
import type { CompanyOverviewStats } from '@/server/services/company.service'

export function CompanyOverview({ companyId, companyName, stats }: { companyId: string; companyName: string; stats: CompanyOverviewStats }) {
  const { estates, estateCount, activeEstateCount, unitCount, residentCount, passesThisWeek } = stats
  const none = estateCount === 0
  const inactive = estateCount - activeEstateCount

  return (
    <>
      <header className="mb-8">
        <h1 className="type-h1 text-ink">Overview</h1>
        <p className="mt-1.5 max-w-xl text-[15px] text-ink-2">How {companyName} is doing across all of its estates.</p>
      </header>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          label="Estates"
          icon={Building2}
          value={String(activeEstateCount)}
          caption={none ? 'None registered yet' : inactive ? `${inactive} deactivated` : 'All active'}
        />
        <StatCard label="Units" icon={Home} value={unitCount.toLocaleString('en-NG')} caption={none ? 'Add units to an estate' : 'Across active estates'} />
        <StatCard
          label="Residents"
          icon={Users}
          value={residentCount.toLocaleString('en-NG')}
          caption={none ? 'Invite residents once an estate is set up' : 'Active members'}
        />
        <StatCard
          label="Passes this week"
          icon={Ticket}
          value={passesThisWeek.toLocaleString('en-NG')}
          caption={none ? 'Passes appear here as residents issue them' : 'Last 7 days'}
        />
      </div>

      <div className="mb-4 mt-12 flex items-end justify-between gap-4">
        <h2 className="type-h2">Estates</h2>
        {!none && (
          <Link href={`/companies/${companyId}/estates`} className="rounded-sm text-sm font-medium text-accent underline-offset-4 hover:underline">
            View all estates
          </Link>
        )}
      </div>

      <section className="rounded-card border border-line bg-surface">
        {none ? (
          <EmptyState
            icon={Building2}
            className="py-16"
            message="Register your first estate to start inviting residents and guards."
            action={
              <LinkButton href={`/companies/${companyId}/estates/new`} className="w-auto">
                <Plus className="size-[18px]" aria-hidden /> Register estate
              </LinkButton>
            }
          />
        ) : (
          <ul className="divide-y divide-line">
            {estates.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/companies/${companyId}/estates/${e.id}`}
                  className="group flex w-full items-center gap-6 px-6 py-4 text-left transition-colors duration-150 ease-calm first:rounded-t-card last:rounded-b-card hover:bg-surface-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold text-ink">{e.name}</p>
                    <p className="mt-0.5 truncate text-sm text-ink-2">{e.city ?? 'No city set'}</p>
                  </div>
                  {e.status === 'DEACTIVATED' && <StatusBadge status="deactivated" size="sm" />}
                  <ChevronRight className="size-4 shrink-0 text-ink-3 transition-transform duration-150 ease-calm group-hover:translate-x-0.5 group-hover:text-ink-2" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
