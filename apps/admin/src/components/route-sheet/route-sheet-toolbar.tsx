'use client'

import { useState } from 'react'
import { IconDownload, IconPrinter, IconArrowLeft } from '@tabler/icons-react'
import { Button } from '@/components/ui'
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
    <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[--color-border-subtle] print:hidden">
      <div className="flex items-center gap-3">
        <Link
          href={`/trips/${trip.id}`}
          className="p-1.5 rounded-[--radius-sm] text-[--color-text-tertiary] hover:bg-[--color-surface-2] hover:text-[--color-text-primary] transition-colors"
          aria-label="Back to trip"
        >
          <IconArrowLeft size={16} stroke={2} aria-hidden />
        </Link>
        <div>
          <p className="text-[14px] font-semibold text-[--color-text-primary]">
            Route sheet - {trip.reference}
          </p>
          <p className="text-[12px] text-[--color-text-tertiary]">
            {trip.driver?.name ?? 'Unassigned'} · {trip.stops.length} stops · {new Date(trip.createdAt).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
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
    </div>
  )
}
