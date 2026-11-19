import type { Metadata } from 'next'
import { InvitesTable } from '@/features/members/components/invites-table'
import { PeopleHeader, PeopleTabs } from '@/features/members/components/people-header'
import { requireActor } from '@/server/authz/actor'
import { listEstates } from '@/server/services/estate.service'
import { listMembers } from '@/server/services/company.service'
import { listInvitations } from '@/server/services/invitation.service'

export const metadata: Metadata = { title: 'Pending invites · GatePass' }
export const dynamic = 'force-dynamic'

export default async function InvitesPage({ params }: PageProps<'/companies/[companyId]/members/invites'>) {
  const { companyId } = await params
  const actor = await requireActor()
  const [members, estates, invites] = await Promise.all([
    listMembers(actor, companyId),
    listEstates(actor, companyId),
    listInvitations(actor, companyId),
  ])
  return (
    <>
      <PeopleHeader companyId={companyId} estates={estates} />
      <PeopleTabs active="invites" companyId={companyId} memberCount={members.length} inviteCount={invites.length} />
      <InvitesTable companyId={companyId} invites={invites} estates={estates} />
    </>
  )
}
