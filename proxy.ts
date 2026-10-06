import { NextResponse, type NextRequest } from 'next/server'
import { createProxyClient } from '@/lib/supabase/proxy'

// Pages for signed-out users. Signed-in users are sent to the dashboard instead.
const GUEST_ONLY_PATHS = ['/login', '/signup', '/forgot-password']

export async function proxy(request: NextRequest) {
  const { supabase, getResponse } = createProxyClient(request)
  const path = request.nextUrl.pathname

  // Refreshes the session cookie; must run before any early return.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Auth callbacks handle their own redirects.
  if (path.startsWith('/api/auth')) {
    return getResponse()
  }

  const redirectTo = (pathname: string) => {
    const response = NextResponse.redirect(new URL(pathname, request.url))
    // Keep any refreshed auth cookies on the redirect.
    getResponse().cookies.getAll().forEach((cookie) => response.cookies.set(cookie))
    return response
  }

  const isGuestOnlyPath = GUEST_ONLY_PATHS.some((p) => path.startsWith(p))

  if (!user) {
    return isGuestOnlyPath ? getResponse() : redirectTo('/login')
  }

  if (isGuestOnlyPath || path === '/') {
    return redirectTo('/dashboard')
  }

  if (path.startsWith('/admin')) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') {
      return redirectTo('/dashboard')
    }
  }

  return getResponse()
}

export const config = {
  matcher: [
    // Everything except static assets and image optimization files.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
