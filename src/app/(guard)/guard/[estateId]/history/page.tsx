import type { Metadata } from 'next'
import { GuardHistory } from '@/features/access-log/components/guard-history'

export const metadata: Metadata = { title: 'Entry history · GatePass' }

export default function GuardHistoryPage() {
  return <GuardHistory />
}
