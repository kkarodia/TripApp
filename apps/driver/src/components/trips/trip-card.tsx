'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { StatusPill } from '@/components/layout'
import type { Trip } from '@routedesk/types'

interface TripCardProps {
  trip: Trip
}

function getProgress(trip: Trip) {
  const arrived = trip.stops.filter(s => s.status === 'arrived').length
  const total   = trip.stops.length
  return { arrived, total, pct: total > 0 ? Math.round((arrived / total) * 100) : 0 }
}

const barColor: Record<string, string> = {
  assigned:  'var(--color-info)',
  active:    'var(--color-success)',
  completed: 'var(--color-success)',
  archived:  'var(--color-border-strong)',
}

export function TripCard({ trip }: TripCardProps) {
  const { arrived, total, pct } = getProgress(trip)

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="block bg-white rounded-[--radius-lg] border border-[--color-border-subtle] px-4 py-3.5 transition-colors hover:bg-[--color-surface-1]"
    >
      {/* Row 1: reference + status */}
      <div className="flex items-center justify-between gap-3 mb-0.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[13px] font-semibold text-[--color-brand] flex-shrink-0">
            {trip.reference}
          </span>
          <span className="text-[13px] text-[--color-text-primary] truncate">
            {trip.driver?.name ?? trip.warehouseName}
          </span>
        </div>
        <StatusPill status={trip.status} />
      </div>

      {/* Row 2: warehouse · stops */}
      <p className="text-[12px] text-[--color-text-tertiary] mb-2.5">
        {trip.stops.length} stop{trip.stops.length !== 1 ? 's' : ''} · {trip.warehouseName}
      </p>

      {/* Progress bar — same thin style as admin */}
      <div className={cn(
        'h-0.5 rounded-full overflow-hidden',
        pct === 0 ? 'bg-[--color-surface-3]' : 'bg-[--color-surface-3]'
      )}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: barColor[trip.status] ?? barColor.assigned }}
          role="progressbar"
          aria-valuenow={arrived}
          aria-valuemax={total}
          aria-label={`${arrived} of ${total} stops`}
        />
      </div>

      {/* Row 3: stop count right-aligned */}
      <p className="text-[11px] text-[--color-text-tertiary] text-right mt-1 tabular-nums">
        {arrived}/{total}
      </p>
    </Link>
  )
}
