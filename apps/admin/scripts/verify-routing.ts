/**
 * Offline verification of the routing pipeline.
 *
 * IMPORTANT: the cost matrix here is a MODEL of Durban road travel, not Google data.
 * This proves the solver, the fuel model and the objective wiring are correct. It
 * does NOT prove the Google integration - that needs a browser run with the real key.
 */

import { solveRoute, tourCost } from '../src/lib/routing/solver'
import { buildFuelMatrix, legFuelLitres, consumptionAtSpeed } from '../src/lib/routing/fuel'
import { optimiseFromMatrices } from '../src/lib/routing/optimise'
import { DEPOTS, durbanSeedStops } from '../src/lib/durban-seed'

// ─── A Durban road-travel model ──────────────────────────────────────────────
// Straight-line distance inflated by a circuity factor, with speeds that reflect
// how the corridor is actually driven: CBD crawl, suburban arterials, N2/N3 runs.

interface P { name: string; latitude: number; longitude: number }

function haversineKm(a: P, b: P): number {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.latitude - a.latitude)
  const dLon = toRad(b.longitude - a.longitude)
  const lat1 = toRad(a.latitude)
  const lat2 = toRad(b.latitude)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** Dense inner-Durban box - anything inside it drives slowly. */
function isCongested(p: P): boolean {
  return p.latitude < -29.79 && p.latitude > -29.94 && p.longitude > 30.97
}

function modelLeg(a: P, b: P): { distanceMeters: number; durationSeconds: number } {
  const straight = haversineKm(a, b)
  if (straight === 0) return { distanceMeters: 0, durationSeconds: 0 }

  const circuity = straight < 8 ? 1.38 : straight < 25 ? 1.26 : 1.18
  const roadKm = straight * circuity

  let speed = straight < 8 ? 26 : straight < 25 ? 46 : 78
  if (isCongested(a)) speed *= 0.72
  if (isCongested(b)) speed *= 0.72

  return {
    distanceMeters: roadKm * 1000,
    durationSeconds: (roadKm / speed) * 3600,
  }
}

function buildModelMatrices(points: P[]) {
  const n = points.length
  const distance = Array.from({ length: n }, () => new Array<number>(n).fill(0))
  const duration = Array.from({ length: n }, () => new Array<number>(n).fill(0))
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue
      const leg = modelLeg(points[i], points[j])
      distance[i][j] = leg.distanceMeters
      duration[i][j] = leg.durationSeconds
    }
  }
  return { distance, duration, unreachablePairs: 0 }
}

// ─── Test harness ────────────────────────────────────────────────────────────
let failures = 0
function check(label: string, condition: boolean, detail = '') {
  const mark = condition ? 'PASS' : 'FAIL'
  if (!condition) failures++
  console.log(`  [${mark}] ${label}${detail ? ` — ${detail}` : ''}`)
}

const depot = DEPOTS.springfield
const stops = durbanSeedStops()
const points: P[] = [
  { name: depot.name, latitude: depot.latitude, longitude: depot.longitude },
  ...stops.map(s => ({ name: s.clientName, latitude: s.latitude as number, longitude: s.longitude as number })),
]
const matrices = buildModelMatrices(points)

console.log(`\n=== Builders Warehouse Springfield Park — ${stops.length} stops, round trip ===\n`)

// ─── 1. Solver correctness against brute force ───────────────────────────────
console.log('1. Solver optimality (brute force on a 9-point subset)')
{
  const sub = points.slice(0, 9)
  const m = buildModelMatrices(sub)

  const bruteForce = (matrix: number[][], closed: boolean) => {
    const nodes = matrix.map((_, i) => i).slice(1)
    let best: number[] = []
    let bestCost = Infinity
    const permute = (arr: number[], prefix: number[] = []) => {
      if (arr.length === 0) {
        const order = [0, ...prefix]
        const c = tourCost(matrix, order, closed)
        if (c < bestCost) { bestCost = c; best = order }
        return
      }
      for (let i = 0; i < arr.length; i++) {
        permute([...arr.slice(0, i), ...arr.slice(i + 1)], [...prefix, arr[i]])
      }
    }
    permute(nodes)
    return { best, bestCost }
  }

  for (const closed of [true, false]) {
    const exact = bruteForce(m.distance, closed)
    const solved = solveRoute(m.distance, { closed })
    const gap = ((solved.cost - exact.bestCost) / exact.bestCost) * 100
    check(
      `${closed ? 'round trip' : 'one-way  '} matches optimal`,
      gap < 1e-6,
      `solver ${(solved.cost / 1000).toFixed(2)} km vs optimal ${(exact.bestCost / 1000).toFixed(2)} km (gap ${gap.toFixed(4)}%)`
    )
  }
}

