/**
 * Placeholder data for the Phase 3.5 audit page. Access events are now real (slice E) — see
 * gate.service.ts. Delete this file once the real audit-log service lands in slice H.
 */

const now = Date.now()
const MIN = 60_000

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
