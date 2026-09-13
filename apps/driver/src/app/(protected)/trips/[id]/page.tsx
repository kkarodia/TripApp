import { notFound } from 'next/navigation'
import { MOCK_ALL_TRIPS } from '@/lib/mock-data'
import { ActiveTripClient } from '@/components/trips/active-trip-client'
import type { Metadata } from 'next'

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const trip = MOCK_ALL_TRIPS.find(t => t.id === id)
  return { title: trip ? `Trip ${trip.reference} — RouteDesk` : 'Trip — RouteDesk' }
}

export default async function TripPage({ params }: Props) {
  const { id } = await params
  const trip = MOCK_ALL_TRIPS.find(t => t.id === id)
  if (!trip) notFound()
  return <ActiveTripClient initialTrip={trip} />
}
