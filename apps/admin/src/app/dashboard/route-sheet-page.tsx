import { notFound } from 'next/navigation'
import { MOCK_TRIPS } from '@/lib/mock-data'
import { RouteSheetDocument } from '@/components/route-sheet'
import { RouteSheetToolbar } from '@/components/route-sheet'
import type { Metadata } from 'next'

interface RouteSheetPageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: RouteSheetPageProps): Promise<Metadata> {
  const trip = MOCK_TRIPS.find(t => t.id === params.id)
  return {
    title: trip ? `Route sheet ${trip.reference} - RouteDesk` : 'Route sheet - RouteDesk',
  }
}

/**
 * Route sheet page - server component.
 *
 * Deliberately outside the Shell layout - the route sheet page
 * is a clean full-screen preview with no sidebar, so it can be
 * printed or screenshotted cleanly by Puppeteer.
 *
 * The Shell is applied by protected/layout.tsx - since this page
 * is inside the protected/ group it still gets the auth check,
 * but we override the visual chrome by not using PageContent.
 *
 * Print behaviour:
 * - @media print CSS hides the toolbar (print:hidden class)
 * - Only #route-sheet-print renders in print output
 * - Puppeteer targets the same component server-side for PDF
 */
export default function RouteSheetPage({ params }: RouteSheetPageProps) {
  const trip = MOCK_TRIPS.find(t => t.id === params.id)
  if (!trip) notFound()

  return (
    <div className="min-h-screen bg-[--color-surface-2]">
      {/* Toolbar - hidden in print */}
      <RouteSheetToolbar trip={trip} />

      {/* A4 document - centred on the page */}
      <div className="flex justify-center py-8 px-4 print:p-0 print:bg-white">
        <RouteSheetDocument trip={trip} />
      </div>
    </div>
  )
}
