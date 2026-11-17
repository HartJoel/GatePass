'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Activity, Building2, ChevronRight, Home, Plus, Ticket, Users } from 'lucide-react'
import { LinkButton } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { StatCard } from '@/components/ui/stat-card'
import { StatusBadge } from '@/components/ui/status-badge'
import { useCompanyData } from '@/features/companies/components/company-data-provider'

export function CompanyOverview() {
  const { companyId } = useParams<{ companyId: string }>()
  const { company, estates } = useCompanyData()
  const active = estates.filter((e) => e.status === 'active')
  const inactive = estates.length - active.length
  const units = active.reduce((n, e) => n + (e.units ?? 0), 0)
  const none = estates.length === 0

  return (
    <>
      <header className="mb-8">
        <h1 className="type-h1 text-ink">Overview</h1>
        <p className="mt-1.5 max-w-xl text-[15px] text-ink-2">How {company.name} is doing across all of its estates.</p>
      </header>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          label="Estates"
          icon={Building2}
          value={String(active.length)}
          caption={none ? 'None registered yet' : inactive ? `${inactive} deactivated` : 'All active'}
        />
        <StatCard label="Units" icon={Home} value={units.toLocaleString('en-NG')} caption={none ? 'Add units to an estate' : 'Across active estates'} />
        <StatCard
          label="Residents"
          icon={Users}
          value={none ? '0' : '1,126'}
          trend={none ? undefined : 'up'}
          caption={none ? 'Invite residents once an estate is set up' : '18 joined this month'}
        />
        <StatCard
          label="Passes this week"
          icon={Ticket}
          value={none ? '0' : '1,284'}
          trend={none ? undefined : 'up'}
          caption={none ? 'Passes appear here as residents issue them' : '12% more than last week'}
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
                  <div className="w-56 shrink-0 xl:w-64">
                    <p className="truncate text-[15px] font-semibold text-ink">{e.name}</p>
                    <p className="mt-0.5 truncate text-sm text-ink-2">{e.city}</p>
                  </div>
                  <p className="flex min-w-0 flex-1 items-center gap-2 text-sm text-ink-2">
                    <Activity className="size-4 shrink-0 text-ink-3" aria-hidden />
                    <span className="truncate">{e.activity}</span>
                  </p>
                  {e.status === 'deactivated' && <StatusBadge status="deactivated" size="sm" />}
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
