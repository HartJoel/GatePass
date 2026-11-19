import type { Metadata } from 'next'
import { PassesList } from '@/features/passes/components/passes-list'
import { requireActor } from '@/server/authz/actor'
import { listPasses } from '@/server/services/pass.service'

export const metadata: Metadata = { title: 'My passes · GatePass' }
export const dynamic = 'force-dynamic'

export default async function ResidentPassesPage({ params }: PageProps<'/resident/[estateId]/passes'>) {
  const { estateId } = await params
  const actor = await requireActor()
  const passes = await listPasses(actor, estateId)
  return <PassesList estateId={estateId} passes={passes} />
}
