import Link from 'next/link'
import { IconPlus } from '@tabler/icons-react'

interface TopbarProps {
  title: string
  subtitle?: string
  action?: { label: string; href: string }
}

export function Topbar({ title, subtitle, action }: TopbarProps) {
  return (
    <header className="flex items-start justify-between gap-4 px-6 py-4 surface-pattern-panel border-b border-[--color-accent-border] flex-shrink-0">
      <div className="min-w-0">
        <h1 className="text-[18px] font-semibold text-[--color-text-primary] truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[12px] text-[--color-text-tertiary] mt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[--radius-md] bg-[--color-brand] text-white text-[12px] font-semibold hover:bg-[--color-brand-hover] transition-colors flex-shrink-0"
        >
          <IconPlus size={14} stroke={2.5} aria-hidden />
          {action.label}
        </Link>
      )}
    </header>
  )
}
