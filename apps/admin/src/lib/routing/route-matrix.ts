/**
 * Stage 1 of route optimisation: fetch the pairwise cost matrix.
 *
 * One computeRouteMatrix request returns distance and duration for every
 * origin/destination pair, which is what lets us own the sequencing step instead of
 * accepting whatever single ordering computeRoutes hands back. Google caps a request
 * at 625 elements, so anything past a 25x25 grid is tiled into several requests and
 * stitched back together.
 *
 * Params are typed `any` rather than google.maps.* to match the rest of the maps
 * integration in this app - the @types/google.maps global isn't resolved from
 * apps/admin's TS project, so every other map file does the same.
 */

export interface MatrixPoint {
  latitude: number
  longitude: number
}

export interface CostMatrices {
  /** distance[i][j] - metres driving from point i to point j. */
  distance: number[][]
  /** duration[i][j] - seconds driving from point i to point j. */
  duration: number[][]
  /** Pairs Google could not route, left as Infinity in both matrices. */
  unreachablePairs: number
}

/** Google's per-request ceiling is 625 elements; a 25x25 tile sits exactly on it. */
const MAX_TILE = 25

function square(n: number, fill: number): number[][] {
  return Array.from({ length: n }, () => new Array<number>(n).fill(fill))
}

/**
 * @param RouteMatrixClass The `RouteMatrix` class from the loaded 'routes' library
 *   (i.e. `(await loader.importLibrary('routes')).RouteMatrix`).
 */
export async function fetchCostMatrices(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  RouteMatrixClass: any,
  points: MatrixPoint[]
): Promise<CostMatrices> {
  const n = points.length
  if (n < 2) throw new Error('fetchCostMatrices requires at least two points')

  const distance = square(n, Infinity)
  const duration = square(n, Infinity)
  let unreachablePairs = 0

  const latLng = (p: MatrixPoint) => ({ lat: p.latitude, lng: p.longitude })

  for (let rowStart = 0; rowStart < n; rowStart += MAX_TILE) {
    for (let colStart = 0; colStart < n; colStart += MAX_TILE) {
      const rowEnd = Math.min(rowStart + MAX_TILE, n)
      const colEnd = Math.min(colStart + MAX_TILE, n)

      const { matrix } = await RouteMatrixClass.computeRouteMatrix({
        origins: points.slice(rowStart, rowEnd).map(latLng),
        destinations: points.slice(colStart, colEnd).map(latLng),
        travelMode: 'DRIVING',
        fields: ['distanceMeters', 'durationMillis', 'condition'],
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows: any[] = matrix?.rows ?? []
      rows.forEach((row, localRow) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items: any[] = row?.items ?? []
        items.forEach((item, localCol) => {
          const i = rowStart + localRow
          const j = colStart + localCol

          if (i === j) {
            distance[i][j] = 0
            duration[i][j] = 0
            return
          }

          const routable = !item?.error && item?.condition !== 'ROUTE_NOT_FOUND'
          if (!routable || item?.distanceMeters == null) {
            unreachablePairs++
            return
          }

          distance[i][j] = item.distanceMeters
          duration[i][j] = item.durationMillis != null ? item.durationMillis / 1000 : 0
        })
      })
    }
  }

  for (let i = 0; i < n; i++) {
    distance[i][i] = 0
    duration[i][i] = 0
  }

  return { distance, duration, unreachablePairs }
}
