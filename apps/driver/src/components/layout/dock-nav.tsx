'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { IconTruckDelivery, IconBell, IconUser, IconNavigation } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/navigate',      icon: IconNavigation,    label: 'Navigate' },
  { href: '/trips',         icon: IconTruckDelivery, label: 'Trips'    },
  { href: '/notifications', icon: IconBell,          label: 'Alerts'   },
  { href: '/profile',       icon: IconUser,          label: 'Profile'  },
]

interface DockNavProps {
  unreadCount?: number
}

export function DockNav({ unreadCount = 0 }: DockNavProps) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/trips')    return pathname === '/trips' || pathname.startsWith('/trips/')
    if (href === '/navigate') return pathname === '/navigate'
    return pathname.startsWith(href)
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex bg-white border-t border-[--color-border-subtle]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', height: 'calc(var(--dock-height) + env(safe-area-inset-bottom, 0px))' }}
      aria-label="Main navigation"
    >
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        const active = isActive(href)
        const showBadge = href === '/notifications' && unreadCount > 0

        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative flex-1 flex flex-col items-center justify-center gap-1 transition-colors pt-0.5',
              active
                ? 'text-[--color-brand]'
                : 'text-[--color-text-tertiary] hover:text-[--color-text-secondary]'
            )}
            style={active ? { borderTop: '2px solid var(--color-brand)', marginTop: '-1px' } : {}}
          >
            <Icon size={22} stroke={active ? 2 : 1.5} aria-hidden />
            <span
              className={cn(
                'text-[10px] font-medium leading-none',
                active ? 'text-[--color-brand]' : 'text-[--color-text-tertiary]'
              )}
            >
              {label}
            </span>

            {showBadge && (
              <span className="absolute top-2.5 left-1/2 translate-x-1 w-[7px] h-[7px] rounded-full bg-[--color-danger]" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
