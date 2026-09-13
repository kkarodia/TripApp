import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequestWithAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const role = req.nextauth.token?.role

    // Any authenticated non-manager hitting a protected route → login
    // This runs BEFORE the layout session check - belt and braces
    if (role !== 'manager') {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      // Only run the middleware function when a token exists
      // Unauthenticated requests are redirected to the signIn page automatically
      authorized: ({ token }) => !!token,
    },
  }
)

// Protect everything except login and Next.js internals
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/trips/:path*',
    '/routes/:path*',
    '/route-sheets/:path*',
    '/settings/:path*',
  ],
}
