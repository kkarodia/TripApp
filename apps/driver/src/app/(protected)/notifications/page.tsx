import { AppBar, DockNav } from '@/components/layout'
import { MOCK_NOTIFICATIONS } from '@/lib/mock-data'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Notifications - RouteDesk' }

function formatNotifTime(iso: string): string {
  const date = new Date(iso)
  const now  = new Date()
  const isToday = date.toDateString() === now.toDateString()
  return isToday
    ? date.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false })
    : date.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' })
}

export default function NotificationsPage() {
  const unread = MOCK_NOTIFICATIONS.filter(n => !n.read).length

  return (
    <div className="min-h-dvh surface-pattern-ground">
      <AppBar
        title="Notifications"
        subtitle={unread > 0 ? `${unread} unread` : 'All caught up'}
      />

      <main
        className="px-4 pb-24"
        style={{ paddingTop: 'calc(var(--header-height) + 16px)' }}
      >
        <div className="surface-pattern-panel rounded-[--radius-lg] border border-[--color-border-subtle] overflow-hidden">
          {MOCK_NOTIFICATIONS.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-[13px] text-[--color-text-tertiary]">No notifications</p>
            </div>
          ) : MOCK_NOTIFICATIONS.map((notif, i) => (
            <div
              key={notif.id}
              className={`flex items-start gap-3 px-4 py-3.5 ${i < MOCK_NOTIFICATIONS.length - 1 ? 'border-b border-[--color-border-subtle]' : ''} ${!notif.read ? 'bg-[--color-accent-subtle] shadow-[inset_3px_0_0_var(--color-accent)]' : ''}`}
            >
              <div className="flex-shrink-0 mt-1.5">
                {notif.read
                  ? <div className="w-2 h-2 rounded-full border-2 border-[--color-border-default]" />
                  : <div className="w-2 h-2 rounded-full bg-[--color-brand]" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[13px] mb-0.5 ${notif.read ? 'text-[--color-text-tertiary]' : 'text-[--color-text-primary] font-medium'}`}>
                  {notif.title}
                </p>
                <p className="text-[12px] text-[--color-text-secondary] leading-relaxed">
                  {notif.message}
                </p>
                <p className="text-[11px] text-[--color-text-tertiary] mt-1 tabular-nums">
                  {formatNotifTime(notif.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <DockNav unreadCount={unread} />
    </div>
  )
}
