'use client'

import { useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { usePassesData } from '@/features/passes/components/passes-data-provider'

const DURATIONS = [
  { value: '4', label: '4 hours' },
  { value: '24', label: '24 hours (default)' },
  { value: '72', label: '3 days' },
  { value: '168', label: '7 days (maximum)' },
] as const

export function PassForm() {
  const { estateId } = useParams<{ estateId: string }>()
  const { unit, createPass } = usePassesData()
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const passesHref = `/resident/${estateId}/passes`
  const [visitor, setVisitor] = useState('')
  const [duration, setDuration] = useState('24')
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const errors = { visitor: !visitor.trim() ? 'Enter the visitor’s name.' : undefined }
  const shown = (k: keyof typeof errors) => (submitted ? errors[k] : undefined)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    if (errors.visitor) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }
    // TODO(phase 5, slice D): createPassAction — generate the token (128-bit, SHA-256 hash stored).
    // `note` isn't recorded by the demo store yet; it has no field for it until the real schema lands.
    const id = createPass({ visitor, durationHours: Number(duration), note })
    router.push(`/resident/${estateId}/passes/${id}`)
  }

  return (
    <>
      <header className="mb-6">
        <Link href={passesHref} className="-ml-1 mb-3 inline-flex items-center gap-0.5 rounded-sm text-sm font-medium text-ink-2 transition-colors hover:text-ink">
          <ChevronLeft className="size-4" aria-hidden />
          Passes
        </Link>
        <h1 className="type-h1 text-ink">Create a visitor pass</h1>
        <p className="mt-1.5 text-[15px] text-ink-2">The code is shown once you save. Share it with your visitor before they arrive.</p>
      </header>

      <form ref={formRef} onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Field label="Visitor’s name" name="visitor" autoFocus placeholder="Chidi Okafor" value={visitor} onChange={(e) => setVisitor(e.target.value)} error={shown('visitor')} />
        <Field label="Unit" value={unit} readOnly disabled hint="Passes are issued for your own unit." />
        <Select label="Valid for" value={duration} onChange={(e) => setDuration(e.target.value)} hint="24 hours covers most visits. Longer passes need a reason at the gate.">
          {DURATIONS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </Select>
        <Textarea label="Note for the guard (optional)" placeholder="e.g. Grey Camry, plate KJA 204 XB" value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
        <Button type="submit" variant="filled" className="mt-2">
          Save and get code
        </Button>
      </form>
    </>
  )
}
