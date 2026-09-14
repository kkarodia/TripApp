'use client'

import { useState } from 'react'
import { IconMap, IconMapPinCheck } from '@tabler/icons-react'
import { AppBar, StatusPill, DockNav } from '@/components/layout'
import { StopRow } from '@/components/stops'
import { cn } from '@/lib/utils'
import type { Trip, Stop } from '@routedesk/types'

interface ActiveTripClientProps {
  initialTrip: Trip
}

export function ActiveTripClient({ initialTrip }: ActiveTripClientProps) {
  const [trip,        setTrip]        = useState<Trip>(initialTrip)
  const [starting,    setStarting]    = useState(false)
  const [arriving,    setArriving]    = useState(false)
  const [justArrived, setJustArrived] = useState(false)

  // A driver only ever sees trips already assigned to them, so `scheduled` here
  // means "yours, not departed yet" - the state the Start button acts on.
  const isAssigned  = trip.status === 'scheduled'
  const isActive    = trip.status === 'active'
  const isCompleted = trip.status === 'completed'

  const arrived     = trip.stops.filter(s => s.status === 'arrived').length
  const total       = trip.stops.length
  const currentStop = trip.stops.find(s => s.status === 'pending')
  const allDone     = arrived === total

  async function handleStart() {
    setStarting(true)
    await new Promise(r => setTimeout(r, 1200))
    setTrip(prev => ({ ...prev, status: 'active', departedAt: new Date().toISOString() }))
    setStarting(false)
  }

  async function handleArrived() {
    if (!currentStop) return
    setArriving(true)
    await new Promise(r => setTimeout(r, 800))
    const updatedStops = trip.stops.map((s: Stop) =>
      s.id === currentStop.id
        ? { ...s, status: 'arrived' as const, arrivedAt: new Date().toISOString() }
        : s
    )
    const allNowDone = updatedStops.every((s: Stop) => s.status === 'arrived')
    setTrip(prev => ({
      ...prev,
      stops:       updatedStops,
      status:      allNowDone ? 'completed' : prev.status,
      completedAt: allNowDone ? new Date().toISOString() : null,
    }))
    setJustArrived(true)
    setArriving(false)
    setTimeout(() => setJustArrived(false), 2500)
  }

  const departedAt = trip.departedAt
    ? new Date(trip.departedAt).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false })
    : null

  const subtitle = isAssigned
    ? `${trip.warehouseName} · ${total} stops`
    : isCompleted
    ? 'All stops delivered'
    : `Departed ${departedAt} · ${arrived}/${total} stops`

  return (
    <div className="min-h-dvh surface-pattern-ground">
      <AppBar
        title={trip.reference}
        subtitle={subtitle}
        back="/trips"
        action={<StatusPill status={trip.status} />}
      />

      <main
        className="px-4 pb-24 flex flex-col gap-3"
        style={{ paddingTop: 'calc(var(--header-height) + 12px)' }}
      >
        {/* Progress bar */}
        <div className="bg-white rounded-[--radius-lg] border border-[--color-border-subtle] p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] font-medium text-[--color-text-primary]">
              {isCompleted ? 'Delivery complete' : isAssigned ? 'Ready to depart' : 'On route'}
            </p>
            <span className="text-[12px] text-[--color-text-tertiary]">{arrived}/{total} stops</span>
          </div>
          <div className="h-1.5 rounded-full bg-[--color-surface-3] overflow-hidden">
            <div
              className="h-full rounded-full bg-[--color-success] transition-all duration-700"
              style={{ width: `${Math.round((arrived / total) * 100)}%` }}
            />
          </div>
        </div>

        {/* Pre-departure */}
        {isAssigned && (
          <div className="bg-white rounded-[--radius-lg] border border-[--color-border-default] p-4">
            <p className="text-[13px] font-semibold text-[--color-text-primary] mb-1">Ready to depart?</p>
            <p className="text-[12px] text-[--color-text-secondary] mb-3 leading-relaxed">
              Collect your route sheet and confirm your vehicle before starting.
            </p>
            <div className="bg-[--color-surface-1] rounded-[--radius-md] px-3 py-2.5 mb-3 border border-[--color-border-subtle]">
              <p className="text-[12px] font-medium text-[--color-text-primary]">{trip.warehouseName}</p>
              <p className="text-[11px] text-[--color-text-tertiary] mt-0.5">{trip.warehouseAddress}</p>
            </div>
            <button
              onClick={handleStart}
              disabled={starting}
              className="w-full flex items-center justify-center py-2.5 rounded-[--radius-md] bg-[--color-brand] text-white text-[13px] font-semibold disabled:opacity-50 transition-colors hover:bg-[--color-brand-hover]"
            >
              {starting ? 'Starting...' : 'Start trip'}
            </button>
          </div>
        )}

        {/* Next stop card */}
        {isActive && currentStop && (
          <div className="bg-white rounded-[--radius-lg] border border-[--color-accent-border] p-4">
            <p className="text-[10px] font-medium text-[--color-accent] uppercase tracking-[0.06em] mb-2">
              Next stop
            </p>
            <p className="text-[16px] font-semibold text-[--color-text-primary] mb-0.5">
              {currentStop.clientName}
            </p>
            <p className="text-[12px] text-[--color-text-secondary] mb-3">{currentStop.address}</p>

            <div className="flex gap-1.5 flex-wrap mb-3">
              {[
                currentStop.distanceKm !== null && `${currentStop.distanceKm} km`,
                currentStop.estimatedMinutes !== null && `~${currentStop.estimatedMinutes} min`,
                currentStop.roadType !== 'unknown' && currentStop.roadType,
              ].filter(Boolean).map(chip => (
                <span
                  key={String(chip)}
                  className="text-[11px] px-2 py-1 rounded-[--radius-sm] bg-[--color-sky-100] text-[--color-navy-600] border border-[--color-accent-border]"
                >
                  {chip}
                </span>
              ))}
            </div>

            <button
              onClick={() => {
                const q = currentStop.latitude && currentStop.longitude
                  ? `${currentStop.latitude},${currentStop.longitude}`
                  : encodeURIComponent(currentStop.address)
                window.open(`https://maps.google.com/?q=${q}`, '_blank')
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[--radius-md] bg-[--color-brand] text-white text-[12px] font-semibold hover:bg-[--color-brand-hover] transition-colors"
            >
              <IconMap size={15} stroke={2} aria-hidden />
              Open in maps
            </button>
          </div>
        )}

        {/* Completed */}
        {(isCompleted || (isActive && allDone)) && (
          <div className="bg-white rounded-[--radius-lg] border border-[--color-success-border] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[--color-success-bg] flex items-center justify-center flex-shrink-0">
              <IconMapPinCheck size={20} stroke={2} className="text-[--color-success]" aria-hidden />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[--color-text-primary]">Trip complete</p>
              <p className="text-[12px] text-[--color-text-secondary]">All {total} stops delivered</p>
            </div>
          </div>
        )}

        {/* Mark arrived CTA */}
        {isActive && currentStop && (
          <button
            onClick={handleArrived}
            disabled={arriving}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-3 rounded-[--radius-lg] text-[13px] font-semibold border transition-colors',
              justArrived
                ? 'bg-[--color-success-bg] text-[--color-success] border-[--color-success-border]'
                : 'bg-[--color-success-bg] text-[--color-success] border-[--color-success-border] hover:bg-[#d4f0e6]'
            )}
          >
            <IconMapPinCheck size={18} stroke={2} aria-hidden />
            {justArrived ? 'Marked as arrived' : arriving ? 'Marking...' : 'Mark as arrived'}
          </button>
        )}

        {/* All stops list */}
        <div>
          <p className="text-[10px] font-medium text-[--color-accent] uppercase tracking-[0.06em] mb-2 px-0.5">
            {isAssigned ? 'Stops preview' : 'All stops'}
          </p>
          <div className="bg-white rounded-[--radius-lg] border border-[--color-border-subtle] overflow-hidden">
            {trip.stops.map((stop: Stop, i: number) => {
              const isCurrent = isActive && stop.status === 'pending' &&
                trip.stops.slice(0, i).every((s: Stop) => s.status === 'arrived')
              return (
                <StopRow
                  key={stop.id}
                  stop={stop}
                  tripId={trip.id}
                  isCurrent={isCurrent}
                  isLast={i === trip.stops.length - 1}
                />
              )
            })}
          </div>
        </div>
      </main>

      <DockNav />
    </div>
  )
}
