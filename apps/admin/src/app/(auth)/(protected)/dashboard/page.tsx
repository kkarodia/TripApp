import { IconTruckDelivery, IconCalendarClock, IconMapPinCheck, IconAlertTriangle } from '@tabler/icons-react'
// icons used as MetricCard `icon` props below
import { Topbar, PageContent } from '@/components/layout'
import { MetricCard } from '@/components/ui'
import { ActiveTripsCard, ScheduledTripsCard, AlertsCard } from '@/components/dashboard'
import {
  MOCK_TRIPS,
  MOCK_ALERTS,
  MOCK_DRIVERS,
  totalArrivedToday,
  totalStopsToday,
  totalGeocodeFails,
} from '@/lib/mock-data'

/**
 * Dashboard page - server component.
 * Fetches data server-side (currently mock, swap for real API calls later).
 * No 'use client' - all interactivity is in the child components.
 */
export default function DashboardPage() {
  // ── Data ─────────────────────────────────────────────────────────────────
  // TODO: replace with real API calls when backend is ready
  // e.g. const trips = await fetchActiveTrips()
  const trips          = MOCK_TRIPS
  const alerts         = MOCK_ALERTS
  const activeTrips    = trips.filter(t => t.status === 'active')
  const scheduledTrips = trips.filter(t => t.status === 'scheduled')
  const needDriver     = scheduledTrips.filter(t => !t.driverId).length
  // "Today" counts only work actually underway - scheduled trips haven't run yet.
  const arrivedToday   = totalArrivedToday(activeTrips)
  const stopsToday     = totalStopsToday(activeTrips)
  const geocodeFails   = totalGeocodeFails(trips)
  const unreadAlerts   = alerts.filter(a => !a.read)

  // ── Greeting ──────────────────────────────────────────────────────────────
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' :
    hour < 17 ? 'Good afternoon' :
    'Good evening'

  const today = new Date().toLocaleDateString('en-ZA', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <>
      <Topbar
        title={`${greeting}, Sarah`}
        subtitle={`${today} - ${activeTrips.length} on the road, ${scheduledTrips.length} scheduled`}
        action={{ label: 'New trip', href: '/trips/new' }}
      />

      <PageContent>
        {/* ── Metric cards ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          <MetricCard
            label="Active trips"
            value={activeTrips.length}
            sub={`${new Set(activeTrips.map(t => t.driverId)).size} of ${MOCK_DRIVERS.length} drivers out`}
            icon={IconTruckDelivery}
            subVariant="success"
          />
          <MetricCard
            label="Scheduled trips"
            value={scheduledTrips.length}
            sub={needDriver > 0 ? `${needDriver} need a driver` : 'all crewed'}
            icon={IconCalendarClock}
            subVariant={needDriver > 0 ? 'warning' : 'success'}
          />
          <MetricCard
            label="Stops completed"
            value={arrivedToday}
            sub={`of ${stopsToday} today`}
            icon={IconMapPinCheck}
            subVariant={arrivedToday === stopsToday ? 'success' : 'default'}
          />
          <MetricCard
            label="Geocode failures"
            value={geocodeFails}
            sub={geocodeFails > 0 ? 'need manual review' : 'all addresses verified'}
            icon={IconAlertTriangle}
            subVariant={geocodeFails > 0 ? 'danger' : 'success'}
          />
        </div>

        {/* ── Two-column card row ───────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <ActiveTripsCard trips={activeTrips} />
          <ScheduledTripsCard trips={scheduledTrips} />
        </div>

        {/* ── Full-width alerts ─────────────────────────────────────────── */}
        <AlertsCard alerts={unreadAlerts.length > 0 ? alerts : []} />
      </PageContent>
    </>
  )
}
