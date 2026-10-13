import { cn } from '@/lib/utils'

export default function UserAvatar({ name = '', className }) {
  const initials =
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('') || '?'

  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary',
        className,
      )}
    >
      {initials}
    </span>
  )
}