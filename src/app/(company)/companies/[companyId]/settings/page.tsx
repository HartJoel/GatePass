import type { Metadata } from 'next'
import { CompanySettingsForm } from '@/features/companies/components/company-settings-form'

export const metadata: Metadata = { title: 'Settings · GatePass' }

export default function CompanySettingsPage() {
  return <CompanySettingsForm />
}
