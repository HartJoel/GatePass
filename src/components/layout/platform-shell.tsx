'use client'

import { ShieldCheck } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { Avatar } from '@/components/ui/avatar'
import { BottomTabs, Sidebar, SignOutButton } from '@/components/layout/navigation'
import { platformNav } from '@/lib/constants/navigation'

type Section = (typeof platformNav)[number]['id']

function sectionOf(pathname: string): Section {
  const seg = pathname.split('/platform')[1]?.split('/').filter(Boolean)[0]
  return (platformNav.find((n) => n.id === seg)?.id ?? 'overview') as Section
}

/** Platform (super-admin) shell: sidebar + a tighter top bar than the company admin's. */
export function PlatformShell({ adminName, children }: { adminName: string; children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const section = sectionOf(pathname)

  const goTo = (id: string) => router.push(id === 'overview' ? '/platform' : `/platform/${id}`)

  return (
    <div data-theme="light" className="flex h-dvh overflow-hidden bg-bg text-ink">
      <Sidebar className="hidden md:flex" items={platformNav} active={section} onSelect={goTo} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface px-4 md:px-8">
          <ShieldCheck className="size-[18px] shrink-0 text-ink" aria-hidden />
          <p className="truncate text-[15px] font-semibold text-ink">GatePass Platform</p>
          <span className="hidden shrink-0 rounded-full bg-neutral-bg px-2 py-0.5 text-xs font-semibold text-neutral-fg sm:inline-block">Internal</span>
          <div className="ml-auto flex items-center gap-3">
            <Avatar name={adminName} size="sm" />
            <span className="hidden text-sm font-medium text-ink lg:block">{adminName}</span>
            <SignOutButton className="p-2" />
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto max-w-[1180px] px-4 pb-10 pt-6 md:px-8 md:pb-16 md:pt-8">{children}</div>
        </main>
        <BottomTabs className="md:hidden" items={platformNav} active={section} onSelect={goTo} />
      </div>
    </div>
  )
}
