'use client'

import { IconUser, IconMapPin, IconClock, IconTruckDelivery } from '@tabler/icons-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { tripProgress, countStops } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import type { Trip } from '@routedesk/types'

interface DriverStatusCardProps {
  trip: Trip
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export function DriverStatusCard({ trip }: DriverStatusCardProps) {
  const arrived    = countStops(trip, 'arrived')
  const total      = trip.stops.length
  const progress   = tripProgress(trip)
  const driverName = trip.driver?.name ?? 'Unassigned'
  const currentStop = trip.stops.find(s => s.status === 'pending')

  const departedAt = trip.departedAt
    ? new Date(trip.departedAt).toLocaleTimeString('en-ZA', {
        hour: '2-digit', minute: '2-digit', hour12: false,
      })
    : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Driver status</CardTitle>
        {trip.status === 'active' && (
          <span className="flex items-center gap-1.5 text-[11px] text-[--color-success] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[--color-success] animate-pulse" />
            Live
          </span>
        )}
      </CardHeader>
      <CardContent>
        {/* Driver identity */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[--color-info-bg] flex items-center justify-center flex-shrink-0">
            <span className="text-[13px] font-semibold text-[--color-info]">
              {getInitials(driverName)}
            </span>
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[--color-text-primary]">{driverName}</p>
            <p className="text-[12px] text-[--color-text-tertiary]">
              {trip.driver?.username ?? '-'}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <p className="text-[11px] text-[--color-text-tertiary] uppercase tracking-[0.05em]">
              Progress
            </p>
            <p className="text-[11px] font-medium text-[--color-text-primary]">
              {arrived} of {total} stops
            </p>
          </div>
          <div className="h-2 rounded-full bg-[--color-surface-2] overflow-hidden">
            <div
              className="h-full rounded-full bg-[--color-success] transition-all duration-500"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={arrived}
              aria-valuemax={total}
            />
          </div>
        </div>

        {/* Status items */}
        <div className="space-y-2.5">
          {[
            {
              icon: IconTruckDelivery,
              label: 'Trip status',
              value: trip.status.charAt(0).toUpperCase() + trip.status.slice(1),
            },
            {
              icon: IconClock,
              label: 'Departed',
              value: departedAt ?? 'Not yet departed',
            },
            {
              icon: IconMapPin,
              label: 'Current stop',
              value: currentStop
                ? `${currentStop.sequence}. ${currentStop.clientName}`
                : arrived === total ? 'All stops complete' : '-',
            },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-[--radius-sm] bg-[--color-surface-2] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon size={13} stroke={1.5} className="text-[--color-text-tertiary]" aria-hidden />
              </div>
              <div>
                <p className="text-[10px] text-[--color-text-tertiary] uppercase tracking-[0.05em]">
                  {label}
                </p>
                <p className="text-[12px] font-medium text-[--color-text-primary] mt-0.5">
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Realtime note */}
        {trip.status === 'active' && (
          <p className="text-[10px] text-[--color-text-tertiary] mt-4 pt-3 border-t border-[--color-border-subtle]">
            Stop arrivals update in real time via Supabase Realtime
          </p>
        )}
      </CardContent>
    </Card>
  )
}
