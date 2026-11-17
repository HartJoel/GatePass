'use client'

import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { useToast } from '@/components/ui/toast'
import type { Company } from '@/features/companies/demo-data'
import { useCompanyData } from '@/features/companies/components/company-data-provider'

export function CompanySettingsForm() {
  const { company, updateCompany } = useCompanyData()
  const toast = useToast()
  const [form, setForm] = useState<Company>(company)
  const [submitted, setSubmitted] = useState(false)
  const set = (k: keyof Company) => (e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const dirty = (Object.keys(form) as (keyof Company)[]).some((k) => form[k] !== company[k])

  const errors = {
    name: !form.name.trim() ? 'Enter your company’s name.' : undefined,
    email: !form.email.trim() ? 'Enter a contact email.' : !/^\S+@\S+\.\S+$/.test(form.email.trim()) ? 'Enter a valid email address, like name@company.ng.' : undefined,
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)
    if (errors.name || errors.email) {
      const f = e.currentTarget
      requestAnimationFrame(() => f.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }
    const clean = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()])) as unknown as Company
    updateCompany(clean)
    setForm(clean)
    setSubmitted(false)
    toast({ tone: 'success', title: 'Changes saved', description: 'Your company information is up to date.' })
  }

  return (
    <>
      <header className="mb-8">
        <h1 className="type-h1 text-ink">Settings</h1>
        <p className="mt-1.5 max-w-xl text-[15px] text-ink-2">Company information used across GatePass, including in emails to your residents.</p>
      </header>
      <form onSubmit={onSubmit} noValidate className="max-w-[680px]">
        <section className="rounded-card border border-line bg-surface">
          <div className="border-b border-line px-6 py-4">
            <h2 className="type-h3">Company information</h2>
          </div>
          <div className="flex flex-col gap-5 p-6">
            <Field label="Company name" name="company" autoComplete="organization" value={form.name} onChange={set('name')} error={submitted ? errors.name : undefined} />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Contact email"
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                value={form.email}
                onChange={set('email')}
                error={submitted ? errors.email : undefined}
              />
              <Field label="Phone" prefix="+234" name="phone" autoComplete="tel-national" inputMode="tel" value={form.phone} onChange={set('phone')} />
            </div>
            <Field label="CAC registration number (optional)" name="rc" placeholder="RC 1234567" value={form.rcNumber} onChange={set('rcNumber')} />
            <Field label="Office address" name="address" autoComplete="street-address" value={form.address} onChange={set('address')} />
            <Field className="sm:w-1/2" label="City" name="city" value={form.city} onChange={set('city')} />
          </div>
          <div className="flex items-center gap-4 border-t border-line px-6 py-4">
            <Button type="submit" variant="filled" disabled={!dirty}>
              Save changes
            </Button>
            {!dirty && <span className="text-sm text-ink-2">No changes to save</span>}
          </div>
        </section>
      </form>
    </>
  )
}