// ─── 2. Solver beats the naive input order ───────────────────────────────────
console.log('\n2. Optimisation actually improves on the unsorted input order')
{
  const naive = points.map((_, i) => i)
  for (const [label, matrix] of [
    ['distance', matrices.distance],
    ['time    ', matrices.duration],
  ] as const) {
    const before = tourCost(matrix, naive, true)
    const after = solveRoute(matrix, { closed: true }).cost
    check(`${label} improved`, after < before, `${(before / (label === 'distance' ? 1000 : 60)).toFixed(0)} → ${(after / (label === 'distance' ? 1000 : 60)).toFixed(0)} (${(((before - after) / before) * 100).toFixed(1)}% better)`)
  }
}

// ─── 3. Fuel model is not a restatement of distance ──────────────────────────
console.log('\n3. Fuel model is speed-dependent, not a flat per-km rate')
{
  check('consumption curve is U-shaped', consumptionAtSpeed(80) < consumptionAtSpeed(15) && consumptionAtSpeed(80) < consumptionAtSpeed(120),
    `15 km/h ${consumptionAtSpeed(15).toFixed(1)} · 80 km/h ${consumptionAtSpeed(80).toFixed(1)} · 120 km/h ${consumptionAtSpeed(120).toFixed(1)} L/100km`)

  // 30 km of highway vs 20 km of CBD crawl: shorter is not cheaper.
  const highway = legFuelLitres(30_000, (30 / 85) * 3600)
  const crawl = legFuelLitres(20_000, (20 / 14) * 3600)
  check('longer highway leg beats shorter crawl', highway < crawl,
    `30 km @85 km/h = ${highway.toFixed(2)} L vs 20 km @14 km/h = ${crawl.toFixed(2)} L`)

  const fuel = buildFuelMatrix(matrices.distance, matrices.duration)
  const ratios: number[] = []
  for (let i = 0; i < points.length; i++)
    for (let j = 0; j < points.length; j++)
      if (i !== j) ratios.push(fuel[i][j] / (matrices.distance[i][j] / 1000))
  const spread = Math.max(...ratios) / Math.min(...ratios)
  check('L/km varies across the network', spread > 1.3,
    `${Math.min(...ratios).toFixed(3)}–${Math.max(...ratios).toFixed(3)} L/km (${spread.toFixed(2)}× spread)`)
}

// ─── 4. The three objectives produce genuinely different routes ──────────────
console.log('\n4. Objective toggle changes the answer')
{
  const results = {
    distance: optimiseFromMatrices(matrices, { objective: 'distance', closed: true }),
    time: optimiseFromMatrices(matrices, { objective: 'time', closed: true }),
    fuel: optimiseFromMatrices(matrices, { objective: 'fuel', closed: true }),
  }

  console.log('\n   objective │  distance │    time │    fuel')
  console.log('   ──────────┼───────────┼─────────┼────────')
  for (const [name, r] of Object.entries(results)) {
    console.log(
      `   ${name.padEnd(9)} │ ${r.totalDistanceKm.toFixed(1).padStart(7)} km │ ${r.totalMinutes.toFixed(0).padStart(4)} min │ ${r.totalFuelLitres.toFixed(1).padStart(5)} L`
    )
  }
  console.log('')

  // Each objective must win on its own metric - that is the whole contract.
  check('distance objective minimises km', results.distance.totalDistanceKm <= Math.min(results.time.totalDistanceKm, results.fuel.totalDistanceKm) + 1e-6)
  check('time objective minimises minutes', results.time.totalMinutes <= Math.min(results.distance.totalMinutes, results.fuel.totalMinutes) + 1e-6)
  check('fuel objective minimises litres', results.fuel.totalFuelLitres <= Math.min(results.distance.totalFuelLitres, results.time.totalFuelLitres) + 1e-6)

  const key = (r: { order: number[] }) => r.order.join('>')
  check('time order differs from distance order', key(results.time) !== key(results.distance))
}

