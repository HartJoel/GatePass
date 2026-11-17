import type { Metadata } from 'next'
import { ResidentDashboard } from '@/features/passes/components/resident-dashboard'

export const metadata: Metadata = { title: 'Home · GatePass' }

export default function ResidentHomePage() {
  return <ResidentDashboard />
}
