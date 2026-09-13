import type { Metadata } from 'next'
import { Topbar } from '@/components/layout'
import { RouteMapClient } from '@/components/map'
import { MOCK_TRIPS } from '@/lib/mock-data'

export const metadata: Metadata = {
  title: 'Route map - RouteDesk',
}

/**
 * Route map page - server component.
 *
 * This page deliberately has no PageContent wrapper - the map needs
 * to fill the full remaining viewport height below the topbar,
 * so we use flex layout directly.
 *
 * TODO: replace MOCK_TRIPS with real API call:
 * const trips = await fetch(`${process.env.API_URL}/trips?status=active`)
 */
export default function RoutesPage() {
  const activeTrips = MOCK_TRIPS.filter(t => t.status === 'active')

  return (
    <>
      <Topbar
        title="Route map"
        subtitle={`${activeTrips.length} active trip${activeTrips.length !== 1 ? 's' : ''} - live view`}
        action={{ label: 'New trip', href: '/trips/new' }}
      />

      {/*
        RouteMapClient fills remaining height.
        The flex-1 + min-h-0 pattern is critical here - without min-h-0
        the map div won't respect the parent's height constraint and
        will overflow the viewport.
      */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <RouteMapClient trips={activeTrips} />
      </div>
    </>
  )
}
