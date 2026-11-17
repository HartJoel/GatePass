import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  label: string
  hint?: string
  error?: string
  prefix?: ReactNode
  /** Trailing control inside the input frame, e.g. a show-password toggle. */
  suffix?: ReactNode
  /** Link or action aligned to the right of the label. */
  labelAction?: ReactNode
  size?: 'default' | 'large'
  /** Render the focus ring statically (for specimens). */
  forceFocus?: boolean
}

export function Field({ label, hint, error, prefix, suffix, labelAction, size = 'default', forceFocus, className, disabled, ...rest }: FieldProps) {
  const id = useId()
  const large = size === 'large'
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className={cn('font-medium text-ink', large ? 'text-lg' : 'text-sm')}>
          {label}
        </label>
        {labelAction}
      </div>
      <div
        className={cn(
          'flex items-center overflow-hidden rounded-control border bg-surface transition-colors duration-150 ease-calm',
          large ? 'h-16 text-2xl' : 'h-11 text-[15px]',
          error ? 'border-danger' : 'border-field',
          !disabled && !error && 'hover:border-ink-2',
          !error && 'focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30',
          error && 'focus-within:ring-2 focus-within:ring-danger/30',
          forceFocus && 'border-accent ring-2 ring-accent/30',
          disabled && 'border-line bg-surface-2',
        )}
      >
        {prefix && (
          <span className={cn('flex h-full items-center border-r border-line bg-surface-2 text-ink-2', large ? 'px-4' : 'px-3')}>
            {prefix}
          </span>
        )}
        <input
          id={id}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error || hint ? `${id}-msg` : undefined}
          className={cn(
            'h-full min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-ink-3 disabled:cursor-not-allowed disabled:text-ink-3',
            large ? 'px-4' : 'px-3',
          )}
          {...rest}
        />
        {suffix && <span className="flex h-full items-center pr-1">{suffix}</span>}
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
