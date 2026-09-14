'use client'

import { useState, useCallback } from 'react'
import { IconAlertTriangle } from '@tabler/icons-react'
import { ConfigBar } from './config-bar'
import { StopsPanel } from './stops-panel'
import { MapPanel } from './map-panel'
import { DEPOTS, DEFAULT_DEPOT, durbanSeedStops } from '@/lib/durban-seed'
import { getMapsLoader } from '@/lib/maps-loader'
import { optimiseRoute } from '@/lib/routing/optimise'
import type { Stop, OptimiseFor, Trip } from '@routedesk/types'

/**
 * TripPlanner - the main client component owning all trip planner state.
 *
 * State lives here (not in the page) because the two panels (stops + map)
 * need to share it. The page itself is a server component that just renders this.
 *
 * When the backend is ready:
 * - Replace mock stop creation with POST /stops
 * - Replace handleCalculate() with POST /trips/:id/calculate
 * - Replace save draft with POST /trips
 */

const SEED_STOPS = durbanSeedStops()

export function TripPlanner() {
  // ── Config state ─────────────────────────────────────────────
  const [warehouse,   setWarehouse]   = useState(DEFAULT_DEPOT)
  // Empty until a driver is picked - a trip can be built and saved uncrewed.
  const [driverId,    setDriverId]    = useState('')
  const [tripType,    setTripType]    = useState<'round-trip' | 'one-way'>('round-trip')
  const [optimiseFor, setOptimiseFor] = useState<OptimiseFor>('distance')

  // ── Stops state ──────────────────────────────────────────────
  const [stops, setStops] = useState<Stop[]>(SEED_STOPS)

  // ── Calculation state ────────────────────────────────────────
  // Totals start empty: they are results of a calculation, not seed data.
  const [calculated,   setCalculated]   = useState(false)
  const [calculating,  setCalculating]  = useState(false)
  const [totalDistKm,  setTotalDistKm]  = useState<number | null>(null)
  const [totalMins,    setTotalMins]    = useState<number | null>(null)
  const [fuelIndex,    setFuelIndex]    = useState<number | null>(null)
  const [calcError,    setCalcError]    = useState<string | null>(null)

  // Count geocode failures - these block calculation
  const geocodeFails = stops.filter(s => s.geocodeFailed).length

  // ── Handlers ─────────────────────────────────────────────────
  const handleAddStop = useCallback((address: string) => {
    // In production: POST /geocode then append stop
    // For now: create a pending stop with a geocode failure flag
    const newStop: Stop = {
      id:                 `s-${Date.now()}`,
      tripId:             'new',
      sequence:           stops.length + 1,
      clientName:         address,
      address,
      latitude:           null,
      longitude:          null,
      geocodeFailed:      true,   // mock - real geocoder would resolve this
      roadType:           'unknown',
      distanceKm:         null,
      estimatedMinutes:   null,
      status:             'pending',
      arrivedAt:          null,
      orders:             null,
      createdAt:          new Date().toISOString(),
    }
    setStops(prev => [...prev, newStop])
    setCalculated(false)  // adding a stop invalidates the current calculation
  }, [stops.length])

  const handleDeleteStop = useCallback((stopId: string) => {
    setStops(prev => prev.filter(s => s.id !== stopId))
    setCalculated(false)
  }, [])

  const handleEditStop = useCallback((stop: Stop) => {
    // TODO: open edit modal - for now just logs
    console.log('Edit stop:', stop)
  }, [])

  // Any input that feeds the cost matrix or the objective invalidates the result on
  // screen - otherwise the totals keep describing a route nobody asked for any more.
  const invalidate = useCallback((reason: string) => {
    setCalculated(false)
    setTotalDistKm(null)
    setTotalMins(null)
    setFuelIndex(null)
    setCalcError(`${reason} - recalculate to update the route.`)
  }, [])

  const handleOptimiseChange = useCallback((value: OptimiseFor) => {
    if (calculated) invalidate('Optimisation filter changed')
    setOptimiseFor(value)
  }, [calculated, invalidate])

  const handleWarehouseChange = useCallback((value: string) => {
    if (calculated) invalidate('Depot changed')
    setWarehouse(value)
  }, [calculated, invalidate])

  const handleTripTypeChange = useCallback((value: 'round-trip' | 'one-way') => {
    if (calculated) invalidate('Trip type changed')
    setTripType(value)
  }, [calculated, invalidate])

  async function handleCalculate() {
    // Block if geocode failures exist
    if (geocodeFails > 0) {
      setCalcError(`${geocodeFails} stop${geocodeFails !== 1 ? 's' : ''} could not be geocoded. Fix all addresses before calculating.`)
      return
    }
    if (stops.length === 0) {
      setCalcError('Add at least one stop before calculating.')
      return
    }
    // No driver check: trips are planned and costed first, crewed later.

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY
    if (!apiKey) {
      setCalcError('Google Maps is not configured - add NEXT_PUBLIC_GOOGLE_MAPS_KEY to .env.local.')
      return
    }

    setCalcError(null)
    setCalculating(true)

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const routesLib = await getMapsLoader(apiKey).importLibrary('routes') as any

      const depot       = DEPOTS[warehouse]
      const isRoundTrip = tripType === 'round-trip'

      // Point 0 is the depot; points 1..n are the stops, in the order currently listed.
      // The solver returns indices into this array.
      const points = [depot, ...stops].map(p => ({
        latitude:  p.latitude as number,
        longitude: p.longitude as number,
      }))

      const result = await optimiseRoute(routesLib.RouteMatrix, points, {
        objective: optimiseFor,
        closed:    isRoundTrip,
        // On a one-way trip the last listed stop is the fixed destination, not a
        // waypoint to be resequenced.
        fixedEnd:  isRoundTrip ? undefined : points.length - 1,
      })

      if (result.unreachablePairs > 0) {
        setCalcError(`${result.unreachablePairs} stop pair${result.unreachablePairs !== 1 ? 's' : ''} could not be routed by road. The order below skips them.`)
      }

      // result.order starts at the depot (index 0), so drop it and shift back to stop indices.
      const newStops: Stop[] = result.order.slice(1).map((pointIndex, i) => {
        const leg = result.legs[i]
        return {
          ...stops[pointIndex - 1],
          sequence:         i + 1,
          distanceKm:       Math.round(leg.distanceMeters / 100) / 10,
          estimatedMinutes: Math.round(leg.durationSeconds / 60),
          roadType:         leg.roadType,
        }
      })

      setStops(newStops)
      setTotalDistKm(Math.round(result.totalDistanceKm * 10) / 10)
      setTotalMins(Math.round(result.totalMinutes))
      setFuelIndex(Math.round(result.totalFuelLitres * 10) / 10)
      setCalculating(false)
      setCalculated(true)
    } catch {
      setCalculating(false)
      setCalcError('Could not calculate the route. Check stop addresses and try again.')
    }
  }

  const trip: Partial<Trip> & { stops: Stop[] } = {
    warehouseName:          DEPOTS[warehouse].name,
    warehouseAddress:       DEPOTS[warehouse].address,
    tripType,
    stops,
    totalDistanceKm:        totalDistKm,
    totalEstimatedMinutes:  totalMins,
    fuelIndex,
  }

  return (
    <div className="flex flex-col lg:flex-1 lg:min-h-0">

      {/* ── Config bar ───────────────────────────────────────────── */}
      <ConfigBar
        warehouse={warehouse}         onWarehouseChange={handleWarehouseChange}
        driverId={driverId}           onDriverChange={setDriverId}
        tripType={tripType}           onTripTypeChange={handleTripTypeChange}
        optimiseFor={optimiseFor}     onOptimiseChange={handleOptimiseChange}
        disabled={calculating}
      />

      {/* ── Error banner ─────────────────────────────────────────── */}
      {calcError && (
        <div className="mx-4 mt-3 flex items-start gap-2.5 px-3.5 py-3 rounded-[--radius-md] bg-[--color-danger-bg] border border-[--color-danger-border]">
          <IconAlertTriangle size={14} stroke={2} className="text-[--color-danger] flex-shrink-0 mt-0.5" aria-hidden />
          <p className="text-[12px] text-[--color-danger]">{calcError}</p>
          <button
            onClick={() => setCalcError(null)}
            className="ml-auto text-[--color-danger] hover:opacity-70 text-[12px]"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Two-panel layout - stacked below lg ─────────────────── */}
      <div className="flex flex-col mt-3 mx-4 mb-4 rounded-[--radius-lg] border border-[--color-border-subtle] overflow-hidden bg-white lg:flex-row lg:flex-1 lg:min-h-0">

        {/* Left: stops */}
        <div className="w-full border-b border-[--color-border-subtle] flex flex-col lg:w-[420px] lg:flex-shrink-0 lg:border-b-0 lg:border-r lg:min-h-0">
          <StopsPanel
            trip={trip}
            onAddStop={handleAddStop}
            onDeleteStop={handleDeleteStop}
            onEditStop={handleEditStop}
            onCalculate={handleCalculate}
            calculated={calculated}
            calculating={calculating}
            disabled={calculating}
          />
        </div>

        {/* Right: map - needs an explicit height once stacked. */}
        <div className="h-[420px] flex flex-col lg:h-auto lg:flex-1 lg:min-h-0">
          <MapPanel
            stops={stops}
            depot={DEPOTS[warehouse]}
            roundTrip={tripType === 'round-trip'}
            calculated={calculated}
            calculating={calculating}
            optimiseFor={optimiseFor}
            totalDistanceKm={totalDistKm}
            totalEstimatedMinutes={totalMins}
            totalFuelLitres={fuelIndex}
          />
        </div>
      </div>
    </div>
  )
}
