'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Home, UserPlus, X } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Field } from '@/components/ui/field'
import { Modal } from '@/components/ui/overlay'
import { Select } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { assignResidentAction, createUnitAction, unassignResidentAction } from '@/server/actions/unit.actions'
import type { ResidentOption, UnitRow } from '@/server/services/unit.service'

export function UnitsView({
  companyId,
  estateId,
  estateName,
  units,
  residents,
}: {
  companyId: string
  estateId: string
  estateName: string
  units: UnitRow[]
  residents: ResidentOption[]
}) {
  const router = useRouter()
  const [adding, setAdding] = useState(false)
  const [assigningUnit, setAssigningUnit] = useState<UnitRow | null>(null)

  return (
    <>
      <header className="mb-8">
        <Link
          href={`/companies/${companyId}/estates/${estateId}`}
          className="-ml-1 mb-3 inline-flex items-center gap-0.5 rounded-sm text-sm font-medium text-ink-2 transition-colors hover:text-ink"
        >
          <ChevronLeft className="size-4" aria-hidden />
          {estateName}
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div className="min-w-0">
            <h1 className="type-h1 text-ink">Units</h1>
            <p className="mt-1.5 max-w-xl text-[15px] text-ink-2">Residential units at {estateName}, and who lives in each one.</p>
          </div>
          <Button variant="filled" icon={<Home />} onClick={() => setAdding(true)}>
            Add unit
          </Button>
        </div>
      </header>

      {units.length === 0 ? (
        <EmptyState icon={Home} message="No units yet. Add the first one." />
      ) : (
        <div className="flex flex-col gap-3">
          {units.map((unit) => (
            <UnitCard
              key={unit.id}
              unit={unit}
              companyId={companyId}
              estateId={estateId}
              onAssign={() => setAssigningUnit(unit)}
            />
          ))}
        </div>
      )}

      <AddUnitModal open={adding} onClose={() => setAdding(false)} companyId={companyId} estateId={estateId} />
      {assigningUnit && (
        <AssignResidentModal
          unit={assigningUnit}
          residents={residents}
          companyId={companyId}
          estateId={estateId}
          onClose={() => {
            setAssigningUnit(null)
            router.refresh()
          }}
        />
      )}
    </>
  )
}

function UnitCard({
  unit,
  companyId,
  estateId,
  onAssign,
}: {
  unit: UnitRow
  companyId: string
  estateId: string
  onAssign: () => void
}) {
  const router = useRouter()
  const toast = useToast()
  const [removingId, setRemovingId] = useState<string | null>(null)

  async function remove(resident: ResidentOption) {
    setRemovingId(resident.membershipId)
    const result = await unassignResidentAction(estateId, companyId, unit.id, resident.membershipId)
    setRemovingId(null)
    if (result.error) {
      toast({ tone: 'danger', title: 'Couldn’t remove resident', description: result.error.message })
      return
    }
    toast({ tone: 'neutral', title: 'Resident removed', description: `${resident.name} · ${unit.label}` })
    router.refresh()
  }

  return (
    <section className="rounded-card border border-line bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <h3 className="type-h3 text-ink">{unit.label}</h3>
        <Button variant="ghost" className="!h-9 !px-3 !text-sm" icon={<UserPlus className="size-4" />} onClick={onAssign}>
          Assign resident
        </Button>
      </div>
      {unit.residents.length === 0 ? (
        <p className="mt-3 text-sm text-ink-2">No residents assigned yet.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {unit.residents.map((r) => (
            <li key={r.membershipId} className="flex items-center gap-3">
              <Avatar name={r.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{r.name}</p>
                <p className="truncate text-xs text-ink-2">{r.email}</p>
              </div>
              <button
                type="button"
                aria-label={`Remove ${r.name} from ${unit.label}`}
                disabled={removingId === r.membershipId}
                onClick={() => remove(r)}
                className="rounded-control p-1.5 text-ink-2 transition-colors hover:bg-surface-2 hover:text-danger disabled:opacity-45"
              >
                <X className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function AddUnitModal({ open, onClose, companyId, estateId }: { open: boolean; onClose: () => void; companyId: string; estateId: string }) {
  const router = useRouter()
  const toast = useToast()
  const [label, setLabel] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const error = !label.trim() ? 'Enter a unit label, like Flat 12B.' : undefined

  async function submit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    if (error) return
    setServerError(null)
    setBusy(true)
    const result = await createUnitAction(estateId, companyId, { label })
    setBusy(false)
    if (result.error) {
      setServerError(result.error.message)
      return
    }
    toast({ tone: 'success', title: 'Unit added', description: label.trim() })
    setLabel('')
    setSubmitted(false)
    onClose()
    router.refresh()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add a unit"
      description="Residents are assigned to a unit after it's added."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="filled" type="submit" form="add-unit-form" disabled={busy}>
            {busy ? 'Adding…' : 'Add unit'}
          </Button>
        </>
      }
    >
      <form id="add-unit-form" onSubmit={submit} noValidate className="flex flex-col gap-4 pb-2">
        {serverError && <p className="rounded-control bg-danger-bg px-3.5 py-3 text-sm font-medium text-danger-fg">{serverError}</p>}
        <Field label="Unit label" autoFocus placeholder="Flat 12B" value={label} onChange={(e) => setLabel(e.target.value)} error={submitted ? error : undefined} />
      </form>
    </Modal>
  )
}

function AssignResidentModal({
  unit,
  residents,
  companyId,
  estateId,
  onClose,
}: {
  unit: UnitRow
  residents: ResidentOption[]
  companyId: string
  estateId: string
  onClose: () => void
}) {
  const toast = useToast()
  const [membershipId, setMembershipId] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const assignedIds = new Set(unit.residents.map((r) => r.membershipId))
  const available = residents.filter((r) => !assignedIds.has(r.membershipId))
  const error = !membershipId ? (available.length ? 'Choose a resident.' : 'Every resident of this estate is already assigned here.') : undefined

  async function submit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    if (error) return
    setServerError(null)
    setBusy(true)
    const result = await assignResidentAction(estateId, companyId, unit.id, membershipId)
    setBusy(false)
    if (result.error) {
      setServerError(result.error.message)
      return
    }
    const resident = residents.find((r) => r.membershipId === membershipId)
    toast({ tone: 'success', title: 'Resident assigned', description: resident ? `${resident.name} · ${unit.label}` : unit.label })
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Assign a resident to ${unit.label}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="filled" type="submit" form="assign-resident-form" disabled={busy}>
            {busy ? 'Assigning…' : 'Assign'}
          </Button>
        </>
      }
    >
      <form id="assign-resident-form" onSubmit={submit} noValidate className="flex flex-col gap-4 pb-2">
        {serverError && <p className="rounded-control bg-danger-bg px-3.5 py-3 text-sm font-medium text-danger-fg">{serverError}</p>}
        <Select label="Resident" value={membershipId} onChange={(e) => setMembershipId(e.target.value)} error={submitted ? error : undefined}>
          <option value="">Choose a resident</option>
          {available.map((r) => (
            <option key={r.membershipId} value={r.membershipId}>
              {r.name} — {r.email}
            </option>
          ))}
        </Select>
      </form>
    </Modal>
  )
}
