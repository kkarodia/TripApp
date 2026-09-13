import { notFound } from 'next/navigation'
import Link from 'next/link'
import { IconMap, IconMapPinCheck } from '@tabler/icons-react'
import { MOCK_ALL_TRIPS } from '@/lib/mock-data'
import { AppBar, StatusPill, DockNav } from '@/components/layout'
import { formatTime } from '@/lib/utils'
import type { Metadata } from 'next'

interface Props { params: Promise<{ id: string; stopId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, stopId } = await params
  const trip = MOCK_ALL_TRIPS.find(t => t.id === id)
  const stop = trip?.stops.find(s => s.id === stopId)
  return { title: stop ? `${stop.clientName} - RouteDesk` : 'Stop - RouteDesk' }
}

export default async function StopDetailPage({ params }: Props) {
  const { id, stopId } = await params
  const trip = MOCK_ALL_TRIPS.find(t => t.id === id)
  const stop = trip?.stops.find(s => s.id === stopId)
  if (!trip || !stop) notFound()

  const mapsUrl = stop.latitude && stop.longitude
    ? `https://maps.google.com/?q=${stop.latitude},${stop.longitude}`
    : `https://maps.google.com/?q=${encodeURIComponent(stop.address)}`

  const total = trip.stops.length

  return (
    <div className="min-h-dvh bg-[--color-surface-1]">
      <AppBar
        title={stop.clientName}
        subtitle={`Stop ${stop.sequence} of ${total}`}
        back={`/trips/${trip.id}`}
        action={<StatusPill status={trip.status} />}
      />

      <main
        className="px-4 pb-24 flex flex-col gap-3"
        style={{ paddingTop: 'calc(var(--header-height) + 12px)' }}
      >
        {/* Address */}
        <div className="bg-white rounded-[--radius-lg] border border-[--color-border-subtle] p-4">
          <p className="text-[11px] font-medium text-[--color-text-tertiary] uppercase tracking-[0.06em] mb-2">
            Address
          </p>
          <p className="text-[13px] text-[--color-text-primary] mb-3 leading-snug">
            {stop.address}
          </p>
          {stop.geocodeFailed && (
            <p className="text-[12px] text-[--color-warning] mb-3">
              Address not geocoded - directions may be approximate
            </p>
          )}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[--radius-md] bg-[--color-brand] text-white text-[12px] font-semibold hover:bg-[--color-brand-hover] transition-colors"
          >
            <IconMap size={15} stroke={2} aria-hidden />
            Open in maps
          </a>
        </div>

        {/* Details */}
        <div className="bg-white rounded-[--radius-lg] border border-[--color-border-subtle] overflow-hidden">
          <div className="px-4 py-3 border-b border-[--color-border-subtle]">
            <p className="text-[11px] font-medium text-[--color-text-tertiary] uppercase tracking-[0.06em]">
              Delivery details
            </p>
          </div>
          {[
            { label: 'Orders',       value: stop.orders ?? '-' },
            { label: 'Est. arrival', value: stop.estimatedMinutes !== null ? `~${stop.estimatedMinutes} min` : '-' },
            { label: 'Road type',    value: stop.roadType !== 'unknown' ? stop.roadType : '-' },
            { label: 'Distance',     value: stop.distanceKm !== null ? `${stop.distanceKm} km` : '-' },
            { label: 'Status',       value: stop.status },
            { label: 'Arrived at',   value: formatTime(stop.arrivedAt) },
          ].map(({ label, value }, i, arr) => (
            <div
              key={label}
              className={`flex justify-between items-center px-4 py-3 ${i < arr.length - 1 ? 'border-b border-[--color-border-subtle]' : ''}`}
            >
              <span className="text-[12px] text-[--color-text-tertiary]">{label}</span>
              <span className="text-[12px] text-[--color-text-primary] font-medium capitalize">
                {String(value)}
              </span>
            </div>
          ))}
        </div>

        {/* Mark arrived */}
        {trip.status === 'active' && stop.status === 'pending' && (
          <Link
            href={`/trips/${trip.id}`}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-[--radius-lg] bg-[--color-success-bg] border border-[--color-success-border] text-[--color-success] text-[13px] font-semibold transition-colors"
          >
            <IconMapPinCheck size={17} stroke={2} aria-hidden />
            Mark as arrived
          </Link>
        )}
      </main>

      <DockNav />
    </div>
  )
}
