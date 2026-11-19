/**
 * Placeholder data for slice E (gate verify), which still reads this by code. The resident-facing
 * pages (slice D) now use the real pass service — see pass.service.ts. Delete this file once
 * gate-verify.tsx is wired to the real gate service.
 */
import type { Status } from '@/components/ui/status-badge'

export interface DemoPass {
  id: string
  code: string
  visitor: string
  unit: string
  start: Date
  end: Date
  status: Status
  host: string
}

const now = Date.now()
const HOUR = 3_600_000

export const DEMO_RESIDENT = { name: 'Tunde Bello', unit: 'Block C, Flat 4' }

export const DEMO_PASSES: DemoPass[] = [
  { id: 'p1', code: 'K7H2PALM', visitor: 'Chidi Okafor', unit: DEMO_RESIDENT.unit, start: new Date(now - 1 * HOUR), end: new Date(now + 3 * HOUR), status: 'active', host: DEMO_RESIDENT.name },
  { id: 'p2', code: 'M9X4LAGO', visitor: 'Funmi Adewale', unit: DEMO_RESIDENT.unit, start: new Date(now + 20 * HOUR), end: new Date(now + 28 * HOUR), status: 'active', host: DEMO_RESIDENT.name },
  { id: 'p3', code: 'B2Q8VICT', visitor: 'Emeka Nwosu', unit: DEMO_RESIDENT.unit, start: new Date(now - 30 * HOUR), end: new Date(now - 26 * HOUR), status: 'used', host: DEMO_RESIDENT.name },
  { id: 'p4', code: 'T5R1EKIT', visitor: 'Sade Williams', unit: DEMO_RESIDENT.unit, start: new Date(now - 50 * HOUR), end: new Date(now - 44 * HOUR), status: 'expired', host: DEMO_RESIDENT.name },
  { id: 'p5', code: 'N3W7IKOY', visitor: 'Tamuno Briggs', unit: DEMO_RESIDENT.unit, start: new Date(now - 3 * HOUR), end: new Date(now + 1 * HOUR), status: 'revoked', host: DEMO_RESIDENT.name },
]

export function findPass(id: string): DemoPass | undefined {
  return DEMO_PASSES.find((p) => p.id === id)
}

export function findPassByCode(code: string): DemoPass | undefined {
  return DEMO_PASSES.find((p) => p.code === code)
}
