'use client'

import { useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, Power } from 'lucide-react'
import { Banner } from '@/components/ui/banner'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Modal } from '@/components/ui/overlay'
import { Select } from '@/components/ui/select'
import { SegmentedControl } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/toast'
import { useCompanyData } from '@/features/companies/components/company-data-provider'

type ManagerMode = 'member' | 'invite'

export function EstateForm({ estateId }: { estateId?: string }) {
  const { companyId } = useParams<{ companyId: string }>()
  const { estates, members, saveEstate, setEstateStatus } = useCompanyData()
  const toast = useToast()
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const estatesHref = `/companies/${companyId}/estates`

  const estate = estateId ? estates.find((e) => e.id === estateId) : undefined
  const editing = !!estateId

  const [name, setName] = useState(estate?.name ?? '')
  const [address, setAddress] = useState(estate?.address ?? '')
  const [city, setCity] = useState(estate?.city ?? '')
  const [units, setUnits] = useState(estate?.units?.toString() ?? '')
  const [mode, setMode] = useState<ManagerMode>(estate?.managerInviteId ? 'invite' : 'member')
  const [memberId, setMemberId] = useState(estate?.managerId ?? '')
  // TODO(phase 5): resolve the pending invite's email when editing an estate invited by email.
  const [inviteEmail, setInviteEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [confirmOff, setConfirmOff] = useState(false)

  if (editing && !estate) {
    return (
      <>
        <header className="mb-8">
          <Link href={estatesHref} className="-ml-1 mb-3 inline-flex items-center gap-0.5 rounded-sm text-sm font-medium text-ink-2 transition-colors hover:text-ink">
            <ChevronLeft className="size-4" aria-hidden />
            Estates
          </Link>
          <h1 className="type-h1 text-ink">Estate not found</h1>
        </header>
        <Banner tone="info" title="We couldn’t find that estate">
          It may have been removed. Go back to Estates to pick another.
        </Banner>
      </>
    )
  }

  const eligible = members.filter((m) => (m.role === 'Estate manager' || m.role === 'Company admin') && m.status === 'active')

  const unitsNum = units.trim() === '' ? undefined : Number(units)
  const errors = {
    name: !name.trim() ? 'Enter the estate’s name.' : undefined,
    address: !address.trim() ? 'Enter the street address.' : undefined,
    city: !city.trim() ? 'Enter the city.' : undefined,
    units: unitsNum !== undefined && (!Number.isInteger(unitsNum) || unitsNum < 1) ? 'Enter a whole number, like 120. Leave blank if you’re not sure yet.' : undefined,
    email:
      mode !== 'invite'
        ? undefined
        : !inviteEmail.trim()
          ? 'Enter the manager’s email address.'
          : !/^\S+@\S+\.\S+$/.test(inviteEmail.trim())
            ? 'Enter a valid email address, like name@company.ng.'
            : undefined,
  }
  const shown = (k: keyof typeof errors) => (submitted ? errors[k] : undefined)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    if (Object.values(errors).some(Boolean)) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }
    // TODO(phase 5, slice A/B): saveEstateAction — create/update the estate, and when inviting a
    // manager by email, create the Invitation row, in one transaction.
    saveEstate(estateId, {
      name,
      address,
      city,
      units: unitsNum,
      manager: mode === 'invite' ? { kind: 'invite', email: inviteEmail } : memberId ? { kind: 'member', memberId } : { kind: 'none' },
    })
    toast(
      mode === 'invite'
        ? { tone: 'success', title: editing ? 'Estate saved' : 'Estate registered', description: `Invite sent to ${inviteEmail.trim()} to manage ${name.trim()}.` }
        : { tone: 'success', title: editing ? 'Estate saved' : 'Estate registered', description: name.trim() },
    )
    router.push(estatesHref)
  }

  const off = estate?.status === 'deactivated'

  return (
    <>
      <header className="mb-8">
        <Link href={estatesHref} className="-ml-1 mb-3 inline-flex items-center gap-0.5 rounded-sm text-sm font-medium text-ink-2 transition-colors hover:text-ink">
          <ChevronLeft className="size-4" aria-hidden />
          Estates
        </Link>
        <h1 className="type-h1 text-ink">{editing ? estate!.name : 'Register estate'}</h1>
        <p className="mt-1.5 max-w-xl text-[15px] text-ink-2">
          {editing ? 'Update the estate’s details and who manages it.' : 'Add the estate’s details. You can invite residents and guards afterwards.'}
        </p>
      </header>

      <div className="flex max-w-[680px] flex-col gap-6">
        {off && (
          <Banner tone="info" title="This estate is deactivated">
            Residents and guards can’t use it, and passes won’t work at the gate. Reactivate it below to switch it back on.
          </Banner>
        )}
        <form ref={formRef} onSubmit={onSubmit} noValidate>
          <section className="rounded-card border border-line bg-surface">
            <div className="flex flex-col gap-5 p-6">
              <h2 className="type-h3">Estate details</h2>
              <Field label="Estate name" name="name" autoFocus={!editing} placeholder="Palmgrove Estate" value={name} onChange={(e) => setName(e.target.value)} error={shown('name')} />
              <Field
                label="Street address"
                name="address"
                autoComplete="street-address"
                placeholder="14 Palmgrove Close, Lekki Phase 1"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                error={shown('address')}
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="City" name="city" placeholder="Lagos" value={city} onChange={(e) => setCity(e.target.value)} error={shown('city')} />
                <Field
                  label="Number of units (optional)"
                  name="units"
                  inputMode="numeric"
                  placeholder="120"
                  hint="Flats or houses. You can add this later."
                  value={units}
                  onChange={(e) => setUnits(e.target.value.replace(/[^\d]/g, ''))}
                  error={shown('units')}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-line p-6">
              <div>
                <h2 className="type-h3">Estate manager</h2>
                <p className="mt-0.5 text-sm text-ink-2">The person who approves residents and looks after day-to-day access.</p>
              </div>
              <SegmentedControl
                label="Estate manager source"
                value={mode}
                onChange={setMode}
                options={[
                  { value: 'member', label: 'Existing member' },
                  { value: 'invite', label: 'Invite by email' },
                ]}
              />
              {mode === 'member' ? (
                <Select
                  label="Manager"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  hint={eligible.length ? 'You can assign a manager later.' : 'No eligible members yet. Invite someone by email instead.'}
                >
                  <option value="">No manager yet</option>
                  {eligible.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} · {m.role}
                    </option>
                  ))}
                </Select>
              ) : (
                <Field
                  label="Manager’s email"
                  type="email"
                  name="manager-email"
                  inputMode="email"
                  placeholder="name@company.ng"
                  hint="We’ll email them an invite to manage this estate."
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  error={shown('email')}
                />
              )}
            </div>

            <div className="flex items-center gap-3 border-t border-line px-6 py-4">
              <Button type="submit" variant="filled">
                Save estate
              </Button>
              <Button variant="ghost" onClick={() => router.push(estatesHref)}>
                Cancel
              </Button>
            </div>
          </section>
        </form>

        {editing && estate && (
          <section className="rounded-card border border-line bg-surface">
            <div className="flex items-center justify-between gap-6 p-6">
              <div>
                <h2 className="type-h3">{off ? 'Reactivate this estate' : 'Deactivate this estate'}</h2>
                <p className="mt-0.5 max-w-md text-sm text-ink-2">
                  {off
                    ? 'Switch the estate back on so residents can issue passes and guards can scan them.'
                    : 'Switch the estate off without deleting anything. You can reactivate it at any time.'}
                </p>
              </div>
              {off ? (
                <Button
                  variant="ghost"
                  icon={<Power />}
                  onClick={() => {
                    setEstateStatus(estate.id, 'active')
                    toast({ tone: 'success', title: 'Estate reactivated', description: estate.name })
                  }}
                >
                  Reactivate estate
                </Button>
              ) : (
                <Button variant="destructive-ghost" onClick={() => setConfirmOff(true)}>
                  Deactivate estate
                </Button>
              )}
            </div>
          </section>
        )}
      </div>

      {estate && (
        <Modal
          open={confirmOff}
          onClose={() => setConfirmOff(false)}
          title={`Deactivate ${estate.name}?`}
          description="Residents and guards lose access straight away and active visitor passes stop working at the gate. Records are kept, and you can reactivate the estate at any time."
          footer={
            <>
              <Button variant="ghost" onClick={() => setConfirmOff(false)}>
                Keep estate active
              </Button>
              <Button
                variant="destructive-ghost"
                onClick={() => {
                  setEstateStatus(estate.id, 'deactivated')
                  setConfirmOff(false)
                  toast({ tone: 'neutral', title: 'Estate deactivated', description: estate.name })
                  router.push(estatesHref)
                }}
              >
                Deactivate estate
              </Button>
            </>
          }
        />
      )}
    </>
  )
}
