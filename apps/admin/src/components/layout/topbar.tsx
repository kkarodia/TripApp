'use client'

import { usePathname } from 'next/navigation'
import { ActionButton } from '@/components/ui'
import { PageHeading, AccentRule } from './page-heading'
import { NAV_ITEMS } from './nav-items'

interface TopbarProps {
  title: string
  subtitle?: string
  action?: { label: string; href: string }
}

export function Topbar({ title, subtitle, action }: TopbarProps) {
  const pathname = usePathname()

  // Eyebrow doubles as a breadcrumb: on /trips/new it reads "Trips / New trip".
  const section = NAV_ITEMS.find(
    item => pathname === item.href || pathname.startsWith(`${item.href}/`)
  )?.label

  return (
    <header className="relative flex items-center justify-between gap-5 px-6 py-5 surface-pattern-panel flex-shrink-0">
      <PageHeading eyebrow={section} title={title} subtitle={subtitle} />

      {action && (
        <ActionButton label={action.label} href={action.href} className="flex-shrink-0" />
      )}

      <AccentRule />
    </header>
  )
}
