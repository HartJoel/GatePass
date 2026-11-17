import Link from 'next/link'
import { Building2, Mail, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { StatusBadge } from '@/components/ui/status-badge'

export interface EstateCardProps {
  name: string
  address: string
  /** Units are optional when an estate is first registered. */
  units?: number
  manager?: string
  /** Manager was invited by email and hasn't accepted yet. */
  managerPending?: boolean
  status: 'active' | 'deactivated'
  /** Navigates to the estate. Works from a Server Component — no client JS needed. */
  href: string
}

/** Estate summary for the Estates grid. The whole card is the target. */
export function EstateCard({ name, address, units, manager, managerPending, status, href }: EstateCardProps) {
  const off = status === 'deactivated'
  return (
    <Link
      href={href}
      className="group flex w-full flex-col gap-5 rounded-card border border-line bg-surface p-5 text-left transition-shadow duration-200 ease-calm hover:shadow-hover"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-surface-2 text-ink-2">
          <Building2 className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className={cn('type-h3 truncate', off && 'text-ink-2')}>{name}</h3>
          <p className="mt-0.5 flex items-start gap-1 text-sm text-ink-2">
            <MapPin className="mt-[3px] size-3.5 shrink-0" aria-hidden />
            <span className="line-clamp-2">{address}</span>
          </p>
        </div>
        <StatusBadge status={status} size="sm" />
      </div>
      <dl className="grid grid-cols-[88px_1fr] gap-4 border-t border-line pt-4">
        <div>
          <dt className="type-caption text-ink-2">Units</dt>
          <dd className="tnum mt-1 text-[15px] font-semibold text-ink">{units === undefined ? <span className="font-normal text-ink-3">Not set</span> : units.toLocaleString('en-NG')}</dd>
        </div>
        <div className="min-w-0">
          <dt className="type-caption text-ink-2">Estate manager</dt>
          <dd className="mt-1 text-[15px]">
            {manager ? (
              <>
                <span className="flex items-center gap-2">
                  {managerPending ? (
                    <span aria-hidden className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-2 text-ink-2">
                      <Mail className="size-3.5" />
                    </span>
                  ) : (
                    <Avatar name={manager} size="sm" />
                  )}
                  <span className={cn('min-w-0 truncate', managerPending ? 'text-ink' : 'font-semibold text-ink')}>{manager}</span>
                </span>
                {managerPending && <span className="mt-0.5 block pl-8 text-[13px] text-ink-2">Invite pending</span>}
              </>
            ) : (
              <span className="text-ink-3">Not assigned</span>
            )}
          </dd>
        </div>
      </dl>
      <span className="sr-only">Open {name}</span>
    </Link>
  )
}
