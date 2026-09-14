import Link from 'next/link'
import { IconPlus } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

interface ActionButtonProps {
  label: string
  href: string
  /**
   * Set on navy chrome so the focus ring's offset matches the panel behind it
   * instead of punching a white gap into the sidebar.
   */
  onNavy?: boolean
  /** Below `sm`, shrink to the plus icon; the label stays for screen readers. */
  compact?: boolean
  className?: string
}

/**
 * The app's primary "create" affordance - pale blue on both navy and white
 * chrome. Shared by the sidebar and the topbar so the two stay identical.
 */
export function ActionButton({ label, href, onNavy, compact, className }: ActionButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group inline-flex items-center justify-center gap-2 rounded-[--radius-md] py-2.5',
        compact ? 'px-2.5 sm:px-3.5' : 'px-3.5',
        'bg-[--color-sky-300] text-[13px] font-semibold text-[--color-navy-900]',
        'transition-[background-color,box-shadow] duration-200 ease-out',
        'hover:bg-[--color-sky-200] hover:shadow-[0_0_20px_rgba(126,169,220,0.35)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-sky-300]',
        'focus-visible:ring-offset-2',
        onNavy
          ? 'focus-visible:ring-offset-[--color-navy-800]'
          : 'focus-visible:ring-offset-white',
        className
      )}
    >
      <IconPlus
        size={15}
        stroke={2.5}
        className="flex-shrink-0 transition-transform duration-200 ease-out group-hover:rotate-90"
        aria-hidden
      />
      <span className={compact ? 'sr-only sm:not-sr-only' : undefined}>{label}</span>
    </Link>
  )
}
