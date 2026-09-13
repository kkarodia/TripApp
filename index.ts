// ─── Trip status lifecycle ───────────────────────────────────────────────────
export type TripStatus = 'assigned' | 'active' | 'completed' | 'archived'

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
}

export interface Trip {
  id: string
  reference: string
  driverId: string
  driver?: User
  warehouseName: string
  warehouseAddress: string
  optimiseFor: OptimiseFor
  tripType: 'round-trip' | 'one-way'
  status: TripStatus
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
