import type { Metadata } from 'next'
import { PageHeading } from '@/components/layout'
import { TripPlanner } from '@/components/trips'

export const metadata: Metadata = {
  title: 'New trip - RouteDesk',
}

/**
 * Trip planner page - server component shell.
 *
 * Keeps the page heading server-rendered (fast, no hydration cost)
 * while delegating all interactive state to TripPlanner (client component).
 *
 * The calculate + save draft buttons are rendered inside TripPlanner
 * because they depend on client state (stops, geocode status, etc).
 */
export default function NewTripPage() {
  return (
    <>
      <div className="px-4 pt-4 pb-1 sm:px-6 sm:pt-6 flex-shrink-0">
        <PageHeading
          title="New trip"
          subtitle="Plan and optimise a delivery route"
        />
      </div>

      {/*
        TripPlanner is 'use client' and owns all state.
        It renders the config bar, two-panel layout, and action buttons.
      */}
      <TripPlanner />
    </>
  )
}
