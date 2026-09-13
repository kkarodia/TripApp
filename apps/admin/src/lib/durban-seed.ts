/**
 * A realistic day's delivery sheet out of Builders Warehouse Springfield Park,
 * Durban - the depot every trip in the planner starts from.
 *
 * The stops are deliberately spread across the four corridors a Durban delivery
 * truck actually works: the N2 north coast run (fast motorway), the dense inner-city
 * grid (slow, stop-start), the N3 west up to the Upper Highway, and the M4/N2 south.
 * That spread is what makes the time, distance and fuel objectives disagree - on a
 * cluster of stops in one suburb all three would return the same order and the
 * toggle would look broken even when it works.
 */

import type { Stop } from '@routedesk/types'

export interface Depot {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
}

export const DEPOTS: Record<string, Depot> = {
  springfield: {
    id: 'springfield',
    name: 'Builders Warehouse Springfield Park',
    address: '1 Electron Road, Springfield Park, Durban, 4091',
    latitude: -29.8063,
    longitude: 31.0161,
  },
  umhlanga: {
    id: 'umhlanga',
    name: 'Builders Warehouse Umhlanga',
    address: '1 Flanders Drive, Mount Edgecombe, 4302',
    latitude: -29.7186,
    longitude: 31.0437,
  },
  amanzimtoti: {
    id: 'amanzimtoti',
    name: 'Builders Warehouse Amanzimtoti',
    address: 'Arbour Crossing, Arbour Road, Amanzimtoti, 4126',
    latitude: -30.0398,
    longitude: 30.8955,
  },
}

export const DEFAULT_DEPOT = 'springfield'

interface SeedSpec {
  clientName: string
  address: string
  latitude: number
  longitude: number
}

/** Trade counters, hardware merchants and sites a Builders depot supplies. */
const SEED: SeedSpec[] = [
  // ── N2 north coast corridor ──────────────────────────────────────────────
  { clientName: 'Ballito Junction Trade',   address: 'Ballito Junction, Leonora Drive, Ballito, 4420',          latitude: -29.5389, longitude: 31.2144 },
  { clientName: 'Tongaat Hardware',         address: '120 Mill Road, Tongaat, 4399',                            latitude: -29.5772, longitude: 31.1218 },
  { clientName: 'Verulam Building Supply',  address: '45 Wick Street, Verulam, 4340',                           latitude: -29.6470, longitude: 31.0510 },
  { clientName: 'Mount Edgecombe Sites',    address: '12 Flanders Drive, Mount Edgecombe, 4302',                latitude: -29.7050, longitude: 31.0400 },
  { clientName: 'Gateway Contractors',      address: '1 Palm Boulevard, Umhlanga Ridge, 4319',                  latitude: -29.7257, longitude: 31.0664 },
  { clientName: 'Phoenix Industrial Park',  address: '14 Lotus Drive, Phoenix Industrial Park, 4068',           latitude: -29.7150, longitude: 31.0180 },

  // ── Inner Durban - dense, slow, stop-start ───────────────────────────────
  { clientName: 'Durban North Tyres',       address: '8 Umgeni Road, Durban North, 4051',                       latitude: -29.7950, longitude: 31.0350 },
  { clientName: 'Berea Renovations',        address: '115 Musgrave Road, Berea, 4001',                          latitude: -29.8330, longitude: 31.0080 },
  { clientName: 'CBD Trade Counter',        address: '22 Aliwal Street, Durban Central, 4001',                  latitude: -29.8587, longitude: 31.0218 },
  { clientName: 'Maydon Wharf Depot',       address: '3 Maydon Road, Maydon Wharf, Durban, 4001',               latitude: -29.8750, longitude: 31.0100 },
  { clientName: 'Bluff Hardware',           address: '12 Tara Road, Bluff, Durban, 4052',                       latitude: -29.9200, longitude: 31.0100 },

  // ── N3 west to the Upper Highway ─────────────────────────────────────────
  { clientName: 'Pavilion Builders',        address: 'Jack Martens Drive, Westville, 3629',                     latitude: -29.8420, longitude: 30.9333 },
  { clientName: 'New Germany Industrial',   address: '7 Chris Hani Road, New Germany, 3610',                    latitude: -29.8000, longitude: 30.8800 },
  { clientName: 'Pinetown Trade Supply',    address: '45 Old Main Road, Pinetown, 3610',                        latitude: -29.8156, longitude: 30.8586 },
  { clientName: 'Queensburgh Hardware',     address: '88 Main Road, Queensburgh, 4093',                         latitude: -29.8400, longitude: 30.8800 },
  { clientName: 'Hillcrest Auto & Build',   address: '22 Old Main Road, Hillcrest, 3610',                       latitude: -29.7807, longitude: 30.7594 },

  // ── M4 / N2 south ────────────────────────────────────────────────────────
  { clientName: 'Chatsworth Builders',      address: '10 Joyhurst Street, Chatsworth, 4092',                    latitude: -29.9167, longitude: 30.8833 },
  { clientName: 'Umlazi Superstore',        address: '5 Chief Albert Luthuli Drive, Umlazi, 4031',              latitude: -29.9667, longitude: 30.8833 },
  { clientName: 'Prospecton Industrial',    address: '2 Tarentaal Road, Prospecton, 4110',                      latitude: -29.9900, longitude: 30.9400 },
  { clientName: 'Galleria Amanzimtoti',     address: 'Galleria Mall, Moss Kolnik Drive, Amanzimtoti, 4126',     latitude: -30.0530, longitude: 30.8940 },
]

export function durbanSeedStops(tripId = 'new'): Stop[] {
  return SEED.map((spec, i) => ({
    id: `seed-${i + 1}`,
    tripId,
    sequence: i + 1,
    clientName: spec.clientName,
    address: spec.address,
    latitude: spec.latitude,
    longitude: spec.longitude,
    geocodeFailed: false,
    roadType: 'unknown',
    distanceKm: null,
    estimatedMinutes: null,
    status: 'pending',
    arrivedAt: null,
    orders: null,
    createdAt: new Date('2026-09-13T06:00:00Z').toISOString(),
  }))
}
