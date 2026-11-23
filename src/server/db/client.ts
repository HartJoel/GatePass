// No 'server-only' guard: prisma/seed.ts imports this outside Next's bundler. See env.ts.
import { PrismaClient, Prisma } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { env } from '@/server/env'

declare global {
  var prismaClient: PrismaClient | undefined
}

/** Neon can close a pooled connection server-side (compute suspend, PgBouncer's own idle
 * timeout) well before our client-side `idleTimeoutMillis` elapses, so the pool can hand out a
 * client that looks idle-but-alive to node-postgres and fails with P1017 "Server has closed the
 * connection" on first use. The retry is safe because it only re-runs if the query never reached
 * the database. */
function isDeadConnectionError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P1017'
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
function createClient(): PrismaClient {
  const adapter = new PrismaPg(
    {
      connectionString: env.DATABASE_URL,
      idleTimeoutMillis: 10 * 60_000,
      keepAlive: true,
    },
    // node-postgres emits 'error' on a pooled client that dies in the background (e.g. the
    // server closing it); without a handler that's an unhandled error that crashes the process.
    { onPoolError: (err) => console.error('[db] idle pg client error', err) },
  )
  const client = new PrismaClient({ adapter })
  // The extension only intercepts queries — it adds no client-level API — so this cast keeps
  // the exported `db` typed as a plain PrismaClient for every existing call site.
  return client.$extends({
    query: {
      async $allOperations({ args, query }) {
        try {
          return await query(args)
        } catch (error) {
          if (!isDeadConnectionError(error)) throw error
          return query(args)
        }
      },
    },
  }) as PrismaClient
}

// Next.js dev-mode hot reload re-evaluates this module on every edit; without the global
// cache each reload would open a fresh pool of connections to Neon.
export const db = globalThis.prismaClient ?? createClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaClient = db
}
