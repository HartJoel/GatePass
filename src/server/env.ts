import 'server-only'
import { z } from 'zod'

const schema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required (pooled Neon connection string).'),
  DATABASE_URL_UNPOOLED: z.string().min(1, 'DATABASE_URL_UNPOOLED is required (direct Neon connection string, used by the Prisma CLI).'),
  BETTER_AUTH_SECRET: z.string().min(1, 'BETTER_AUTH_SECRET is required.'),
  BETTER_AUTH_URL: z.url('BETTER_AUTH_URL must be a valid URL.'),
  NEXT_PUBLIC_APP_URL: z.url('NEXT_PUBLIC_APP_URL must be a valid URL.'),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  const issues = z.flattenError(parsed.error).fieldErrors
  const lines = Object.entries(issues).map(([key, messages]) => `  ${key}: ${messages?.join(', ')}`)
  throw new Error(`Invalid environment variables:\n${lines.join('\n')}`)
}

export const env = parsed.data
