// No 'server-only' guard: prisma/seed.ts imports this outside Next's bundler. See env.ts.
import { createNeonAuth } from '@neon/auth/next/server'
import { env } from '@/server/env'

/**
 * Neon hosts the actual Better Auth server — we never call betterAuth() ourselves, and there
 * is no Prisma adapter here. This instance is just a typed client for that hosted service:
 * it proxies the route handler, gives us getSession()/signIn/signUp/signOut, and builds the
 * proxy.ts middleware. See prisma/schema/auth.prisma for why our own tables never model Neon's
 * `neon_auth.user` table directly.
 */
export const auth = createNeonAuth({
  baseUrl: env.NEON_AUTH_BASE_URL,
  cookies: {
    secret: env.NEON_AUTH_COOKIE_SECRET,
  },
})
