import { cn } from '@/lib/utils'
import type { TripStatus } from '@routedesk/types'

interface StatusPillProps {
  status: TripStatus | 'not-started'
}

const pillConfig: Record<string, { label: string; className: string }> = {
  'not-started': { label: 'Not started', className: 'bg-[--color-surface-2] text-[--color-text-tertiary] border-[--color-border-default]' },
  assigned:      { label: 'Assigned',    className: 'bg-[--color-info-bg] text-[--color-info] border-[--color-info-border]' },
  active:        { label: 'On route',    className: 'bg-[--color-success-bg] text-[--color-success] border-[--color-success-border]' },
  completed:     { label: 'Complete',    className: 'bg-[--color-surface-2] text-[--color-text-tertiary] border-[--color-border-default]' },
  archived:      { label: 'Archived',    className: 'bg-[--color-surface-2] text-[--color-text-tertiary] border-[--color-border-default]' },
}

export function StatusPill({ status }: StatusPillProps) {
  const config = pillConfig[status] ?? pillConfig['not-started']
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border leading-none',
      config.className
    )}>
      {config.label}
    </span>
  )
}
