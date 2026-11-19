import { notFound } from 'next/navigation'
import { GuardShell } from '@/components/layout/guard-shell'
import { requireActor } from '@/server/authz/actor'
import { getEstateForMember } from '@/server/services/estate.service'

export default async function GuardLayout({ children, params }: LayoutProps<'/guard/[estateId]'>) {
  const { estateId } = await params
  const actor = await requireActor()
  const estate = await getEstateForMember(actor, estateId)
  if (!estate) notFound()

  return (
    <GuardShell estateId={estateId} estateName={estate.name}>
      {children}
    </GuardShell>
  )
}
