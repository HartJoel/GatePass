'use client'

import { useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { Banner } from '@/components/ui/banner'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createPassAction } from '@/server/actions/pass.actions'

const DURATIONS = [
  { value: '4', label: '4 hours' },
  { value: '24', label: '24 hours (default)' },
  { value: '72', label: '3 days' },
  { value: '168', label: '7 days (maximum)' },
] as const

export function PassForm({ estateId, units }: { estateId: string; units: { id: string; label: string }[] }) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const passesHref = `/resident/${estateId}/passes`
  const [unitId, setUnitId] = useState(units[0]?.id ?? '')
  const [visitor, setVisitor] = useState('')
  const [duration, setDuration] = useState('24')
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  if (units.length === 0) {
    return (
      <>
        <Link href={passesHref} className="-ml-1 mb-3 inline-flex items-center gap-0.5 rounded-sm text-sm font-medium text-ink-2 transition-colors hover:text-ink">
          <ChevronLeft className="size-4" aria-hidden />
          Passes
        </Link>
        <h1 className="type-h1 mb-6 text-ink">Create a visitor pass</h1>
        <Banner tone="info" title="You’re not assigned to a unit yet">
          Ask your estate manager to assign you to your unit before you can issue a visitor pass.
        </Banner>
      </>
    )
  }

  const errors = { visitor: !visitor.trim() ? 'Enter the visitor’s name.' : undefined, unit: !unitId ? 'Choose a unit.' : undefined }
  const shown = (k: keyof typeof errors) => (submitted ? errors[k] : undefined)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    setServerError(null)
    if (errors.visitor || errors.unit) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }
    setBusy(true)
    const result = await createPassAction(estateId, { unitId, visitorName: visitor, note: note || undefined, durationHours: Number(duration) })
    setBusy(false)
    if (result.error) {
      setServerError(result.error.message)
      return
    }
    router.push(`${passesHref}/${result.data.passId}`)
  }

  return (
    <>
      <header className="mb-6">
        <Link href={passesHref} className="-ml-1 mb-3 inline-flex items-center gap-0.5 rounded-sm text-sm font-medium text-ink-2 transition-colors hover:text-ink">
          <ChevronLeft className="size-4" aria-hidden />
          Passes
        </Link>
        <h1 className="type-h1 text-ink">Create a visitor pass</h1>
        <p className="mt-1.5 text-[15px] text-ink-2">You’ll get a code and QR to share with your visitor right after you save.</p>
      </header>

      <form ref={formRef} onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {serverError && <Banner title="Couldn’t create the pass">{serverError}</Banner>}
        <Field label="Visitor’s name" name="visitor" autoFocus placeholder="Chidi Okafor" value={visitor} onChange={(e) => setVisitor(e.target.value)} error={shown('visitor')} />
        {units.length === 1 ? (
          <Field label="Unit" value={units[0].label} readOnly disabled hint="Passes are issued for your own unit." />
        ) : (
          <Select label="Unit" value={unitId} onChange={(e) => setUnitId(e.target.value)} error={shown('unit')}>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </Select>
        )}
        <Select label="Valid for" value={duration} onChange={(e) => setDuration(e.target.value)} hint="24 hours covers most visits. Longer passes need a reason at the gate.">
          {DURATIONS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </Select>
        <Textarea label="Note for the guard (optional)" placeholder="e.g. Grey Camry, plate KJA 204 XB" value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
        <Button type="submit" variant="filled" className="mt-2" loading={busy}>
          {busy ? 'Saving…' : 'Save and get code'}
        </Button>
      </form>
    </>
  )
}
