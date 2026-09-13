/**
 * Driver app mock data.
 * Mirrors the admin mock data but scoped to a single driver (John Dlamini).
 * Swap these for real API calls when the backend is ready.
 */
import type { Trip, Stop, Notification } from '@routedesk/types'

function mockStop(overrides: Partial<Stop> & Pick<Stop, 'id' | 'tripId' | 'sequence' | 'clientName' | 'address'>): Stop {
  return {
    latitude:         null,
    longitude:        null,
    geocodeFailed:    false,
    roadType:         'national',
    distanceKm:       12,
    estimatedMinutes: 15,
    status:           'pending',
    arrivedAt:        null,
    orders:           null,
    createdAt:        '2026-06-13T07:00:00Z',
    ...overrides,
  }
}

export const MOCK_ACTIVE_TRIP: Trip = {
  id:                     't1',
  reference:              'T-18',
  driverId:               'd1',
  driver:                 { id: 'd1', username: 'john.dlamini', name: 'John Dlamini', role: 'driver', createdAt: '2026-01-10T08:00:00Z' },
  warehouseName:          'Central Warehouse',
  warehouseAddress:       '22 Aliwal Street, Durban Central, 4001',
  optimiseFor:            'distance',
  tripType:               'round-trip',
  status:                 'active',
  scheduledFor:           '2026-09-13',
  departedAt:             '2026-06-13T09:22:00Z',
  completedAt:            null,
  totalDistanceKm:        154.4,
  totalEstimatedMinutes:  262,
  fuelIndex:              47.1,
  stops: [
    mockStop({ id: 's1', tripId: 't1', sequence: 1, clientName: 'Amanzimtoti Stores', address: 'Galleria Mall, Amanzimtoti, 4126',       status: 'arrived', arrivedAt: '2026-06-13T08:14:00Z', distanceKm: 23.7, estimatedMinutes: 13, roadType: 'motorway', latitude: -30.0542, longitude: 30.8680 }),
    mockStop({ id: 's2', tripId: 't1', sequence: 2, clientName: 'Acme Hardware',       address: '45 Pine Street, Pinetown, 3610',         status: 'arrived', arrivedAt: '2026-06-13T09:02:00Z', distanceKm: 24.2, estimatedMinutes: 18, roadType: 'national', latitude: -29.8190, longitude: 30.8666 }),
    mockStop({ id: 's3', tripId: 't1', sequence: 3, clientName: 'Hillcrest Auto',       address: '22 Old Main Road, Hillcrest, 3610',      status: 'pending', distanceKm: 7.6,  estimatedMinutes: 6,  roadType: 'national', latitude: -29.7889, longitude: 30.7605 }),
    mockStop({ id: 's4', tripId: 't1', sequence: 4, clientName: 'Sunrise Bakery',       address: '12 Bluff Road, Bluff, Durban, 4052',    geocodeFailed: true, distanceKm: null, estimatedMinutes: null, roadType: 'unknown' }),
    mockStop({ id: 's5', tripId: 't1', sequence: 5, clientName: 'Ballito Depot',        address: '3 Compensation Beach Road, Ballito',     distanceKm: 46.6, estimatedMinutes: 32, roadType: 'motorway', latitude: -29.5380, longitude: 31.2088 }),
    mockStop({ id: 's6', tripId: 't1', sequence: 6, clientName: 'Tongaat Mills',        address: '120 Mill Road, Tongaat, 4399',           distanceKm: 12.1, estimatedMinutes: 7,  roadType: 'motorway', latitude: -29.5733, longitude: 31.1193 }),
    mockStop({ id: 's7', tripId: 't1', sequence: 7, clientName: 'Coastline Tyres',      address: '8 Umgeni Road, Durban North, 4051',      distanceKm: 28.1, estimatedMinutes: 34, roadType: 'urban',    latitude: -29.8120, longitude: 31.0170 }),
  ],
  createdAt: '2026-06-13T07:55:00Z',
}

export const MOCK_ASSIGNED_TRIP: Trip = {
  ...MOCK_ACTIVE_TRIP,
  id:           't1-assigned',
  reference:    'T-19',
  status:       'scheduled',
  scheduledFor: '2026-09-14',
  departedAt:   null,
  stops:        MOCK_ACTIVE_TRIP.stops.map(s => ({ ...s, tripId: 't1-assigned', status: 'pending', arrivedAt: null })),
}

export const MOCK_COMPLETED_TRIP: Trip = {
  ...MOCK_ACTIVE_TRIP,
  id:          't0',
  reference:   'T-14',
  status:      'completed',
  departedAt:  '2026-06-12T09:10:00Z',
  completedAt: '2026-06-12T14:31:00Z',
  stops:       MOCK_ACTIVE_TRIP.stops.map(s => ({ ...s, tripId: 't0', status: 'arrived', arrivedAt: '2026-06-12T10:00:00Z' })),
  createdAt:   '2026-06-12T07:55:00Z',
}

export const MOCK_ALL_TRIPS: Trip[] = [
  MOCK_ASSIGNED_TRIP,
  MOCK_ACTIVE_TRIP,
  MOCK_COMPLETED_TRIP,
]

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1', driverId: 'd1', tripId: 't1',
    title:   'Stop 4 — navigate manually',
    message: 'Sunrise Bakery address could not be verified. Use the address on your route sheet.',
    read:    false, createdAt: '2026-06-13T09:55:00Z',
  },
  {
    id: 'n2', driverId: 'd1', tripId: 't1',
    title:   'Stop added — Coastline Tyres',
    message: 'Dispatch added a stop to your route. Check your updated trip order.',
    read:    false, createdAt: '2026-06-13T09:30:00Z',
  },
  {
    id: 'n3', driverId: 'd1', tripId: 't1',
    title:   'Trip T-18 assigned',
    message: '7 stops from Central Warehouse. Collect your route sheet before departing.',
    read:    false, createdAt: '2026-06-13T08:50:00Z',
  },
  {
    id: 'n4', driverId: 'd1', tripId: 't0',
    title:   'Trip T-14 filed',
    message: 'Your route sheet for yesterday\'s trip has been filed.',
    read:    true,  createdAt: '2026-06-12T16:45:00Z',
  },
]
