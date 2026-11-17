'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/providers/theme'

function useOverlay(open: boolean, onClose: () => void) {
  const panel = useRef<HTMLDivElement>(null)
  const close = useRef(onClose)
  useEffect(() => {
    close.current = onClose
  }, [onClose])
  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panel.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return close.current()
      if (e.key !== 'Tab' || !panel.current) return
      const f = panel.current.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')
      if (!f.length) return
      const first = f[0], last = f[f.length - 1]
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) (e.preventDefault(), last.focus())
      else if (!e.shiftKey && document.activeElement === last) (e.preventDefault(), first.focus())
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      prev?.focus()
    }
  }, [open])
  return panel
}

interface OverlayProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
}

/** Shadow is allowed here: modals and drawers are the only floating surfaces. */
export function Modal({ open, onClose, title, description, children, footer }: OverlayProps) {
  const theme = useTheme()
  const panel = useOverlay(open, onClose)
  if (!open) return null
  return createPortal(
    <div data-theme={theme} className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div className="anim-fade absolute inset-0 bg-scrim" onClick={onClose} aria-hidden />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="anim-rise relative flex max-h-[90vh] w-full max-w-md flex-col rounded-t-[14px] bg-surface text-ink shadow-overlay outline-none sm:rounded-card"
      >
        <div className="flex items-start justify-between gap-4 p-6 pb-2">
          <div>
            <h2 className="type-h2">{title}</h2>
            {description && <p className="mt-1.5 text-[15px] text-ink-2">{description}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="-m-2 rounded-control p-2 text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink">
            <X className="size-5" />
          </button>
        </div>
        {children && <div className="overflow-y-auto px-6 py-3">{children}</div>}
        {footer && <div className="flex flex-col-reverse gap-2 p-6 pt-4 sm:flex-row sm:justify-end">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

/** Right-side drawer; full-width sheet on phones. */
export function Drawer({ open, onClose, title, description, children, footer }: OverlayProps) {
  const theme = useTheme()
  const panel = useOverlay(open, onClose)
  if (!open) return null
  return createPortal(
    <div data-theme={theme} className="fixed inset-0 z-50">
      <div className="anim-fade absolute inset-0 bg-scrim" onClick={onClose} aria-hidden />
      <aside
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn('anim-slide absolute inset-y-0 right-0 flex w-full flex-col bg-surface text-ink shadow-overlay outline-none sm:max-w-[420px]')}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line p-6">
          <div>
            <h2 className="type-h2">{title}</h2>
            {description && <p className="mt-1.5 text-[15px] text-ink-2">{description}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="-m-2 rounded-control p-2 text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink">
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-line p-6">{footer}</div>}
      </aside>
    </div>,
    document.body,
  )
}
