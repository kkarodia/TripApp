'use client'

import Link from 'next/link'

import { Card, CardHeader, CardTitle, CardContent, TripStatusPill } from '@/components/ui'
import { countStops, tripProgress } from '@/lib/mock-data'
import type { Trip } from '@routedesk/types'
import { cn } from '@/lib/utils'

interface ActiveTripsCardProps {
  trips: Trip[]
}

export function ActiveTripsCard({ trips }: ActiveTripsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active trips</CardTitle>
        <Link
          href="/trips"
          className="text-[12px] text-[--color-info] hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent className="px-0 py-0">
        {trips.length === 0 ? (
          <p className="px-5 py-8 text-[13px] text-[--color-text-tertiary] text-center">
            No active trips today
          </p>
        ) : (
          <ul>
            {trips.map((trip, i) => {
              const arrived  = countStops(trip, 'arrived')
              const total    = trip.stops.length
              const progress = tripProgress(trip)
              const isLast   = i === trips.length - 1

              return (
                <li key={trip.id}>
                  <Link
                    href={`/trips/${trip.id}`}
                    className={cn(
                      'flex items-center gap-3 px-5 py-3 hover:bg-[--color-surface-1] transition-colors',
                      !isLast && 'border-b border-[--color-border-subtle]'
                    )}
                  >
                    {/* Trip ref + driver */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] font-semibold text-[--color-info]">
                          {trip.reference}
                        </span>
                        <span className="text-[12px] font-medium text-[--color-text-primary] truncate">
                          {trip.driver?.name ?? 'Unassigned'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[--color-text-tertiary] truncate">
                        {trip.stops.length} stops · {trip.warehouseName}
                      </p>
                      {/* Progress bar */}
                      <div className="mt-1.5 h-[2px] rounded-full bg-[--color-surface-3] overflow-hidden w-full">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            trip.status === 'active' ? 'bg-[--color-success]' : 'bg-[--color-text-disabled]'
                          )}
                          style={{ width: `${progress}%` }}
                          role="progressbar"
                          aria-valuenow={arrived}
                          aria-valuemax={total}
                          aria-label={`${arrived} of ${total} stops completed`}
                        />
                      </div>
                    </div>

                    {/* Right: status + stop count */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <TripStatusPill status={trip.status} />
                      <span className="text-[11px] text-[--color-text-tertiary]">
                        {arrived}/{total}
                      </span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
