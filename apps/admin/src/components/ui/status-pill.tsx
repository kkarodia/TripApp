import { Badge } from './badge'
import type { TripStatus, StopStatus } from '@routedesk/types'

const tripStatusMap: Record<TripStatus, { label: string; variant: 'success' | 'info' | 'warning' | 'default' | 'outline' }> = {
  scheduled: { label: 'Scheduled',  variant: 'info' },
  active:    { label: 'On route',   variant: 'success' },
  completed: { label: 'Complete',   variant: 'outline' },
  archived:  { label: 'Archived',   variant: 'default' },
}

const stopStatusMap: Record<StopStatus, { label: string; variant: 'success' | 'warning' | 'default' }> = {
  pending:  { label: 'Pending',  variant: 'default' },
  arrived:  { label: 'Arrived',  variant: 'success' },
  skipped:  { label: 'Skipped',  variant: 'warning' },
}

export function TripStatusPill({ status }: { status: TripStatus }) {
  const { label, variant } = tripStatusMap[status]
  return <Badge variant={variant}>{label}</Badge>
}

export function StopStatusPill({ status }: { status: StopStatus }) {
  const { label, variant } = stopStatusMap[status]
  return <Badge variant={variant}>{label}</Badge>
}
