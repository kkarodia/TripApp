import Link from 'next/link'
import { IconChevronLeft } from '@tabler/icons-react'

interface AppBarProps {
  title:     string
  subtitle?: string
  back?:     string
  action?:   React.ReactNode
}

export function AppBar({ title, subtitle, back, action }: AppBarProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex items-center bg-white border-b border-[--color-border-subtle]"
      style={{
        height: 'var(--header-height)',
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      {back && (
        <Link
          href={back}
          className="flex items-center justify-center w-10 h-full pl-3 text-[--color-text-tertiary] hover:text-[--color-text-primary] flex-shrink-0 transition-colors"
          aria-label="Go back"
        >
          <IconChevronLeft size={20} stroke={1.5} aria-hidden />
        </Link>
      )}

      <div className={`flex-1 min-w-0 ${back ? 'px-2' : 'px-5'}`}>
        <p className="text-[17px] font-semibold text-[--color-text-primary] leading-tight truncate">
          {title}
        </p>
        {subtitle && (
          <p className="text-[12px] text-[--color-text-tertiary] leading-tight mt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div className="flex-shrink-0 pr-4">
          {action}
        </div>
      )}
    </header>
  )
}
