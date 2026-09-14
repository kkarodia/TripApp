import { cn } from '@/lib/utils'

interface TripHeaderProps {
  eyebrow:    string
  title:      string
  subtitle:   string
  progress?:  { done: number; total: number }
  statusPill?: React.ReactNode
  className?: string
}

export function TripHeader({
  eyebrow, title, subtitle, progress, statusPill, className
}: TripHeaderProps) {
  return (
    <div
      className={cn('surface-pattern-navy px-5 pb-8', className)}
      style={{ paddingTop: 'max(48px, env(safe-area-inset-top, 48px))' }}
    >
      {/* Top row — status pill only; clock removed (SSR/client mismatch) */}
      {statusPill && (
        <div className="flex items-center justify-end mb-4">
          {statusPill}
        </div>
      )}

      {/* Eyebrow */}
      <p
        className="text-[9px] uppercase tracking-[0.12em] text-[--color-sky-500] mb-1.5"
        style={{ fontFamily: 'var(--font-label)' }}
      >
        {eyebrow}
      </p>

      {/* Title */}
      <h1
        className="text-[34px] text-white leading-none mb-1"
        style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.04em' }}
      >
        {title}
      </h1>

      {/* Subtitle */}
      <p
        className="text-[11px] text-[--color-sky-300] tracking-[0.02em]"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        {subtitle}
      </p>

      {/* Progress bar */}
      {progress && (
        <div className="flex items-center gap-3 mt-4">
          <div className="flex-1 h-[3px] bg-white/12 rounded-full overflow-hidden">
            <div
              className="h-full bg-[--color-sky-300] rounded-full transition-all duration-700"
              style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }}
              role="progressbar"
              aria-valuenow={progress.done}
              aria-valuemax={progress.total}
              aria-label={`${progress.done} of ${progress.total} stops completed`}
            />
          </div>
          <span
            className="text-[10px] text-[--color-sky-500] tabular-nums"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {progress.done}/{progress.total}
          </span>
        </div>
      )}
    </div>
  )
}
