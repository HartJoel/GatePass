import { Building2, Plus } from 'lucide-react'
import { LinkButton } from '@/components/ui/button'
import { EstateCard } from '@/features/estates/components/estate-card'
import type { EstateModel } from '@/generated/prisma/models'

export function EstatesGrid({ companyId, estates }: { companyId: string; estates: EstateModel[] }) {
  const none = estates.length === 0
  const newHref = `/companies/${companyId}/estates/new`

  return (
    <>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <h1 className="type-h1 text-ink">Estates</h1>
          {!none && <p className="mt-1.5 max-w-xl text-[15px] text-ink-2">Every estate this company manages.</p>}
        </div>
        {!none && (
          <LinkButton href={newHref} className="w-auto">
            <Plus className="size-[18px]" aria-hidden /> Register estate
          </LinkButton>
        )}
      </header>
      {none ? (
        <section className="rounded-card border border-line bg-surface">
          <div className="flex flex-col items-center px-6 py-20 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent">
              <Building2 className="size-7" aria-hidden />
            </span>
            <h2 className="type-h2 mt-6">Register your first estate</h2>
            <p className="mt-2 max-w-sm text-[15px] text-ink-2">An estate holds your units, residents and guards. Add one to start issuing visitor passes.</p>
            <LinkButton href={newHref} className="mt-8 w-auto">
              <Plus className="size-[18px]" aria-hidden /> Register estate
            </LinkButton>
          </div>
        </section>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {estates.map((e) => (
            <li key={e.id} className="flex">
              <EstateCard
                name={e.name}
                address={e.city ? `${e.address ?? ''}, ${e.city}` : (e.address ?? '')}
                status="active"
                href={`/companies/${companyId}/estates/${e.id}`}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
