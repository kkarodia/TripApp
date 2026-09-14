'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
import type { ProfileUser } from './profile-menu'

interface ShellProps {
  children: React.ReactNode
  user: ProfileUser
}

/**
 * App chrome for every protected page: sidebar, global topbar, then content.
 *
 * From `lg` up the sidebar is a static column and full-height pages (the route
 * map, the trip planner) size to the viewport. Below `lg` the sidebar becomes
 * an off-canvas drawer and the content area scrolls as a whole, so those same
 * pages stack at their natural height instead of being squeezed.
 */
export function Shell({ children, user }: ShellProps) {
  const [navOpen, setNavOpen] = useState(false)
  const pathname = usePathname()

  // Picking a destination puts the drawer away.
  useEffect(() => {
    setNavOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!navOpen) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setNavOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [navOpen])

  return (
    <div className="flex h-dvh overflow-hidden surface-pattern-ground">
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />

      {/* Scrim behind the open drawer - tapping it closes the menu. */}
      {navOpen && (
        <div
          className="fixed inset-0 z-40 bg-[rgba(8,21,41,0.55)] lg:hidden"
          onClick={() => setNavOpen(false)}
          aria-hidden
        />
      )}

      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        <Topbar user={user} menuOpen={navOpen} onMenuClick={() => setNavOpen(true)} />

        {/* Pages that fill the viewport use `flex-1 min-h-0` and shrink to fit;
            everything else grows and this area scrolls. */}
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
