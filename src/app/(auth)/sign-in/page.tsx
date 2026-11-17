import type { Metadata } from 'next'
import { LoginForm } from '@/features/auth/components/login-form'

export const metadata: Metadata = { title: 'Sign in · GatePass' }

export default function SignInPage() {
  return <LoginForm />
}
