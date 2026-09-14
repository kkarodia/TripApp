import { notFound } from 'next/navigation'
import { MOCK_TRIPS } from '@/lib/mock-data'
import { RouteSheetDocument } from '@/components/route-sheet'
import { RouteSheetToolbar } from '@/components/route-sheet'
import type { Metadata } from 'next'

interface RouteSheetPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: RouteSheetPageProps): Promise<Metadata> {
  const { id } = await params
  const trip = MOCK_TRIPS.find(t => t.id === id)
  return {
    title: trip ? `Route sheet ${trip.reference} — RouteDesk` : 'Route sheet — RouteDesk',
  }
}

export default async function RouteSheetPage({ params }: RouteSheetPageProps) {
  const { id } = await params
  const trip = MOCK_TRIPS.find(t => t.id === id)
  if (!trip) notFound()

  return (
    <div className="min-h-screen bg-[--color-surface-2]">
      {/* Toolbar — hidden in print */}
      <RouteSheetToolbar trip={trip} />

      {/* A4 document — centred on the page */}
      {/* The sheet is a fixed A4 width; on narrow screens it scrolls sideways
          rather than reflowing, so what you see is what prints. */}
      <div className="flex overflow-x-auto py-4 px-4 sm:py-8 print:overflow-visible print:p-0 print:bg-white">
        <RouteSheetDocument trip={trip} />
      </div>
    </div>
  )
}
