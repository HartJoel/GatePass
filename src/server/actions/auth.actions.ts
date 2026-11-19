'use server'

import { randomUUID } from 'node:crypto'
import { auth } from '@/server/auth/auth'
import { signInSchema } from '@/lib/validation/auth.schema'
import type { ActionResult } from '@/lib/types'

/** Generic failure message regardless of the underlying reason — per the gatepass-auth skill,
 * sign-in never reveals whether an email is registered. */
export async function signInAction(input: unknown): Promise<ActionResult<{ signedIn: true }>> {
  const parsed = signInSchema.safeParse(input)
  if (!parsed.success) {
    return { error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message ?? 'Check your details and try again.', requestId: randomUUID() } }
  }

  const { error } = await auth.signIn.email({ email: parsed.data.email, password: parsed.data.password })
  if (error) {
    return { error: { code: 'UNAUTHENTICATED', message: 'Email or password is incorrect.', requestId: randomUUID() } }
  }

  return { data: { signedIn: true } }
}

export async function signOutAction(): Promise<void> {
  await auth.signOut()
}
