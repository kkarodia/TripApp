import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { Suspense } from 'react'
import { authOptions } from '@/lib/auth'
import { LoginForm } from '@/components/auth/login-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign in - RouteDesk',
}

/**
 * Login page - server component.
 *
 * Checks for an existing session first - if the user is already
 * authenticated as a manager, redirect straight to the dashboard.
 * This prevents the login page flashing briefly on refresh.
 *
 * LoginForm is wrapped in Suspense because it calls useSearchParams()
 * which requires a Suspense boundary in Next.js App Router.
 */
export default async function LoginPage() {
  const session = await getServerSession(authOptions)

  if (session?.user?.role === 'manager') {
    redirect('/dashboard')
  }

  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
