/**
 * Derives a fuel-cost matrix from the distance and duration matrices.
 *
 * Google's fuel-consumption data is only available on computeRoutes (point to point),
 * never on computeRouteMatrix, so there is no pairwise fuel matrix to fetch. Instead
 * the implied average speed of each pair tells us what kind of driving it is, and a
 * consumption curve converts that into litres.
 *
 * This is what stops "fuel" collapsing into "distance": a flat litres-per-km rate
 * would rank every route exactly as distance does. Weighting by speed means a longer
 * run up the N2 can beat a shorter crawl through the Durban CBD.
 */

/**
 * Diesel consumption for a medium delivery truck, litres per 100 km, against average
 * speed in km/h. U-shaped: stop-start traffic burns fuel going nowhere, high speed
 * burns it fighting drag, with the optimum in the 70-85 km/h band.
 */
const CONSUMPTION_CURVE: ReadonlyArray<readonly [speedKmh: number, litresPer100Km: number]> = [
  [5, 58.0],
  [15, 44.0],
  [25, 35.0],
  [40, 29.0],
  [55, 26.0],
  [70, 24.2],
  [85, 24.8],
  [100, 27.5],
  [120, 32.0],
]

/** Litres per 100 km for a given average speed, linearly interpolated across the curve. */
export function consumptionAtSpeed(speedKmh: number): number {
  const first = CONSUMPTION_CURVE[0]
  const last = CONSUMPTION_CURVE[CONSUMPTION_CURVE.length - 1]
  if (speedKmh <= first[0]) return first[1]
  if (speedKmh >= last[0]) return last[1]

  for (let i = 0; i < CONSUMPTION_CURVE.length - 1; i++) {
    const [s0, c0] = CONSUMPTION_CURVE[i]
    const [s1, c1] = CONSUMPTION_CURVE[i + 1]
    if (speedKmh >= s0 && speedKmh <= s1) {
      const t = (speedKmh - s0) / (s1 - s0)
      return c0 + t * (c1 - c0)
    }
  }
  return last[1]
}

/** Litres burned covering `distanceMeters` in `durationSeconds`. */
export function legFuelLitres(distanceMeters: number, durationSeconds: number): number {
  if (distanceMeters <= 0) return 0
  const distanceKm = distanceMeters / 1000
  // A zero/absent duration would imply infinite speed; fall back to a typical urban pace.
  const speedKmh = durationSeconds > 0 ? distanceKm / (durationSeconds / 3600) : 30
  return (distanceKm / 100) * consumptionAtSpeed(speedKmh)
}

/** Builds the litres-per-pair matrix the solver minimises when the objective is fuel. */
export function buildFuelMatrix(distance: number[][], duration: number[][]): number[][] {
  return distance.map((row, i) => row.map((meters, j) => legFuelLitres(meters, duration[i][j])))
}
