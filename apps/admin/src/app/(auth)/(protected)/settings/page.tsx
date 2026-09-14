import type { Metadata } from 'next'
import { IconSettings } from '@tabler/icons-react'
import { PageContent, PageHeading } from '@/components/layout'
import { Card, CardContent } from '@/components/ui'

export const metadata: Metadata = { title: 'Settings - RouteDesk' }

/**
 * Placeholder so the topbar's settings button has somewhere to land.
 * Account and dispatch preferences will be built out here.
 */
export default function SettingsPage() {
  return (
    <PageContent>
      <PageHeading
        className="mb-6"
        title="Settings"
        subtitle="Manage your account and dispatch preferences"
      />

      <Card>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[--color-sky-100]">
            <IconSettings size={20} stroke={1.6} className="text-[--color-accent]" aria-hidden />
          </span>
          <p className="text-[13px] font-medium text-[--color-text-primary]">Nothing to configure yet</p>
          <p className="mt-1 text-[12px] text-[--color-text-tertiary]">
            Account and dispatch settings will live here.
          </p>
        </CardContent>
      </Card>
    </PageContent>
  )
}
