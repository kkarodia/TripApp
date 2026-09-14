'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IconMenu2, IconSettings } from '@tabler/icons-react'
import { ActionButton } from '@/components/ui'
import { ProfileMenu, type ProfileUser } from './profile-menu'
import { NAV_ITEMS } from './nav-items'
import { cn } from '@/lib/utils'

interface TopbarProps {
  user: ProfileUser
  /** Opens the sidebar drawer. The trigger only shows below `lg`. */
  onMenuClick: () => void
  menuOpen: boolean
}

const ICON_BUTTON = cn(
  'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[--radius-md] text-[--color-navy-600]',
  'transition-colors duration-200 ease-out hover:bg-[--color-sky-200] hover:text-[--color-navy-800]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-sky-400]'
)

/**
 * Global app bar - a thin, solid light-blue strip rendered once by the Shell.
 *
 * It carries only where you are and what you can do from anywhere; page
 * titles and greetings live in each page's own content.
 */
export function Topbar({ user, onMenuClick, menuOpen }: TopbarProps) {
  const pathname = usePathname()

  const onSettings = pathname === '/settings' || pathname.startsWith('/settings/')
  const section = onSettings
    ? 'Settings'
    : NAV_ITEMS.find(item => pathname === item.href || pathname.startsWith(`${item.href}/`))?.label

  return (
    <header className="flex h-14 flex-shrink-0 items-center justify-between gap-3 border-b border-[--color-sky-200] bg-[--color-sky-100] px-3 sm:px-6 print:hidden">
      <div className="flex min-w-0 items-center gap-1.5">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          aria-controls="app-sidebar"
          aria-expanded={menuOpen}
          className={cn(ICON_BUTTON, 'lg:hidden')}
        >
          <IconMenu2 size={20} stroke={1.8} aria-hidden />
        </button>

        {section && (
          <p className="flex min-w-0 items-center gap-2 text-[12px] font-medium text-[--color-navy-600]">
            <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[--color-sky-500]" aria-hidden />
            <span className="truncate">{section}</span>
          </p>
        )}
      </div>

      <div className="flex flex-shrink-0 items-center gap-1 sm:gap-2">
        {/* Pointless to offer "New trip" while already planning one. */}
        {pathname !== '/trips/new' && (
          <ActionButton label="New trip" href="/trips/new" compact />
        )}

        <span className="mx-1.5 hidden h-6 w-px bg-[--color-sky-300] sm:block" aria-hidden />

        <Link
          href="/settings"
          aria-label="Settings"
          aria-current={onSettings ? 'page' : undefined}
          className={cn(ICON_BUTTON, onSettings && 'bg-[--color-sky-200] text-[--color-navy-800]')}
        >
          <IconSettings
            size={19}
            stroke={1.7}
            className="transition-transform duration-300 ease-out hover:rotate-45"
            aria-hidden
          />
        </Link>

        <ProfileMenu user={user} />
      </div>
    </header>
  )
}
