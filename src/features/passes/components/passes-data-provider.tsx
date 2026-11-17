'use client'

/**
 * In-memory stand-in for the pass service. See the note in
 * company-data-provider.tsx — same reasoning, delete once Phase 5 slice D lands.
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { DEMO_PASSES, DEMO_RESIDENT } from '@/features/passes/demo-data'
import type { Pass } from '@/features/passes/components/pass-card'

export interface CreatePassInput {
  visitor: string
  durationHours: number
  note?: string
}

interface Store {
  residentName: string
  unit: string
  passes: Pass[]
  createPass: (input: CreatePassInput) => string
  revokePass: (id: string) => void
}

const Ctx = createContext<Store | null>(null)

export function usePassesData() {
  const s = useContext(Ctx)
  if (!s) throw new Error('usePassesData must be used inside <PassesDataProvider>')
  return s
}

let seq = 100
const uid = () => `p${++seq}`
const code = () => Math.random().toString(36).slice(2, 10).toUpperCase()

export function PassesDataProvider({ children }: { children: ReactNode }) {
  const [passes, setPasses] = useState<Pass[]>(DEMO_PASSES)

  const createPass = useCallback<Store['createPass']>((input) => {
    const id = uid()
    const start = new Date()
    const end = new Date(start.getTime() + input.durationHours * 3_600_000)
    const pass: Pass = { id, code: code(), visitor: input.visitor.trim(), unit: DEMO_RESIDENT.unit, start, end, status: 'active', host: DEMO_RESIDENT.name }
    setPasses((l) => [pass, ...l])
    return id
  }, [])

  const revokePass = useCallback<Store['revokePass']>((id) => {
    setPasses((l) => l.map((p) => (p.id === id ? { ...p, status: 'revoked' } : p)))
  }, [])

  const store = useMemo<Store>(
    () => ({ residentName: DEMO_RESIDENT.name, unit: DEMO_RESIDENT.unit, passes, createPass, revokePass }),
    [passes, createPass, revokePass],
  )

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}
