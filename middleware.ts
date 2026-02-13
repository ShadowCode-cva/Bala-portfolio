import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if we are in the admin area
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check for session cookie
    const session = request.cookies.get('admin_session')
    
    console.log('[MIDDLEWARE] Path:', request.nextUrl.pathname)
    console.log('[MIDDLEWARE] Session cookie value:', session?.value || 'NOT FOUND')

    // If accessing login page and already logged in, redirect to dashboard
    if (request.nextUrl.pathname === '/admin/login') {
      if (session?.value === 'authenticated') {
        console.log('[MIDDLEWARE] Already authenticated, redirecting to /admin')
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      console.log('[MIDDLEWARE] On login page, allowing access')
      return NextResponse.next()
    }

    // If not logged in and trying to access other admin pages, redirect to login
    if (!session || session.value !== 'authenticated') {
      console.log('[MIDDLEWARE] ❌ Unauthorized access attempt, redirecting to login')
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    console.log('[MIDDLEWARE] ✅ Authorized access')
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
}
