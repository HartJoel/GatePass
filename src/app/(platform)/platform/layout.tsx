import { notFound } from 'next/navigation'
import { PlatformShell } from '@/components/layout/platform-shell'
import { ToastProvider } from '@/components/ui/toast'
import { auth } from '@/server/auth/auth'
import { requireActor } from '@/server/authz/actor'

export default async function PlatformLayout({ children }: LayoutProps<'/platform'>) {
  const actor = await requireActor()
  if (!actor.isPlatformAdmin) notFound()
  const { data: session } = await auth.getSession()

  return (
    <ToastProvider>
      <PlatformShell adminName={session?.user.name ?? 'Platform admin'}>{children}</PlatformShell>
    </ToastProvider>
  )
}
