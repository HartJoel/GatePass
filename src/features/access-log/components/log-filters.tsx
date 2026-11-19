'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Select } from '@/components/ui/select'

export function LogFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const decision = searchParams.get('decision') ?? ''
  const timeWindow = searchParams.get('window') ?? '24h'

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(params.size ? `${pathname}?${params.toString()}` : pathname)
  }

  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <Select label="Time range" value={timeWindow} onChange={(e) => update('window', e.target.value)} className="w-auto">
        <option value="24h">Last 24 hours</option>
        <option value="7d">Last 7 days</option>
        <option value="all">All time</option>
      </Select>
      <Select label="Outcome" value={decision} onChange={(e) => update('decision', e.target.value)} className="w-auto">
        <option value="">All outcomes</option>
        <option value="APPROVED">Approved</option>
        <option value="REJECTED">Rejected</option>
      </Select>
    </div>
  )
}
