import type { Metadata } from 'next'
import { EstateForm } from '@/features/estates/components/estate-form'

export const metadata: Metadata = { title: 'Register estate · GatePass' }

export default function NewEstatePage() {
  return <EstateForm />
}
