'use client'

import { useEffect, useRef, useState } from 'react'
import { signOut } from 'next-auth/react'
import { IconChevronDown, IconLogout } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

export interface ProfileUser {
  name: string
  role: string
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function ProfileMenu({ user }: { user: ProfileUser }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  // Close on an outside click or Escape, as a native menu would.
  useEffect(() => {
    if (!open) return

    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={`Account menu for ${user.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        className={cn(
          'flex items-center gap-2 rounded-full p-1 sm:pr-2.5',
          'transition-colors duration-200 ease-out hover:bg-[--color-sky-200]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-sky-400]',
          open && 'bg-[--color-sky-200]'
        )}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[--color-navy-800] text-[11px] font-semibold text-white">
          {initials(user.name)}
        </span>
        <span className="hidden max-w-[140px] truncate text-[13px] font-medium text-[--color-navy-800] sm:block">
          {user.name}
        </span>
        <IconChevronDown
          size={14}
          stroke={2}
          className={cn(
            'hidden text-[--color-navy-600] transition-transform duration-200 ease-out sm:block',
            open && 'rotate-180'
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-[--radius-lg] border border-[--color-border-default] bg-white shadow-[0_8px_24px_rgba(15,34,64,0.12)]"
        >
          <div className="border-b border-[--color-border-subtle] bg-[--color-sky-50] px-4 py-3">
            <p className="truncate text-[13px] font-semibold text-[--color-text-primary]">{user.name}</p>
            <p className="mt-0.5 text-[11px] capitalize text-[--color-text-secondary]">{user.role}</p>
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] text-[--color-text-secondary] transition-colors hover:bg-[--color-danger-bg] hover:text-[--color-danger]"
          >
            <IconLogout size={16} stroke={1.6} aria-hidden />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
