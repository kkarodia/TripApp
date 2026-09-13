'use client'

import { useEffect, useRef, useState } from 'react'
import { IconMap, IconCheck } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { getMapsLoader } from '@/lib/maps-loader'
import { fetchRoute } from '@/lib/directions'
import type { Stop, OptimiseFor } from '@routedesk/types'

interface MapPanelProps {
  stops: Stop[]
  /** Route start point, and the end point too on a round trip. */
  depot: { name: string; latitude: number; longitude: number }
  roundTrip: boolean
  calculated: boolean
  calculating: boolean
  optimiseFor: OptimiseFor
  totalDistanceKm?: number | null
  totalEstimatedMinutes?: number | null
  totalFuelLitres?: number | null
}

const OPTIMISE_LABEL: Record<OptimiseFor, string> = {
  distance: 'shortest distance',
  time:     'shortest time',
  fuel:     'lowest fuel cost',
}

const ROUTE_DOT_COLORS = {
  start: 'bg-[--color-success]',
  end:   'bg-[--color-danger]',
  mid:   'bg-[--color-brand]',
}

function hasCoords(stop: Stop): stop is Stop & { latitude: number; longitude: number } {
  return stop.latitude !== null && stop.longitude !== null
}

function makeMarkerEl(label: string, isDepot = false): HTMLElement {
  const el = document.createElement('div')
  el.style.cssText = `
    width:26px;height:26px;border-radius:50%;background:${isDepot ? '#0F7B4F' : '#1B3A6B'};
    border:2px solid #fff;display:flex;align-items:center;
    justify-content:center;color:#fff;font-size:${isDepot ? '13px' : '11px'};font-weight:600;
    font-family:system-ui,sans-serif;box-shadow:0 2px 6px rgba(0,0,0,0.25);
  `
  el.textContent = label
  return el
}

type GoogleMapState = 'loading' | 'ready' | 'error' | 'no-key'

