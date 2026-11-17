import type { Metadata } from 'next'
import { CompanyOverview } from '@/features/companies/components/company-overview'

export const metadata: Metadata = { title: 'Overview · GatePass' }

export default function CompanyOverviewPage() {
  return <CompanyOverview />
}
