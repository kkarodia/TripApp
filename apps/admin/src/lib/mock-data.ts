/**
 * Mock data - replaces real Supabase/API calls until the backend is wired up.
 * Every function mirrors the signature of the real data fetcher it will replace.
 * Swap these out one by one as the backend comes online.
 */

import type { Trip, Stop, User, Notification } from '@routedesk/types'

// ─── Mock users (drivers) ─────────────────────────────────────────────────────
export const MOCK_DRIVERS: User[] = [
  { id: 'd1', username: 'john.dlamini',  name: 'John Dlamini',   role: 'driver', createdAt: '2026-01-10T08:00:00Z' },
  { id: 'd2', username: 'thabo.nkosi',   name: 'Thabo Nkosi',    role: 'driver', createdAt: '2026-01-10T08:00:00Z' },
  { id: 'd3', username: 'zanele.dube',   name: 'Zanele Dube',    role: 'driver', createdAt: '2026-01-10T08:00:00Z' },
  { id: 'd4', username: 'sipho.mthembu', name: 'Sipho Mthembu',  role: 'driver', createdAt: '2026-01-10T08:00:00Z' },
]

// ─── Mock stops ───────────────────────────────────────────────────────────────
function mockStop(overrides: Partial<Stop> & Pick<Stop, 'id' | 'tripId' | 'sequence' | 'clientName' | 'address'>): Stop {
  return {
    // No default coordinate: every stop supplies its own, and a stop that failed
    // geocoding keeps null. A shared fallback would stack the whole fleet on one
    // pin and leave the route map with nothing to draw.
    latitude: null,
    longitude: null,
    geocodeFailed: false,
    roadType: 'national',
    distanceKm: 12,
    estimatedMinutes: 15,
    status: 'pending',
    arrivedAt: null,
    orders: null,
    createdAt: '2026-06-13T07:00:00Z',
    ...overrides,
  }
}

