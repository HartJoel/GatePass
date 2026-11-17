'use client'

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, Ban, CheckCircle2, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/providers/theme'

type ToastTone = 'success' | 'danger' | 'warning' | 'neutral'
export interface ToastData {
  tone: ToastTone
  title: string
  description?: string
}

const icons = { success: CheckCircle2, danger: Ban, warning: AlertTriangle, neutral: Info }
const iconColor: Record<ToastTone, string> = {
  success: 'text-success',
  danger: 'text-danger',
  warning: 'text-warning',
  neutral: 'text-neutral',
}

/** No shadow: toasts sit on a strong hairline instead. */
export function Toast({ tone, title, description, onClose, className }: ToastData & { onClose?: () => void; className?: string }) {
  const Icon = icons[tone]
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn('anim-rise flex w-full max-w-sm items-start gap-3 rounded-card border border-field/60 bg-surface p-4', className)}
    >
      <Icon className={cn('mt-0.5 size-5 shrink-0', iconColor[tone])} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-ink">{title}</p>
        {description && <p className="mt-0.5 text-sm text-ink-2">{description}</p>}
      </div>
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Dismiss" className="-m-1 rounded-md p-1 text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink">
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}

const ToastCtx = createContext<(t: ToastData) => void>(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<(ToastData & { id: number })[]>([])
  const seq = useRef(0)
  const theme = useTheme()
  const dismiss = useCallback((id: number) => setItems((l) => l.filter((x) => x.id !== id)), [])
  const push = useCallback(
    (t: ToastData) => {
      const id = ++seq.current
      setItems((l) => [...l.slice(-2), { ...t, id }])
      window.setTimeout(() => dismiss(id), 5000)
    },
    [dismiss],
  )
  return (
    <ToastCtx.Provider value={push}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <div data-theme={theme} className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6">
            {items.map((t) => (
              <div key={t.id} className="pointer-events-auto w-full max-w-sm">
                <Toast {...t} onClose={() => dismiss(t.id)} />
              </div>
            ))}
          </div>,
          document.body,
        )}
    </ToastCtx.Provider>
  )
}
