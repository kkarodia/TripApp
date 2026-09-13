'use client'

import { useEffect, useRef, useState } from 'react'
import type { Trip, Stop } from '@routedesk/types'
import { getMapsLoader } from '@/lib/maps-loader'
import { fetchRoute } from '@/lib/directions'

function hasCoords(stop: Stop): stop is Stop & { latitude: number; longitude: number } {
  return stop.latitude !== null && stop.longitude !== null
}

interface TripMapProps {
  trip: Trip
}

type MapState = 'loading' | 'ready' | 'error' | 'no-key'

function makeMarkerEl(sequence: number, color: string): HTMLElement {
  const el = document.createElement('div')
  el.style.cssText = `
    width:28px;height:28px;border-radius:50%;background:${color};
    border:2px solid #fff;display:flex;align-items:center;
    justify-content:center;color:#fff;font-size:11px;font-weight:600;
    font-family:system-ui,sans-serif;box-shadow:0 2px 6px rgba(0,0,0,0.25);cursor:pointer;
  `
  el.textContent = String(sequence)
  return el
}

export function TripMap({ trip }: TripMapProps) {
  const mapRef      = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstance = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markers     = useRef<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const routeLine   = useRef<any>(null)
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
        fullscreenControl: false,
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
    routeLine.current?.setMap(null)
    markers.current = []

    const currentStop = trip.stops.find(s => s.status === 'pending')
    const validStops  = trip.stops.filter(hasCoords)
    const bounds      = new core.LatLngBounds()

    validStops.forEach((stop: any) => {
      const isArrived = stop.status === 'arrived'
      const isCurrent = stop.id === currentStop?.id
      const position  = { lat: stop.latitude, lng: stop.longitude }
      bounds.extend(position)

      const color = isArrived ? '#1D9E75' : isCurrent ? '#1B3A6B' : '#9eb4d6'

      const marker = new markerLib.AdvancedMarkerElement({
        position,
        map:     mapInstance.current,
        title:   `${stop.sequence}. ${stop.clientName}`,
        content: makeMarkerEl(stop.sequence, color),
        zIndex:  isCurrent ? 10 : isArrived ? 5 : 1,
      })

      const arrivedTime = stop.arrivedAt
        ? new Date(stop.arrivedAt).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false })
        : null

      const infoWindow = new maps.InfoWindow({
        content: `
          <div style="font-family:system-ui,sans-serif;font-size:12px;padding:4px 2px;min-width:160px">
            <p style="font-weight:600;margin:0 0 3px;color:#111">${stop.sequence}. ${stop.clientName}</p>
            <p style="color:#555;margin:0 0 4px;font-size:11px">${stop.address}</p>
            <p style="margin:0;font-weight:500;color:${isArrived ? '#1D9E75' : isCurrent ? '#1B3A6B' : '#888'}">
              ${isArrived ? (arrivedTime ? `Delivered · ${arrivedTime}` : 'Delivered') : isCurrent ? 'Next stop' : 'Pending'}
            </p>
            ${stop.geocodeFailed ? '<p style="color:#a32d2d;margin:4px 0 0;font-size:11px">⚠ Approximate location</p>' : ''}
          </div>
        `,
      })

      marker.addEventListener('gmp-click', () => infoWindow.open(mapInstance.current, marker))
      markers.current.push(marker)
    })

    if (validStops.length > 1) {
      // Preserve the assigned stop order (sequence) - only ask Directions for
      // the real road path between them, not a reordering.
      fetchRoute(routesLib.Route, validStops, false)
        .then(route => {
          if (cancelled) return
          routeLine.current = new maps.Polyline({
            path:          route.overviewPath,
            strokeColor:   '#1B3A6B',
            strokeOpacity: 0.65,
            strokeWeight:  3,
            map:           mapInstance.current,
          })
        })
        .catch(() => {
          if (cancelled) return
          // Road routing failed (e.g. no route found) - fall back to a straight line
          routeLine.current = new maps.Polyline({
            path:          validStops.map((s: any) => ({ lat: s.latitude, lng: s.longitude })),
            geodesic:      true,
            strokeColor:   '#1B3A6B',
            strokeOpacity: 0.4,
            strokeWeight:  3,
            map:           mapInstance.current,
          })
        })
    }

    if (!bounds.isEmpty()) mapInstance.current.fitBounds(bounds, 48)

    return () => { cancelled = true }
  }, [trip, mapState])

  return (
    <div className="relative w-full h-full bg-[--color-surface-1]">
      <div ref={mapRef} className="absolute inset-0" aria-label="Trip route map" />

      {mapState === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[--color-brand] border-t-transparent animate-spin" aria-hidden />
          <p className="text-[13px] text-[--color-text-secondary]">Loading map…</p>
        </div>
      )}

      {mapState === 'no-key' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
          <div className="w-14 h-14 rounded-full bg-[--color-surface-2] flex items-center justify-center mb-4 text-2xl">🗺</div>
          <p className="text-[14px] font-semibold text-[--color-text-primary] mb-1">Map not configured</p>
          <p className="text-[12px] text-[--color-text-tertiary] leading-relaxed">
            Add <code className="bg-[--color-surface-2] px-1 rounded">NEXT_PUBLIC_GOOGLE_MAPS_KEY</code> to .env.local
          </p>
          <div className="mt-6 w-full max-w-[280px] bg-white rounded-[--radius-lg] border border-[--color-border-subtle] overflow-hidden text-left">
            {trip.stops.map((stop, i) => {
              const isArrived = stop.status === 'arrived'
              const isNext    = stop.status === 'pending' && trip.stops.slice(0, i).every(s => s.status === 'arrived')
              const dotColor  = isArrived ? '#1D9E75' : isNext ? '#1B3A6B' : '#9eb4d6'
              return (
                <div key={stop.id} className={`flex items-center gap-3 px-4 py-2.5 ${i < trip.stops.length - 1 ? 'border-b border-[--color-border-subtle]' : ''}`}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold" style={{ background: dotColor }}>
                    {stop.sequence}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-[--color-text-primary] truncate">{stop.clientName}</p>
                    <p className="text-[11px] text-[--color-text-tertiary] truncate">{stop.address}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {mapState === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p className="text-[13px] font-medium text-[--color-text-primary] mb-1">Failed to load map</p>
          <p className="text-[12px] text-[--color-text-tertiary]">Check your API key and network connection</p>
        </div>
      )}
    </div>
  )
}
