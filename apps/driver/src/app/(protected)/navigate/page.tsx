import { DockNav } from '@/components/layout'
import { NavigateClient } from '@/components/map'
import { MOCK_ALL_TRIPS } from '@/lib/mock-data'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Navigate - RouteDesk' }

export default function NavigatePage() {
  const activeTrip = MOCK_ALL_TRIPS.find(t => t.status === 'active') ?? null

  return (
    <>
      <NavigateClient activeTrip={activeTrip} />
      <DockNav />
    </>
  )
}
