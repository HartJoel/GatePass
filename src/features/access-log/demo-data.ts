/**
 * Placeholder data for the Phase 3.5 guard/audit pages. See the note in
 * src/features/companies/demo-data.ts — same reasoning. Delete this file
 * once the real access-event/audit services land in Phase 5, slices E/H.
 */

export const DEMO_GUARD = { name: 'Segun Alabi' }

export interface AccessEvent {
  id: string
  visitor: string
  unit: string
  guard: string
  decision: 'approved' | 'rejected'
  at: number
}

const now = Date.now()
const MIN = 60_000

export const DEMO_ACCESS_EVENTS: AccessEvent[] = [
  { id: 'ev1', visitor: 'Chidi Okafor', unit: 'Block C, Flat 4', guard: 'Segun Alabi', decision: 'approved', at: now - 4 * MIN },
  { id: 'ev2', visitor: 'Funmi Adewale', unit: 'Block A, Flat 2', guard: 'Segun Alabi', decision: 'approved', at: now - 52 * MIN },
  { id: 'ev3', visitor: 'Unknown visitor', unit: '—', guard: 'Segun Alabi', decision: 'rejected', at: now - 70 * MIN },
  { id: 'ev4', visitor: 'Emeka Nwosu', unit: 'Block B, Flat 9', guard: 'Segun Alabi', decision: 'approved', at: now - 125 * MIN },
  { id: 'ev5', visitor: 'Sade Williams', unit: 'Block C, Flat 4', guard: 'Segun Alabi', decision: 'approved', at: now - 310 * MIN },
]

export interface AuditEntry {
  id: string
  actor: string
  action: string
  target: string
  at: number
}

export const DEMO_AUDIT_ENTRIES: AuditEntry[] = [
  { id: 'au1', actor: 'Kemi Adebayo', action: 'Registered estate', target: 'Victoria Island Towers', at: now - 2 * 86_400_000 },
  { id: 'au2', actor: 'Kemi Adebayo', action: 'Invited member', target: 'ife.coker@example.com · Estate manager', at: now - 2 * 86_400_000 - 5 * MIN },
  { id: 'au3', actor: 'Chinedu Okeke', action: 'Deactivated estate', target: 'Lekki Gardens Phase 2', at: now - 21 * 86_400_000 },
  { id: 'au4', actor: 'Amaka Eze', action: 'Cancelled invite', target: 'chioma.nwosu@example.com', at: now - 9 * 86_400_000 },
]
