'use client'

import { IconClock, IconFileDownload, IconMapPinOff } from '@tabler/icons-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { Notification } from '@routedesk/types'

interface AlertsCardProps {
  alerts: Notification[]
}

type AlertVariant = 'danger' | 'warning' | 'info'

function getAlertVariant(title: string): AlertVariant {
  if (title.toLowerCase().includes('geocode')) return 'danger'
  if (title.toLowerCase().includes('overdue')) return 'warning'
  return 'info'
}

const variantStyles: Record<AlertVariant, { icon: React.ComponentType<{ size?: number; stroke?: number }>, bg: string, text: string }> = {
  danger:  { icon: IconMapPinOff,     bg: 'bg-[--color-danger-bg]',  text: 'text-[--color-danger]' },
  warning: { icon: IconClock,         bg: 'bg-[--color-warning-bg]', text: 'text-[--color-warning]' },
  info:    { icon: IconFileDownload,  bg: 'bg-[--color-info-bg]',    text: 'text-[--color-info]' },
}

function formatAlertTime(iso: string): string {
  const date = new Date(iso)
  const now  = new Date()
  const isToday = date.toDateString() === now.toDateString()
  return isToday
    ? date.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false })
    : date.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' })
}

export function AlertsCard({ alerts }: AlertsCardProps) {
  const unread = alerts.filter(a => !a.read)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Alerts requiring attention</CardTitle>
          {unread.length > 0 && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[--color-danger-bg] text-[--color-danger]">
              {unread.length}
            </span>
          )}
        </div>
        {alerts.length > 0 && (
          <button className="text-[12px] text-[--color-text-tertiary] hover:text-[--color-text-primary] transition-colors">
            Dismiss all
          </button>
        )}
      </CardHeader>
      <CardContent className="px-0 py-0">
        {alerts.length === 0 ? (
          <p className="px-5 py-8 text-[13px] text-[--color-text-tertiary] text-center">
            No alerts - all trips running smoothly
          </p>
        ) : (
          <ul>
            {alerts.map((alert, i) => {
              const variant = getAlertVariant(alert.title)
              const { icon: Icon, bg, text } = variantStyles[variant]
              const isLast = i === alerts.length - 1

              return (
                <li
                  key={alert.id}
                  className={cn(
                    'flex items-start gap-3 px-5 py-3.5',
                    !isLast && 'border-b border-[--color-border-subtle]',
                    !alert.read && 'bg-[--color-surface-1]'
                  )}
                >
                  {/* Icon */}
                  <div className={cn('w-7 h-7 rounded-[--radius-md] flex items-center justify-center flex-shrink-0 mt-0.5', bg)}>
                    <Icon size={14} stroke={2} className={text} aria-hidden />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-[--color-text-primary] leading-snug">
                      {alert.title}
                    </p>
                    <p className="text-[11px] text-[--color-text-secondary] mt-0.5 leading-relaxed">
                      {alert.message}
                    </p>
                    <p className="text-[10px] text-[--color-text-tertiary] mt-1">
                      {formatAlertTime(alert.createdAt)}
                      {alert.tripId && (
                        <span className="ml-1.5">· Trip {alert.tripId.replace('t', 'T-1')}</span>
                      )}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!alert.read && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[--color-brand] flex-shrink-0 mt-2" aria-label="Unread" />
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