// ─── Mock trips ───────────────────────────────────────────────────────────────
export const MOCK_TRIPS: Trip[] = [
  {
    id: 't1',
    reference: 'T-18',
    driverId: 'd1',
    driver: MOCK_DRIVERS[0],
    warehouseName: 'Builders Warehouse Springfield Park',
    warehouseAddress: '1 Electron Road, Springfield Park, Durban, 4091',
    optimiseFor: 'distance',
    tripType: 'round-trip',
    status: 'active',
    scheduledFor: '2026-09-13',
    departedAt: '2026-06-13T09:22:00Z',
    completedAt: null,
    totalDistanceKm: 154.4,
    totalEstimatedMinutes: 262,
    fuelIndex: 47.1,
    stops: [
      mockStop({ id: 's1', tripId: 't1', sequence: 1, clientName: 'Amanzimtoti Stores', address: 'Galleria Mall, Amanzimtoti, 4126', status: 'arrived', arrivedAt: '2026-06-13T08:14:00Z', distanceKm: 23.7, estimatedMinutes: 13, roadType: 'motorway', latitude: -30.0530, longitude: 30.8940 }),
      mockStop({ id: 's2', tripId: 't1', sequence: 2, clientName: 'Acme Hardware',       address: '45 Pine Street, Pinetown, 3610',    status: 'arrived', arrivedAt: '2026-06-13T09:02:00Z', distanceKm: 24.2, estimatedMinutes: 18, roadType: 'national', latitude: -29.8156, longitude: 30.8586 }),
      mockStop({ id: 's3', tripId: 't1', sequence: 3, clientName: 'Hillcrest Auto',       address: '22 Old Main Road, Hillcrest, 3610', status: 'pending', distanceKm: 7.6,  estimatedMinutes: 6,  roadType: 'national', latitude: -29.7807, longitude: 30.7594 }),
      // Geocode failure - no coordinates, so it cannot appear on the map at all.
      mockStop({ id: 's4', tripId: 't1', sequence: 4, clientName: 'Sunrise Bakery',       address: '12 Bluff Road, Bluff, Durban, 4052', geocodeFailed: true, distanceKm: null, estimatedMinutes: null, roadType: 'unknown' }),
      mockStop({ id: 's5', tripId: 't1', sequence: 5, clientName: 'Ballito Depot',        address: '3 Compensation Beach Road, Ballito', distanceKm: 46.6, estimatedMinutes: 32, roadType: 'motorway', latitude: -29.5389, longitude: 31.2144 }),
      mockStop({ id: 's6', tripId: 't1', sequence: 6, clientName: 'Tongaat Mills',        address: '120 Mill Road, Tongaat, 4399',       distanceKm: 12.1, estimatedMinutes: 7,  roadType: 'motorway', latitude: -29.5772, longitude: 31.1218 }),
      mockStop({ id: 's7', tripId: 't1', sequence: 7, clientName: 'Coastline Tyres',      address: '8 Umgeni Road, Durban North, 4051',  distanceKm: 28.1, estimatedMinutes: 34, roadType: 'urban',    latitude: -29.7950, longitude: 31.0350 }),
    ],
    createdAt: '2026-06-13T07:55:00Z',
  },
  {
    id: 't2',
    reference: 'T-15',
    driverId: 'd2',
    driver: MOCK_DRIVERS[1],
    warehouseName: 'Builders Warehouse Umhlanga',
    warehouseAddress: '1 Flanders Drive, Mount Edgecombe, 4302',
    optimiseFor: 'time',
    tripType: 'round-trip',
    status: 'active',
    scheduledFor: '2026-09-13',
    departedAt: '2026-06-13T08:45:00Z',
    completedAt: null,
    totalDistanceKm: 63,
    totalEstimatedMinutes: 83,
    fuelIndex: 21.4,
    stops: [
      mockStop({ id: 's8',  tripId: 't2', sequence: 1, clientName: 'Pinetown Hardware',   address: '12 Old Main Road, Pinetown',     status: 'arrived', arrivedAt: '2026-06-13T09:10:00Z', distanceKm: 18, estimatedMinutes: 22, roadType: 'national', latitude: -29.8162, longitude: 30.8601 }),
      mockStop({ id: 's9',  tripId: 't2', sequence: 2, clientName: 'Westville Pharmacy',  address: '33 Jan Hofmeyr Road, Westville', status: 'arrived', arrivedAt: '2026-06-13T09:45:00Z', distanceKm: 9,  estimatedMinutes: 12, roadType: 'urban',    latitude: -29.8420, longitude: 30.9333 }),
      mockStop({ id: 's10', tripId: 't2', sequence: 3, clientName: 'Musgrave Centre',     address: '115 Musgrave Road, Durban',      status: 'arrived', arrivedAt: '2026-06-13T10:15:00Z', distanceKm: 11, estimatedMinutes: 14, roadType: 'urban',    latitude: -29.8480, longitude: 31.0060 }),
      mockStop({ id: 's11', tripId: 't2', sequence: 4, clientName: 'Berea Butchery',      address: '18 Cowey Road, Berea, 4001',     status: 'arrived', arrivedAt: '2026-06-13T10:48:00Z', distanceKm: 6,  estimatedMinutes: 9,  roadType: 'urban',    latitude: -29.8330, longitude: 31.0080 }),
      mockStop({ id: 's12', tripId: 't2', sequence: 5, clientName: 'Glenwood Deli',       address: '22 Glenwood Road, Glenwood',     distanceKm: 5,  estimatedMinutes: 8,  roadType: 'urban',    latitude: -29.8720, longitude: 30.9950 }),
      mockStop({ id: 's13', tripId: 't2', sequence: 6, clientName: 'Acme Hardware',       address: '45 Pine Street, Pinetown',       distanceKm: 14, estimatedMinutes: 18, roadType: 'national', latitude: -29.8156, longitude: 30.8586 }),
    ],
    createdAt: '2026-06-13T07:30:00Z',
  },
  {
    id: 't3',
    reference: 'T-16',
    driverId: 'd3',
    driver: MOCK_DRIVERS[2],
    warehouseName: 'Builders Warehouse Springfield Park',
    warehouseAddress: '1 Electron Road, Springfield Park, Durban, 4091',
    optimiseFor: 'distance',
    tripType: 'one-way',
    status: 'active',
    scheduledFor: '2026-09-13',
    departedAt: '2026-06-13T09:00:00Z',
    completedAt: null,
    totalDistanceKm: 30,
    totalEstimatedMinutes: 40,
    fuelIndex: 10.2,
    stops: [
      mockStop({ id: 's14', tripId: 't3', sequence: 1, clientName: 'Pinecrest Butchery',  address: '18 Cowey Road, Berea, 4001', status: 'arrived', arrivedAt: '2026-06-13T09:30:00Z', distanceKm: 8, estimatedMinutes: 12, roadType: 'urban', latitude: -29.8330, longitude: 31.0080 }),
      mockStop({ id: 's15', tripId: 't3', sequence: 2, clientName: 'Umlazi Superstore',   address: '5 Chief Albert Luthuli Drive, Umlazi', geocodeFailed: true, distanceKm: null, estimatedMinutes: null, roadType: 'unknown' }),
      mockStop({ id: 's16', tripId: 't3', sequence: 3, clientName: 'Hillcrest Auto',      address: '22 Old Main Road, Hillcrest', distanceKm: 22, estimatedMinutes: 28, roadType: 'national', latitude: -29.7807, longitude: 30.7594 }),
    ],
    createdAt: '2026-06-13T07:00:00Z',
  },
  {
    id: 't4',
    reference: 'T-17',
    driverId: 'd4',
    driver: MOCK_DRIVERS[3],
    warehouseName: 'Builders Warehouse Springfield Park',
    warehouseAddress: '1 Electron Road, Springfield Park, Durban, 4091',
    optimiseFor: 'fuel',
    tripType: 'round-trip',
    status: 'active',
    scheduledFor: '2026-09-13',
    departedAt: '2026-06-13T09:10:00Z',
    completedAt: null,
    totalDistanceKm: 141,
    totalEstimatedMinutes: 133,
    fuelIndex: 38.6,
    stops: [
      mockStop({ id: 's17', tripId: 't4', sequence: 1, clientName: 'Tongaat Mills',       address: '120 Mill Road, Tongaat, 4399', status: 'arrived', arrivedAt: '2026-06-13T09:45:00Z', distanceKm: 48, estimatedMinutes: 35, roadType: 'motorway', latitude: -29.5772, longitude: 31.1218 }),
      mockStop({ id: 's18', tripId: 't4', sequence: 2, clientName: 'Ballito Depot',       address: '3 Compensation Beach Road, Ballito', status: 'arrived', arrivedAt: '2026-06-13T10:20:00Z', distanceKm: 12, estimatedMinutes: 10, roadType: 'motorway', latitude: -29.5389, longitude: 31.2144 }),
      mockStop({ id: 's19', tripId: 't4', sequence: 3, clientName: 'Phoenix Industrial',  address: '14 Lotus Drive, Phoenix Industrial Park', distanceKm: 32, estimatedMinutes: 28, roadType: 'national', latitude: -29.7150, longitude: 31.0180 }),
      mockStop({ id: 's20', tripId: 't4', sequence: 4, clientName: 'Umgeni Park Store',   address: '5 Umgeni Park Road, Durban', distanceKm: 18, estimatedMinutes: 22, roadType: 'urban', latitude: -29.7890, longitude: 31.0290 }),
      mockStop({ id: 's21', tripId: 't4', sequence: 5, clientName: 'Coastline Tyres',     address: '8 Umgeni Road, Durban North', distanceKm: 9, estimatedMinutes: 12, roadType: 'urban', latitude: -29.7950, longitude: 31.0350 }),
    ],
    createdAt: '2026-06-13T06:55:00Z',
  },

  // ── Scheduled: built and costed, not yet on the road ──────────────────────
  // Dated and crewed - ready to roll tomorrow.
  {
    id: 't5',
    reference: 'T-19',
    driverId: 'd2',
    driver: MOCK_DRIVERS[1],
    warehouseName: 'Builders Warehouse Springfield Park',
    warehouseAddress: '1 Electron Road, Springfield Park, Durban, 4091',
    optimiseFor: 'fuel',
    tripType: 'round-trip',
    status: 'scheduled',
    scheduledFor: '2026-09-14',
    departedAt: null,
    completedAt: null,
    totalDistanceKm: 96.4,
    totalEstimatedMinutes: 124,
    fuelIndex: 29.8,
    stops: [
      mockStop({ id: 's22', tripId: 't5', sequence: 1, clientName: 'Verulam Building Supply', address: '45 Wick Street, Verulam, 4340',            distanceKm: 21.4, estimatedMinutes: 24, roadType: 'motorway', latitude: -29.6470, longitude: 31.0510 }),
      mockStop({ id: 's23', tripId: 't5', sequence: 2, clientName: 'Tongaat Hardware',        address: '120 Mill Road, Tongaat, 4399',             distanceKm: 13.0, estimatedMinutes: 14, roadType: 'motorway', latitude: -29.5772, longitude: 31.1218 }),
      mockStop({ id: 's24', tripId: 't5', sequence: 3, clientName: 'Ballito Junction Trade',  address: 'Ballito Junction, Leonora Drive, Ballito', distanceKm: 12.5, estimatedMinutes: 13, roadType: 'motorway', latitude: -29.5389, longitude: 31.2144 }),
      mockStop({ id: 's25', tripId: 't5', sequence: 4, clientName: 'Mount Edgecombe Sites',   address: '12 Flanders Drive, Mount Edgecombe, 4302', distanceKm: 29.5, estimatedMinutes: 31, roadType: 'motorway', latitude: -29.7050, longitude: 31.0400 }),
    ],
    createdAt: '2026-09-12T15:10:00Z',
  },
  // Dated but not yet crewed - the one a dispatcher needs to chase.
  {
    id: 't6',
    reference: 'T-20',
    driverId: null,
    warehouseName: 'Builders Warehouse Springfield Park',
    warehouseAddress: '1 Electron Road, Springfield Park, Durban, 4091',
    optimiseFor: 'distance',
    tripType: 'round-trip',
    status: 'scheduled',
    scheduledFor: '2026-09-15',
    departedAt: null,
    completedAt: null,
    totalDistanceKm: 74.2,
    totalEstimatedMinutes: 118,
    fuelIndex: 24.6,
    stops: [
      mockStop({ id: 's26', tripId: 't6', sequence: 1, clientName: 'Pavilion Builders',      address: 'Jack Martens Drive, Westville, 3629',  distanceKm: 18.2, estimatedMinutes: 28, roadType: 'national', latitude: -29.8420, longitude: 30.9333 }),
      mockStop({ id: 's27', tripId: 't6', sequence: 2, clientName: 'Pinetown Trade Supply',  address: '45 Old Main Road, Pinetown, 3610',     distanceKm: 8.1,  estimatedMinutes: 16, roadType: 'urban',    latitude: -29.8156, longitude: 30.8586 }),
      mockStop({ id: 's28', tripId: 't6', sequence: 3, clientName: 'New Germany Industrial', address: '7 Chris Hani Road, New Germany, 3610', distanceKm: 3.7,  estimatedMinutes: 9,  roadType: 'urban',    latitude: -29.8000, longitude: 30.8800 }),
      mockStop({ id: 's29', tripId: 't6', sequence: 4, clientName: 'Queensburgh Hardware',   address: '88 Main Road, Queensburgh, 4093',      distanceKm: 6.1,  estimatedMinutes: 14, roadType: 'urban',    latitude: -29.8400, longitude: 30.8800 }),
      mockStop({ id: 's30', tripId: 't6', sequence: 5, clientName: 'Chatsworth Builders',    address: '10 Joyhurst Street, Chatsworth, 4092', distanceKm: 12.1, estimatedMinutes: 22, roadType: 'urban',    latitude: -29.9167, longitude: 30.8833 }),
    ],
    createdAt: '2026-09-12T16:42:00Z',
  },
  // Undated backlog - built ahead of time, no day committed yet.
  {
    id: 't7',
    reference: 'T-21',
    driverId: null,
    warehouseName: 'Builders Warehouse Amanzimtoti',
    warehouseAddress: 'Arbour Crossing, Arbour Road, Amanzimtoti, 4126',
    optimiseFor: 'time',
    tripType: 'round-trip',
    status: 'scheduled',
    scheduledFor: null,
    departedAt: null,
    completedAt: null,
    totalDistanceKm: 52.8,
    totalEstimatedMinutes: 96,
    fuelIndex: 17.9,
    stops: [
      mockStop({ id: 's31', tripId: 't7', sequence: 1, clientName: 'Prospecton Industrial', address: '2 Tarentaal Road, Prospecton, 4110',           distanceKm: 9.4,  estimatedMinutes: 16, roadType: 'national', latitude: -29.9900, longitude: 30.9400 }),
      mockStop({ id: 's32', tripId: 't7', sequence: 2, clientName: 'Isipingo Hardware',     address: '14 Old Main Road, Isipingo, 4110',             distanceKm: 5.2,  estimatedMinutes: 12, roadType: 'urban',    latitude: -29.9950, longitude: 30.9350 }),
      mockStop({ id: 's33', tripId: 't7', sequence: 3, clientName: 'Umlazi Superstore',     address: '5 Chief Albert Luthuli Drive, Umlazi, 4031',   geocodeFailed: true, distanceKm: null, estimatedMinutes: null, roadType: 'unknown' }),
      mockStop({ id: 's34', tripId: 't7', sequence: 4, clientName: 'Bluff Hardware',        address: '12 Tara Road, Bluff, Durban, 4052',            distanceKm: 18.7, estimatedMinutes: 31, roadType: 'urban',    latitude: -29.9200, longitude: 31.0100 }),
    ],
    createdAt: '2026-09-11T11:05:00Z',
  },
]

