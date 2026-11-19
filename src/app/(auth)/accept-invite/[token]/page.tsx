import type { Metadata } from 'next'
import { AcceptInvite } from '@/features/auth/components/accept-invite'
import { getInvitationByToken } from '@/server/services/invitation.service'

export const metadata: Metadata = { title: 'Join GatePass' }
export const dynamic = 'force-dynamic'

export default async function AcceptInvitePage({ params }: PageProps<'/accept-invite/[token]'>) {
  const { token } = await params
  const { status, ...invite } = await getInvitationByToken(token)
  return <AcceptInvite status={status} invite={invite} token={token} />
}
