'use client'

import { useState } from 'react'
import { IconPlus, IconAlertTriangle } from '@tabler/icons-react'
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui'
import { PageContent } from '@/components/layout'
import { StopList } from './stop-list'
import { DriverStatusCard } from './driver-status-card'
import { AssignDriverCard } from './assign-driver-card'
import { TripMetaBar } from './trip-meta-bar'
import { MOCK_DRIVERS } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import type { Trip, Stop } from '@routedesk/types'

interface TripDetailClientProps {
  trip: Trip
}

/**
 * TripDetailClient - owns mutable state for the trip detail page.
 * Receives the initial trip as a prop from the server component page.
 *
 * In production:
 * - Stop arrivals come in via Supabase Realtime subscription
 * - Add/delete stop calls Fastify backend
 * - Trip status updates via Realtime
 */
export function TripDetailClient({ trip: initialTrip }: TripDetailClientProps) {
  const [trip,       setTrip]       = useState<Trip>(initialTrip)
  const [newStop,    setNewStop]     = useState('')
  const [addError,   setAddError]    = useState<string | null>(null)
  const [adding,     setAdding]      = useState(false)

  const isEditable  = trip.status !== 'completed' && trip.status !== 'archived'
  const geocodeFails = trip.stops.filter(s => s.geocodeFailed).length

  // ── Add stop ───────────────────────────────────────────────────
  async function handleAddStop() {
    if (!newStop.trim()) return
    setAddError(null)
    setAdding(true)

    // TODO: replace with real API call + geocoding
    // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trips/${trip.id}/stops`, { ... })
    await new Promise(r => setTimeout(r, 600))

    const stop: Stop = {
      id:               `s-${Date.now()}`,
      tripId:           trip.id,
      sequence:         trip.stops.length + 1,
      clientName:       newStop.trim(),
      address:          newStop.trim(),
      latitude:         null,
      longitude:        null,
      geocodeFailed:    true,
      roadType:         'unknown',
      distanceKm:       null,
      estimatedMinutes: null,
      status:           'pending',
      arrivedAt:        null,
      orders:           null,
      createdAt:        new Date().toISOString(),
    }

    setTrip(prev => ({ ...prev, stops: [...prev.stops, stop] }))
    setNewStop('')
    setAdding(false)
  }

  // ── Assign / reassign driver ───────────────────────────────────
  async function handleAssign(driverId: string | null, scheduledFor: string | null) {
    // TODO: PATCH /trips/:id { driverId, scheduledFor }
    await new Promise(r => setTimeout(r, 500))

    setTrip(prev => ({
      ...prev,
      driverId,
      driver: driverId ? MOCK_DRIVERS.find(d => d.id === driverId) : undefined,
      scheduledFor,
    }))
  }

  // ── Delete stop ────────────────────────────────────────────────
  function handleDeleteStop(stopId: string) {
    // TODO: DELETE /trips/:id/stops/:stopId then re-optimise route
    setTrip(prev => ({
      ...prev,
      stops: prev.stops
        .filter(s => s.id !== stopId)
        .map((s, i) => ({ ...s, sequence: i + 1 })),
    }))
  }

  return (
    <>
    {/* Rendered here rather than in the page so the header reflects an assignment
        made below without waiting for a navigation. */}
    <TripMetaBar trip={trip} />

    <PageContent>
    <div className="flex gap-5">

      {/* ── Left: stop list ──────────────────────────────────── */}
      <div className="flex-1 min-w-0">

        {/* Geocode warning banner */}
        {geocodeFails > 0 && (
          <div className="flex items-start gap-2.5 px-4 py-3 mb-4 rounded-[--radius-md] bg-[--color-danger-bg] border border-[--color-danger-border]">
            <IconAlertTriangle size={14} stroke={2} className="text-[--color-danger] flex-shrink-0 mt-0.5" aria-hidden />
            <p className="text-[12px] text-[--color-danger]">
              <span className="font-semibold">{geocodeFails} stop{geocodeFails !== 1 ? 's' : ''} could not be geocoded.</span>
              {' '}Drivers will need to navigate to {geocodeFails !== 1 ? 'these addresses' : 'this address'} manually.
            </p>
          </div>
        )}

        {/* Stop list card */}
        <Card>
          <CardHeader>
            <CardTitle>
              Stops - {trip.stops.filter(s => s.status === 'arrived').length} of {trip.stops.length} arrived
            </CardTitle>
          </CardHeader>

          <StopList
            stops={trip.stops}
            tripStatus={trip.status}
            onDeleteStop={isEditable ? handleDeleteStop : undefined}
          />

          {/* Add stop - only when trip is editable */}
          {isEditable && (
            <div className="px-5 py-3 border-t border-[--color-border-subtle] bg-[--color-surface-1] rounded-b-[--radius-lg]">
              {addError && (
                <p className="text-[11px] text-[--color-danger] mb-2">{addError}</p>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newStop}
                  onChange={e => setNewStop(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddStop()}
                  placeholder="Add stop - client name or address…"
                  disabled={adding}
                  className={cn(
                    'flex-1 px-3 py-2 text-[13px] rounded-[--radius-md] border border-[--color-border-default]',
                    'bg-white text-[--color-text-primary] placeholder:text-[--color-text-disabled]',
                    'focus:outline-none focus:ring-2 focus:ring-[--color-brand] focus:ring-offset-1 focus:border-transparent',
                    'disabled:opacity-50'
                  )}
                />
                <Button
                  variant="primary"
                  size="sm"
                  loading={adding}
                  onClick={handleAddStop}
                  disabled={!newStop.trim() || adding}
                  icon={<IconPlus size={14} stroke={2.5} aria-hidden />}
                >
                  Add
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* ── Right sidebar ────────────────────────────────────── */}
      <div className="w-[280px] flex-shrink-0 space-y-4">
        {/* Before departure the useful control is crewing the trip; once it is
            rolling, progress is what matters and the driver is settled. */}
        {trip.status === 'scheduled'
          ? <AssignDriverCard trip={trip} onAssign={handleAssign} />
          : <DriverStatusCard trip={trip} />
        }

        {/* Trip summary card */}
        <Card>
          <CardHeader>
            <CardTitle>Trip summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {[
                { label: 'Reference',  value: trip.reference },
                { label: 'Warehouse',  value: trip.warehouseName },
                { label: 'Trip type',  value: trip.tripType },
                { label: 'Distance',   value: trip.totalDistanceKm ? `${trip.totalDistanceKm.toLocaleString('en-US')} km` : '-' },
                { label: 'Est. time',  value: trip.totalEstimatedMinutes ? `${(trip.totalEstimatedMinutes / 60).toFixed(1)} hrs` : '-' },
                { label: 'Fuel',       value: trip.fuelIndex ? `${trip.fuelIndex.toLocaleString('en-US')} L` : '-' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start gap-2">
                  <span className="text-[12px] text-[--color-text-tertiary]">{label}</span>
                  <span className="text-[12px] font-medium text-[--color-text-primary] text-right">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </PageContent>
    </>
  )
}