// ─── Mock notifications / alerts ──────────────────────────────────────────────
export const MOCK_ALERTS: Notification[] = [
  {
    id: 'n1',
    driverId: 'd1',
    tripId: 't1',
    title: 'Geocode failure - T-18',
    message: 'Stop 4 (Sunrise Bakery, 12 Bluff Road) could not be geocoded. Driver must navigate manually.',
    read: false,
    createdAt: '2026-06-13T07:56:00Z',
  },
  {
    id: 'n2',
    driverId: 'd3',
    tripId: 't3',
    title: 'Geocode failure - T-16',
    message: 'Stop 2 (Umlazi Superstore) could not be geocoded. Driver must navigate manually.',
    read: false,
    createdAt: '2026-06-13T07:02:00Z',
  },
  {
    id: 'n3',
    driverId: 'd3',
    tripId: 't3',
    title: 'Zanele Dube - stop 2 overdue',
    message: 'Stop 2 was due at 09:45. Now 18 minutes overdue with no arrival recorded.',
    read: false,
    createdAt: '2026-06-13T10:03:00Z',
  },
  {
    id: 'n4',
    driverId: 'd1',
    tripId: 't1',
    title: 'Route sheet ready - T-18',
    message: 'Route sheet for John Dlamini (T-18) has been generated and is ready to download.',
    read: true,
    createdAt: '2026-06-13T07:55:00Z',
  },
]

// ─── Derived helpers ──────────────────────────────────────────────────────────

/** Count stops with a specific status across a trip */
export function countStops(trip: Trip, status?: Stop['status']) {
  if (!status) return trip.stops.length
  return trip.stops.filter(s => s.status === status).length
}

/** Progress percentage for a trip (arrived / total) */
export function tripProgress(trip: Trip): number {
  const total = trip.stops.length
  if (total === 0) return 0
  return Math.round((countStops(trip, 'arrived') / total) * 100)
}

/** Total geocode failures across all active trips */
export function totalGeocodeFails(trips: Trip[]): number {
  return trips.reduce((acc, t) => acc + t.stops.filter(s => s.geocodeFailed).length, 0)
}

/** Total stops completed today across all trips */
export function totalArrivedToday(trips: Trip[]): number {
  return trips.reduce((acc, t) => acc + countStops(t, 'arrived'), 0)
}

/** Total stops across all trips */
export function totalStopsToday(trips: Trip[]): number {
  return trips.reduce((acc, t) => acc + t.stops.length, 0)
}
