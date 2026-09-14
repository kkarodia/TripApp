'use client'

import { useState } from 'react'
import { MapContainer } from './map-container'
import { TripFilterSidebar } from './trip-filter-sidebar'
import type { Trip } from '@routedesk/types'

interface RouteMapClientProps {
  trips: Trip[]
}

/**
 * RouteMapClient - owns selected trip state.
 * Sits between the server page and the map/sidebar components.
 */
export function RouteMapClient({ trips }: RouteMapClientProps) {
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)

  // When a trip is selected, filter to only that trip's stops on the map
  // When null, show all trips
  const displayedTrips = selectedTripId
    ? trips.filter(t => t.id === selectedTripId)
    : trips

  // Below lg the trip list stacks above the map, and the page scrolls - so the
  // map gets a height of its own instead of borrowing the viewport's.
  return (
    <div className="flex flex-col lg:flex-row lg:flex-1 lg:min-h-0">
      <TripFilterSidebar
        trips={trips}
        selectedTripId={selectedTripId}
        onSelect={setSelectedTripId}
      />
      <div className="h-[60vh] min-h-[360px] lg:h-auto lg:min-h-0 lg:flex-1">
        <MapContainer
          trips={displayedTrips}
          selectedTripId={selectedTripId}
          onTripSelect={id => setSelectedTripId(prev => prev === id ? null : id)}
        />
      </div>
    </div>
  )
}
