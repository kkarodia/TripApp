import type { Metadata } from 'next'
import { PageHeading } from '@/components/layout'
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
      <div className="px-4 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-4 flex-shrink-0">
        <PageHeading
          title="Route map"
          subtitle={`${activeTrips.length} active trip${activeTrips.length !== 1 ? 's' : ''} - live view`}
        />
      </div>

      {/*
        RouteMapClient fills remaining height.
        The flex-1 + min-h-0 pattern is critical here - without min-h-0
        the map div won't respect the parent's height constraint and
        will overflow the viewport.
      */}
      <div className="flex flex-col lg:flex-1 lg:min-h-0 lg:overflow-hidden">
        <RouteMapClient trips={activeTrips} />
      </div>
    </>
  )
}
