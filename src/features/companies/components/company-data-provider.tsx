'use client'

/**
 * In-memory stand-in for the company/estate/member/invite services, so every
 * button in the company-admin area actually does something during Phase 3/3.5
 * instead of being an inert TODO. Delete this file (and the Context it defines)
 * once the real services + Server Actions land in Phase 5 — pages should then
 * read via the service and mutate via a Server Action, not a client Context.
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  DEMO_COMPANY,
  DEMO_ESTATES,
  DEMO_INVITES,
  DEMO_MEMBERS,
  INVITE_VALID_DAYS,
  type Company,
  type Estate,
  type Invite,
  type Member,
  type Role,
} from '@/features/companies/demo-data'

const DAY = 86_400_000

export interface EstateInput {
  name: string
  address: string
  city: string
  units?: number
  manager: { kind: 'none' } | { kind: 'member'; memberId: string } | { kind: 'invite'; email: string }
}

interface Store {
  company: Company
  estates: Estate[]
  members: Member[]
  invites: Invite[]
  saveEstate: (id: string | undefined, input: EstateInput) => string
  setEstateStatus: (id: string, status: Estate['status']) => void
  addInvite: (input: { email: string; role: Role; estateId?: string }) => void
  resendInvite: (id: string) => void
  cancelInvite: (id: string) => void
  updateCompany: (c: Company) => void
  estateName: (id: string) => string
  managerOf: (e: Estate) => { name: string; pending: boolean } | null
}

const Ctx = createContext<Store | null>(null)

export function useCompanyData() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useCompanyData must be used inside <CompanyDataProvider>')
  return s
}

let seq = 100
const uid = (p: string) => `${p}${++seq}`

export function CompanyDataProvider({ children }: { children: ReactNode }) {
  const [company, setCompany] = useState<Company>(DEMO_COMPANY)
  const [estates, setEstates] = useState<Estate[]>(DEMO_ESTATES)
  const [members] = useState<Member[]>(DEMO_MEMBERS)
  const [invites, setInvites] = useState<Invite[]>(DEMO_INVITES)

  const estateName = useCallback((id: string) => estates.find((e) => e.id === id)?.name ?? 'Unknown estate', [estates])

  const saveEstate = useCallback<Store['saveEstate']>(
    (id, input) => {
      const estateId = id ?? uid('e')
      let managerId: string | undefined
      let managerInviteId: string | undefined
      const prev = id ? estates.find((e) => e.id === id) : undefined

      if (input.manager.kind === 'member') managerId = input.manager.memberId
      if (input.manager.kind === 'invite') {
        const email = input.manager.email.trim().toLowerCase()
        const existing = invites.find((i) => i.id === prev?.managerInviteId && i.email === email)
        if (existing) managerInviteId = existing.id
        else {
          const now = Date.now()
          const invite: Invite = { id: uid('i'), email, role: 'Estate manager', estateId, sentAt: now, expiresAt: now + INVITE_VALID_DAYS * DAY }
          setInvites((l) => [invite, ...l])
          managerInviteId = invite.id
        }
      }

      const base = { name: input.name.trim(), address: input.address.trim(), city: input.city.trim(), units: input.units, managerId, managerInviteId }
      setEstates((l) =>
        prev
          ? l.map((e) => (e.id === id ? { ...e, ...base } : e))
          : [{ id: estateId, ...base, status: 'active' as const, activity: 'Just registered · no passes issued yet' }, ...l],
      )
      return estateId
    },
    [estates, invites],
  )

  const setEstateStatus = useCallback<Store['setEstateStatus']>((id, status) => {
    setEstates((l) =>
      l.map((e) => (e.id === id ? { ...e, status, activity: status === 'deactivated' ? 'Deactivated just now · no activity' : 'Reactivated just now' } : e)),
    )
  }, [])

  const addInvite = useCallback<Store['addInvite']>((i) => {
    const now = Date.now()
    setInvites((l) => [{ id: uid('i'), email: i.email.trim().toLowerCase(), role: i.role, estateId: i.estateId, sentAt: now, expiresAt: now + INVITE_VALID_DAYS * DAY }, ...l])
  }, [])

  const resendInvite = useCallback<Store['resendInvite']>((id) => {
    const now = Date.now()
    setInvites((l) => l.map((i) => (i.id === id ? { ...i, sentAt: now, expiresAt: now + INVITE_VALID_DAYS * DAY } : i)))
  }, [])

  const cancelInvite = useCallback<Store['cancelInvite']>((id) => {
    setInvites((l) => l.filter((i) => i.id !== id))
    setEstates((l) => l.map((e) => (e.managerInviteId === id ? { ...e, managerInviteId: undefined } : e)))
  }, [])

  const managerOf = useCallback<Store['managerOf']>(
    (e) => {
      const m = members.find((x) => x.id === e.managerId)
      if (m) return { name: m.name, pending: false }
      const inv = invites.find((x) => x.id === e.managerInviteId)
      return inv ? { name: inv.email, pending: true } : null
    },
    [members, invites],
  )

  const store = useMemo<Store>(
    () => ({ company, estates, members, invites, saveEstate, setEstateStatus, addInvite, resendInvite, cancelInvite, updateCompany: setCompany, estateName, managerOf }),
    [company, estates, members, invites, saveEstate, setEstateStatus, addInvite, resendInvite, cancelInvite, estateName, managerOf],
  )

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}