// ─── 5. Trip-type handling ───────────────────────────────────────────────────
console.log('\n5. Round trip vs one-way')
{
  const round = optimiseFromMatrices(matrices, { objective: 'distance', closed: true })
  const oneWay = optimiseFromMatrices(matrices, { objective: 'distance', closed: false, fixedEnd: points.length - 1 })

  check('round trip returns to depot', round.legs[round.legs.length - 1].to === 0)
  check('round trip has one leg per stop plus return', round.legs.length === stops.length + 1)
  check('one-way ends on the pinned destination', oneWay.order[oneWay.order.length - 1] === points.length - 1)
  check('one-way has no return leg', oneWay.legs.length === stops.length)
  check('one-way is shorter than the round trip', oneWay.totalDistanceKm < round.totalDistanceKm,
    `${oneWay.totalDistanceKm.toFixed(1)} km vs ${round.totalDistanceKm.toFixed(1)} km`)
}

// ─── 6. Totals are self-consistent and physically plausible ──────────────────
console.log('\n6. Totals are consistent and plausible')
{
  const r = optimiseFromMatrices(matrices, { objective: 'distance', closed: true })
  const legKm = r.legs.reduce((a, l) => a + l.distanceMeters, 0) / 1000
  check('total km equals the sum of its legs', Math.abs(legKm - r.totalDistanceKm) < 1e-6,
    `${r.totalDistanceKm.toFixed(2)} km`)

  const avgSpeed = r.totalDistanceKm / (r.totalMinutes / 60)
  check('average speed is realistic for Durban', avgSpeed > 20 && avgSpeed < 90, `${avgSpeed.toFixed(1)} km/h`)

  const lPer100 = (r.totalFuelLitres / r.totalDistanceKm) * 100
  check('consumption is realistic for a delivery truck', lPer100 > 20 && lPer100 < 50, `${lPer100.toFixed(1)} L/100km`)

  const visited = new Set(r.order)
  check('every stop is visited exactly once', visited.size === points.length && r.order.length === points.length)
}

// ─── 7. The winning route, in full ───────────────────────────────────────────
{
  const r = optimiseFromMatrices(matrices, { objective: 'fuel', closed: true })
  console.log('\n=== Optimised for fuel — the sheet the driver would get ===\n')
  console.log(`   Depart  ${depot.name}`)
  r.order.slice(1).forEach((pointIndex, i) => {
    const leg = r.legs[i]
    console.log(
      `   ${String(i + 1).padStart(2)}.     ${points[pointIndex].name.padEnd(30)} ` +
      `${(leg.distanceMeters / 1000).toFixed(1).padStart(5)} km  ` +
      `${String(Math.round(leg.durationSeconds / 60)).padStart(3)} min  ` +
      `${leg.fuelLitres.toFixed(1).padStart(4)} L  ${leg.roadType}`
    )
  })
  const back = r.legs[r.legs.length - 1]
  console.log(`   Return  ${depot.name.padEnd(30)} ${(back.distanceMeters / 1000).toFixed(1).padStart(5)} km  ${String(Math.round(back.durationSeconds / 60)).padStart(3)} min  ${back.fuelLitres.toFixed(1).padStart(4)} L  ${back.roadType}`)
  console.log(`\n   TOTAL   ${r.totalDistanceKm.toFixed(1)} km · ${(r.totalMinutes / 60).toFixed(1)} hrs · ${r.totalFuelLitres.toFixed(1)} L`)
}

// ─── 8. Scale ────────────────────────────────────────────────────────────────
console.log('\n8. Scale beyond the 25-waypoint computeRoutes ceiling')
{
  const many: P[] = [points[0]]
  let seed = 7
  for (let i = 0; i < 79; i++) {
    seed = (seed * 1103515245 + 12345) % 2147483648
    const a = (seed / 2147483648) * 0.9 - 0.45
    seed = (seed * 1103515245 + 12345) % 2147483648
    const b = (seed / 2147483648) * 0.9 - 0.45
    many.push({ name: `stop-${i}`, latitude: -29.85 + a, longitude: 31.0 + b })
  }
  const m = buildModelMatrices(many)
  const t0 = Date.now()
  const r = optimiseFromMatrices(m, { objective: 'distance', closed: true })
  const ms = Date.now() - t0

  const naive = tourCost(m.distance, many.map((_, i) => i), true)
  check(`${many.length} points solved`, r.order.length === many.length,
    `${(r.totalDistanceKm).toFixed(0)} km vs naive ${(naive / 1000).toFixed(0)} km, ${ms} ms`)
  check('solve stays interactive', ms < 10_000, `${ms} ms`)
}

console.log(failures === 0 ? '\nAll checks passed.\n' : `\n${failures} check(s) FAILED.\n`)
process.exit(failures === 0 ? 0 : 1)
