'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { getMapsLoader } from '@/lib/maps-loader'
import { fetchRoute } from '@/lib/directions'
import type { Trip, Stop } from '@routedesk/types'

function hasCoords(stop: Stop): stop is Stop & { latitude: number; longitude: number } {
  return stop.latitude !== null && stop.longitude !== null
}

interface MapContainerProps {
  trips: Trip[]
  selectedTripId?: string | null
  onTripSelect?: (tripId: string) => void
  className?: string
}

const TRIP_COLORS = ['#1B3A6B', '#1D9E75', '#BA7517', '#A32D2D', '#534AB7']

type MapState = 'loading' | 'ready' | 'error' | 'no-key'

function makeMarkerEl(sequence: number, color: string, opacity = 1): HTMLElement {
  const el = document.createElement('div')
  el.style.cssText = `
    width:28px;height:28px;border-radius:50%;background:${color};
    border:2px solid #fff;display:flex;align-items:center;
    justify-content:center;color:#fff;font-size:11px;font-weight:600;
    font-family:system-ui,sans-serif;box-shadow:0 2px 6px rgba(0,0,0,0.25);
    cursor:pointer;opacity:${opacity};
  `
  el.textContent = String(sequence)
  return el
}

export function MapContainer({
  trips,
  selectedTripId,
  onTripSelect,
  className,
}: MapContainerProps) {
  const mapRef      = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstance = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markers     = useRef<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const polylines   = useRef<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const libs        = useRef<{ maps: any; core: any; marker: any; routes: any } | null>(null)

  const [mapState, setMapState] = useState<MapState>('loading')
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY

  useEffect(() => {
    if (!apiKey) { setMapState('no-key'); return }
    if (!mapRef.current) return

    const loader = getMapsLoader(apiKey)

    Promise.all([
      loader.importLibrary('maps'),
      loader.importLibrary('core'),
      loader.importLibrary('marker'),
      loader.importLibrary('routes'),
    ]).then(([mapsLib, coreLib, markerLib, routesLib]) => {
      if (!mapRef.current) return
      libs.current = { maps: mapsLib, core: coreLib, marker: markerLib, routes: routesLib }
      mapInstance.current = new mapsLib.Map(mapRef.current, {
        center:            { lat: -29.8587, lng: 31.0218 },
        zoom:              11,
        mapId:             'DEMO_MAP_ID',
        mapTypeControl:    false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl:       true,
      })
      setMapState('ready')
    }).catch(() => setMapState('error'))
  }, [apiKey])

  useEffect(() => {
    if (!mapInstance.current || !libs.current || mapState !== 'ready') return
    let cancelled = false

    const { maps, core, marker: markerLib, routes: routesLib } = libs.current

    markers.current.forEach((m: any) => { m.map = null })
    polylines.current.forEach((p: any) => p.setMap(null))
    markers.current  = []
    polylines.current = []

    const bounds = new core.LatLngBounds()

    trips.forEach((trip, tripIndex) => {
      const color      = TRIP_COLORS[tripIndex % TRIP_COLORS.length]
      const validStops = trip.stops.filter(hasCoords)
      const dimmed     = !!(selectedTripId && selectedTripId !== trip.id)

      if (validStops.length > 1) {
        const drawPolyline = (path: any, geodesic: boolean, opacity: number) => {
          if (cancelled) return
          const polyline = new maps.Polyline({
            path,
            geodesic,
            strokeColor:   color,
            strokeOpacity: opacity,
            strokeWeight:  selectedTripId === trip.id ? 4 : 2,
            map:           mapInstance.current,
          })
          polylines.current.push(polyline)
        }

        // Preserve the trip's assigned stop order - only ask Directions for
        // the real road path between them, not a reordering.
        fetchRoute(routesLib.Route, validStops, false)
          .then(route => drawPolyline(route.overviewPath, false, dimmed ? 0.2 : 0.8))
          .catch(() => drawPolyline(
            validStops.map((s: any) => ({ lat: s.latitude, lng: s.longitude })),
            true,
            dimmed ? 0.1 : 0.4
          ))
      }

      validStops.forEach((stop: any) => {
        const isArrived = stop.status === 'arrived'
        const position  = { lat: stop.latitude, lng: stop.longitude }
        bounds.extend(position)

        const marker = new markerLib.AdvancedMarkerElement({
          position,
          map:     mapInstance.current,
          title:   `${stop.sequence}. ${stop.clientName}`,
          content: makeMarkerEl(stop.sequence, isArrived ? '#1D9E75' : color, dimmed ? 0.35 : 1),
          zIndex:  selectedTripId === trip.id ? 10 : 1,
        })

        const arrivedTime = stop.arrivedAt
          ? new Date(stop.arrivedAt).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false })
          : null

        const infoWindow = new maps.InfoWindow({
          content: `
            <div style="font-family:sans-serif;font-size:12px;padding:4px 0">
              <p style="font-weight:600;margin:0 0 2px">${stop.sequence}. ${stop.clientName}</p>
              <p style="color:#666;margin:0 0 2px">${stop.address}</p>
              <p style="color:${isArrived ? '#1D9E75' : '#888'};margin:0;font-weight:500">
                ${isArrived ? `Arrived${arrivedTime ? ' ' + arrivedTime : ''}` : 'Pending'}
              </p>
              ${stop.geocodeFailed ? '<p style="color:#A32D2D;margin:4px 0 0;font-size:11px">⚠ Geocode failed</p>' : ''}
            </div>
          `,
        })

        marker.addEventListener('gmp-click', () => {
          infoWindow.open(mapInstance.current, marker)
          onTripSelect?.(trip.id)
        })

        markers.current.push(marker)
      })
    })

    if (!bounds.isEmpty()) mapInstance.current.fitBounds(bounds, 60)

    return () => { cancelled = true }
  }, [trips, selectedTripId, mapState, onTripSelect])

  return (
    <div className={cn('relative w-full h-full', className)}>
      <div ref={mapRef} className="absolute inset-0" aria-label="Route map" />

      {mapState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-[--color-surface-1]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[--color-brand] border-t-transparent animate-spin" aria-hidden />
            <p className="text-[13px] text-[--color-text-secondary]">Loading map…</p>
          </div>
        </div>
      )}

      {mapState === 'no-key' && (
        <div className="absolute inset-0 flex items-center justify-center bg-[--color-surface-1]">
          <div className="text-center max-w-xs">
            <div className="w-12 h-12 rounded-full bg-[--color-surface-2] flex items-center justify-center mx-auto mb-3">
              <span className="text-[20px]" aria-hidden>🗺</span>
            </div>
            <p className="text-[13px] font-medium text-[--color-text-primary] mb-1">
              Google Maps not configured
            </p>
            <p className="text-[12px] text-[--color-text-tertiary]">
              Add{' '}
              <code className="bg-[--color-surface-2] px-1 py-0.5 rounded text-[11px]">
                NEXT_PUBLIC_GOOGLE_MAPS_KEY
              </code>
              {' '}to your <code className="bg-[--color-surface-2] px-1 py-0.5 rounded text-[11px]">.env.local</code>
            </p>
          </div>
        </div>
      )}

      {mapState === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-[--color-surface-1]">
          <div className="text-center">
            <p className="text-[13px] font-medium text-[--color-text-primary] mb-1">Failed to load Google Maps</p>
            <p className="text-[12px] text-[--color-text-tertiary]">Check your API key and billing status</p>
          </div>
        </div>
      )}
    </div>
  )
}
