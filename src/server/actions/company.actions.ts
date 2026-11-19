'use server'

import { randomUUID } from 'node:crypto'
import { registerCompanySchema } from '@/lib/validation/company.schema'
import { registerCompany, type RegisteredCompany } from '@/server/services/company.service'
import { normalizeError } from '@/server/errors/to-result'
import type { ActionResult } from '@/lib/types'

export async function registerCompanyAction(input: unknown): Promise<ActionResult<RegisteredCompany>> {
  const parsed = registerCompanySchema.safeParse(input)
  if (!parsed.success) {
    return { error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message ?? 'Check your details and try again.', requestId: randomUUID() } }
  }

  try {
    const data = await registerCompany(parsed.data)
    return { data }
  } catch (err) {
    return normalizeError(err)
  }
}
