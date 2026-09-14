'use client'

import Link from 'next/link'
import { IconArrowLeft, IconFileText, IconPrinter } from '@tabler/icons-react'
import { TripStatusPill } from '@/components/ui'
import type { Trip, OptimiseFor } from '@routedesk/types'

interface TripMetaBarProps {
  trip: Trip
}

const OPTIMISE_LABEL: Record<OptimiseFor, string> = {
  distance: 'Shortest distance',
  time:     'Shortest time',
  fuel:     'Lowest fuel cost',
}

export function TripMetaBar({ trip }: TripMetaBarProps) {
  return (
    <div className="surface-pattern-panel border-b border-[--color-accent-border] px-6 py-4">

      {/* ── Back + title row ──────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link
            href="/trips"
            className="mt-0.5 p-1.5 rounded-[--radius-sm] text-[--color-text-tertiary] hover:bg-[--color-surface-2] hover:text-[--color-text-primary] transition-colors"
            aria-label="Back to trips"
          >
            <IconArrowLeft size={16} stroke={2} aria-hidden />
          </Link>
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-[18px] font-semibold text-[--color-text-primary]">
                Trip {trip.reference}
              </h1>
              <TripStatusPill status={trip.status} />
            </div>
            <p className="text-[12px] text-[--color-text-tertiary]">
              {trip.driver?.name ?? (
                <span className="text-[--color-warning] font-medium">Needs a driver</span>
              )}
              {' · '}{trip.warehouseName} · {trip.tripType} · {OPTIMISE_LABEL[trip.optimiseFor]}
            </p>
          </div>
        </div>

        {/* ── Actions ─────────────────────────────────────────── */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href={`/route-sheets/${trip.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[--radius-md] border border-[--color-border-default] text-[12px] text-[--color-text-primary] hover:bg-[--color-surface-1] transition-colors"
          >
            <IconFileText size={14} stroke={1.5} aria-hidden />
            Route sheet
          </Link>
          <Link
            href={`/route-sheets/${trip.id}?print=1`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[--radius-md] bg-[--color-brand] text-white text-[12px] font-semibold hover:bg-[--color-brand-hover] transition-colors"
          >
            <IconPrinter size={14} stroke={2} aria-hidden />
            Print
          </Link>
        </div>
      </div>

      {/* ── Stats row ─────────────────────────────────────────── */}
      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-[--color-border-subtle]">
        {[
          { label: 'Total distance',  value: trip.totalDistanceKm       ? `${trip.totalDistanceKm.toLocaleString('en-US')} km` : '-' },
          { label: 'Est. time',       value: trip.totalEstimatedMinutes  ? `${(trip.totalEstimatedMinutes / 60).toFixed(1)} hrs` : '-' },
          { label: 'Fuel',            value: trip.fuelIndex              ? `${trip.fuelIndex.toLocaleString('en-US')} L` : '-' },
          // A trip that hasn't left has no departure time, so show the plan instead.
          trip.status === 'scheduled'
            ? { label: 'Scheduled for', value: trip.scheduledFor
                ? new Date(`${trip.scheduledFor}T00:00:00`).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' })
                : 'No date' }
            : { label: 'Departed',     value: trip.departedAt
                ? new Date(trip.departedAt).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false })
                : '-' },
          { label: 'Stops',           value: `${trip.stops.filter(s => s.status === 'arrived').length} / ${trip.stops.length}` },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-[11px] text-[--color-text-tertiary] uppercase tracking-[0.05em]">{label}</p>
            <p className="text-[14px] font-semibold text-[--color-text-primary] mt-0.5">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
