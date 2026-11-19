import type { Metadata } from 'next'
import { EstatesGrid } from '@/features/estates/components/estates-grid'
import { listEstates } from '@/server/services/estate.service'
import { requireActor } from '@/server/authz/actor'

export const metadata: Metadata = { title: 'Estates · GatePass' }
export const dynamic = 'force-dynamic'

export default async function EstatesPage({ params }: PageProps<'/companies/[companyId]/estates'>) {
  const { companyId } = await params
  const actor = await requireActor()
  const estates = await listEstates(actor, companyId)
  return <EstatesGrid companyId={companyId} estates={estates} />
}
