// ─── Trip status lifecycle ───────────────────────────────────────────────────
// A trip is built first and crewed later: it sits in `scheduled` from creation
// until the driver actually departs, whether or not it has a driver yet.
export type TripStatus = 'scheduled' | 'active' | 'completed' | 'archived'

// ─── Stop status lifecycle ───────────────────────────────────────────────────
export type StopStatus = 'pending' | 'arrived' | 'skipped'

// ─── Road types ──────────────────────────────────────────────────────────────
export type RoadType = 'motorway' | 'national' | 'urban' | 'unknown'

// ─── Optimisation modes ──────────────────────────────────────────────────────
export type OptimiseFor = 'distance' | 'time' | 'fuel'

// ─── User roles ──────────────────────────────────────────────────────────────
export type UserRole = 'manager' | 'driver'

// ─── Core entities ───────────────────────────────────────────────────────────
export interface User {
  id: string
  username: string
  role: UserRole
  name: string
  createdAt: string
}

export interface Stop {
  id: string
  tripId: string
  sequence: number
  clientName: string
  address: string
  latitude: number | null
  longitude: number | null
  geocodeFailed: boolean
  roadType: RoadType
  distanceKm: number | null
  estimatedMinutes: number | null
  status: StopStatus
  arrivedAt: string | null
  orders: string | null
  createdAt: string
}

export interface Trip {
  id: string
  reference: string
  /** Null until a driver is assigned - trips are planned before they are crewed. */
  driverId: string | null
  driver?: User
  warehouseName: string
  warehouseAddress: string
  optimiseFor: OptimiseFor
  tripType: 'round-trip' | 'one-way'
  status: TripStatus
  /** Target date (YYYY-MM-DD), or null for an undated backlog trip. */
  scheduledFor: string | null
  departedAt: string | null
  completedAt: string | null
  totalDistanceKm: number | null
  totalEstimatedMinutes: number | null
  fuelIndex: number | null
  stops: Stop[]
  createdAt: string
}

export interface Notification {
  id: string
  driverId: string
  tripId: string | null
  title: string
  message: string
  read: boolean
  createdAt: string
}
