import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/middleware'

export async function proxy(request: NextRequest) {
  const { supabase, supabaseResponse } = createClient(request)
  const { data: { user } } = await supabase.auth.getUser()


  const path = request.nextUrl.pathname

  // Public paths that do not require authentication
  const isPublicPath = path.startsWith('/login') || path.startsWith('/signup') || path.startsWith('/forgot-password')

  // API auth paths or Next.js internals that should be skipped
  if (path.startsWith('/api/auth') || path.startsWith('/_next') || path.includes('/favicon.ico')) {
    return supabaseResponse
  }

  if (!user) {
    // If not authenticated and trying to access a protected path, redirect to login
    if (!isPublicPath) {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  } else {
    // If authenticated and trying to access login/signup/forgot-password or root, redirect to dashboard
    if (isPublicPath || path === '/') {
      const dashboardUrl = new URL('/dashboard', request.url)
      return NextResponse.redirect(dashboardUrl)
    }

    // Role-based authorization for admin paths
    if (path.startsWith('/admin')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        // Not authorized, redirect to dashboard
        const dashboardUrl = new URL('/dashboard', request.url)
        return NextResponse.redirect(dashboardUrl)
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, documents, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
