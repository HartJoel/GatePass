'use client'

/**
 * In-memory stand-in for the platform-scoped company service. See the note in
 * company-data-provider.tsx — same reasoning, delete once Phase 5 slice I lands.
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { DEMO_PLATFORM_COMPANIES, STAFF, type PlatformCompany } from '@/features/platform/demo-data'

interface Store {
  companies: PlatformCompany[]
  suspend: (id: string, reason: string) => void
  reactivate: (id: string) => void
}

const Ctx = createContext<Store | null>(null)

export function usePlatformData() {
  const s = useContext(Ctx)
  if (!s) throw new Error('usePlatformData must be used inside <PlatformDataProvider>')
  return s
}

export function PlatformDataProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<PlatformCompany[]>(DEMO_PLATFORM_COMPANIES)

  const suspend = useCallback<Store['suspend']>((id, reason) => {
    setCompanies((l) => l.map((c) => (c.id === id ? { ...c, status: 'suspended', suspension: { reason: reason.trim(), at: Date.now(), by: STAFF.name } } : c)))
  }, [])

  const reactivate = useCallback<Store['reactivate']>((id) => {
    setCompanies((l) => l.map((c) => (c.id === id ? { ...c, status: 'active', suspension: undefined } : c)))
  }, [])

  const store = useMemo<Store>(() => ({ companies, suspend, reactivate }), [companies, suspend, reactivate])

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}
