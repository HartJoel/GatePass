'use client'

import { useCallback, useState, type FormEvent } from 'react'
import { useParams } from 'next/navigation'
import { Camera, CheckCircle2, RotateCcw, ShieldAlert, XCircle } from 'lucide-react'
import { Button, DecisionPair } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { formatWindow } from '@/lib/format'
import { QrScanner } from '@/features/gate/components/qr-scanner'
import { decideAction, verifyCodeAction } from '@/server/actions/gate.actions'
import type { GatePassPeek } from '@/server/services/gate.service'

type Result =
  | { kind: 'not-found' }
  | { kind: 'blocked'; message: string }
  | { kind: 'ready'; pass: GatePassPeek; clientRequestId: string }
  | { kind: 'decided'; pass: GatePassPeek; decision: 'approved' | 'rejected' }

/** Gate verify + decide. No design existed for this screen — built from the guard theme,
 * StatusBadge and Countdown pieces that were already in the kit, per the dark, large-type
 * "guard" variant in the tokens. */
export function GateVerify() {
  const { estateId } = useParams<{ estateId: string }>()
  const [code, setCode] = useState('')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [busy, setBusy] = useState(false)

  const verify = useCallback(
    async (rawCode: string) => {
      setScanning(false)
      setBusy(true)
      const res = await verifyCodeAction(estateId, { code: rawCode })
      setBusy(false)
      if (res.error) return setResult({ kind: 'blocked', message: res.error.message })
      if (res.data.outcome === 'VALID') {
        setResult({ kind: 'ready', pass: res.data.pass, clientRequestId: crypto.randomUUID() })
      } else if (res.data.reason === 'NOT_FOUND') {
        setResult({ kind: 'not-found' })
      } else {
        setResult({ kind: 'blocked', message: res.data.message })
      }
    },
    [estateId],
  )

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (code.trim()) await verify(code.trim())
  }

  const onScanned = useCallback(
    (value: string) => {
      const digits = value.replace(/\D/g, '').slice(0, 6)
      setCode(digits)
      if (digits) void verify(digits)
    },
    [verify],
  )

  function reset() {
    setCode('')
    setResult(null)
  }

  async function decide(decision: 'APPROVE' | 'REJECT') {
    if (!result || result.kind !== 'ready') return
    setBusy(true)
    const res = await decideAction(estateId, { code: code.trim(), decision, clientRequestId: result.clientRequestId })
    setBusy(false)
    if (res.error) return // keep the ready state — retrying reuses the same clientRequestId
    setResult({ kind: 'decided', pass: result.pass, decision: res.data.outcome === 'APPROVED' ? 'approved' : 'rejected' })
  }

  if (!result && scanning) {
    return (
      <div className="flex flex-col gap-5">
        <div className="text-center">
          <h1 className="type-h1 text-ink">Scan a pass</h1>
        </div>
        <QrScanner onDetect={onScanned} onClose={() => setScanning(false)} />
      </div>
    )
  }

  if (!result) {
    return (
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <div className="text-center">
          <h1 className="type-h1 text-ink">Verify a pass</h1>
          <p className="mt-1.5 text-[15px] text-ink-2">Scan the visitor’s QR code or type the code in.</p>
        </div>
        <Button type="button" size="large" fullWidth icon={<Camera className="size-6" aria-hidden />} onClick={() => setScanning(true)}>
          Scan QR code
        </Button>
        <p className="text-center text-[13px] text-ink-3">Or type the code manually:</p>
        <Field
          label="Visitor code"
          size="large"
          autoFocus
          inputMode="numeric"
          maxLength={6}
          placeholder="482913"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="[&_input]:tnum [&_input]:tracking-[0.3em]"
        />
        <Button type="submit" variant="filled" size="large" fullWidth disabled={!code.trim()} loading={busy}>
          {busy ? 'Checking…' : 'Verify'}
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

  if (result.kind === 'blocked') {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-danger-bg text-danger">
          <ShieldAlert className="size-8" aria-hidden />
        </span>
        <p className="text-[15px] text-ink-2">{result.message}</p>
        <p className="text-[15px] text-ink-2">Don’t let the visitor in on this code.</p>
        <Button variant="filled" size="large" fullWidth icon={<RotateCcw />} onClick={reset}>
          Verify another
        </Button>
      </div>
    )
  }

  const { pass } = result

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
            {pass.visitorName} · {pass.unitLabel}
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
      <div>
        <h1 className="type-guard text-ink">{pass.visitorName}</h1>
        <p className="mt-1 text-[15px] text-ink-2">{pass.unitLabel}</p>
        <p className="tnum mt-2 text-sm text-ink-2">{formatWindow(pass.validFrom, pass.expiresAt)}</p>
        {pass.note && <p className="mt-2 text-[15px] text-ink-2">{pass.note}</p>}
      </div>
      <DecisionPair onApprove={() => decide('APPROVE')} onReject={() => decide('REJECT')} loading={busy} />
      <button type="button" onClick={reset} className="text-sm font-medium text-ink-2 underline-offset-4 hover:text-ink hover:underline">
        Cancel
      </button>
    </div>
  )
}
