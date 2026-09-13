/**
 * Stage 2 of route optimisation: given a square cost matrix, find a good visit order.
 *
 * Nearest-neighbour construction, then 2-opt and Or-opt local search, then iterated
 * local search - repeatedly kicking the best-known tour with a double-bridge move and
 * re-optimising. Plain local search alone is not good enough here: it settles into
 * local optima far enough off the mark that optimising for time could return a slower
 * route than optimising for distance did, which makes the objective toggle look broken.
 *
 * At the stop counts a delivery sheet actually reaches (tens, not thousands) this lands
 * on the optimal tour or within a fraction of a percent of it, which is why there is no
 * OR-Tools service here - that would mean standing up a Python process next to a
 * TypeScript monorepo to solve a problem this size.
 *
 * Tour cost is always recomputed in full rather than by edge deltas. Road matrices are
 * asymmetric (one-way systems, different routes each way), so reversing a segment
 * changes every edge inside it, not just the two at the seam.
 *
 * Deliberately dependency-free and free of any framework/DOM reference so it can be
 * lifted to the Fastify backend unchanged once that comes online.
 */

export interface SolveOptions {
  /** Return to the start node after the final stop (round trip). */
  closed: boolean
  /** Node that must be visited last, for a one-way trip with a fixed destination. */
  fixedEnd?: number
}

export interface SolveResult {
  /** Visit order by node index, always beginning at node 0. Excludes the implicit return leg. */
  order: number[]
  /** Total matrix cost of `order`, including the return leg when `closed`. */
  cost: number
  /** Perturbation rounds run on top of the first local-search descent. */
  restarts: number
}

/** Node 0 is the depot and is always the start of the route. */
const DEPOT = 0

export function tourCost(matrix: number[][], order: number[], closed: boolean): number {
  let total = 0
  for (let i = 0; i < order.length - 1; i++) total += matrix[order[i]][order[i + 1]]
  if (closed && order.length > 1) total += matrix[order[order.length - 1]][order[DEPOT]]
  return total
}

/**
 * Deterministic RNG. The same stop list must always produce the same route - a
 * dispatcher recalculating an unchanged sheet should not get a different answer.
 */
function makeRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

function nearestNeighbour(matrix: number[][], free: number[], fixedEnd?: number): number[] {
  const order = [DEPOT]
  const remaining = new Set(free)
  let current = DEPOT

  while (remaining.size > 0) {
    let best = -1
    let bestCost = Infinity
    for (const candidate of remaining) {
      const cost = matrix[current][candidate]
      if (cost < bestCost) {
        bestCost = cost
        best = candidate
      }
    }
    order.push(best)
    remaining.delete(best)
    current = best
  }

  if (fixedEnd !== undefined) order.push(fixedEnd)
  return order
}

/** Descend to a local optimum under 2-opt and Or-opt, restarting the scan after each gain. */
function localSearch(
  matrix: number[][],
  start: number[],
  closed: boolean,
  lastMovable: number
): { order: number[]; cost: number } {
  let order = start
  let cost = tourCost(matrix, order, closed)
  let improving = true

  while (improving) {
    improving = false

    // 2-opt: reverse an interior segment, re-linking the tour at both seams.
    for (let i = 1; i <= lastMovable && !improving; i++) {
      for (let j = i + 1; j <= lastMovable && !improving; j++) {
        const candidate = order.slice()
        reverseInPlace(candidate, i, j)
        const candidateCost = tourCost(matrix, candidate, closed)
        if (candidateCost < cost - 1e-9) {
          order = candidate
          cost = candidateCost
          improving = true
        }
      }
    }
    if (improving) continue

    // Or-opt: relocate a run of 1-3 consecutive stops, in either orientation.
    for (let segLen = 1; segLen <= 3 && !improving; segLen++) {
      for (let i = 1; i + segLen - 1 <= lastMovable && !improving; i++) {
        const segment = order.slice(i, i + segLen)
        const reversed = segment.slice().reverse()
        const without = order.slice(0, i).concat(order.slice(i + segLen))
        const maxInsert = lastMovable - segLen + 1

        for (let k = 1; k <= maxInsert && !improving; k++) {
          if (k === i) continue
          for (const piece of segLen > 1 ? [segment, reversed] : [segment]) {
            const candidate = without.slice(0, k).concat(piece, without.slice(k))
            const candidateCost = tourCost(matrix, candidate, closed)
            if (candidateCost < cost - 1e-9) {
              order = candidate
              cost = candidateCost
              improving = true
              break
            }
          }
        }
      }
    }
  }

  return { order, cost }
}

/**
 * Double-bridge kick: cut the movable span into four and reassemble as A-C-B-D. It is
 * the standard perturbation for this because 2-opt cannot undo it in one move, so the
 * search escapes the basin it was stuck in instead of walking straight back.
 */
function doubleBridge(order: number[], lastMovable: number, rand: () => number): number[] {
  const head = order.slice(0, 1)
  const tail = order.slice(lastMovable + 1)
  const span = order.slice(1, lastMovable + 1)
  if (span.length < 4) return order

  const cuts = [0, 0, 0]
    .map(() => 1 + Math.floor(rand() * (span.length - 1)))
    .sort((a, b) => a - b)
  const [p, q, r] = cuts

  return head.concat(
    span.slice(0, p),
    span.slice(q, r),
    span.slice(p, q),
    span.slice(r),
    tail
  )
}

/** Perturbation rounds, tapered so a large sheet still solves interactively. */
function restartBudget(n: number): number {
  if (n <= 30) return 120
  if (n <= 60) return 40
  return 15
}

export function solveRoute(matrix: number[][], opts: SolveOptions): SolveResult {
  const n = matrix.length
  if (n === 0) return { order: [], cost: 0, restarts: 0 }
  if (n === 1) return { order: [DEPOT], cost: 0, restarts: 0 }

  const { closed, fixedEnd } = opts

  const free: number[] = []
  for (let i = 1; i < n; i++) if (i !== fixedEnd) free.push(i)

  const seeded = nearestNeighbour(matrix, free, fixedEnd)

  // Positions that may be reordered: everything except the depot at [0] and, on a
  // one-way trip, the fixed destination pinned at the end.
  const lastMovable = fixedEnd === undefined ? seeded.length - 1 : seeded.length - 2

  let best = localSearch(matrix, seeded, closed, lastMovable)

  const rand = makeRandom(0x5eed)
  const restarts = restartBudget(n)
  for (let i = 0; i < restarts; i++) {
    const kicked = doubleBridge(best.order, lastMovable, rand)
    const candidate = localSearch(matrix, kicked, closed, lastMovable)
    if (candidate.cost < best.cost - 1e-9) best = candidate
  }

  return { order: best.order, cost: best.cost, restarts }
}

function reverseInPlace(arr: number[], i: number, j: number): void {
  while (i < j) {
    const tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
    i++
    j--
  }
}
