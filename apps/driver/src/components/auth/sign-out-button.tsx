'use client'

import { signOut } from 'next-auth/react'
import { IconLogout } from '@tabler/icons-react'
import { useState } from 'react'

export function SignOutButton() {
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-[--radius-lg] border border-[--color-danger-border] bg-[--color-danger-bg] text-[--color-danger] text-[13px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <IconLogout size={15} stroke={2} aria-hidden />
      {loading ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
