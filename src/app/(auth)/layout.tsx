import type { ReactNode } from 'react'
import { PageTransition } from '@/components/layout/page-transition'
import { AuthLayout } from '@/features/auth/components/auth-shell'

export default function AuthGroupLayout({ children }: { children: ReactNode }) {
  return (
    <div data-theme="light" className="flex min-h-dvh flex-1 flex-col bg-bg text-ink">
      <main className="flex flex-1 flex-col">
        <AuthLayout>
          <PageTransition>{children}</PageTransition>
        </AuthLayout>
      </main>
    </div>
  )
}
