import { AppBar, DockNav } from '@/components/layout'
import { TripCard } from '@/components/trips'
import { MOCK_ALL_TRIPS } from '@/lib/mock-data'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My trips - RouteDesk' }

export default function TripsPage() {
  const trips  = MOCK_ALL_TRIPS
  const active = trips.filter(t => t.status === 'scheduled' || t.status === 'active')
  const done   = trips.filter(t => t.status === 'completed' || t.status === 'archived')

  const subtitle = active.length > 0
    ? `${active.length} active · ${done.length} complete`
    : done.length > 0
    ? `${done.length} complete`
    : 'No trips assigned'

  return (
    <div className="min-h-dvh surface-pattern-ground">
      <AppBar title="Today's trips" subtitle={subtitle} />

      <main
        className="px-4 pb-24"
        style={{ paddingTop: 'calc(var(--header-height) + 16px)' }}
      >
        {active.length > 0 && (
          <section className="mb-5">
            <p className="text-[10px] font-medium text-[--color-accent] uppercase tracking-[0.06em] mb-2 px-0.5">
              Active
            </p>
            <div className="flex flex-col gap-2">
              {active.map(t => <TripCard key={t.id} trip={t} />)}
            </div>
          </section>
        )}

        {done.length > 0 && (
          <section className="mb-5">
            <p className="text-[10px] font-medium text-[--color-accent] uppercase tracking-[0.06em] mb-2 px-0.5">
              Completed
            </p>
            <div className="flex flex-col gap-2">
              {done.map(t => <TripCard key={t.id} trip={t} />)}
            </div>
          </section>
        )}

        {trips.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-[13px] text-[--color-text-tertiary]">No trips assigned today</p>
          </div>
        )}
      </main>

      <DockNav />
    </div>
  )
}
