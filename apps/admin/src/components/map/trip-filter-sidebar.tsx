'use client'

import { cn } from '@/lib/utils'
import { TripStatusPill } from '@/components/ui'
import { tripProgress, countStops } from '@/lib/mock-data'
import type { Trip } from '@routedesk/types'

interface TripFilterSidebarProps {
  trips: Trip[]
  selectedTripId: string | null
  onSelect: (id: string | null) => void
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

// Match trip colours to map markers
const TRIP_COLORS = ['#1B3A6B', '#1D9E75', '#BA7517', '#A32D2D', '#534AB7']

export function TripFilterSidebar({
  trips,
  selectedTripId,
  onSelect,
}: TripFilterSidebarProps) {
  return (
    <div className="w-[280px] flex-shrink-0 surface-pattern-panel border-r border-[--color-border-subtle] flex flex-col">

      {/* Header */}
      <div className="px-4 py-3.5 border-b border-[--color-border-subtle]">
        <p className="text-[13px] font-semibold text-[--color-text-primary]">
          Active trips
        </p>
        <p className="text-[11px] text-[--color-text-tertiary] mt-0.5">
          {trips.length} trip{trips.length !== 1 ? 's' : ''} on map
        </p>
      </div>

      {/* All trips option */}
      <button
        onClick={() => onSelect(null)}
        className={cn(
          'flex items-center gap-2.5 px-4 py-3 text-left border-b border-[--color-border-subtle] transition-colors',
          selectedTripId === null
            ? 'bg-[--color-accent-subtle] text-[--color-brand] shadow-[inset_3px_0_0_var(--color-accent)]'
            : 'text-[--color-text-secondary] hover:bg-[--color-surface-1]'
        )}
      >
        <div className="w-2.5 h-2.5 rounded-full bg-[--color-text-tertiary] flex-shrink-0" />
        <span className="text-[12px] font-medium">Show all trips</span>
      </button>

      {/* Trip list */}
      <div className="flex-1 overflow-y-auto">
        {trips.map((trip, i) => {
          const isSelected = selectedTripId === trip.id
          const color      = TRIP_COLORS[i % TRIP_COLORS.length]
          const arrived    = countStops(trip, 'arrived')
          const total      = trip.stops.length
          const progress   = tripProgress(trip)
          const driverName = trip.driver?.name ?? 'Unassigned'

          return (
            <button
              key={trip.id}
              onClick={() => onSelect(isSelected ? null : trip.id)}
              className={cn(
                'w-full flex items-start gap-3 px-4 py-3.5 text-left border-b border-[--color-border-subtle] transition-colors',
                isSelected
                  ? 'bg-[--color-accent-subtle] shadow-[inset_3px_0_0_var(--color-accent)]'
                  : 'hover:bg-[--color-surface-1]'
              )}
            >
              {/* Colour dot matching map polyline */}
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5"
                style={{ background: color }}
                aria-hidden
              />

              <div className="flex-1 min-w-0">
                {/* Ref + status */}
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-[12px] font-semibold text-[--color-text-primary]">
                    {trip.reference}
                  </span>
                  <TripStatusPill status={trip.status} />
                </div>

                {/* Driver */}
                <p className="text-[11px] text-[--color-text-secondary] truncate mb-1.5">
                  {driverName}
                </p>

                {/* Progress bar */}
                <div className="h-[2px] rounded-full bg-[--color-surface-3] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${progress}%`, background: color }}
                    role="progressbar"
                    aria-valuenow={arrived}
                    aria-valuemax={total}
                    aria-label={`${arrived} of ${total} stops`}
                  />
                </div>
                <p className="text-[10px] text-[--color-text-tertiary] mt-1">
                  {arrived}/{total} stops
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
