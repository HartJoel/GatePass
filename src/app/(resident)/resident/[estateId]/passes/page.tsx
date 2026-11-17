import type { Metadata } from 'next'
import { PassesList } from '@/features/passes/components/passes-list'

export const metadata: Metadata = { title: 'My passes · GatePass' }

export default function ResidentPassesPage() {
  return <PassesList />
}
