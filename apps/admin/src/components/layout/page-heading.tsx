import { cn } from '@/lib/utils'

interface PageHeadingProps {
  /** Small tracked label above the title - usually the nav section. */
  eyebrow?: string
  title: string
  subtitle?: React.ReactNode
  /** Sits inline beside the title - a status pill, a count, a chip. */
  trailing?: React.ReactNode
  /** `lg` for the main topbar, `md` for the denser detail bars. */
  size?: 'md' | 'lg'
  className?: string
}

const TITLE_SIZE = {
  md: 'text-[17px]',
  lg: 'text-[23px]',
}

/**
 * The heading block shared by every bar across the top of a page: a pale-blue
 * eyebrow, a tightly tracked title, then a quiet subtitle.
 */
export function PageHeading({
  eyebrow, title, subtitle, trailing, size = 'lg', className,
}: PageHeadingProps) {
  return (
    <div className={cn('min-w-0', className)}>
      {eyebrow && (
        <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase leading-none tracking-[0.16em] text-[--color-sky-500]">
          <span className="h-1 w-1 flex-shrink-0 rounded-full bg-[--color-sky-400]" aria-hidden />
          {eyebrow}
        </p>
      )}

      <div className={cn('flex items-center gap-2.5 min-w-0', eyebrow && 'mt-2')}>
        <h1
          className={cn(
            'font-semibold leading-none tracking-[-0.025em] text-[--color-text-primary] truncate',
            TITLE_SIZE[size]
          )}
        >
          {title}
        </h1>
        {trailing && <span className="flex-shrink-0">{trailing}</span>}
      </div>

      {subtitle && (
        <p className="mt-2.5 text-[12px] leading-none text-[--color-text-secondary] truncate">
          {subtitle}
        </p>
      )}
    </div>
  )
}

/**
 * Light-blue hairline that fades out to the right. Sits along the bottom edge
 * of a top bar in place of a flat border, so absolutely position it inside a
 * `relative` parent.
 */
export function AccentRule({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'pointer-events-none absolute inset-x-0 bottom-0 h-px',
        'bg-[linear-gradient(to_right,var(--color-sky-400),var(--color-accent-border)_42%,transparent)]',
        className
      )}
      aria-hidden
    />
  )
}
