import type { Metadata } from 'next'
import { AcceptInvite, type InviteDetails, type InviteStatus } from '@/features/auth/components/accept-invite'

export const metadata: Metadata = { title: 'Join an estate · GatePass' }

// TODO(phase 5, slice B): replace with a real lookup in the invitation service —
// hash the token, find the Invitation row, and derive 'ready' | 'invalid' | 'expired' | 'used'.
async function resolveInvite(token: string): Promise<{ status: InviteStatus; invite: InviteDetails }> {
  return {
    status: token ? 'ready' : 'invalid',
    invite: { company: '', estate: '', role: '', email: '' },
  }
}

export default async function AcceptInvitePage({ params }: PageProps<'/accept-invite/[token]'>) {
  const { token } = await params
  const { status, invite } = await resolveInvite(token)
  return <AcceptInvite status={status} invite={invite} />
}
