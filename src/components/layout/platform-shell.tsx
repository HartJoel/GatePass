'use client'

import { LogOut, ShieldCheck } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { Avatar } from '@/components/ui/avatar'
import { Sidebar } from '@/components/layout/navigation'
import { platformNav } from '@/lib/constants/navigation'
import { signOutAction } from '@/server/actions/auth.actions'

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

  return (
    <div data-theme="light" className="flex h-screen bg-bg text-ink">
      <Sidebar items={platformNav} active={section} onSelect={(id) => router.push(id === 'overview' ? '/platform' : `/platform/${id}`)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface px-8">
          <ShieldCheck className="size-[18px] text-ink" aria-hidden />
          <p className="text-[15px] font-semibold text-ink">GatePass Platform</p>
          <span className="rounded-full bg-neutral-bg px-2 py-0.5 text-xs font-semibold text-neutral-fg">Internal</span>
          <div className="ml-auto flex items-center gap-3">
            <Avatar name={adminName} size="sm" />
            <span className="hidden text-sm font-medium text-ink lg:block">{adminName}</span>
            <button
              type="button"
              aria-label="Sign out"
              title="Sign out"
              className="rounded-control p-2 text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
              onClick={() => signOutAction().then(() => router.push('/sign-in'))}
            >
              <LogOut className="size-[18px]" aria-hidden />
            </button>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1180px] px-8 pb-16 pt-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
