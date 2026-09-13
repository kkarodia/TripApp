import type { Metadata } from 'next'
import { Topbar } from '@/components/layout'
import { TripPlanner } from '@/components/trips'
import { Button } from '@/components/ui'

export const metadata: Metadata = {
  title: 'New trip - RouteDesk',
}

/**
 * Trip planner page - server component shell.
 *
 * Keeps the Topbar server-rendered (fast, no hydration cost)
 * while delegating all interactive state to TripPlanner (client component).
 *
 * The calculate + save draft buttons are rendered inside TripPlanner
 * because they depend on client state (stops, geocode status, etc).
 */
export default function NewTripPage() {
  return (
    <>
      <Topbar
        title="New trip"
        subtitle="Plan and optimise a delivery route"
      />

      {/*
        TripPlanner is 'use client' and owns all state.
        It renders the config bar, two-panel layout, and action buttons.
      */}
      <TripPlanner />
    </>
  )
}