export function MapPanel({
  stops,
  depot,
  roundTrip,
  calculated,
  calculating,
  optimiseFor,
  totalDistanceKm,
  totalEstimatedMinutes,
  totalFuelLitres,
}: MapPanelProps) {
  const mapRef      = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstance = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markers     = useRef<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const routeLine   = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const libs        = useRef<{ maps: any; core: any; marker: any; routes: any } | null>(null)

  const [googleState, setGoogleState] = useState<GoogleMapState>('loading')
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY

  // The map <div> only exists in the DOM while `calculated` is true (see JSX below).
  // Once it unmounts, drop the stale map/marker refs so the next calculation
  // reinitialises cleanly into the freshly-mounted div instead of a detached one.
  useEffect(() => {
    if (calculated) return
    mapInstance.current = null
    markers.current = []
    routeLine.current = null
    setGoogleState('loading')
  }, [calculated])

  // Load the map once the calculated route is ready to display
  useEffect(() => {
    if (!calculated) return
    if (!apiKey) { setGoogleState('no-key'); return }
    if (!mapRef.current || mapInstance.current) return

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
      setGoogleState('ready')
    }).catch(() => setGoogleState('error'))
  }, [calculated, apiKey])

  // Draw markers + the real road-following route once the map is ready
  useEffect(() => {
    if (!mapInstance.current || !libs.current || googleState !== 'ready') return
    let cancelled = false

    const { maps, core, marker: markerLib, routes: routesLib } = libs.current

    markers.current.forEach((m: any) => { m.map = null })
    routeLine.current?.setMap(null)
    markers.current = []

    const validStops = stops.filter(hasCoords)
    const bounds      = new core.LatLngBounds()

    // The driver leaves from and (on a round trip) returns to the depot, so it has to
    // be on the map and in the polyline - otherwise the drawn route silently omits
    // the first and last legs that the totals are counting.
    const depotPoint = { latitude: depot.latitude, longitude: depot.longitude }
    const routePoints = [
      depotPoint,
      ...validStops.map(s => ({ latitude: s.latitude, longitude: s.longitude })),
      ...(roundTrip ? [depotPoint] : []),
    ]

    const pins: { position: { lat: number; lng: number }; label: string; isDepot: boolean; title: string; body: string }[] = [
      {
        position: { lat: depot.latitude, lng: depot.longitude },
        label:    '⌂',
        isDepot:  true,
        title:    depot.name,
        body:     roundTrip ? 'Start and end of route' : 'Start of route',
      },
      ...validStops.map(stop => ({
        position: { lat: stop.latitude, lng: stop.longitude },
        label:    String(stop.sequence),
        isDepot:  false,
        title:    `${stop.sequence}. ${stop.clientName}`,
        body:     stop.address,
      })),
    ]

    pins.forEach(pin => {
      bounds.extend(pin.position)

      const marker = new markerLib.AdvancedMarkerElement({
        position: pin.position,
        map:      mapInstance.current,
        title:    pin.title,
        content:  makeMarkerEl(pin.label, pin.isDepot),
      })

      const infoWindow = new maps.InfoWindow({
        content: `
          <div style="font-family:sans-serif;font-size:12px;padding:4px 0">
            <p style="font-weight:600;margin:0 0 2px">${pin.title}</p>
            <p style="color:#666;margin:0">${pin.body}</p>
          </div>
        `,
      })
      marker.addEventListener('gmp-click', () => infoWindow.open(mapInstance.current, marker))
      markers.current.push(marker)
    })

    if (routePoints.length > 1) {
      // Order is already solved - this call only fetches the drivable path through it.
      fetchRoute(routesLib.Route, routePoints, false)
        .then(route => {
          if (cancelled) return
          routeLine.current = new maps.Polyline({
            path:          route.overviewPath,
            strokeColor:   '#1B3A6B',
            strokeOpacity: 0.7,
            strokeWeight:  3,
            map:           mapInstance.current,
          })
        })
        .catch(() => {
          if (cancelled) return
          routeLine.current = new maps.Polyline({
            path:          routePoints.map(p => ({ lat: p.latitude, lng: p.longitude })),
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
  }, [stops, depot, roundTrip, googleState])

  return (
    <div className="flex flex-col h-full">

      {/* ── Panel header ───────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[--color-border-subtle] flex-shrink-0">
        <p className="text-[13px] font-semibold text-[--color-text-primary]">Route preview</p>
        <p className="text-[11px] text-[--color-text-tertiary]">
          {calculated
            ? `Optimised · ${OPTIMISE_LABEL[optimiseFor]}`
            : 'Calculate route to preview'
          }
        </p>
      </div>

      {/* ── Map area ───────────────────────────────────────────── */}
      <div className="flex-1 relative bg-[--color-surface-1] flex items-center justify-center min-h-0">
        {calculating ? (
          /* Calculating state */
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-10 h-10 rounded-full border-2 border-[--color-brand] border-t-transparent animate-spin" aria-hidden />
            <p className="text-[13px] text-[--color-text-secondary]">Calculating optimal route…</p>
            <p className="text-[11px] text-[--color-text-tertiary]">This may take a few seconds</p>
          </div>
        ) : !calculated ? (
          /* Empty state */
          <div className="flex flex-col items-center gap-3 text-center px-8">
            <div className="w-12 h-12 rounded-full bg-[--color-surface-2] flex items-center justify-center">
              <IconMap size={22} stroke={1.5} className="text-[--color-text-tertiary]" aria-hidden />
            </div>
            <p className="text-[13px] text-[--color-text-secondary]">
              Map preview loads after route calculation
            </p>
            <p className="text-[11px] text-[--color-text-tertiary]">
              Google Maps will render here with stop markers and route polyline
            </p>
          </div>
        ) : (
          <div className="absolute inset-0" aria-label="Route map">
            <div ref={mapRef} className="absolute inset-0" />

            {googleState === 'loading' && (
              <div className="absolute inset-0 flex items-center justify-center bg-[--color-surface-2]">
                <div className="w-8 h-8 rounded-full border-2 border-[--color-brand] border-t-transparent animate-spin" aria-hidden />
              </div>
            )}

            {googleState === 'no-key' && (
              <div className="absolute inset-0 bg-[--color-surface-2] flex items-center justify-center">
                <div className="text-center px-6">
                  <IconMap size={28} stroke={1} className="text-[--color-text-tertiary] mx-auto mb-2" aria-hidden />
                  <p className="text-[13px] text-[--color-text-secondary]">Google Maps not configured</p>
                  <p className="text-[11px] text-[--color-text-tertiary] mt-1">
                    Add NEXT_PUBLIC_GOOGLE_MAPS_KEY to .env.local
                  </p>
                </div>
              </div>
            )}

            {googleState === 'error' && (
              <div className="absolute inset-0 bg-[--color-surface-2] flex items-center justify-center">
                <div className="text-center px-6">
                  <p className="text-[13px] text-[--color-text-secondary]">Failed to load Google Maps</p>
                  <p className="text-[11px] text-[--color-text-tertiary] mt-1">Check your API key and billing status</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Result banner ──────────────────────────────────────── */}
      {calculated && (
        <div className="mx-4 my-3 px-4 py-3 rounded-[--radius-md] bg-[--color-success-bg] border border-[--color-success-border] flex items-center justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-1.5">
              <IconCheck size={13} stroke={2.5} className="text-[--color-success]" aria-hidden />
              <p className="text-[12px] font-semibold text-[--color-success]">
                Route optimised - {OPTIMISE_LABEL[optimiseFor]}
              </p>
            </div>
            <p className="text-[11px] text-[--color-success] opacity-80 mt-0.5">
              {stops.length} stops
              {totalDistanceKm && ` · ${totalDistanceKm.toLocaleString('en-US')} km`}
              {totalEstimatedMinutes && ` · ${(totalEstimatedMinutes / 60).toFixed(1)} hrs`}
              {totalFuelLitres && ` · ${totalFuelLitres.toLocaleString('en-US')} L`}
            </p>
          </div>
        </div>
      )}

      {/* ── Optimised stop order ───────────────────────────────── */}
      {calculated && stops.length > 0 && (
        <div className="px-4 pb-4 flex-shrink-0 max-h-[220px] overflow-y-auto">
          <p className="text-[10px] font-medium text-[--color-text-tertiary] uppercase tracking-[0.06em] mb-2">
            Optimised stop order
          </p>
          <div>
            {/* Depot opens the list so the order reads as the drive actually happens. */}
            <div className="flex items-start gap-2">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className={cn('w-2 h-2 rounded-full mt-1 flex-shrink-0', ROUTE_DOT_COLORS.start)} />
                <div className="w-px flex-1 min-h-[14px] bg-[--color-border-default] my-0.5" />
              </div>
              <div className="pb-1 min-w-0">
                <p className="text-[12px] text-[--color-text-primary] truncate">{depot.name}</p>
                <p className="text-[10px] text-[--color-text-tertiary]">Depart</p>
              </div>
            </div>

            {stops.map((stop, i) => (
              <div key={stop.id} className="flex items-start gap-2">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={cn('w-2 h-2 rounded-full mt-1 flex-shrink-0', ROUTE_DOT_COLORS.mid)} />
                  <div className="w-px flex-1 min-h-[14px] bg-[--color-border-default] my-0.5" />
                </div>
                <div className="pb-1 min-w-0">
                  <p className="text-[12px] text-[--color-text-primary] truncate">
                    {i + 1}. {stop.clientName}
                  </p>
                  {stop.distanceKm !== null && (
                    <p className="text-[10px] text-[--color-text-tertiary]">
                      {stop.distanceKm} km · {stop.roadType}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {roundTrip && (
              <div className="flex items-start gap-2">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={cn('w-2 h-2 rounded-full mt-1 flex-shrink-0', ROUTE_DOT_COLORS.end)} />
                </div>
                <div className="pb-1 min-w-0">
                  <p className="text-[12px] text-[--color-text-primary] truncate">{depot.name}</p>
                  <p className="text-[10px] text-[--color-text-tertiary]">Return</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
