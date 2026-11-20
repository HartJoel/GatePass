import type { Metadata } from 'next'
import { CompaniesTable } from '@/features/platform/components/companies-table'
import { requireActor } from '@/server/authz/actor'
import { listPlatformCompanies } from '@/server/services/platform.service'

export const metadata: Metadata = { title: 'Companies · GatePass Platform' }
export const dynamic = 'force-dynamic'

export default async function PlatformCompaniesPage() {
  const actor = await requireActor()
  const companies = await listPlatformCompanies(actor)
  return <CompaniesTable companies={companies} />
}
