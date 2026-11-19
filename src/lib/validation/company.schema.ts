import { z } from 'zod'

export const registerCompanySchema = z.object({
  companyName: z.string().trim().min(1, 'Enter your company name.'),
  adminName: z.string().trim().min(1, 'Enter your full name.'),
  adminEmail: z.email('Enter a valid email address.'),
  password: z.string().min(8, 'Use at least 8 characters.'),
})

export type RegisterCompanyInput = z.infer<typeof registerCompanySchema>
