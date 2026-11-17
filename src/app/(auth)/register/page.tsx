import type { Metadata } from 'next'
import { RegisterForm } from '@/features/auth/components/register-form'

export const metadata: Metadata = { title: 'Register your company · GatePass' }

export default function RegisterPage() {
  return <RegisterForm />
}
