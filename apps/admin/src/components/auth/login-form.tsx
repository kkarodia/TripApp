'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { IconRoute, IconEye, IconEyeOff } from '@tabler/icons-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

export function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl  = searchParams.get('callbackUrl') ?? '/dashboard'

  const [username,    setUsername]    = useState('')
  const [password,    setPassword]    = useState('')
  const [showPass,    setShowPass]    = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!username.trim() || !password) {
      setError('Enter your username and password.')
      return
    }

    setLoading(true)

    const result = await signIn('credentials', {
      username: username.trim().toLowerCase(),
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      // Don't reveal whether username or password was wrong - generic message
      setError('Username or password is incorrect.')
      setPassword('')
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[--color-surface-1] flex items-center justify-center px-4">
      <div className="w-full max-w-[380px]">

        {/* ── Logo ──────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-[8px] bg-[--color-brand] flex items-center justify-center flex-shrink-0">
            <IconRoute size={20} stroke={2} className="text-white" aria-hidden />
          </div>
          <div>
            <p className="text-[16px] font-semibold text-[--color-text-primary] leading-tight">
              RouteDesk
            </p>
            <p className="text-[12px] text-[--color-text-tertiary] leading-tight">
              Dispatch portal
            </p>
          </div>
        </div>

        {/* ── Card ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-[--radius-lg] border border-[--color-border-subtle] p-7">
          <h1 className="text-[18px] font-semibold text-[--color-text-primary] mb-1">
            Sign in
          </h1>
          <p className="text-[13px] text-[--color-text-tertiary] mb-6">
            Manager accounts only. Drivers use the driver app.
          </p>

          {/* ── Error banner ────────────────────────────────────────── */}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 px-3.5 py-3 rounded-[--radius-md] bg-[--color-danger-bg] border border-[--color-danger-border] mb-5"
            >
              <p className="text-[12px] text-[--color-danger] leading-snug">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* ── Username ──────────────────────────────────────────── */}
            <div className="mb-4">
              <label
                htmlFor="username"
                className="block text-[11px] font-medium text-[--color-text-tertiary] uppercase tracking-[0.06em] mb-1.5"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="sarah.mokoena"
                disabled={loading}
                className={cn(
                  'w-full px-3.5 py-2.5 rounded-[--radius-md] border text-[13px] text-[--color-text-primary]',
                  'bg-[--color-surface-1] placeholder:text-[--color-text-disabled]',
                  'focus:outline-none focus:ring-2 focus:ring-[--color-brand] focus:ring-offset-1 focus:border-transparent',
                  'disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
                  error
                    ? 'border-[--color-danger-border]'
                    : 'border-[--color-border-default] hover:border-[--color-border-strong]'
                )}
              />
            </div>

            {/* ── Password ──────────────────────────────────────────── */}
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-[11px] font-medium text-[--color-text-tertiary] uppercase tracking-[0.06em] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className={cn(
                    'w-full px-3.5 py-2.5 pr-10 rounded-[--radius-md] border text-[13px] text-[--color-text-primary]',
                    'bg-[--color-surface-1] placeholder:text-[--color-text-disabled]',
                    'focus:outline-none focus:ring-2 focus:ring-[--color-brand] focus:ring-offset-1 focus:border-transparent',
                    'disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
                    error
                      ? 'border-[--color-danger-border]'
                      : 'border-[--color-border-default] hover:border-[--color-border-strong]'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[--color-text-tertiary] hover:text-[--color-text-primary] transition-colors"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass
                    ? <IconEyeOff size={15} stroke={1.5} aria-hidden />
                    : <IconEye    size={15} stroke={1.5} aria-hidden />
                  }
                </button>
              </div>
            </div>

            {/* ── Submit ────────────────────────────────────────────── */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full justify-center"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>

        {/* ── Footer note ───────────────────────────────────────────── */}
        <p className="text-center text-[12px] text-[--color-info] mt-5">
          Forgot your password? Contact your system administrator.
        </p>

      </div>
    </div>
  )
}
