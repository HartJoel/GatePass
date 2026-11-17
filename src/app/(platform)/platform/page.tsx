import type { Metadata } from 'next'
import { PlatformOverview } from '@/features/platform/components/platform-overview'

export const metadata: Metadata = { title: 'Overview · GatePass Platform' }

export default function PlatformOverviewPage() {
  return <PlatformOverview />
}
