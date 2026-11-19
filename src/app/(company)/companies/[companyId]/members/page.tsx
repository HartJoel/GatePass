import type { Metadata } from 'next'
import { MembersTable } from '@/features/members/components/members-table'
import { PeopleHeader, PeopleTabs } from '@/features/members/components/people-header'
import { requireActor } from '@/server/authz/actor'
import { listEstates } from '@/server/services/estate.service'
import { listMembers } from '@/server/services/company.service'
import { listInvitations } from '@/server/services/invitation.service'

export const metadata: Metadata = { title: 'People · GatePass' }
export const dynamic = 'force-dynamic'

export default async function MembersPage({ params }: PageProps<'/companies/[companyId]/members'>) {
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
      <PeopleTabs active="members" companyId={companyId} memberCount={members.length} inviteCount={invites.length} />
      <MembersTable members={members} estates={estates} />
    </>
  )
}
