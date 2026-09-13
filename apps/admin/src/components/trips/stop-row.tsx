'use client'

import { IconGripVertical, IconEdit, IconTrash, IconMapPinOff } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import type { Stop, RoadType } from '@routedesk/types'

interface StopRowProps {
  stop: Stop
  index: number
  isDep?: boolean
  isRtn?: boolean
  onEdit?: (stop: Stop) => void
  onDelete?: (stopId: string) => void
  disabled?: boolean
}

const ROAD_PILL: Record<RoadType, { label: string; className: string }> = {
  motorway: { label: 'Motorway', className: 'bg-[--color-success-bg] text-[--color-success]' },
  national: { label: 'National', className: 'bg-[--color-info-bg] text-[--color-info]' },
  urban:    { label: 'Urban',    className: 'bg-[--color-warning-bg] text-[--color-warning]' },
  unknown:  { label: 'Unknown',  className: 'bg-[--color-surface-2] text-[--color-text-tertiary]' },
}

export function StopRow({ stop, index, isDep, isRtn, onEdit, onDelete, disabled }: StopRowProps) {
  const road = ROAD_PILL[stop.roadType]

  return (
    <div
      className={cn(
        'group flex items-center gap-2.5 px-3 py-2.5 rounded-[--radius-md] border transition-colors',
        stop.geocodeFailed
          ? 'border-[--color-danger-border] bg-[--color-danger-bg]'
          : 'border-transparent hover:border-[--color-border-subtle] hover:bg-[--color-surface-1]'
      )}
    >
      {/* ── Drag handle ────────────────────────────────────────── */}
      {!isDep && !isRtn && (
        <div className="text-[--color-text-disabled] group-hover:text-[--color-text-tertiary] cursor-grab flex-shrink-0">
          <IconGripVertical size={14} stroke={1.5} aria-hidden />
        </div>
      )}

      {/* ── Sequence dot ───────────────────────────────────────── */}
      <div className={cn(
        'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0',
        isDep || isRtn
          ? 'bg-[--color-surface-2] text-[--color-text-tertiary] text-[9px]'
          : stop.geocodeFailed
            ? 'bg-[--color-danger] text-white'
            : 'bg-[--color-brand] text-white'
      )}>
        {isDep ? 'DEP' : isRtn ? 'RTN' : index}
      </div>

      {/* ── Stop info ──────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-[13px] font-medium truncate',
          isDep || isRtn ? 'text-[--color-text-tertiary]' : 'text-[--color-text-primary]'
        )}>
          {stop.clientName}
        </p>
        <p className="text-[11px] text-[--color-text-tertiary] truncate mt-0.5">
          {stop.address}
        </p>

        {/* Road pill + distance - only for real stops */}
        {!isDep && !isRtn && (
          <div className="flex items-center gap-2 mt-1">
            <span className={cn(
              'text-[10px] font-medium px-1.5 py-0.5 rounded-[4px]',
              road.className
            )}>
              {road.label}
            </span>
            {stop.distanceKm !== null ? (
              <span className="text-[11px] text-[--color-text-tertiary]">
                {stop.distanceKm} km · {stop.estimatedMinutes} min
              </span>
            ) : (
              <span className="text-[11px] text-[--color-text-tertiary]">-</span>
            )}
          </div>
        )}

        {/* Geocode failure inline warning */}
        {stop.geocodeFailed && (
          <div className="flex items-center gap-1 mt-1">
            <IconMapPinOff size={11} stroke={2} className="text-[--color-danger]" aria-hidden />
            <span className="text-[11px] text-[--color-danger] font-medium">
              Address not geocoded - fix before calculating
            </span>
          </div>
        )}
      </div>

      {/* ── Actions (visible on hover) ─────────────────────────── */}
      {!isDep && !isRtn && !disabled && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => onEdit?.(stop)}
            className="w-7 h-7 flex items-center justify-center rounded-[--radius-sm] border border-[--color-border-default] text-[--color-text-tertiary] hover:text-[--color-text-primary] hover:bg-white transition-colors"
            aria-label={`Edit stop ${stop.clientName}`}
          >
            <IconEdit size={13} stroke={1.5} aria-hidden />
          </button>
          <button
            onClick={() => onDelete?.(stop.id)}
            className="w-7 h-7 flex items-center justify-center rounded-[--radius-sm] border border-[--color-border-default] text-[--color-text-tertiary] hover:text-[--color-danger] hover:bg-[--color-danger-bg] hover:border-[--color-danger-border] transition-colors"
            aria-label={`Delete stop ${stop.clientName}`}
          >
            <IconTrash size={13} stroke={1.5} aria-hidden />
          </button>
        </div>
      )}
    </div>
  )
}
