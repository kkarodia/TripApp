import { Sidebar } from './sidebar'

/**
 * App chrome for every protected page: fixed sidebar, scrolling content column.
 *
 * The content column is `min-w-0 min-h-0` so pages that fill the viewport (the
 * route map, the trip planner) can size to it instead of overflowing the window.
 */
export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh overflow-hidden surface-pattern-ground">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        {children}
      </div>
    </div>
  )
}
