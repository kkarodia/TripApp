import Link from 'next/link'
import type { Metadata } from 'next'
import { MOCK_TRIPS } from '@/lib/mock-data'
import { TripStatusPill } from '@/components/ui'
import { PageHeading } from '@/components/layout'

export const metadata: Metadata = { title: 'Route sheets - RouteDesk' }

export default function RouteSheetsPage() {
  const trips = MOCK_TRIPS

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto w-full">
      <PageHeading
        className="mb-6"
        title="Route sheets"
        subtitle="Print or download route sheets for any trip"
      />

      <div className="bg-white rounded-[--radius-lg] border border-[--color-border-subtle] divide-y divide-[--color-border-subtle]">
        {trips.map(trip => {
          const arrived = trip.stops.filter(s => s.status === 'arrived').length
          return (
            <div key={trip.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[--color-surface-1] transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-0.5">
                  <span className="text-[14px] font-semibold text-[--color-text-primary]">
                    {trip.reference}
                  </span>
                  <TripStatusPill status={trip.status} />
                </div>
                <p className="text-[12px] text-[--color-text-tertiary] truncate">
                  {trip.driver?.name ?? 'Unassigned'} · {trip.warehouseName} · {arrived}/{trip.stops.length} stops arrived
                </p>
              </div>

              <div className="text-right flex-shrink-0 hidden sm:block">
                <p className="text-[13px] font-medium text-[--color-text-primary]">
                  {trip.totalDistanceKm?.toLocaleString('en-US') ?? '-'} km
                </p>
                <p className="text-[11px] text-[--color-text-tertiary]">
                  {trip.totalEstimatedMinutes
                    ? `${(trip.totalEstimatedMinutes / 60).toFixed(1)} hrs`
                    : '-'}
                </p>
              </div>

              <Link
                href={`/route-sheets/${trip.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[--radius-md] bg-[--color-brand] text-white text-[12px] font-semibold hover:bg-[--color-brand-hover] transition-colors flex-shrink-0"
              >
                View sheet
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
