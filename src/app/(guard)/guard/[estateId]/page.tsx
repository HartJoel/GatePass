import type { Metadata } from 'next'
import { GateVerify } from '@/features/gate/components/gate-verify'

export const metadata: Metadata = { title: 'Verify · GatePass' }

export default function GateVerifyPage() {
  return <GateVerify />
}
