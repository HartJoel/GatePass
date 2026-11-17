/**
 * Placeholder data for the Phase 3.5 resident pages. See the note in
 * src/features/companies/demo-data.ts — same reasoning. Delete this file
 * once the real pass service lands in Phase 5, slice D.
 */
import type { Pass } from '@/features/passes/components/pass-card'

const now = Date.now()
const HOUR = 3_600_000

export const DEMO_RESIDENT = { name: 'Tunde Bello', unit: 'Block C, Flat 4' }

export const DEMO_PASSES: Pass[] = [
  { id: 'p1', code: 'K7H2PALM', visitor: 'Chidi Okafor', unit: DEMO_RESIDENT.unit, start: new Date(now - 1 * HOUR), end: new Date(now + 3 * HOUR), status: 'active', host: DEMO_RESIDENT.name },
  { id: 'p2', code: 'M9X4LAGO', visitor: 'Funmi Adewale', unit: DEMO_RESIDENT.unit, start: new Date(now + 20 * HOUR), end: new Date(now + 28 * HOUR), status: 'active', host: DEMO_RESIDENT.name },
  { id: 'p3', code: 'B2Q8VICT', visitor: 'Emeka Nwosu', unit: DEMO_RESIDENT.unit, start: new Date(now - 30 * HOUR), end: new Date(now - 26 * HOUR), status: 'used', host: DEMO_RESIDENT.name },
  { id: 'p4', code: 'T5R1EKIT', visitor: 'Sade Williams', unit: DEMO_RESIDENT.unit, start: new Date(now - 50 * HOUR), end: new Date(now - 44 * HOUR), status: 'expired', host: DEMO_RESIDENT.name },
  { id: 'p5', code: 'N3W7IKOY', visitor: 'Tamuno Briggs', unit: DEMO_RESIDENT.unit, start: new Date(now - 3 * HOUR), end: new Date(now + 1 * HOUR), status: 'revoked', host: DEMO_RESIDENT.name },
]

export function findPass(id: string): Pass | undefined {
  return DEMO_PASSES.find((p) => p.id === id)
}

export function findPassByCode(code: string): Pass | undefined {
  return DEMO_PASSES.find((p) => p.code === code)
}
