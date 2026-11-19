import { notFound } from 'next/navigation'
import { ResidentShell } from '@/components/layout/resident-shell'
import { ToastProvider } from '@/components/ui/toast'
import { PassesDataProvider } from '@/features/passes/components/passes-data-provider'
import { requireActor } from '@/server/authz/actor'
import { getEstateForMember } from '@/server/services/estate.service'

export default async function ResidentLayout({ children, params }: LayoutProps<'/resident/[estateId]'>) {
  const { estateId } = await params
  const actor = await requireActor()
  const estate = await getEstateForMember(actor, estateId)
  if (!estate) notFound()

  return (
    <PassesDataProvider>
      <ToastProvider>
        <ResidentShell estateId={estateId} estateName={estate.name}>
          {children}
        </ResidentShell>
      </ToastProvider>
    </PassesDataProvider>
  )
}
