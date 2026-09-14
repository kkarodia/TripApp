'use client'

import { useState } from 'react'
import { IconDownload, IconPrinter, IconArrowLeft } from '@tabler/icons-react'
import { Button } from '@/components/ui'
import { PageHeading, AccentRule } from '@/components/layout'
import Link from 'next/link'
import type { Trip } from '@routedesk/types'

interface RouteSheetToolbarProps {
  trip: Trip
}

export function RouteSheetToolbar({ trip }: RouteSheetToolbarProps) {
  const [downloading, setDownloading] = useState(false)

  async function handleDownload() {
    setDownloading(true)
    try {
      await new Promise(r => setTimeout(r, 1200))
      alert(`PDF download for ${trip.reference} - wire up Puppeteer endpoint to activate`)
    } finally {
      setDownloading(false)
    }
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div className="relative flex flex-col gap-3 px-4 py-4 bg-white print:hidden sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-5">
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href={`/trips/${trip.id}`}
          className="p-1.5 rounded-[--radius-sm] text-[--color-text-tertiary] hover:bg-[--color-surface-2] hover:text-[--color-text-primary] transition-colors"
          aria-label="Back to trip"
        >
          <IconArrowLeft size={16} stroke={2} aria-hidden />
        </Link>
        <PageHeading
          size="md"
          title={`Route sheet - ${trip.reference}`}
          subtitle={`${trip.driver?.name ?? 'Unassigned'} · ${trip.stops.length} stops · ${new Date(trip.createdAt).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })}`}
        />
      </div>

      <div className="flex items-center gap-2 pl-10 sm:pl-0">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleDownload}
          loading={downloading}
          icon={<IconDownload size={14} stroke={1.5} aria-hidden />}
        >
          Download PDF
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handlePrint}
          icon={<IconPrinter size={14} stroke={2} aria-hidden />}
        >
          Print
        </Button>
      </div>

      <AccentRule />
    </div>
  )
}
