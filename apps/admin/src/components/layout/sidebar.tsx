'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { IconLogout, IconRoute, IconX } from '@tabler/icons-react'
import { ActionButton } from '@/components/ui'
import { NAV_ITEMS } from './nav-items'
import { cn } from '@/lib/utils'

/**
 * Hover treatment shared by every row in the sidebar: the label lifts and
 * lights up pale blue.
 *
 * The lift is a `scale` on the label rather than a `font-size` change - it
 * animates on the compositor and, crucially, doesn't reflow the rows below
 * it, which a real font-size transition would do on every frame.
 */
const LABEL_HOVER = cn(
  'origin-left transition-[transform,color,text-shadow] duration-200 ease-out',
  'group-hover:scale-[1.07] group-hover:text-[--color-sky-300]',
  'group-hover:[text-shadow:0_0_12px_rgba(126,169,220,0.45)]'
)

// Every colour below is a solid navy step - no alpha - so the backdrop
// pattern never bleeds through text, icons or row fills.
const ROW = cn(
  'group relative flex items-center gap-3 rounded-[--radius-md] px-3 py-2.5',
  'transition-colors duration-200 ease-out'
)

interface SidebarProps {
  /** Drawer state below `lg`. From `lg` up the sidebar is always shown. */
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      id="app-sidebar"
      className={cn(
        'flex flex-col flex-shrink-0 surface-pattern-navy text-white border-r border-[--color-navy-900]',
        // Off-canvas drawer below lg. `visibility` rides the transition so a
        // closed drawer leaves the tab order only once it has slid away.
        'fixed inset-y-0 left-0 z-50 transition-[transform,visibility] duration-300 ease-out',
        open
          ? 'visible translate-x-0 shadow-[8px_0_32px_rgba(8,21,41,0.35)]'
          : 'invisible -translate-x-full',
        // Static column from lg up, whatever the drawer state.
        'lg:static lg:z-auto lg:visible lg:translate-x-0 lg:shadow-none lg:transition-none'
      )}
      style={{ width: 'var(--sidebar-width)' }}
    >
      {/* ── Brand ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-4 pt-5 pb-4">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[--radius-md] bg-[--color-navy-600] ring-1 ring-inset ring-[--color-navy-400]">
          <IconRoute size={18} stroke={2} className="text-[--color-sky-300]" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold leading-none tracking-[-0.01em] text-white">RouteDesk</p>
          <p className="mt-1.5 text-[9px] font-medium uppercase leading-none tracking-[0.16em] text-[--color-sky-400]">
            Dispatch portal
          </p>
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[--radius-md] text-[--color-navy-100] transition-colors hover:bg-[--color-navy-700] hover:text-white lg:hidden"
        >
          <IconX size={18} stroke={2} aria-hidden />
        </button>
      </div>

      {/* ── Primary action ─────────────────────────────────────── */}
      <div className="px-3 pb-4">
        <ActionButton label="New trip" href="/trips/new" onNavy className="w-full" />
      </div>

      {/* ── Navigation ─────────────────────────────────────────── */}
      <nav className="flex-1 px-3" aria-label="Main">
        <p className="px-3 pb-2 text-[9px] font-medium uppercase tracking-[0.16em] text-[--color-navy-200]">
          Menu
        </p>

        <div className="space-y-1">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            // /trips must not stay highlighted while on /trips/new or /trips/:id,
            // so match the segment rather than a bare prefix.
            const active = pathname === href || pathname.startsWith(`${href}/`)

            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  ROW,
                  active
                    ? 'bg-[--color-navy-600] text-white'
                    : 'text-[--color-navy-100] hover:bg-[--color-navy-700]'
                )}
              >
                {/* Light-blue rail marks the active page. */}
                <span
                  className={cn(
                    'absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full',
                    'bg-[--color-sky-400] transition-opacity duration-200',
                    active ? 'opacity-100' : 'opacity-0'
                  )}
                  aria-hidden
                />

                <Icon
                  size={18}
                  stroke={active ? 2 : 1.6}
                  className={cn(
                    'flex-shrink-0 transition-colors duration-200 ease-out',
                    active
                      ? 'text-[--color-sky-300]'
                      : 'text-[--color-navy-200] group-hover:text-[--color-sky-300]'
                  )}
                  aria-hidden
                />

                <span
                  className={cn(
                    'text-[13px]',
                    active ? 'font-medium text-white' : 'font-normal',
                    LABEL_HOVER
                  )}
                >
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* ── Sign out ───────────────────────────────────────────── */}
      <div className="border-t border-[--color-navy-600] px-3 py-3">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className={cn(ROW, 'w-full text-[--color-navy-100] hover:bg-[--color-navy-700]')}
        >
          <IconLogout
            size={18}
            stroke={1.6}
            className="flex-shrink-0 text-[--color-navy-200] transition-colors duration-200 ease-out group-hover:text-[--color-sky-300]"
            aria-hidden
          />
          <span className={cn('text-[13px]', LABEL_HOVER)}>Sign out</span>
        </button>
      </div>
    </aside>
  )
}
