import { AppBar, DockNav } from '@/components/layout'
import { SignOutButton } from '@/components/auth/sign-out-button'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Profile - RouteDesk' }

const INFO_ROWS = [
  { label: 'Full name',   value: 'John Dlamini' },
  { label: 'Username',    value: 'john.dlamini' },
  { label: 'Role',        value: 'Driver' },
  { label: 'App version', value: '1.0.0' },
]

export default function ProfilePage() {
  return (
    <div className="min-h-dvh bg-[--color-surface-1]">
      <AppBar title="Profile" />

      <main
        className="px-4 pb-24"
        style={{ paddingTop: 'calc(var(--header-height) + 16px)' }}
      >
        {/* Avatar card */}
        <div className="bg-white rounded-[--radius-lg] border border-[--color-border-subtle] p-4 mb-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[--color-brand] flex items-center justify-center flex-shrink-0">
            <span className="text-[13px] font-semibold text-white">JD</span>
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[--color-text-primary]">John Dlamini</p>
            <p className="text-[12px] text-[--color-text-tertiary]">john.dlamini · Driver</p>
          </div>
        </div>

        {/* Info rows */}
        <div className="bg-white rounded-[--radius-lg] border border-[--color-border-subtle] overflow-hidden mb-3">
          {INFO_ROWS.map(({ label, value }, i) => (
            <div
              key={label}
              className={`flex justify-between items-center px-4 py-3 ${i < INFO_ROWS.length - 1 ? 'border-b border-[--color-border-subtle]' : ''}`}
            >
              <span className="text-[12px] text-[--color-text-tertiary]">{label}</span>
              <span className="text-[13px] text-[--color-text-primary] font-medium">{value}</span>
            </div>
          ))}
        </div>

        {/* Sign out */}
        <SignOutButton />
      </main>

      <DockNav />
    </div>
  )
}
