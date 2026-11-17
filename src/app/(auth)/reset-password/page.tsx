import type { Metadata } from 'next'
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form'

export const metadata: Metadata = { title: 'Set a new password · GatePass' }

export default function ResetPasswordPage() {
  return <ResetPasswordForm />
}
