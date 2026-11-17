import type { Metadata } from 'next'
import { EstatesGrid } from '@/features/estates/components/estates-grid'

export const metadata: Metadata = { title: 'Estates · GatePass' }

export default function EstatesPage() {
  return <EstatesGrid />
}
