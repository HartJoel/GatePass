const TZ = 'Africa/Lagos'

function parts(d: Date, opts: Intl.DateTimeFormatOptions) {
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: TZ, ...opts })
  const get = (type: string, p = fmt.formatToParts(d)) => p.find((x) => x.type === type)?.value ?? ''
  return { fmt, get }
}

/** "Tue 3 Nov, 2:30 PM" in Lagos time (WAT, UTC+1). Dates are stored and transported as UTC; this is UI-only. */
export function formatLagos(d: Date): string {
  const { fmt, get } = parts(d, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  const p = fmt.formatToParts(d)
  return `${get('weekday', p)} ${get('day', p)} ${get('month', p)}, ${get('hour', p)}:${get('minute', p)} ${get('dayPeriod', p).toUpperCase()}`
}

export function formatLagosTime(d: Date): string {
  const { fmt, get } = parts(d, { hour: 'numeric', minute: '2-digit', hour12: true })
  const p = fmt.formatToParts(d)
  return `${get('hour', p)}:${get('minute', p)} ${get('dayPeriod', p).toUpperCase()}`
}

function dayKey(d: Date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d)
}

/** "Tue 3 Nov, 2:30 PM – 6:30 PM" or, across days, two full stamps. */
export function formatWindow(start: Date, end: Date): string {
  return dayKey(start) === dayKey(end)
    ? `${formatLagos(start)} – ${formatLagosTime(end)}`
    : `${formatLagos(start)} – ${formatLagos(end)}`
}

/** Compact remaining time: "2d 4h", "1h 24m", "12m", "45s". */
export function formatRemaining(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000))
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m`
  return `${s}s`
}

/** "12 Mar 2025" in Lagos time — used where a precise day matters more than relative time. */
export function formatDate(d: Date): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: TZ, day: 'numeric', month: 'short', year: 'numeric' }).format(d)
}

export function formatAgo(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000))
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (d > 0) return `${d}d ago`
  if (h > 0) return `${h}h ago`
  if (m > 0) return `${m}m ago`
  return 'just now'
}
