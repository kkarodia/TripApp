import { notFound } from 'next/navigation'
import { TripDetailClient } from '@/components/trip-detail'
import { MOCK_TRIPS } from '@/lib/mock-data'
import type { Metadata } from 'next'

interface TripDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: TripDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const trip = MOCK_TRIPS.find(t => t.id === id)
  return {
    title: trip ? `Trip ${trip.reference} — RouteDesk` : 'Trip not found — RouteDesk',
  }
}

export default async function TripDetailPage({ params }: TripDetailPageProps) {
  const { id } = await params
  const trip = MOCK_TRIPS.find(t => t.id === id)

  if (!trip) notFound()

  // The client component owns the meta bar too, so an assignment made in the
  // sidebar is reflected in the header without a round trip.
  return <TripDetailClient trip={trip} />
}
