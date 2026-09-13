'use client'

import { useState } from 'react'
import { IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui'
import { StopRow } from './stop-row'
import { cn } from '@/lib/utils'
import type { Stop, Trip } from '@routedesk/types'

interface StopsPanelProps {
  trip: Partial<Trip> & { stops: Stop[] }
  onAddStop: (address: string) => void
  onDeleteStop: (stopId: string) => void
  onEditStop: (stop: Stop) => void
  onCalculate: () => void
  calculated: boolean
  calculating: boolean
  disabled?: boolean
}

export function StopsPanel({
  trip,
  onAddStop,
  onDeleteStop,
  onEditStop,
  onCalculate,
  calculated,
  calculating,
  disabled,
}: StopsPanelProps) {
  const [newStop, setNewStop] = useState('')

  const geocodeFails  = trip.stops.filter(s => s.geocodeFailed).length
  const totalStops    = trip.stops.length
  const warehouseStop: Stop = {
    id: 'dep',
    tripId: '',
    sequence: 0,
    clientName: trip.warehouseName ?? 'Warehouse',
    address: trip.warehouseAddress ?? '',
    latitude: null,
    longitude: null,
    geocodeFailed: false,
    roadType: 'unknown',
    distanceKm: null,
    estimatedMinutes: null,
    status: 'pending',
    arrivedAt: null,
    orders: null,
    createdAt: '',
  }

  function handleAdd() {
    const val = newStop.trim()
    if (!val) return
    onAddStop(val)
    setNewStop('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div className="flex flex-col h-full">

      {/* ── Panel header ───────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[--color-border-subtle] flex-shrink-0">
        <div>
          <p className="text-[13px] font-semibold text-[--color-text-primary]">
            Delivery stops
          </p>
          <p className="text-[11px] text-[--color-text-tertiary] mt-0.5">
            {totalStops} stop{totalStops !== 1 ? 's' : ''}
            {geocodeFails > 0 && (
              <span className="text-[--color-danger] font-medium ml-1.5">
                · {geocodeFails} geocode issue{geocodeFails !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* ── Stop list ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {/* Departure */}
        <StopRow stop={warehouseStop} index={0} isDep disabled={disabled} />

        {/* Delivery stops */}
        {trip.stops.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-[13px] text-[--color-text-tertiary]">No stops added yet</p>
            <p className="text-[11px] text-[--color-text-tertiary] mt-1">
              Add a stop below or import from the database
            </p>
          </div>
        ) : (
          trip.stops.map((stop, i) => (
            <StopRow
              key={stop.id}
              stop={stop}
              index={i + 1}
              onEdit={onEditStop}
              onDelete={onDeleteStop}
              disabled={disabled}
            />
          ))
        )}

        {/* Return row - only shown after calculation on round-trips */}
        {calculated && trip.tripType === 'round-trip' && (
          <StopRow stop={warehouseStop} index={0} isRtn disabled={disabled} />
        )}
      </div>

      {/* ── Add stop input ─────────────────────────────────────── */}
      <div className="px-3 py-2.5 border-t border-[--color-border-subtle] flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={newStop}
            onChange={e => setNewStop(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Client name or address…"
            disabled={disabled}
            className={cn(
              'flex-1 px-3 py-2 text-[13px] rounded-[--radius-md] border border-[--color-border-default]',
              'bg-[--color-surface-1] text-[--color-text-primary] placeholder:text-[--color-text-disabled]',
              'focus:outline-none focus:ring-2 focus:ring-[--color-brand] focus:ring-offset-1 focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            aria-label="New stop address"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={handleAdd}
            disabled={!newStop.trim() || disabled}
            icon={<IconPlus size={14} stroke={2.5} aria-hidden />}
          >
            Add
          </Button>
        </div>
      </div>

      {/* ── Totals footer ──────────────────────────────────────── */}
      <div className="px-4 py-3 border-t border-[--color-border-subtle] bg-[--color-surface-1] flex-shrink-0">
        <div className="grid grid-cols-3 gap-3 mb-3">
          {[
            { label: 'Distance',  value: trip.totalDistanceKm       ? `${trip.totalDistanceKm.toLocaleString('en-US')} km`   : '-' },
            { label: 'Est. time', value: trip.totalEstimatedMinutes  ? `${(trip.totalEstimatedMinutes / 60).toFixed(1)} hrs` : '-' },
            { label: 'Fuel',      value: trip.fuelIndex              ? `${trip.fuelIndex.toLocaleString('en-US')} L`         : '-' },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-[14px] font-semibold text-[--color-text-primary]">{value}</p>
              <p className="text-[10px] text-[--color-text-tertiary] uppercase tracking-[0.05em] mt-0.5">{label}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="md"
            className="flex-1 justify-center"
            disabled={disabled || trip.stops.length === 0}
            loading={calculating}
            onClick={onCalculate}
          >
            Calculate route
          </Button>
          <Button
            variant="secondary"
            size="md"
            className="flex-1 justify-center"
            disabled={!calculated}
            onClick={() => window.print()}
          >
            Generate route sheet
          </Button>
        </div>
      </div>
    </div>
  )
}
