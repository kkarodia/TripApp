/**
 * Ties the two stages together: pick the cost matrix that matches the chosen
 * objective, hand it to the solver, then summarise the resulting route.
 *
 * Splitting "cost data" from "solving" is what makes the three-way objective toggle
 * nearly free - time, distance and fuel are the same solver run over a different
 * matrix. Google's own waypoint optimisation only ever optimises one way, so owning
 * the sequencing step is the only way to offer the choice honestly.
 */

import type { OptimiseFor, RoadType } from '@routedesk/types'
import { fetchCostMatrices, type CostMatrices, type MatrixPoint } from './route-matrix'
import { buildFuelMatrix, legFuelLitres } from './fuel'
import { solveRoute } from './solver'

export interface OptimiseOptions {
  objective: OptimiseFor
  /** Return to the depot after the last stop. */
  closed: boolean
  /** Point index pinned to the end of the route, for a one-way trip. */
  fixedEnd?: number
}

export interface RouteLeg {
  from: number
  to: number
  distanceMeters: number
  durationSeconds: number
  fuelLitres: number
  roadType: RoadType
}

export interface OptimiseResult {
  /** Visit order by point index, starting at the depot (index 0). */
  order: number[]
  legs: RouteLeg[]
  totalDistanceKm: number
  totalMinutes: number
  totalFuelLitres: number
  unreachablePairs: number
}

/** Average speed of a leg tells us what kind of road it mostly used. */
function classifyRoad(distanceMeters: number, durationSeconds: number): RoadType {
  if (durationSeconds <= 0 || distanceMeters <= 0) return 'unknown'
  const speedKmh = distanceMeters / 1000 / (durationSeconds / 3600)
  if (speedKmh >= 80) return 'motorway'
  if (speedKmh >= 50) return 'national'
  return 'urban'
}

function matrixFor(objective: OptimiseFor, m: CostMatrices): number[][] {
  switch (objective) {
    case 'time':
      return m.duration
    case 'distance':
      return m.distance
    case 'fuel':
      return buildFuelMatrix(m.distance, m.duration)
  }
}

/**
 * Pure half of the pipeline - no Google, no DOM. Given cost matrices, returns the
 * optimised order and its totals.
 */
export function optimiseFromMatrices(
  matrices: CostMatrices,
  opts: OptimiseOptions
): OptimiseResult {
  const { order } = solveRoute(matrixFor(opts.objective, matrices), {
    closed: opts.closed,
    fixedEnd: opts.fixedEnd,
  })

  // Walk the solved order to collect per-leg figures, adding the return leg on a
  // round trip so the totals match what the driver actually drives.
  const hops: [number, number][] = []
  for (let i = 0; i < order.length - 1; i++) hops.push([order[i], order[i + 1]])
  if (opts.closed && order.length > 1) hops.push([order[order.length - 1], order[0]])

  const legs: RouteLeg[] = hops.map(([from, to]) => {
    const distanceMeters = matrices.distance[from][to]
    const durationSeconds = matrices.duration[from][to]
    const reachable = Number.isFinite(distanceMeters) && Number.isFinite(durationSeconds)
    return {
      from,
      to,
      distanceMeters: reachable ? distanceMeters : 0,
      durationSeconds: reachable ? durationSeconds : 0,
      fuelLitres: reachable ? legFuelLitres(distanceMeters, durationSeconds) : 0,
      roadType: reachable ? classifyRoad(distanceMeters, durationSeconds) : 'unknown',
    }
  })

  const sum = (pick: (l: RouteLeg) => number) => legs.reduce((acc, l) => acc + pick(l), 0)

  return {
    order,
    legs,
    totalDistanceKm: sum(l => l.distanceMeters) / 1000,
    totalMinutes: sum(l => l.durationSeconds) / 60,
    totalFuelLitres: sum(l => l.fuelLitres),
    unreachablePairs: matrices.unreachablePairs,
  }
}

/** Full pipeline: fetch the matrix from Google, then solve for the chosen objective. */
export async function optimiseRoute(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  RouteMatrixClass: any,
  points: MatrixPoint[],
  opts: OptimiseOptions
): Promise<OptimiseResult> {
  const matrices = await fetchCostMatrices(RouteMatrixClass, points)
  return optimiseFromMatrices(matrices, opts)
}
