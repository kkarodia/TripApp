import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'navy' | 'unread'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-[--color-card-muted] text-[--color-text-tertiary]',
  success: 'bg-[--color-success-bg] text-[--color-success]',
  warning: 'bg-[--color-warning-bg] text-[--color-warning]',
  navy:    'bg-[--color-navy] text-white',
  unread:  'bg-[--color-navy] text-white',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold leading-none',
        variantClasses[variant],
        className
      )}
      style={{ fontFamily: 'var(--font-label)' }}
    >
      {children}
    </span>
  )
}
