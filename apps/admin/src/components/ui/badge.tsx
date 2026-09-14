import { cn } from '@/lib/utils'

type BadgeVariant = 'success' | 'info' | 'warning' | 'danger' | 'default' | 'outline'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-[--color-success-bg] text-[--color-success] border-[--color-success-border]',
  info:    'bg-[--color-info-bg] text-[--color-info] border-[--color-info-border]',
  warning: 'bg-[--color-warning-bg] text-[--color-warning] border-[--color-warning-border]',
  danger:  'bg-[--color-danger-bg] text-[--color-danger] border-[--color-danger-border]',
  default: 'bg-[--color-surface-2] text-[--color-text-secondary] border-[--color-border-default]',
  outline: 'bg-transparent text-[--color-text-tertiary] border-[--color-border-default]',
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium leading-none whitespace-nowrap',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
