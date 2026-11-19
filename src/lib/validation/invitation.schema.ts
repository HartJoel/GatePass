import { z } from 'zod'

export const INVITE_ROLES = ['COMPANY_ADMIN', 'MANAGER', 'RESIDENT', 'GUARD'] as const
export type InviteRoleValue = (typeof INVITE_ROLES)[number]

export const inviteMemberSchema = z.object({
  email: z.email('Enter a valid email address.'),
  role: z.enum(INVITE_ROLES),
  estateId: z.string().trim().min(1).optional(),
})
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>

export const acceptInvitationSchema = z.object({
  token: z.string().trim().min(1),
  password: z.string().min(8, 'Use at least 8 characters.'),
})
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>
