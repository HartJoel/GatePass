'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Check, ChevronLeft, ChevronRight, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export type Density = 'comfortable' | 'compact'

export interface Column<T> {
  key: string
  header: string
  width?: string
  align?: 'left' | 'right'
  cell: (row: T) => ReactNode
  skeleton?: string // tailwind width for the skeleton bar
}

export function Checkbox({
  checked,
  indeterminate,
  onChange,
  label,
}: {
  checked: boolean
  indeterminate?: boolean
  onChange: () => void
  label: string
}) {
  const on = checked || indeterminate
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-label={label}
      onClick={(e) => (e.stopPropagation(), onChange())}
      className={cn(
        'flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors duration-150 ease-calm',
        on ? 'border-ink bg-ink text-bg' : 'border-field bg-surface hover:border-ink-2',
      )}
    >
      {indeterminate ? <Minus className="size-3.5" strokeWidth={3} /> : checked ? <Check className="size-3.5" strokeWidth={3} /> : null}
    </button>
  )
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  density = 'comfortable',
  loading,
  pageSize = 6,
  selectable = true,
  empty,
  bulkActions,
  label,
  onRowClick,
}: {
  columns: Column<T>[]
  rows: T[]
  density?: Density
  loading?: boolean
  pageSize?: number
  selectable?: boolean
  empty: ReactNode
  bulkActions?: (count: number, clear: () => void) => ReactNode
  label: string
  /** Makes whole rows clickable (and keyboard-activatable). Put a real link in one cell too. */
  onRowClick?: (row: T) => void
}) {
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const pages = Math.max(1, Math.ceil(rows.length / pageSize))
  const safePage = Math.min(page, pages - 1)
  const visible = useMemo(() => rows.slice(safePage * pageSize, safePage * pageSize + pageSize), [rows, safePage, pageSize])
  const rowH = density === 'compact' ? 'h-10' : 'h-14'
  const cellPad = density === 'compact' ? 'py-1.5' : 'py-3'
  const allOnPage = visible.length > 0 && visible.every((r) => selected.has(r.id))
  const someOnPage = visible.some((r) => selected.has(r.id))

  const prevLen = useRef(rows.length)
  useEffect(() => {
    if (prevLen.current !== rows.length) (setPage(0), setSelected(new Set()))
    prevLen.current = rows.length
  }, [rows.length])

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  const toggleAll = () =>
    setSelected((s) => {
      const n = new Set(s)
      visible.forEach((r) => (allOnPage ? n.delete(r.id) : n.add(r.id)))
      return n
    })

  const from = rows.length === 0 ? 0 : safePage * pageSize + 1
  const to = Math.min(rows.length, (safePage + 1) * pageSize)
  const colCount = columns.length + (selectable ? 1 : 0)

  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface">
      {selected.size > 0 && bulkActions && (
        <div className="anim-fade flex items-center justify-between gap-3 border-b border-line bg-surface-2 px-4 py-2">
          <span className="tnum text-sm font-medium text-ink">{selected.size} selected</span>
          <div className="flex items-center gap-1">{bulkActions(selected.size, () => setSelected(new Set()))}</div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table aria-label={label} aria-busy={loading} className="w-full min-w-[720px] border-collapse text-left text-[15px]">
          <thead>
            <tr className="border-b border-line">
              {selectable && (
                <th className="w-12 pl-4 pr-0 py-3">
                  <Checkbox
                    label="Select all on this page"
                    checked={allOnPage}
                    indeterminate={!allOnPage && someOnPage}
                    onChange={toggleAll}
                  />
                </th>
              )}
              {columns.map((c) => (
                <th
                  key={c.key}
                  style={{ width: c.width }}
                  className={cn('type-caption px-4 py-3 text-ink-2', c.align === 'right' && 'text-right')}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: Math.min(pageSize, 5) }, (_, i) => (
                <tr key={i} className={cn('border-b border-line last:border-0', rowH)}>
                  {selectable && (
                    <td className="pl-4 pr-0">
                      <Skeleton className="size-[18px] rounded-[5px]" />
                    </td>
                  )}
                  {columns.map((c) => (
                    <td key={c.key} className={cn('px-4', cellPad)}>
                      <Skeleton className={cn('h-4', c.skeleton ?? 'w-28', c.align === 'right' && 'ml-auto')} />
                    </td>
                  ))}
                </tr>
              ))
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={colCount}>{empty}</td>
              </tr>
            ) : (
              visible.map((r) => {
                const isSel = selected.has(r.id)
                return (
                  <tr
                    key={r.id}
                    aria-selected={selectable ? isSel : undefined}
                    onClick={onRowClick ? () => onRowClick(r) : undefined}
                    className={cn(
                      onRowClick && 'cursor-pointer',
                      'border-b border-line transition-colors duration-150 ease-calm last:border-0 hover:bg-surface-2',
                      rowH,
                      isSel && 'bg-surface-2',
                    )}
                  >
                    {selectable && (
                      <td className="pl-4 pr-0">
                        <Checkbox label="Select row" checked={isSel} onChange={() => toggle(r.id)} />
                      </td>
                    )}
                    {columns.map((c) => (
                      <td key={c.key} className={cn('px-4 align-middle', cellPad, c.align === 'right' && 'text-right')}>
                        {c.cell(r)}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-2.5">
        <p className="tnum text-[13px] text-ink-2">
          {loading ? 'Loading…' : rows.length === 0 ? 'No results' : `Showing ${from}–${to} of ${rows.length}`}
        </p>
        <div className="flex items-center gap-1.5">
          <span className="tnum mr-1 text-[13px] text-ink-2">
            Page {safePage + 1} of {pages}
          </span>
          <Button className="!h-9 !w-9 !px-0" aria-label="Previous page" disabled={loading || safePage === 0} onClick={() => setPage(safePage - 1)}>
            <ChevronLeft />
          </Button>
          <Button className="!h-9 !w-9 !px-0" aria-label="Next page" disabled={loading || safePage >= pages - 1} onClick={() => setPage(safePage + 1)}>
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  )
}
