import { useId, type TextareaHTMLAttributes } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  hint?: string
  error?: string
}

/** Multi-line sibling of Field: same frame, border and focus ring. */
export function Textarea({ label, hint, error, className, disabled, rows = 3, ...rest }: TextareaProps) {
  const id = useId()
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error || hint ? `${id}-msg` : undefined}
        className={cn(
          'resize-none rounded-control border bg-surface px-3 py-2.5 text-[15px] text-ink outline-none transition-colors duration-150 ease-calm placeholder:text-ink-3',
          error ? 'border-danger focus:ring-2 focus:ring-danger/30' : 'border-field hover:border-ink-2 focus:border-accent focus:ring-2 focus:ring-accent/30',
          disabled && 'border-line bg-surface-2',
        )}
        {...rest}
      />
      {error ? (
        <p id={`${id}-msg`} className="flex items-center gap-1.5 text-[13px] font-medium text-danger-fg">
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-msg`} className="text-[13px] text-ink-2">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
