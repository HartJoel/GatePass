import { GuardShell } from '@/components/layout/guard-shell'
import { AccessLogProvider } from '@/features/access-log/components/access-log-provider'
import { estateName } from '@/features/companies/demo-data'

export default async function GuardLayout({ children, params }: LayoutProps<'/guard/[estateId]'>) {
  const { estateId } = await params
  // TODO(phase 5): load the estate via the estate service, authorized against the actor.
  return (
    <AccessLogProvider>
      <GuardShell estateId={estateId} estateName={estateName(estateId)}>
        {children}
      </GuardShell>
    </AccessLogProvider>
  )
}
