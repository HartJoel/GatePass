import { z } from 'zod'

export const verifyCodeSchema = z.object({
  code: z.string().trim().min(1, 'Enter the visitor code.'),
})
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>

export const decideSchema = z.object({
  code: z.string().trim().min(1),
  decision: z.enum(['APPROVE', 'REJECT']),
  note: z.string().trim().max(500).optional(),
  clientRequestId: z.string().uuid(),
})
export type DecideInput = z.infer<typeof decideSchema>
