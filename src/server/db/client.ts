// No 'server-only' guard: prisma/seed.ts imports this outside Next's bundler. See env.ts.
import { PrismaClient } from '@/generated/prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { env } from '@/server/env'

declare global {
  var prismaClient: PrismaClient | undefined
}

function createClient() {
  const adapter = new PrismaNeon({ connectionString: env.DATABASE_URL })
  return new PrismaClient({ adapter })
}

// Next.js dev-mode hot reload re-evaluates this module on every edit; without the global
// cache each reload would open a fresh pool of connections to Neon.
export const db = globalThis.prismaClient ?? createClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaClient = db
}
