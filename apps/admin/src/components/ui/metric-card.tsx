import { cn } from '@/lib/utils'

interface MetricCardProps {
  label: string
  value: string | number
  sub?: string
  icon?: React.ComponentType<{ size?: number; stroke?: number; className?: string }>
  subVariant?: 'default' | 'success' | 'warning' | 'danger'
  className?: string
}

const subVariantClasses = {
  default: 'text-[--color-text-tertiary]',
  success: 'text-[--color-success]',
  warning: 'text-[--color-warning]',
  danger:  'text-[--color-danger]',
}

export function MetricCard({
  label, value, sub, icon: Icon, subVariant = 'default', className
}: MetricCardProps) {
  return (
    <div className={cn(
      'bg-[--color-sky-50] rounded-[--radius-md] p-4',
      'ring-1 ring-inset ring-[--color-accent-border]',
      className
    )}>
      <div className="flex items-center gap-1.5 mb-2">
        {Icon && <Icon size={13} stroke={1.5} className="text-[--color-accent]" aria-hidden />}
        <p className="text-[12px] text-[--color-text-tertiary] leading-none">{label}</p>
      </div>
      <p className="text-[24px] font-semibold text-[--color-text-primary] leading-none mb-1">
        {value}
      </p>
      {sub && (
        <p className={cn('text-[11px] leading-none', subVariantClasses[subVariant])}>
          {sub}
        </p>
      )}
    </div>
  )
}
