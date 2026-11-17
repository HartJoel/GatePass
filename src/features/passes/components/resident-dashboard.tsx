'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Plus, Ticket } from 'lucide-react'
import { LinkButton } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { PassCard } from '@/features/passes/components/pass-card'
import { usePassesData } from '@/features/passes/components/passes-data-provider'

export function ResidentDashboard() {
  const { estateId } = useParams<{ estateId: string }>()
  const { residentName, passes } = usePassesData()
  const active = passes.filter((p) => p.status === 'active').sort((a, b) => a.end.getTime() - b.end.getTime())
  const upcoming = active[0]
  const recent = passes.filter((p) => p.id !== upcoming?.id).slice(0, 3)
  const newHref = `/resident/${estateId}/passes/new`

  return (
    <>
      <header className="mb-6">
        <h1 className="type-h1 text-ink">Welcome, {residentName.split(' ')[0]}</h1>
        <p className="mt-1 text-[15px] text-ink-2">{active.length === 0 ? 'No active passes right now.' : `${active.length} active ${active.length === 1 ? 'pass' : 'passes'}.`}</p>
      </header>

      <LinkButton href={newHref} className="mb-8 w-full">
        <Plus className="size-[18px]" aria-hidden /> Create a visitor pass
      </LinkButton>

      {upcoming && (
        <>
          <h2 className="type-h3 mb-3">Next up</h2>
          <Link href={`/resident/${estateId}/passes/${upcoming.id}`} className="mb-8 block">
            <PassCard pass={upcoming} />
          </Link>
        </>
      )}

      <div className="mb-3 flex items-end justify-between">
        <h2 className="type-h3">Recent passes</h2>
        <Link href={`/resident/${estateId}/passes`} className="rounded-sm text-sm font-medium text-accent underline-offset-4 hover:underline">
          View all
        </Link>
      </div>
      {recent.length === 0 ? (
        <EmptyState icon={Ticket} message="No passes yet. Create one for your first visitor." />
      ) : (
        <ul className="flex flex-col gap-3">
          {recent.map((p) => (
            <li key={p.id}>
              <Link href={`/resident/${estateId}/passes/${p.id}`} className="block">
                <PassCard pass={p} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
