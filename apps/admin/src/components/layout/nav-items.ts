import {
  IconLayoutDashboard,
  IconTruckDelivery,
  IconMap2,
  IconFileText,
  type TablerIcon,
} from '@tabler/icons-react'

export interface NavItem {
  label: string
  href: string
  icon: TablerIcon
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',    href: '/dashboard',    icon: IconLayoutDashboard },
  { label: 'Trips',        href: '/trips',        icon: IconTruckDelivery },
  { label: 'Route map',    href: '/routes',       icon: IconMap2 },
  { label: 'Route sheets', href: '/route-sheets', icon: IconFileText },
]
