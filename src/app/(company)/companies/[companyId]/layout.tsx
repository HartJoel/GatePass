import { CompanyShell } from '@/components/layout/company-shell'
import { ToastProvider } from '@/components/ui/toast'
import { CompanyDataProvider } from '@/features/companies/components/company-data-provider'

export default async function CompanyLayout({ children, params }: LayoutProps<'/companies/[companyId]'>) {
  const { companyId } = await params
  // TODO(phase 5): load the company via the company service, authorized against the actor.
  return (
    <CompanyDataProvider>
      <ToastProvider>
        <CompanyShell companyId={companyId}>{children}</CompanyShell>
      </ToastProvider>
    </CompanyDataProvider>
  )
}
