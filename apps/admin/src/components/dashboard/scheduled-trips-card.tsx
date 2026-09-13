'use client'

import Link from 'next/link'
import { IconUserPlus } from '@tabler/icons-react'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import type { Trip } from '@routedesk/types'
import { cn } from '@/lib/utils'

interface ScheduledTripsCardProps {
  trips: Trip[]
}

/** Dated trips first, soonest at the top; undated backlog trips below them. */
function bySchedule(a: Trip, b: Trip): number {
  if (a.scheduledFor && b.scheduledFor) return a.scheduledFor.localeCompare(b.scheduledFor)
  if (a.scheduledFor) return -1
  if (b.scheduledFor) return 1
  return a.createdAt.localeCompare(b.createdAt)
}

function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`)
  const today = new Date()
  const days = Math.round((date.getTime() - new Date(today.toDateString()).getTime()) / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return date.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function ScheduledTripsCard({ trips }: ScheduledTripsCardProps) {
  const sorted = [...trips].sort(bySchedule)
  const unassigned = trips.filter(t => !t.driverId).length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scheduled trips</CardTitle>
        <Link href="/trips" className="text-[12px] text-[--color-info] hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent className="px-0 py-0">
        {sorted.length === 0 ? (
          <p className="px-5 py-8 text-[13px] text-[--color-text-tertiary] text-center">
            Nothing scheduled - every trip is on the road
          </p>
        ) : (
          <>
            {unassigned > 0 && (
              <p className="px-5 py-2 text-[11px] text-[--color-warning] bg-[--color-warning-bg] border-b border-[--color-border-subtle]">
                {unassigned} trip{unassigned !== 1 ? 's' : ''} still need{unassigned === 1 ? 's' : ''} a driver
              </p>
            )}
            <ul>
              {sorted.map((trip, i) => {
                const isLast = i === sorted.length - 1
                const driverName = trip.driver?.name

                return (
                  <li key={trip.id}>
                    <Link
                      href={`/trips/${trip.id}`}
                      className={cn(
                        'flex items-center gap-3 px-5 py-3 hover:bg-[--color-surface-1] transition-colors',
                        !isLast && 'border-b border-[--color-border-subtle]'
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[11px] font-semibold text-[--color-info]">
                            {trip.reference}
                          </span>
                          {driverName ? (
                            <span className="text-[12px] font-medium text-[--color-text-primary] truncate">
                              {driverName}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[--color-warning]">
                              <IconUserPlus size={12} stroke={2} aria-hidden />
                              Needs a driver
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[--color-text-tertiary] truncate">
                          {trip.stops.length} stops · {trip.warehouseName}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span
                          className={cn(
                            'text-[11px] font-medium',
                            trip.scheduledFor
                              ? 'text-[--color-text-secondary]'
                              : 'text-[--color-text-tertiary] italic'
                          )}
                        >
                          {trip.scheduledFor ? formatDate(trip.scheduledFor) : 'No date'}
                        </span>
                        {trip.totalDistanceKm !== null && (
                          <span className="text-[11px] text-[--color-text-tertiary]">
                            {trip.totalDistanceKm.toLocaleString('en-ZA')} km
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  )
}
