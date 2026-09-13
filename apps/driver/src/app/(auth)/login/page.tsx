import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { Suspense } from 'react'
import { authOptions } from '@/lib/auth'
import { LoginForm } from '@/components/auth/login-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign in — RouteDesk Driver',
}

export default async function LoginPage() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role === 'driver') redirect('/trips')

  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
