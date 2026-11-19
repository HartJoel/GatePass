import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { UnitsView } from '@/features/units/components/units-view'
import { getEstate } from '@/server/services/estate.service'
import { listResidentMembers, listUnits } from '@/server/services/unit.service'
import { requireActor } from '@/server/authz/actor'

export const metadata: Metadata = { title: 'Units · GatePass' }
export const dynamic = 'force-dynamic'

export default async function UnitsPage({ params }: PageProps<'/companies/[companyId]/estates/[estateId]/units'>) {
  const { companyId, estateId } = await params
  const actor = await requireActor()
  const estate = await getEstate(actor, estateId)
  if (!estate) notFound()

  const [units, residents] = await Promise.all([
    listUnits(actor, estateId),
    listResidentMembers(actor, estateId),
  ])

  return <UnitsView companyId={companyId} estateId={estateId} estateName={estate.name} units={units} residents={residents} />
}
