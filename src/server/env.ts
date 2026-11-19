// No 'server-only' guard: prisma/seed.ts imports this (via db/client.ts) outside Next's
// bundler, where that package unconditionally throws. The real protection against importing
// src/server/** from client code is the no-restricted-imports ESLint rule, not this.
import { z } from 'zod'

const schema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required (pooled Neon connection string).'),
  DATABASE_URL_UNPOOLED: z.string().min(1, 'DATABASE_URL_UNPOOLED is required (direct Neon connection string, used by the Prisma CLI).'),
  NEON_AUTH_BASE_URL: z.url('NEON_AUTH_BASE_URL must be a valid URL (the Auth URL from the Neon console).'),
  NEON_AUTH_COOKIE_SECRET: z.string().min(32, 'NEON_AUTH_COOKIE_SECRET must be at least 32 characters.'),
  NEXT_PUBLIC_APP_URL: z.url('NEXT_PUBLIC_APP_URL must be a valid URL.'),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  const issues = z.flattenError(parsed.error).fieldErrors
  const lines = Object.entries(issues).map(([key, messages]) => `  ${key}: ${messages?.join(', ')}`)
  throw new Error(`Invalid environment variables:\n${lines.join('\n')}`)
}

export const env = parsed.data
