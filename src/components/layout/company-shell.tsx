'use client'

import { Building2, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { Avatar } from '@/components/ui/avatar'
import { Sidebar } from '@/components/layout/navigation'
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

  return (
    <div data-theme="light" className="flex h-screen bg-bg text-ink">
      <Sidebar
        items={companyNav}
        active={section}
        onSelect={(id) => router.push(id === 'overview' ? `/companies/${companyId}` : `/companies/${companyId}/${id}`)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line bg-surface px-8">
          <span className="flex size-9 items-center justify-center rounded-control bg-accent-soft text-accent">
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
            <Link href="/sign-in" aria-label="Sign out" title="Sign out" className="rounded-control p-2.5 text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink">
              <LogOut className="size-[18px]" aria-hidden />
            </Link>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1120px] px-8 pb-20 pt-10">{children}</div>
        </main>
      </div>
    </div>
  )
}
