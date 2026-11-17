'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Plus, Ticket } from 'lucide-react'
import { LinkButton } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { PassCard } from '@/features/passes/components/pass-card'
import { usePassesData } from '@/features/passes/components/passes-data-provider'

export function PassesList() {
  const { estateId } = useParams<{ estateId: string }>()
  const { passes } = usePassesData()
  const sorted = [...passes].sort((a, b) => b.start.getTime() - a.start.getTime())

  return (
    <>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div>
          <h1 className="type-h1 text-ink">My passes</h1>
          <p className="mt-1 text-[15px] text-ink-2">Every visitor pass you’ve issued, newest first.</p>
        </div>
      </header>
      <LinkButton href={`/resident/${estateId}/passes/new`} className="mb-6 w-auto">
        <Plus className="size-[18px]" aria-hidden /> Create a visitor pass
      </LinkButton>
      {sorted.length === 0 ? (
        <EmptyState icon={Ticket} message="No passes yet. Create one for your first visitor." />
      ) : (
        <ul className="flex flex-col gap-3">
          {sorted.map((p) => (
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
