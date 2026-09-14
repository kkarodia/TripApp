'use client'

import Link from 'next/link'
import { IconMap, IconMapPinCheck, IconTruckDelivery } from '@tabler/icons-react'
import { AppBar } from '@/components/layout'
import { TripMap } from './trip-map'
import type { Trip } from '@routedesk/types'

interface NavigateClientProps {
  activeTrip: Trip | null
}

export function NavigateClient({ activeTrip }: NavigateClientProps) {
  if (!activeTrip) {
    return (
      <div className="min-h-dvh surface-pattern-ground">
        <AppBar title="Navigate" subtitle="No active trip" />
        <main
          className="px-4 pb-24 flex flex-col items-center justify-center"
          style={{ paddingTop: 'calc(var(--header-height) + 40px)', minHeight: '100dvh' }}
        >
          <div className="w-14 h-14 rounded-full bg-[--color-sky-100] border border-[--color-accent-border] flex items-center justify-center mb-4">
            <IconTruckDelivery size={26} stroke={1.5} className="text-[--color-accent]" aria-hidden />
          </div>
          <p className="text-[14px] font-semibold text-[--color-text-primary] mb-1">No active trip</p>
          <p className="text-[12px] text-[--color-text-tertiary] text-center mb-5">
            You don't have a trip in progress. Check your assigned trips.
          </p>
          <Link
            href="/trips"
            className="px-5 py-2.5 rounded-[--radius-md] bg-[--color-brand] text-white text-[13px] font-semibold"
          >
            View trips
          </Link>
        </main>
      </div>
    )
  }

  const currentStop = activeTrip.stops.find(s => s.status === 'pending')
  const arrived     = activeTrip.stops.filter(s => s.status === 'arrived').length
  const total       = activeTrip.stops.length

  const mapsUrl = currentStop
    ? currentStop.latitude && currentStop.longitude
      ? `https://maps.google.com/maps/dir/?api=1&destination=${currentStop.latitude},${currentStop.longitude}&travelmode=driving`
      : `https://maps.google.com/maps/dir/?api=1&destination=${encodeURIComponent(currentStop.address)}&travelmode=driving`
    : null

  return (
    <div className="min-h-dvh surface-pattern-ground">
      <AppBar
        title={activeTrip.reference}
        subtitle={currentStop ? `Stop ${arrived + 1} of ${total}` : 'All stops delivered'}
      />

      {/* Full-screen map between AppBar and DockNav */}
      <div
        className="fixed left-0 right-0"
        style={{
          top:    'var(--header-height)',
          bottom: 'var(--dock-height)',
        }}
      >
        <TripMap trip={activeTrip} />

        {/* Floating current-stop card */}
        {currentStop ? (
          <div className="absolute left-3 right-3 bottom-3 bg-white rounded-[--radius-xl] border border-[--color-border-subtle] p-4"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}
          >
            <div className="flex items-start justify-between mb-1">
              <p className="text-[10px] font-medium text-[--color-accent] uppercase tracking-[0.06em]">
                Next stop · {arrived + 1} of {total}
              </p>
              <span className="text-[10px] font-medium text-[--color-brand] bg-[--color-accent-subtle] px-2 py-0.5 rounded-full">
                {currentStop.distanceKm !== null ? `${currentStop.distanceKm} km` : 'En route'}
              </span>
            </div>
            <p className="text-[16px] font-semibold text-[--color-text-primary] mb-0.5 leading-tight">
              {currentStop.clientName}
            </p>
            <p className="text-[12px] text-[--color-text-secondary] mb-3 leading-snug">
              {currentStop.address}
            </p>

            <div className="flex gap-2">
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[--radius-md] bg-[--color-brand] text-white text-[12px] font-semibold"
                >
                  <IconMap size={14} stroke={2} aria-hidden />
                  Directions
                </a>
              )}
              <Link
                href={`/trips/${activeTrip.id}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[--radius-md] bg-[--color-success-bg] border border-[--color-success-border] text-[--color-success] text-[12px] font-semibold"
              >
                <IconMapPinCheck size={14} stroke={2} aria-hidden />
                Mark arrived
              </Link>
            </div>
          </div>
        ) : (
          <div className="absolute left-3 right-3 bottom-3 bg-white rounded-[--radius-xl] border border-[--color-success-border] p-4 flex items-center gap-3"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
          >
            <div className="w-10 h-10 rounded-full bg-[--color-success-bg] flex items-center justify-center flex-shrink-0">
              <IconMapPinCheck size={20} stroke={2} className="text-[--color-success]" aria-hidden />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[--color-text-primary]">All stops delivered</p>
              <p className="text-[12px] text-[--color-text-tertiary]">Head back to the warehouse</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
