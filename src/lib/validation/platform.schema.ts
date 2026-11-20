import { z } from 'zod'

export const suspendCompanySchema = z.object({
  reason: z.string().trim().min(1, 'Enter a reason. It’s recorded against this company.'),
})
export type SuspendCompanyInput = z.infer<typeof suspendCompanySchema>
