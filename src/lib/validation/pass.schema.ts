import { z } from 'zod'
import { PASS_LIMITS } from '@/lib/constants/limits'

export const createPassSchema = z.object({
  unitId: z.string().trim().min(1, 'Choose a unit.'),
  visitorName: z.string().trim().min(1, 'Enter the visitor’s name.').max(PASS_LIMITS.visitorNameMax),
  note: z.string().trim().max(PASS_LIMITS.noteMax).optional(),
  durationHours: z.coerce.number().int().min(1).max(PASS_LIMITS.maxValidityHours),
})
export type CreatePassInput = z.infer<typeof createPassSchema>
