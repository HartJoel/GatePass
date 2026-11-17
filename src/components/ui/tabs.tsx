'use client'

import { useId, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface TabItem<T extends string> {
  id: T
  label: string
  count?: number
}

/**
 * Underline tabs. The active tab takes the accent underline; counts are quiet.
 * Pair each tab with a panel that has `id={tabPanelId(tabId)}`.
 */
export const tabPanelId = (id: string) => `tabpanel-${id}`

export function Tabs<T extends string>({
  items,
  active,
  onChange,
  label,
}: {
  items: TabItem<T>[]
  active: T
  onChange: (id: T) => void
  label: string
}) {
  const base = useId()
  const move = (dir: 1 | -1, i: number) => {
    const next = items[(i + dir + items.length) % items.length]
    onChange(next.id)
    document.getElementById(`${base}-${next.id}`)?.focus()
  }
  return (
    <div role="tablist" aria-label={label} className="flex gap-6 border-b border-line">
      {items.map((t, i) => {
        const on = t.id === active
        return (
          <button
            key={t.id}
            id={`${base}-${t.id}`}
            type="button"
            role="tab"
            aria-selected={on}
            aria-controls={tabPanelId(t.id)}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') (e.preventDefault(), move(1, i))
              if (e.key === 'ArrowLeft') (e.preventDefault(), move(-1, i))
            }}
            className={cn(
              '-mb-px flex h-11 items-center gap-2 border-b-2 text-[15px] transition-colors duration-150 ease-calm',
              on ? 'border-accent font-semibold text-ink' : 'border-transparent font-medium text-ink-2 hover:text-ink',
            )}
          >
            {t.label}
            {t.count !== undefined && (
              <span className={cn('tnum rounded-full px-2 py-0.5 text-xs font-semibold', on ? 'bg-accent-soft text-accent' : 'bg-surface-2 text-ink-2')}>
                {t.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export function TabPanel({ id, children }: { id: string; children: ReactNode }) {
  return (
    <div role="tabpanel" id={tabPanelId(id)} className="pt-6 outline-none">
      {children}
    </div>
  )
}

/** Two-to-three way switch inside a form (not navigation). */
export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
  label: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-control bg-surface-2 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
          className={cn(
            'h-9 flex-1 whitespace-nowrap rounded-[8px] px-3 text-sm transition-colors duration-150 ease-calm',
            o.value === value ? 'bg-surface font-semibold text-ink' : 'font-medium text-ink-2 hover:text-ink',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
