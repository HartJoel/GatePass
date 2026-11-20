// No 'server-only' guard: prisma/seed.ts imports this outside Next's bundler. See env.ts.
import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { env } from '@/server/env'

declare global {
  var prismaClient: PrismaClient | undefined
}

/**
 * Plain pg Pool over Neon's pooled (PgBouncer) connection string, not the WebSocket-based
 * @prisma/adapter-neon. That adapter is built for edge/serverless runtimes with no persistent
 * TCP — it opens a fresh connection (full DNS + TLS + WS handshake) whenever the pool has gone
 * idle, which is most requests in a normal long-running Next.js server and was adding 1-3s per
 * page. A plain pg Pool keeps real persistent connections instead — but node-postgres defaults
 * idleTimeoutMillis to 10s, which is shorter than normal think-time between page loads, so left
 * at the default we'd still silently fall back into the same per-request reconnect cost. Keeping
 * connections warm for 10 minutes and enabling TCP keepalive (so any NAT/proxy in between
 * doesn't silently drop a long-idle socket) fixes that.
 */
function createClient() {
  const adapter = new PrismaPg({
    connectionString: env.DATABASE_URL,
    idleTimeoutMillis: 10 * 60_000,
    keepAlive: true,
  })
  return new PrismaClient({ adapter })
}

// Next.js dev-mode hot reload re-evaluates this module on every edit; without the global
// cache each reload would open a fresh pool of connections to Neon.
export const db = globalThis.prismaClient ?? createClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaClient = db
}
