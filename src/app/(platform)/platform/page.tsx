import type { Metadata } from 'next'
import { PlatformOverview } from '@/features/platform/components/platform-overview'
import { requireActor } from '@/server/authz/actor'
import { getPlatformOverview } from '@/server/services/platform.service'

export const metadata: Metadata = { title: 'Overview · GatePass Platform' }
export const dynamic = 'force-dynamic'

export default async function PlatformOverviewPage() {
  const actor = await requireActor()
  const stats = await getPlatformOverview(actor)
  return <PlatformOverview stats={stats} />
}
