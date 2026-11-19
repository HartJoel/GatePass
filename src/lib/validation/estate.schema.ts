import { z } from 'zod'

export const saveEstateSchema = z.object({
  name: z.string().trim().min(1, 'Enter the estate’s name.'),
  address: z.string().trim().min(1, 'Enter the street address.'),
  city: z.string().trim().min(1, 'Enter the city.'),
  units: z.number().int().positive().optional(),
})

export type SaveEstateInput = z.infer<typeof saveEstateSchema>
