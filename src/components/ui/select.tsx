import { useId, type SelectHTMLAttributes } from 'react'
import { AlertCircle, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  hint?: string
  error?: string
}

/** Native select in the Field frame: same height, border and focus ring. */
export function Select({ label, hint, error, className, disabled, children, ...rest }: SelectProps) {
  const id = useId()
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <div
        className={cn(
          'relative flex h-11 items-center rounded-control border bg-surface text-[15px] transition-colors duration-150 ease-calm',
          error ? 'border-danger' : 'border-field',
          !disabled && !error && 'hover:border-ink-2',
          !error && 'focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30',
          error && 'focus-within:ring-2 focus-within:ring-danger/30',
          disabled && 'border-line bg-surface-2',
        )}
      >
        <select
          id={id}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error || hint ? `${id}-msg` : undefined}
          className="h-full w-full cursor-pointer appearance-none truncate rounded-control bg-transparent pl-3 pr-10 text-ink outline-none disabled:cursor-not-allowed disabled:text-ink-3"
          {...rest}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 size-4 text-ink-2" aria-hidden />
      </div>
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
