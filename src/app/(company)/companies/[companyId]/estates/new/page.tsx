import type { Metadata } from 'next'
import { EstateForm } from '@/features/estates/components/estate-form'

export const metadata: Metadata = { title: 'Register estate · GatePass' }

export default async function NewEstatePage({ params }: PageProps<'/companies/[companyId]/estates/new'>) {
  const { companyId } = await params
  return <EstateForm companyId={companyId} />
}
