import { randomUUID } from 'node:crypto'
import { AppError } from '@/server/errors/app-error'
import { logger } from '@/server/logger'

export interface ErrorResult {
  error: { code: string; message: string; requestId: string }
}

/** Maps any thrown error to the edge response shape once. Never leaks stack traces, SQL, or
 * other tenants' ids — unexpected errors become a generic INTERNAL message, logged with the
 * requestId so it can be found server-side. */
export function normalizeError(err: unknown): ErrorResult {
  const requestId = randomUUID()

  if (err instanceof AppError) {
    return { error: { code: err.code, message: err.message, requestId } }
  }

  logger.error('unhandled_error', { requestId, message: err instanceof Error ? err.message : String(err) })
  return { error: { code: 'INTERNAL', message: 'Something went wrong. Try again.', requestId } }
}
