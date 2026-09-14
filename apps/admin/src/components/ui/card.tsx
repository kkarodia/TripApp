import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'surface-pattern-panel rounded-[--radius-lg] border border-[--color-border-subtle]',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 px-5 py-3.5',
        'bg-[--color-sky-50] rounded-t-[--radius-lg] border-b border-[--color-accent-border]',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardTitle({ children, className }: CardProps) {
  return (
    <h2 className={cn('text-[13px] font-semibold text-[--color-text-primary]', className)}>
      {children}
    </h2>
  )
}

export function CardContent({ children, className }: CardProps) {
  return <div className={cn('px-5 py-4', className)}>{children}</div>
}
