'use client'

import { LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { BottomTabs } from '@/components/layout/navigation'
import { guardNav } from '@/lib/constants/navigation'

type Section = (typeof guardNav)[number]['id']

function sectionOf(pathname: string, estateId: string): Section {
  const rest = pathname.split(`/guard/${estateId}`)[1] ?? ''
  return rest.split('/').filter(Boolean)[0] === 'history' ? 'history' : 'verify'
}

/** Guard shell: dark, high-contrast theme, large touch targets, minimal chrome. */
export function GuardShell({ estateId, estateName, children }: { estateId: string; estateName: string; children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const section = sectionOf(pathname, estateId)

  const go = (id: Section) => router.push(id === 'verify' ? `/guard/${estateId}` : `/guard/${estateId}/${id}`)

  return (
    <div data-theme="guard" className="flex h-screen flex-col bg-bg text-ink">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface px-5">
        <p className="truncate text-[15px] font-semibold text-ink">{estateName} · Gate</p>
        {/* TODO(phase 5): read the signed-in guard from the session instead of a placeholder. */}
        <Link href="/sign-in" aria-label="Sign out" title="Sign out" className="ml-auto rounded-control p-2.5 text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink">
          <LogOut className="size-[18px]" aria-hidden />
        </Link>
      </header>
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[560px] px-4 pb-8 pt-6">{children}</div>
      </main>
      <BottomTabs items={guardNav} active={section} onSelect={(id) => go(id as Section)} />
    </div>
  )
}
