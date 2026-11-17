import type { Metadata } from 'next'
import { PassForm } from '@/features/passes/components/pass-form'

export const metadata: Metadata = { title: 'Create a visitor pass · GatePass' }

export default function NewPassPage() {
  return <PassForm />
}
