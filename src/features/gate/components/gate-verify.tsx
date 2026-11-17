'use client'

import { useState, type FormEvent } from 'react'
import { Camera, CheckCircle2, RotateCcw, ShieldAlert, XCircle } from 'lucide-react'
import { Button, DecisionPair } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { StatusBadge } from '@/components/ui/status-badge'
import { formatWindow } from '@/lib/format'
import type { Pass } from '@/features/passes/components/pass-card'
import { findPassByCode } from '@/features/passes/demo-data'
import { DEMO_GUARD } from '@/features/access-log/demo-data'
import { useAccessLogData } from '@/features/access-log/components/access-log-provider'

type Result = { kind: 'not-found' } | { kind: 'blocked'; pass: Pass } | { kind: 'ready'; pass: Pass } | { kind: 'decided'; pass: Pass; decision: 'approved' | 'rejected' }

/** Gate verify + decide. No design existed for this screen — built from the guard theme,
 * StatusBadge and Countdown pieces that were already in the kit, per the dark, large-type
 * "guard" variant in the tokens. Manual entry only for now; camera scanning is Phase 5+. */
export function GateVerify() {
  const { addEvent } = useAccessLogData()
  const [code, setCode] = useState('')
  const [result, setResult] = useState<Result | null>(null)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    // TODO(phase 5, slice E): POST estates/[estateId]/gate/verify instead of a local lookup.
    const pass = findPassByCode(code.trim().toUpperCase())
    if (!pass) return setResult({ kind: 'not-found' })
    setResult(pass.status === 'active' ? { kind: 'ready', pass } : { kind: 'blocked', pass })
  }

  function reset() {
    setCode('')
    setResult(null)
  }

  function decide(decision: 'approved' | 'rejected') {
    if (!result || result.kind !== 'ready') return
    // TODO(phase 5, slice E): POST estates/[estateId]/gate/decisions — atomic conditional
    // claim inside a transaction, idempotent on clientRequestId, HTTP 200 either way.
    addEvent({ visitor: result.pass.visitor, unit: result.pass.unit, guard: DEMO_GUARD.name, decision })
    setResult({ kind: 'decided', pass: result.pass, decision })
  }

  if (!result) {
    return (
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <div className="text-center">
          <h1 className="type-h1 text-ink">Verify a pass</h1>
          <p className="mt-1.5 text-[15px] text-ink-2">Scan the visitor’s QR code or type it in.</p>
        </div>
        <Button type="button" size="large" fullWidth icon={<Camera className="size-6" aria-hidden />} disabled>
          Scan QR code
        </Button>
        <p className="text-center text-[13px] text-ink-3">Camera scanning isn’t wired up yet — use manual entry below.</p>
        <Field label="Visitor code" size="large" autoFocus placeholder="K7H2PALM" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="[&_input]:tnum [&_input]:tracking-[0.18em]" />
        <Button type="submit" variant="filled" size="large" fullWidth disabled={!code.trim()}>
          Verify
        </Button>
      </form>
    )
  }

  if (result.kind === 'not-found') {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-danger-bg text-danger">
          <ShieldAlert className="size-8" aria-hidden />
        </span>
        <div>
          <h1 className="type-guard text-ink">Not found</h1>
          <p className="mt-2 text-[15px] text-ink-2">No pass matches that code. Check it with the visitor and try again.</p>
        </div>
        <Button variant="filled" size="large" fullWidth icon={<RotateCcw />} onClick={reset}>
          Try again
        </Button>
      </div>
    )
  }

  const { pass } = result

  if (result.kind === 'blocked') {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <StatusBadge status={pass.status} size="lg" />
        <div>
          <h1 className="type-guard text-ink">{pass.visitor}</h1>
          <p className="mt-1 text-[15px] text-ink-2">{pass.unit}</p>
          <p className="tnum mt-2 text-sm text-ink-2">{formatWindow(pass.start, pass.end)}</p>
        </div>
        <p className="text-[15px] text-ink-2">This pass can’t be used at the gate. Don’t let the visitor in on this code.</p>
        <Button variant="filled" size="large" fullWidth icon={<RotateCcw />} onClick={reset}>
          Verify another
        </Button>
      </div>
    )
  }

  if (result.kind === 'decided') {
    const approved = result.decision === 'approved'
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <span className={approved ? 'flex size-16 items-center justify-center rounded-full bg-success-bg text-success' : 'flex size-16 items-center justify-center rounded-full bg-danger-bg text-danger'}>
          {approved ? <CheckCircle2 className="size-8" aria-hidden /> : <XCircle className="size-8" aria-hidden />}
        </span>
        <div>
          <h1 className="type-guard text-ink">{approved ? 'Entry approved' : 'Entry rejected'}</h1>
          <p className="mt-1 text-[15px] text-ink-2">
            {pass.visitor} · {pass.unit}
          </p>
        </div>
        <Button variant="filled" size="large" fullWidth icon={<RotateCcw />} onClick={reset}>
          Verify another
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <StatusBadge status="active" size="lg" />
      <div>
        <h1 className="type-guard text-ink">{pass.visitor}</h1>
        <p className="mt-1 text-[15px] text-ink-2">{pass.unit}</p>
        <p className="tnum mt-2 text-sm text-ink-2">{formatWindow(pass.start, pass.end)}</p>
      </div>
      <DecisionPair onApprove={() => decide('approved')} onReject={() => decide('rejected')} />
      <button type="button" onClick={reset} className="text-sm font-medium text-ink-2 underline-offset-4 hover:text-ink hover:underline">
        Cancel
      </button>
    </div>
  )
}
