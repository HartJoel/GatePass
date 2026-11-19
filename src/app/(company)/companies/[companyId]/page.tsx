import type { Metadata } from 'next'
import { CompanyOverview } from '@/features/companies/components/company-overview'
import { requireActor } from '@/server/authz/actor'
import { getCompanyOverview } from '@/server/services/company.service'
import { db } from '@/server/db/client'

export const metadata: Metadata = { title: 'Overview · GatePass' }
export const dynamic = 'force-dynamic'

export default async function CompanyOverviewPage({ params }: PageProps<'/companies/[companyId]'>) {
  const { companyId } = await params
  const actor = await requireActor()
  const [stats, company] = await Promise.all([
    getCompanyOverview(actor, companyId),
    db.company.findUnique({ where: { id: companyId }, select: { name: true } }),
  ])
  return <CompanyOverview companyId={companyId} companyName={company?.name ?? 'Your company'} stats={stats} />
}
