import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { AccessLogView } from '@/features/access-log/components/access-log-view'
import { getEstate } from '@/server/services/estate.service'
import { listAccessLog } from '@/server/services/access-log.service'
import { requireActor } from '@/server/authz/actor'

export const metadata: Metadata = { title: 'Access log · GatePass' }
export const dynamic = 'force-dynamic'

export default async function AccessLogPage({
  params,
  searchParams,
}: PageProps<'/companies/[companyId]/estates/[estateId]/access-log'>) {
  const { companyId, estateId } = await params
  const sp = await searchParams
  const decision = sp.decision === 'APPROVED' || sp.decision === 'REJECTED' ? sp.decision : undefined
  const windowParam = typeof sp.window === 'string' ? sp.window : '24h'
  const days = windowParam === '7d' ? 7 : windowParam === 'all' ? undefined : 1

  const actor = await requireActor()
  const estate = await getEstate(actor, estateId)
  if (!estate) notFound()

  const events = await listAccessLog(actor, estateId, { decision, days })

  return <AccessLogView companyId={companyId} estateId={estateId} estateName={estate.name} events={events} />
}
