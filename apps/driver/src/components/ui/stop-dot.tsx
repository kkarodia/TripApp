import { cn } from '@/lib/utils'
import { IconCheck } from '@tabler/icons-react'

type DotVariant = 'done' | 'active' | 'pending' | 'error'

interface StopDotProps {
  variant:   DotVariant
  sequence?: number
  size?:     'sm' | 'md'
}

const variantClasses: Record<DotVariant, string> = {
  done:    'bg-[--color-success-bg] text-[--color-success] border border-[--color-success-border]',
  active:  'bg-[--color-brand] text-white border border-[--color-brand]',
  pending: 'bg-white text-[--color-text-tertiary] border border-[--color-border-default]',
  error:   'bg-[--color-danger-bg] text-[--color-danger] border border-[--color-danger-border]',
}

const sizeClasses = {
  sm: 'w-5 h-5 text-[9px]',
  md: 'w-6 h-6 text-[10px]',
}

export function StopDot({ variant, sequence, size = 'md' }: StopDotProps) {
  return (
    <div className={cn(
      'rounded-full flex items-center justify-center flex-shrink-0 font-semibold',
      variantClasses[variant],
      sizeClasses[size]
    )}>
      {variant === 'done'
        ? <IconCheck size={size === 'sm' ? 9 : 11} stroke={2.5} aria-hidden />
        : <span>{sequence}</span>
      }
    </div>
  )
}
