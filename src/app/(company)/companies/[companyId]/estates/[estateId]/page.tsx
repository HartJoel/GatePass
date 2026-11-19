import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { EstateForm } from '@/features/estates/components/estate-form'
import { getEstate } from '@/server/services/estate.service'
import { requireActor } from '@/server/authz/actor'

export const metadata: Metadata = { title: 'Estate · GatePass' }
export const dynamic = 'force-dynamic'

export default async function EditEstatePage({ params }: PageProps<'/companies/[companyId]/estates/[estateId]'>) {
  const { companyId, estateId } = await params
  const actor = await requireActor()
  const estate = await getEstate(actor, estateId)
  if (!estate) notFound()
  return <EstateForm companyId={companyId} estate={estate} />
}
