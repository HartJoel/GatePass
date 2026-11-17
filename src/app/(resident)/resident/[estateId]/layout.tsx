import { ResidentShell } from '@/components/layout/resident-shell'
import { ToastProvider } from '@/components/ui/toast'
import { PassesDataProvider } from '@/features/passes/components/passes-data-provider'
import { estateName } from '@/features/companies/demo-data'

export default async function ResidentLayout({ children, params }: LayoutProps<'/resident/[estateId]'>) {
  const { estateId } = await params
  // TODO(phase 5): load the estate via the estate service, authorized against the actor.
  return (
    <PassesDataProvider>
      <ToastProvider>
        <ResidentShell estateId={estateId} estateName={estateName(estateId)}>
          {children}
        </ResidentShell>
      </ToastProvider>
    </PassesDataProvider>
  )
}
