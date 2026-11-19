import { z } from 'zod'

export const createUnitSchema = z.object({
  label: z.string().trim().min(1, 'Enter a unit label, like Flat 12B.'),
})
export type CreateUnitInput = z.infer<typeof createUnitSchema>
