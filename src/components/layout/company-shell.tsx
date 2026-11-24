'use client'

import { Building2 } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { Avatar } from '@/components/ui/avatar'
import { BottomTabs, Sidebar, SignOutButton } from '@/components/layout/navigation'
import { companyNav } from '@/lib/constants/navigation'
import { useCompanyData } from '@/features/companies/components/company-data-provider'

type Section = (typeof companyNav)[number]['id']

function sectionOf(pathname: string, companyId: string): Section {
  const rest = pathname.split(`/companies/${companyId}`)[1] ?? ''
  const seg = rest.split('/').filter(Boolean)[0]
  return (companyNav.find((n) => n.id === seg)?.id ?? 'overview') as Section
}

/** Company-admin shell: sidebar + top bar. Mirrors AdminApp's Frame from the design export. */
export function CompanyShell({ companyId, children }: { companyId: string; children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const section = sectionOf(pathname, companyId)
  const { company } = useCompanyData()

  const goTo = (id: string) => router.push(id === 'overview' ? `/companies/${companyId}` : `/companies/${companyId}/${id}`)

  return (
    <div data-theme="light" className="flex h-dvh overflow-hidden bg-bg text-ink">
      <Sidebar className="hidden md:flex" items={companyNav} active={section} onSelect={goTo} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface px-4 md:h-16 md:px-8">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-accent-soft text-accent">
            <Building2 className="size-[18px]" aria-hidden />
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[15px] font-semibold text-ink">{company.name}</p>
            <p className="type-caption text-ink-2">Company admin</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {/* TODO(phase 5): read the signed-in user from the session instead of a placeholder. */}
            <div className="flex items-center gap-2.5">
              <Avatar name="Kemi Adebayo" />
              <span className="hidden text-sm font-medium text-ink lg:block">Kemi Adebayo</span>
            </div>
            <SignOutButton className="p-2.5" />
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto max-w-[1120px] px-4 pb-10 pt-6 md:px-8 md:pb-20 md:pt-10">{children}</div>
        </main>

        <BottomTabs className="md:hidden" items={companyNav} active={section} onSelect={goTo} />
      </div>
    </div>
  )
}
