'use client'

import { useState } from 'react'
import { IconUserPlus, IconUserCheck, IconAlertTriangle } from '@tabler/icons-react'
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui'
import { MOCK_DRIVERS } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import type { Trip } from '@routedesk/types'

interface AssignDriverCardProps {
  trip: Trip
  onAssign: (driverId: string | null, scheduledFor: string | null) => Promise<void> | void
}

const fieldClass = cn(
  'w-full px-3 py-2 text-[12px] rounded-[--radius-md] border border-[--color-border-default]',
  'bg-white text-[--color-text-primary]',
  'focus:outline-none focus:ring-2 focus:ring-[--color-brand] focus:ring-offset-1',
  'disabled:opacity-50 disabled:cursor-not-allowed'
)

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

/**
 * Crewing control for a trip that has been planned but hasn't left yet.
 *
 * Assigning a driver does not move the trip out of `scheduled` - only the driver
 * departing does that - so this stays available right up until the truck rolls,
 * and reassigning is just running it again.
 */
export function AssignDriverCard({ trip, onAssign }: AssignDriverCardProps) {
  const [driverId, setDriverId] = useState(trip.driverId ?? '')
  const [date, setDate] = useState(trip.scheduledFor ?? '')
  const [saving, setSaving] = useState(false)

  const dirty = driverId !== (trip.driverId ?? '') || date !== (trip.scheduledFor ?? '')
  const assigned = Boolean(trip.driverId)

  async function save(nextDriverId: string, nextDate: string) {
    setSaving(true)
    await onAssign(nextDriverId || null, nextDate || null)
    setSaving(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assignment</CardTitle>
        {assigned && (
          <span className="flex items-center gap-1.5 text-[11px] text-[--color-success] font-medium">
            <IconUserCheck size={13} stroke={2} aria-hidden />
            Crewed
          </span>
        )}
      </CardHeader>
      <CardContent>
        {assigned ? (
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[--color-info-bg] flex items-center justify-center flex-shrink-0">
              <span className="text-[13px] font-semibold text-[--color-info]">
                {initials(trip.driver?.name ?? '?')}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-[--color-text-primary] truncate">
                {trip.driver?.name}
              </p>
              <p className="text-[12px] text-[--color-text-tertiary] truncate">
                {trip.driver?.username ?? '-'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2.5 px-3 py-2.5 mb-4 rounded-[--radius-md] bg-[--color-warning-bg] border border-[--color-warning-border]">
            <IconAlertTriangle size={13} stroke={2} className="text-[--color-warning] flex-shrink-0 mt-0.5" aria-hidden />
            <p className="text-[11px] text-[--color-warning]">
              No driver yet. This trip cannot leave until someone is assigned.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label
              htmlFor="assign-driver"
              className="block text-[10px] font-medium text-[--color-text-tertiary] uppercase tracking-[0.06em] mb-1.5"
            >
              Driver
            </label>
            <select
              id="assign-driver"
              value={driverId}
              onChange={e => setDriverId(e.target.value)}
              disabled={saving}
              className={fieldClass}
            >
              <option value="">Unassigned</option>
              {MOCK_DRIVERS.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="assign-date"
              className="block text-[10px] font-medium text-[--color-text-tertiary] uppercase tracking-[0.06em] mb-1.5"
            >
              Scheduled for
            </label>
            <input
              id="assign-date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              disabled={saving}
              className={fieldClass}
            />
            {!date && (
              <p className="text-[10px] text-[--color-text-tertiary] mt-1">
                Leave empty to keep this in the undated backlog.
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              variant="primary"
              size="sm"
              className="flex-1 justify-center"
              loading={saving}
              disabled={!dirty || saving}
              onClick={() => save(driverId, date)}
              icon={<IconUserPlus size={14} stroke={2} aria-hidden />}
            >
              {assigned ? 'Update' : 'Assign'}
            </Button>
            {assigned && (
              <Button
                variant="danger"
                size="sm"
                disabled={saving}
                onClick={() => {
                  setDriverId('')
                  save('', date)
                }}
              >
                Unassign
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
