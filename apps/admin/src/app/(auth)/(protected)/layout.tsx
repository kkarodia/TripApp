import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Shell } from '@/components/layout'

/**
 * Layout for all protected admin pages.
 * Server-side session check - unauthenticated users are sent to /login
 * before any client JS runs.
 *
 * In Next.js App Router, route groups with parentheses (protected)
 * don't add a URL segment - /protected/dashboard is served at /dashboard.
 */
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Double-check role even if middleware passed - defence in depth
  if (session.user.role !== 'manager') {
    redirect('/login')
  }

  return (
    <Shell user={{ name: session.user.name ?? 'Manager', role: session.user.role }}>
      {children}
    </Shell>
  )
}