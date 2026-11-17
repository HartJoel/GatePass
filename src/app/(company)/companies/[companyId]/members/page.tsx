import type { Metadata } from 'next'
import { MembersTable } from '@/features/members/components/members-table'
import { PeopleHeader, PeopleTabs } from '@/features/members/components/people-header'

export const metadata: Metadata = { title: 'People · GatePass' }

export default function MembersPage() {
  return (
    <>
      <PeopleHeader />
      <PeopleTabs active="members" />
      <MembersTable />
    </>
  )
}
