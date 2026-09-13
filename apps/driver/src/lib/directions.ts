/**
 * Thin wrapper around google.maps.routes.Route.computeRoutes (the Routes API,
 * successor to the deprecated DirectionsService). Used both to draw real
 * road-following polylines (optimize: false, order preserved) and to compute
 * the optimal stop order (optimize: true) in the trip planner.
 *
 * Params are typed `any` (not google.maps.*) to match the rest of the maps
 * integration in this app - the @types/google.maps global isn't resolved
 * from apps/admin's TS project, so every other map file does the same.
 */

export interface RoutePoint {
  latitude: number
  longitude: number
}

export interface RouteResult {
  /** Road-following path, ready to feed straight into a Polyline. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  overviewPath: any[]
  totalDistanceMeters: number
  totalDurationSeconds: number
  /** Per-leg distance/duration/end-point, one entry per hop between consecutive points (in response order). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  legs: { distanceMeters: number; durationSeconds: number; endLocation: any }[]
  /**
   * Zero-based reordering of the intermediate points (excludes origin/destination).
   * Only populated when optimize: true was requested.
   */
  waypointOrder: number[] | null
}

const FIELDS = [
  'path',
  'distanceMeters',
  'durationMillis',
  'legs',
  'optimizedIntermediateWaypointIndices',
]

/**
 * @param RouteClass The `Route` class from the loaded 'routes' library (i.e. `(await loader.importLibrary('routes')).Route`).
 */
export async function fetchRoute(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  RouteClass: any,
  points: RoutePoint[],
  optimize: boolean
): Promise<RouteResult> {
  if (points.length < 2) {
    throw new Error('fetchRoute requires at least an origin and a destination')
  }

  const origin       = points[0]
  const destination  = points[points.length - 1]
  const intermediates = points.slice(1, -1).map(p => ({
    location: { lat: p.latitude, lng: p.longitude },
  }))

  const { routes } = await RouteClass.computeRoutes({
    origin:                 { lat: origin.latitude, lng: origin.longitude },
    destination:            { lat: destination.latitude, lng: destination.longitude },
    intermediates,
    optimizeWaypointOrder:  optimize,
    travelMode:             'DRIVING',
    fields:                 FIELDS,
  })

  const route = routes?.[0]
  if (!route) throw new Error('No route found')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const legs = (route.legs ?? []).map((leg: any) => ({
    distanceMeters:  leg.distanceMeters ?? 0,
    durationSeconds: leg.durationMillis ? Math.round(leg.durationMillis / 1000) : 0,
    endLocation:     leg.endLocation,
  }))

  return {
    overviewPath:         route.path ?? [],
    totalDistanceMeters:  route.distanceMeters ?? 0,
    totalDurationSeconds: route.durationMillis ? Math.round(route.durationMillis / 1000) : 0,
    legs,
    waypointOrder: optimize ? (route.optimizedIntermediateWaypointIndices ?? []) : null,
  }
}
