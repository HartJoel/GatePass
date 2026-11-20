import type { Metadata } from 'next'
import { CompanyDetail } from '@/features/platform/components/company-detail'
import { requireActor } from '@/server/authz/actor'
import { getPlatformCompanyDetail } from '@/server/services/platform.service'

export const metadata: Metadata = { title: 'Company · GatePass Platform' }
export const dynamic = 'force-dynamic'

export default async function PlatformCompanyPage({ params }: PageProps<'/platform/companies/[companyId]'>) {
  const { companyId } = await params
  const actor = await requireActor()
  const company = await getPlatformCompanyDetail(actor, companyId)
  return <CompanyDetail company={company} />
}
