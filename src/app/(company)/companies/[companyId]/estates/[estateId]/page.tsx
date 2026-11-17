import type { Metadata } from 'next'
import { EstateForm } from '@/features/estates/components/estate-form'

export const metadata: Metadata = { title: 'Estate · GatePass' }

export default async function EditEstatePage({ params }: PageProps<'/companies/[companyId]/estates/[estateId]'>) {
  const { estateId } = await params
  return <EstateForm estateId={estateId} />
}
