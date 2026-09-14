'use client'

import { IconRuler, IconClock, IconGasStation } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import type { OptimiseFor } from '@routedesk/types'

interface OptimiseToggleProps {
  value: OptimiseFor
  onChange: (value: OptimiseFor) => void
  disabled?: boolean
}

const OPTIONS: {
  value: OptimiseFor
  label: string
  icon: React.ComponentType<{ size?: number; stroke?: number; className?: string }>
}[] = [
  { value: 'distance', label: 'Distance', icon: IconRuler },
  { value: 'time',     label: 'Time',     icon: IconClock },
  { value: 'fuel',     label: 'Fuel',     icon: IconGasStation },
]

export function OptimiseToggle({ value, onChange, disabled }: OptimiseToggleProps) {
  return (
    <div className="flex gap-1.5" role="radiogroup" aria-label="Optimise route for">
      {OPTIONS.map(opt => {
        const Icon    = opt.icon
        const active  = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-2 rounded-[--radius-md] border text-[12px] font-medium transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              active
                ? 'bg-[--color-brand] text-white border-[--color-brand]'
                : 'bg-white text-[--color-text-secondary] border-[--color-border-default] hover:bg-[--color-sky-50] hover:border-[--color-accent-border] hover:text-[--color-text-primary]'
            )}
          >
            <Icon size={13} stroke={active ? 2.5 : 1.5} aria-hidden />
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
