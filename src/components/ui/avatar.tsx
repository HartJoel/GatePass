import { cn } from '@/lib/utils'

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')

/** Neutral initials disc. Deliberately uncoloured: colour is reserved for status. */
export function Avatar({ name, size = 'default', className }: { name: string; size?: 'sm' | 'default'; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-surface-2 font-semibold text-ink-2',
        size === 'sm' ? 'size-6 text-[10px]' : 'size-9 text-[13px]',
        className,
      )}
    >
      {initials(name)}
    </span>
  )
}
