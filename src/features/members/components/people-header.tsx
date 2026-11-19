'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MailPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { InviteDialog, type InviteEstateOption } from './invite-dialog'

export function PeopleHeader({ companyId, estates }: { companyId: string; estates: InviteEstateOption[] }) {
  const [inviting, setInviting] = useState(false)
  return (
    <>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <h1 className="type-h1 text-ink">People</h1>
          <p className="mt-1.5 max-w-xl text-[15px] text-ink-2">Everyone with access to your estates, and invites that haven’t been accepted yet.</p>
        </div>
        <Button variant="filled" icon={<MailPlus />} onClick={() => setInviting(true)}>
          Invite member
        </Button>
      </header>
      <InviteDialog open={inviting} onClose={() => setInviting(false)} companyId={companyId} estates={estates} />
    </>
  )
}

/** Underline tabs that navigate between the real /members and /members/invites routes. */
export function PeopleTabs({ active, companyId, memberCount, inviteCount }: { active: 'members' | 'invites'; companyId: string; memberCount: number; inviteCount: number }) {
  const items = [
    { id: 'members' as const, label: 'Members', count: memberCount, href: `/companies/${companyId}/members` },
    { id: 'invites' as const, label: 'Pending invites', count: inviteCount, href: `/companies/${companyId}/members/invites` },
  ]
  return (
    <div role="tablist" aria-label="People" className="mb-6 flex gap-6 border-b border-line">
      {items.map((t) => {
        const on = t.id === active
        return (
          <Link
            key={t.id}
            href={t.href}
            role="tab"
            aria-selected={on}
            className={cn(
              '-mb-px flex h-11 items-center gap-2 border-b-2 text-[15px] transition-colors duration-150 ease-calm',
              on ? 'border-accent font-semibold text-ink' : 'border-transparent font-medium text-ink-2 hover:text-ink',
            )}
          >
            {t.label}
            <span className={cn('tnum rounded-full px-2 py-0.5 text-xs font-semibold', on ? 'bg-accent-soft text-accent' : 'bg-surface-2 text-ink-2')}>{t.count}</span>
          </Link>
        )
      })}
    </div>
  )
}
