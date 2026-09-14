'use client'

import { useState } from 'react'
import { IconMapPinCheck, IconMapPinOff, IconTrash, IconChevronRight } from '@tabler/icons-react'
import { StopStatusPill } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { Stop } from '@routedesk/types'

interface StopListProps {
  stops: Stop[]
  tripStatus: string
  onDeleteStop?: (stopId: string) => void
}

function formatTime(iso: string | null): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleTimeString('en-ZA', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

export function StopList({ stops, tripStatus, onDeleteStop }: StopListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const isCompleted = tripStatus === 'completed' || tripStatus === 'archived'

  return (
    <div className="divide-y divide-[--color-border-subtle]">
      {stops.length === 0 && (
        <p className="px-5 py-10 text-[13px] text-[--color-text-tertiary] text-center">
          No stops on this trip yet
        </p>
      )}

      {stops.map((stop, i) => {
        const isExpanded = expandedId === stop.id
        const isActive   = stop.status === 'pending' &&
                           stops.slice(0, i).every(s => s.status === 'arrived')

        return (
          <div
            key={stop.id}
            className={cn(
              'transition-colors',
              isActive && 'bg-[--color-accent-subtle] shadow-[inset_3px_0_0_var(--color-accent)]',
              stop.geocodeFailed && 'bg-[--color-danger-bg]'
            )}
          >
            {/* ── Main row ────────────────────────────────────── */}
            <div
              className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-[--color-surface-1] transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : stop.id)}
              role="button"
              aria-expanded={isExpanded}
              aria-controls={`stop-detail-${stop.id}`}
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setExpandedId(isExpanded ? null : stop.id)}
            >
              {/* Sequence dot */}
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0',
                stop.status === 'arrived'
                  ? 'bg-[--color-success-bg] text-[--color-success]'
                  : isActive
                    ? 'bg-[--color-brand] text-white'
                    : stop.geocodeFailed
                      ? 'bg-[--color-danger] text-white'
                      : 'bg-[--color-surface-2] text-[--color-text-tertiary]'
              )}>
                {stop.status === 'arrived'
                  ? <IconMapPinCheck size={14} stroke={2.5} aria-hidden />
                  : stop.geocodeFailed
                    ? <IconMapPinOff size={14} stroke={2} aria-hidden />
                    : stop.sequence
                }
              </div>

              {/* Stop info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={cn(
                    'text-[13px] font-medium truncate',
                    stop.status === 'arrived' && 'text-[--color-text-tertiary]'
                  )}>
                    {stop.clientName}
                  </p>
                  {isActive && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[--color-brand] text-white">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[--color-text-tertiary] truncate mt-0.5">
                  {stop.address}
                </p>
                {stop.geocodeFailed && (
                  <p className="text-[11px] text-[--color-danger] font-medium mt-0.5">
                    Address not geocoded - driver navigating manually
                  </p>
                )}
              </div>

              {/* Right: meta + status */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right hidden sm:block">
                  {stop.distanceKm !== null && (
                    <p className="text-[12px] text-[--color-text-secondary]">
                      {stop.distanceKm} km
                    </p>
                  )}
                  <p className="text-[11px] text-[--color-text-tertiary]">
                    {stop.status === 'arrived'
                      ? `Arrived ${formatTime(stop.arrivedAt)}`
                      : stop.estimatedMinutes !== null
                        ? `~${stop.estimatedMinutes} min`
                        : '-'
                    }
                  </p>
                </div>
                <StopStatusPill status={stop.status} />
                <IconChevronRight
                  size={14}
                  stroke={1.5}
                  className={cn(
                    'text-[--color-text-tertiary] transition-transform',
                    isExpanded && 'rotate-90'
                  )}
                  aria-hidden
                />
              </div>
            </div>

            {/* ── Expanded detail ─────────────────────────────── */}
            {isExpanded && (
              <div
                id={`stop-detail-${stop.id}`}
                className="px-5 pb-4 pt-1 border-t border-[--color-border-subtle] bg-[--color-surface-1]"
              >
                <div className="grid grid-cols-2 gap-4 mb-4 sm:grid-cols-3">
                  {[
                    { label: 'Road type',   value: stop.roadType ?? '-' },
                    { label: 'Distance',    value: stop.distanceKm !== null ? `${stop.distanceKm} km` : '-' },
                    { label: 'Est. time',   value: stop.estimatedMinutes !== null ? `${stop.estimatedMinutes} min` : '-' },
                    { label: 'Status',      value: stop.status },
                    { label: 'Arrived at',  value: formatTime(stop.arrivedAt) },
                    { label: 'Orders',      value: stop.orders ?? '-' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[10px] text-[--color-text-tertiary] uppercase tracking-[0.05em]">
                        {label}
                      </p>
                      <p className="text-[13px] font-medium text-[--color-text-primary] mt-0.5 capitalize">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Admin can delete stop only if trip is not completed */}
                {!isCompleted && onDeleteStop && (
                  <button
                    onClick={() => onDeleteStop(stop.id)}
                    className="inline-flex items-center gap-1.5 text-[12px] text-[--color-danger] hover:underline"
                  >
                    <IconTrash size={13} stroke={1.5} aria-hidden />
                    Remove stop
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
