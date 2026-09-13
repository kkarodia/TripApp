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

  return (
    <div className="flex flex-1 min-h-0">
      <TripFilterSidebar
        trips={trips}
        selectedTripId={selectedTripId}
        onSelect={setSelectedTripId}
      />
      <MapContainer
        trips={displayedTrips}
        selectedTripId={selectedTripId}
        onTripSelect={id => setSelectedTripId(prev => prev === id ? null : id)}
        className="flex-1"
      />
    </div>
  )
}
