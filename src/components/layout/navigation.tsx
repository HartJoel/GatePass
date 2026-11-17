'use client'

import type { LucideIcon } from 'lucide-react'
import { Bell, ChevronsUpDown, Search } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface NavItem {
  id: string
  label: string
  icon: LucideIcon
}

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 24 24" className="size-6 text-ink" fill="none" aria-hidden>
        <path d="M4 20V10a8 8 0 0 1 16 0v10" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
        <path d="M9 20v-8a3 3 0 0 1 6 0v8" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
      </svg>
      <span className="text-[17px] font-semibold tracking-tight text-ink">GatePass</span>
    </div>
  )
}

/** Desktop left sidebar. Active item = the accent (soft tint + accent text). */
export function Sidebar({
  items,
  active,
  onSelect,
  tenant,
}: {
  items: NavItem[]
  active: string
  onSelect: (id: string) => void
  /** Estate switcher label. Omit for company-level areas, which have no tenant switcher. */
  tenant?: string
}) {
  return (
    <nav aria-label="Primary" className="flex w-60 shrink-0 flex-col gap-6 border-r border-line bg-surface px-3 py-5">
      <Logo className="px-3" />
      {tenant && (
        <button
          type="button"
          className="flex items-center justify-between gap-2 rounded-control px-3 py-2 text-left transition-colors hover:bg-surface-2"
        >
          <span className="min-w-0 leading-tight">
            <span className="type-caption block text-ink-2">Estate</span>
            <span className="block text-sm font-semibold text-ink">{tenant}</span>
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-ink-2" aria-hidden />
        </button>
      )}
      <ul className="flex flex-col gap-0.5">
        {items.map((it) => {
          const on = it.id === active
          return (
            <li key={it.id}>
              <button
                type="button"
                aria-current={on ? 'page' : undefined}
                onClick={() => onSelect(it.id)}
                className={cn(
                  'flex h-10 w-full items-center gap-3 rounded-control px-3 text-[15px] transition-colors duration-150 ease-calm',
                  on ? 'bg-accent-soft font-semibold text-accent' : 'font-medium text-ink-2 hover:bg-surface-2 hover:text-ink',
                )}
              >
                <it.icon className="size-[18px]" aria-hidden />
                {it.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export function Topbar({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-line bg-surface px-6">
      <h1 className="type-h3 mr-auto">{title}</h1>
      <label className="relative hidden md:block">
        <span className="sr-only">Search</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
        <input
          placeholder="Search visitors, units, codes"
          className="h-10 w-72 rounded-control bg-surface-2 pl-9 pr-3 text-sm text-ink outline-none transition-shadow placeholder:text-ink-3 focus:ring-2 focus:ring-accent/40"
        />
      </label>
      <button type="button" aria-label="Notifications" className="rounded-control p-2.5 text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink">
        <Bell className="size-5" />
      </button>
      {action}
      <span className="flex size-9 items-center justify-center rounded-full bg-surface-2 text-[13px] font-semibold text-ink" aria-label="Signed in as Kemi Adebayo">
        KA
      </span>
    </header>
  )
}

/** Mobile bottom tab bar: 64px tall, 48px+ touch targets, labels always visible. */
export function BottomTabs({ items, active, onSelect }: { items: NavItem[]; active: string; onSelect: (id: string) => void }) {
  return (
    <nav aria-label="Primary" className="flex h-16 shrink-0 border-t border-line bg-surface pb-1">
      {items.map((it) => {
        const on = it.id === active
        return (
          <button
            key={it.id}
            type="button"
            aria-current={on ? 'page' : undefined}
            onClick={() => onSelect(it.id)}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors duration-150 ease-calm',
              on ? 'font-semibold text-accent' : 'font-medium text-ink-2',
            )}
          >
            <it.icon className="size-6" strokeWidth={on ? 2.25 : 1.75} aria-hidden />
            {it.label}
          </button>
        )
      })}
    </nav>
  )
}
