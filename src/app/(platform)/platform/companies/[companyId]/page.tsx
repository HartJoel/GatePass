import type { Metadata } from 'next'
import { CompanyDetail } from '@/features/platform/components/company-detail'

export const metadata: Metadata = { title: 'Company · GatePass Platform' }

export default async function PlatformCompanyPage({ params }: PageProps<'/platform/companies/[companyId]'>) {
  const { companyId } = await params
  return <CompanyDetail companyId={companyId} />
}
