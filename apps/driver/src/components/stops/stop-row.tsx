'use client'

import Link from 'next/link'
import { cn, formatTime } from '@/lib/utils'
import { StopDot } from '@/components/ui'
import type { Stop } from '@routedesk/types'

interface StopRowProps {
  stop:      Stop
  tripId:    string
  isCurrent: boolean
  isLast:    boolean
}

export function StopRow({ stop, tripId, isCurrent, isLast }: StopRowProps) {
  const variant =
    stop.status === 'arrived' ? 'done'
    : isCurrent               ? 'active'
    : stop.geocodeFailed      ? 'error'
    : 'pending'

  return (
    <Link
      href={`/trips/${tripId}/stops/${stop.id}`}
      className={cn(
        'flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[--color-surface-1]',
        isCurrent && 'bg-[--color-brand-subtle]',
        !isLast && 'border-b border-[--color-border-subtle]'
      )}
    >
      <div className="flex flex-col items-center flex-shrink-0 pt-0.5">
        <StopDot variant={variant} sequence={stop.sequence} size="md" />
        {!isLast && (
          <div className="w-px flex-1 min-h-[12px] bg-[--color-border-subtle] mt-1" />
        )}
      </div>

      <div className="flex-1 min-w-0 pb-1">
        <p className={cn(
          'text-[13px] leading-tight truncate',
          stop.status === 'arrived'
            ? 'text-[--color-text-tertiary]'
            : 'text-[--color-text-primary] font-medium'
        )}>
          {stop.clientName}
        </p>
        <p className="text-[11px] text-[--color-text-tertiary] truncate mt-0.5">
          {stop.address}
        </p>
      </div>

      <div className="flex-shrink-0 text-right pt-0.5">
        {stop.status === 'arrived' ? (
          <span className="text-[11px] text-[--color-success] font-medium">
            {formatTime(stop.arrivedAt)}
          </span>
        ) : stop.estimatedMinutes !== null ? (
          <span className="text-[11px] text-[--color-text-tertiary]">
            ~{stop.estimatedMinutes}m
          </span>
        ) : (
          <span className="text-[11px] text-[--color-text-disabled]">-</span>
        )}
      </div>
    </Link>
  )
}
