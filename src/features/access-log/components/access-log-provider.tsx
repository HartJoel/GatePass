'use client'

/**
 * In-memory stand-in for the access-event service. See the note in
 * company-data-provider.tsx — same reasoning, delete once Phase 5 slice E/F lands.
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { DEMO_ACCESS_EVENTS, type AccessEvent } from '@/features/access-log/demo-data'

interface Store {
  events: AccessEvent[]
  addEvent: (input: Omit<AccessEvent, 'id' | 'at'>) => void
}

const Ctx = createContext<Store | null>(null)

export function useAccessLogData() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useAccessLogData must be used inside <AccessLogProvider>')
  return s
}

let seq = 100
const uid = () => `ev${++seq}`

export function AccessLogProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<AccessEvent[]>(DEMO_ACCESS_EVENTS)

  const addEvent = useCallback<Store['addEvent']>((input) => {
    setEvents((l) => [{ ...input, id: uid(), at: Date.now() }, ...l])
  }, [])

  const store = useMemo<Store>(() => ({ events, addEvent }), [events, addEvent])

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}
