/**
 * Placeholder data for the Phase 3 visual migration. Every page that reads from
 * here does so only because Phase 4 (Prisma/Better Auth) and the real services
 * from the gatepass-database / gatepass-auth skills don't exist yet. Delete this
 * file once the real company/estate/member/invite services land in Phase 5.
 */

export const ROLES = ['Company admin', 'Estate manager', 'Guard', 'Resident'] as const
export type Role = (typeof ROLES)[number]

export interface Estate {
  id: string
  name: string
  address: string
  city: string
  units?: number
  managerId?: string
  managerInviteId?: string
  status: 'active' | 'deactivated'
  activity: string
}

export interface Member {
  id: string
  name: string
  email: string
  role: Role
  estateIds: string[] | 'all'
  status: 'active' | 'suspended' | 'deactivated'
}

export interface Invite {
  id: string
  email: string
  role: Role
  estateId?: string
  sentAt: number
  expiresAt: number
}

export interface Company {
  name: string
  email: string
  phone: string
  rcNumber: string
  address: string
  city: string
}

export const INVITE_VALID_DAYS = 7
const DAY = 86_400_000
const now = Date.now()

export const DEMO_COMPANY: Company = {
  name: 'Crestview Property Management',
  email: 'admin@crestview.ng',
  phone: '803 555 0142',
  rcNumber: 'RC 1482930',
  address: '27 Adeola Odeku Street, Victoria Island',
  city: 'Lagos',
}

export const DEMO_ESTATES: Estate[] = [
  { id: 'e1', name: 'Palmgrove Estate', address: '14 Palmgrove Close, Lekki Phase 1', city: 'Lagos', units: 120, managerId: 'm2', status: 'active', activity: '86 passes this week · last entry 4 minutes ago' },
  { id: 'e2', name: 'Banana Island Gardens', address: 'Plot 7, Banana Island Road, Ikoyi', city: 'Lagos', units: 64, managerId: 'm3', status: 'active', activity: '52 passes this week · 2 new residents joined today' },
  { id: 'e3', name: 'Maitama Heights', address: '12 Aguiyi Ironsi Street, Maitama', city: 'Abuja', units: 86, managerId: 'm4', status: 'active', activity: '41 passes this week · 3 passes expired unused' },
  { id: 'e4', name: 'Ikeja GRA Court', address: '5 Isaac John Street, Ikeja GRA', city: 'Lagos', units: 48, managerId: 'm5', status: 'active', activity: 'No visitors yet today · 1 guard on duty' },
  { id: 'e6', name: 'Victoria Island Towers', address: '3 Adetokunbo Ademola Street, Victoria Island', city: 'Lagos', managerInviteId: 'i1', status: 'active', activity: 'Registered 2 days ago · waiting for the manager to accept their invite' },
  { id: 'e5', name: 'Lekki Gardens Phase 2', address: '9 Admiralty Way, Lekki Phase 1', city: 'Lagos', units: 40, managerId: 'm10', status: 'deactivated', activity: 'Deactivated 3 weeks ago · no activity since' },
]

export const DEMO_MEMBERS: Member[] = [
  { id: 'm1', name: 'Kemi Adebayo', email: 'kemi@crestview.ng', role: 'Company admin', estateIds: 'all', status: 'active' },
  { id: 'm2', name: 'Chinedu Okeke', email: 'chinedu@crestview.ng', role: 'Estate manager', estateIds: ['e1'], status: 'active' },
  { id: 'm3', name: 'Amaka Eze', email: 'amaka@crestview.ng', role: 'Estate manager', estateIds: ['e2'], status: 'active' },
  { id: 'm4', name: 'Ibrahim Musa', email: 'ibrahim@crestview.ng', role: 'Estate manager', estateIds: ['e3'], status: 'active' },
  { id: 'm5', name: 'Folake Adeyemi', email: 'folake@crestview.ng', role: 'Estate manager', estateIds: ['e4'], status: 'active' },
  { id: 'm6', name: 'Segun Alabi', email: 'segun.alabi@example.com', role: 'Guard', estateIds: ['e1'], status: 'active' },
  { id: 'm7', name: 'Hauwa Bello', email: 'hauwa.bello@example.com', role: 'Guard', estateIds: ['e3'], status: 'active' },
  { id: 'm8', name: 'Tunde Bello', email: 'tunde.bello@example.com', role: 'Resident', estateIds: ['e1'], status: 'active' },
  { id: 'm9', name: 'Ngozi Umeh', email: 'ngozi.umeh@example.com', role: 'Resident', estateIds: ['e2'], status: 'suspended' },
  { id: 'm10', name: 'Emeka Obi', email: 'emeka@crestview.ng', role: 'Estate manager', estateIds: ['e5'], status: 'deactivated' },
]

export const DEMO_INVITES: Invite[] = [
  { id: 'i1', email: 'ife.coker@example.com', role: 'Estate manager', estateId: 'e6', sentAt: now - 2 * DAY, expiresAt: now + 5 * DAY },
  { id: 'i2', email: 'yusuf.danjuma@example.com', role: 'Guard', estateId: 'e3', sentAt: now - 6 * DAY, expiresAt: now + 1 * DAY },
  { id: 'i3', email: 'chioma.nwosu@example.com', role: 'Resident', estateId: 'e2', sentAt: now - 9 * DAY, expiresAt: now - 2 * DAY },
]

export function estateName(id: string): string {
  return DEMO_ESTATES.find((e) => e.id === id)?.name ?? 'Unknown estate'
}

export function managerOf(e: Estate): { name: string; pending: boolean } | null {
  const m = DEMO_MEMBERS.find((x) => x.id === e.managerId)
  if (m) return { name: m.name, pending: false }
  const inv = DEMO_INVITES.find((x) => x.id === e.managerInviteId)
  return inv ? { name: inv.email, pending: true } : null
}
