import Link from 'next/link'
import type { Metadata } from 'next'
import { MOCK_TRIPS } from '@/lib/mock-data'
import { TripStatusPill } from '@/components/ui'
import { Topbar, PageContent } from '@/components/layout'

export const metadata: Metadata = { title: 'Trips - RouteDesk' }

export default function TripsPage() {
  const trips = MOCK_TRIPS

  return (
    <>
      <Topbar
        title="All trips"
        subtitle={`${trips.length} trip${trips.length !== 1 ? 's' : ''} total`}
        action={{ label: 'New trip', href: '/trips/new' }}
      />

      <PageContent>
        <div className="surface-pattern-panel rounded-[--radius-lg] border border-[--color-border-subtle] divide-y divide-[--color-border-subtle]">
          {trips.length === 0 ? (
            <p className="px-5 py-12 text-[13px] text-[--color-text-tertiary] text-center">
              No trips yet
            </p>
          ) : (
            trips.map(trip => {
              const arrived = trip.stops.filter(s => s.status === 'arrived').length
              const progress = trip.stops.length > 0
                ? Math.round((arrived / trip.stops.length) * 100)
                : 0

              return (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-[--color-surface-1] transition-colors"
                >
                  {/* Reference + driver */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-0.5">
                      <span className="text-[13px] font-semibold text-[--color-info]">
                        {trip.reference}
                      </span>
                      <TripStatusPill status={trip.status} />
                    </div>
                    <p className="text-[12px] text-[--color-text-tertiary] truncate">
                      {trip.driver?.name ?? 'Unassigned'} · {trip.warehouseName} · {trip.tripType}
                    </p>

                    {/* Progress bar */}
                    <div className="mt-2 h-[3px] rounded-full bg-[--color-surface-3] w-[180px]">
                      <div
                        className="h-full rounded-full bg-[--color-success] transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-8 flex-shrink-0 text-right">
                    <div>
                      <p className="text-[13px] font-medium text-[--color-text-primary]">
                        {arrived}/{trip.stops.length}
                      </p>
                      <p className="text-[11px] text-[--color-text-tertiary]">stops</p>
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-[--color-text-primary]">
                        {trip.totalDistanceKm?.toLocaleString('en-US') ?? '-'} km
                      </p>
                      <p className="text-[11px] text-[--color-text-tertiary]">distance</p>
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </PageContent>
    </>
  )
}
