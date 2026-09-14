'use client'

import { OptimiseToggle } from './optimise-toggle'
import { cn } from '@/lib/utils'
import type { OptimiseFor } from '@routedesk/types'
import { MOCK_DRIVERS } from '@/lib/mock-data'
import { DEPOTS } from '@/lib/durban-seed'

interface ConfigBarProps {
  warehouse: string
  onWarehouseChange: (v: string) => void
  driverId: string
  onDriverChange: (v: string) => void
  tripType: 'round-trip' | 'one-way'
  onTripTypeChange: (v: 'round-trip' | 'one-way') => void
  optimiseFor: OptimiseFor
  onOptimiseChange: (v: OptimiseFor) => void
  disabled?: boolean
}

const WAREHOUSES = Object.values(DEPOTS).map(d => ({ id: d.id, name: d.name }))

const selectClass = cn(
  'w-full px-3 py-2 text-[12px] rounded-[--radius-md] border border-[--color-border-default]',
  'bg-white text-[--color-text-primary]',
  'focus:outline-none focus:ring-2 focus:ring-[--color-brand] focus:ring-offset-1',
  'disabled:opacity-50 disabled:cursor-not-allowed'
)

export function ConfigBar({
  warehouse, onWarehouseChange,
  driverId, onDriverChange,
  tripType, onTripTypeChange,
  optimiseFor, onOptimiseChange,
  disabled,
}: ConfigBarProps) {
  return (
    <div className="grid grid-cols-1 gap-3 px-4 py-3 sm:grid-cols-2 xl:grid-cols-4 bg-[--color-surface-1] border-b border-[--color-border-subtle] items-end flex-shrink-0">

      {/* Warehouse */}
      <div>
        <label className="block text-[10px] font-medium text-[--color-text-tertiary] uppercase tracking-[0.06em] mb-1.5">
          Warehouse / start point
        </label>
        <select
          value={warehouse}
          onChange={e => onWarehouseChange(e.target.value)}
          disabled={disabled}
          className={selectClass}
        >
          {WAREHOUSES.map(w => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>

      {/* Driver */}
      <div>
        <label className="block text-[10px] font-medium text-[--color-text-tertiary] uppercase tracking-[0.06em] mb-1.5">
          Driver <span className="normal-case tracking-normal opacity-70">(optional)</span>
        </label>
        <select
          value={driverId}
          onChange={e => onDriverChange(e.target.value)}
          disabled={disabled}
          className={selectClass}
        >
          <option value="">Assign later</option>
          {MOCK_DRIVERS.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      {/* Trip type */}
      <div>
        <label className="block text-[10px] font-medium text-[--color-text-tertiary] uppercase tracking-[0.06em] mb-1.5">
          Trip type
        </label>
        <select
          value={tripType}
          onChange={e => onTripTypeChange(e.target.value as 'round-trip' | 'one-way')}
          disabled={disabled}
          className={selectClass}
        >
          <option value="round-trip">Round-trip (return to warehouse)</option>
          <option value="one-way">One-way (end at last stop)</option>
        </select>
      </div>

      {/* Optimise toggle */}
      <div>
        <label className="block text-[10px] font-medium text-[--color-text-tertiary] uppercase tracking-[0.06em] mb-1.5">
          Optimise for
        </label>
        <OptimiseToggle
          value={optimiseFor}
          onChange={onOptimiseChange}
          disabled={disabled}
        />
      </div>

    </div>
  )
}
