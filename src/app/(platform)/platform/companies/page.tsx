import type { Metadata } from 'next'
import { CompaniesTable } from '@/features/platform/components/companies-table'

export const metadata: Metadata = { title: 'Companies · GatePass Platform' }

export default function PlatformCompaniesPage() {
  return <CompaniesTable />
}
