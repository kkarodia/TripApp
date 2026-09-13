/**
 * RouteSheetDocument - the printable A4 layout.
 *
 * This is a pure presentational component with zero state.
 * It renders identically in the browser preview and in Puppeteer
 * when generating the PDF server-side.
 *
 * Rules enforced here (from UI doc):
 * - Monochrome only - no colour that loses meaning in B&W print
 * - Geocode error sits inline under the affected address
 * - No top-level alert banner
 * - Haversine disclaimer in footer (updated when Google Routes is live)
 */

import { cn } from '@/lib/utils'
import type { Trip, Stop, RoadType } from '@routedesk/types'

interface RouteSheetDocumentProps {
  trip: Trip
  companyName?: string
}

const ROAD_LABEL: Record<RoadType, string> = {
  motorway: 'Motorway',
  national: 'National',
  urban:    'Urban',
  unknown:  '-',
}

function formatTime(iso: string | null | undefined, fallback = '-'): string {
  if (!iso) return fallback
  return new Date(iso).toLocaleTimeString('en-ZA', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-ZA', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function formatGenerated(iso: string): string {
  return new Date(iso).toLocaleString('en-ZA', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

export function RouteSheetDocument({
  trip,
  companyName = 'Your Company (Pty) Ltd',
}: RouteSheetDocumentProps) {
  const arrived = trip.stops.filter(s => s.status === 'arrived').length

  return (
    <div
      className={cn(
        // A4 dimensions at 96dpi - matches Puppeteer default
        'w-[794px] min-h-[1123px]',
        'bg-white text-[#111] font-sans',
        'px-[44px] py-[40px]',
        'text-[12px] leading-[1.5]'
      )}
      id="route-sheet-print"
    >

      {/* ── Page header ──────────────────────────────────────── */}
      <div className="flex justify-between items-end pb-[14px] mb-[20px] border-b-[1.5px] border-[#111]">
        <div>
          <p className="text-[15px] font-semibold text-[#111]">{companyName}</p>
          <p className="text-[11px] text-[#777] mt-[3px] tracking-[0.03em]">
            Delivery route sheet -{' '}
            {trip.optimiseFor === 'distance' ? 'shortest distance'
              : trip.optimiseFor === 'time' ? 'shortest time'
              : 'lowest fuel cost'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[24px] font-semibold text-[#111] leading-none">
            {trip.reference}
          </p>
          <p className="text-[11px] text-[#777] mt-[4px]">
            {formatDate(trip.createdAt)}
          </p>
        </div>
      </div>

      {/* ── Meta grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-[14px] mb-[20px]">
        {[
          { label: 'Driver',      value: trip.driver?.name ?? '-' },
          { label: 'Vehicle',     value: '-' },
          { label: 'Warehouse',   value: trip.warehouseName },
          { label: 'Trip type',   value: trip.tripType === 'round-trip' ? 'Round-trip' : 'One-way' },
          { label: 'Total stops', value: String(trip.stops.length) },
          { label: 'Generated',   value: formatGenerated(trip.createdAt) },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[#888] mb-[3px]">
              {label}
            </p>
            <p className="text-[13px] font-semibold text-[#111]">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Stop table ───────────────────────────────────────── */}
      <table className="w-full border-collapse mb-[20px]" style={{ tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '36px' }} />
          <col style={{ width: '72px' }} />
          <col style={{ width: '148px' }} />
          <col />
          <col style={{ width: '48px' }} />
          <col style={{ width: '44px' }} />
        </colgroup>
        <thead>
          <tr className="border-b border-[#111]">
            {['#', 'Road', 'Client', 'Address', 'km', 'min'].map(h => (
              <th
                key={h}
                className={cn(
                  'py-[5px] px-[6px] text-[10px] uppercase tracking-[0.06em] text-[#888] font-medium',
                  ['km', 'min'].includes(h) ? 'text-right' : 'text-left'
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Departure row */}
          <tr>
            <td className="py-[8px] px-[6px] text-[11px] text-[#888]">DEP</td>
            <td className="py-[8px] px-[6px]" />
            <td className="py-[8px] px-[6px] text-[11px] text-[#888]">{trip.warehouseName}</td>
            <td className="py-[8px] px-[6px] text-[11px] text-[#888]">{trip.warehouseAddress}</td>
            <td className="py-[8px] px-[6px] text-[11px] text-[#888] text-right">-</td>
            <td className="py-[8px] px-[6px] text-[11px] text-[#888] text-right">-</td>
          </tr>

          {/* Delivery stops */}
          {trip.stops.map((stop, i) => (
            <tr
              key={stop.id}
              className={cn(
                'border-b border-[#e8e8e5]',
                stop.geocodeFailed && 'bg-[#fafafa]'
              )}
            >
              {/* Sequence */}
              <td className="py-[8px] px-[6px] text-[11px] font-semibold text-[#555]">
                {stop.sequence}
              </td>

              {/* Road type */}
              <td className="py-[8px] px-[6px] text-[11px] text-[#777]">
                {ROAD_LABEL[stop.roadType]}
              </td>

              {/* Client name */}
              <td className="py-[8px] px-[6px] text-[12px] font-medium text-[#111]">
                {stop.clientName}
              </td>

              {/* Address - geocode error sits inline here */}
              <td className="py-[8px] px-[6px]">
                <span className="text-[12px] text-[#111] block">
                  {stop.address}
                </span>
                {stop.geocodeFailed && (
                  <span className="block text-[10px] text-[#999] italic mt-[3px] pt-[3px] border-t border-[#e8e8e5]">
                    Address not geocoded - navigate manually
                  </span>
                )}
              </td>

              {/* km */}
              <td className="py-[8px] px-[6px] text-[11px] text-[#555] text-right">
                {stop.distanceKm !== null ? stop.distanceKm : '-'}
              </td>

              {/* min */}
              <td className="py-[8px] px-[6px] text-[11px] text-[#555] text-right">
                {stop.estimatedMinutes !== null ? stop.estimatedMinutes : '-'}
              </td>
            </tr>
          ))}

          {/* Return row - round-trip only */}
          {trip.tripType === 'round-trip' && (
            <tr>
              <td className="py-[8px] px-[6px] text-[11px] text-[#888]">RTN</td>
              <td className="py-[8px] px-[6px]" />
              <td className="py-[8px] px-[6px] text-[11px] text-[#888]">{trip.warehouseName}</td>
              <td className="py-[8px] px-[6px] text-[11px] text-[#888]">{trip.warehouseAddress}</td>
              <td className="py-[8px] px-[6px] text-[11px] text-[#888] text-right">-</td>
              <td className="py-[8px] px-[6px] text-[11px] text-[#888] text-right">-</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ── Totals bar ───────────────────────────────────────── */}
      <div className="grid grid-cols-3 border-t border-[#111] border-b border-b-[#ddd] mb-[20px]">
        {[
          { label: 'Total distance',  value: trip.totalDistanceKm      ? `${trip.totalDistanceKm.toLocaleString('en-US')} km` : '-' },
          { label: 'Est. time',       value: trip.totalEstimatedMinutes ? `${(trip.totalEstimatedMinutes / 60).toFixed(1)} hrs` : '-' },
          { label: 'Fuel index',      value: trip.fuelIndex            ? trip.fuelIndex.toLocaleString('en-US') : '-' },
        ].map(({ label, value }, i) => (
          <div
            key={label}
            className={cn('py-[10px] px-[8px]', i > 0 && 'border-l border-[#ddd]')}
          >
            <p className="text-[15px] font-semibold text-[#111]">{value}</p>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[#888] mt-[2px]">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Dispatcher notes ─────────────────────────────────── */}
      <div className="mb-[22px]">
        <p className="text-[10px] uppercase tracking-[0.06em] text-[#888] mb-[6px]">
          Dispatcher notes
        </p>
        <div className="flex flex-col gap-[10px]">
          <div className="border-b border-[#ccc] h-[18px]" />
          <div className="border-b border-[#ccc] h-[18px]" />
        </div>
      </div>

      {/* ── Signature block ──────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-[32px] pt-[18px] border-t border-[#ddd]">
        {['Driver signature', 'Date'].map(label => (
          <div key={label}>
            <div className="border-b border-[#111] h-[32px] mb-[5px]" />
            <p className="text-[10px] uppercase tracking-[0.06em] text-[#888]">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Page footer ──────────────────────────────────────── */}
      <div className="flex justify-between mt-[22px] pt-[10px] border-t border-[#e8e8e5]">
        <span className="text-[10px] text-[#aaa]">
          Distances are Haversine estimates. Fuel index is relative.
        </span>
        <span className="text-[10px] text-[#aaa]">
          {trip.reference} · Generated {formatGenerated(trip.createdAt)}
        </span>
      </div>

    </div>
  )
}
