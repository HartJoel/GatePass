import type { Metadata } from 'next'
import { InvitesTable } from '@/features/members/components/invites-table'
import { PeopleHeader, PeopleTabs } from '@/features/members/components/people-header'

export const metadata: Metadata = { title: 'Pending invites · GatePass' }

export default function InvitesPage() {
  return (
    <>
      <PeopleHeader />
      <PeopleTabs active="invites" />
      <InvitesTable />
    </>
  )
}
