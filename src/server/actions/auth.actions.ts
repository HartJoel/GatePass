'use server'

import { randomUUID } from 'node:crypto'
import { auth } from '@/server/auth/auth'
import { signInSchema } from '@/lib/validation/auth.schema'
import type { ActionResult } from '@/lib/types'
import { logger } from '@/server/logger'

/** Generic failure message regardless of the underlying reason — per the gatepass-auth skill,
 * sign-in never reveals whether an email is registered. */
export async function signInAction(input: unknown): Promise<ActionResult<{ signedIn: true }>> {
  const parsed = signInSchema.safeParse(input)
  if (!parsed.success) {
    return { error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message ?? 'Check your details and try again.', requestId: randomUUID() } }
  }

  const { error } = await auth.signIn.email({ email: parsed.data.email, password: parsed.data.password })
  if (error) {
    const requestId = randomUUID()
    // TEMP diagnostic: the generic message below hides whether this is bad credentials or a
    // broken NEON_AUTH_BASE_URL/network issue underneath. Check Vercel Runtime Logs for this
    // event, then remove it once the real cause is confirmed.
    logger.error('auth.sign_in.failed', { requestId, code: error.code, status: error.status, message: error.message })
    return { error: { code: 'UNAUTHENTICATED', message: 'Email or password is incorrect.', requestId } }
  }

  return { data: { signedIn: true } }
}

export async function signOutAction(): Promise<void> {
  await auth.signOut()
}
