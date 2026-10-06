import { NextResponse } from 'next/server'
import { safeRedirectPath } from '@/lib/auth/redirect'
import { createClient } from '@/lib/supabase/server'

/** Handles email verification and password reset links from Supabase Auth. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Only same-origin paths are allowed, so the link can't redirect off-site.
  const next = safeRedirectPath(searchParams.get('next'))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      const base = !isLocalEnv && forwardedHost ? `https://${forwardedHost}` : origin
      return NextResponse.redirect(`${base}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
