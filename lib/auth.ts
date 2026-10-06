import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function getSupabase() {
  return createClient(await cookies())
}

/**
 * Returns the signed-in user and their profile, or redirects to /login.
 * Cached per request so layouts and pages can both call it.
 */
export const requireUser = cache(async () => {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  if (!profile) redirect('/login')

  return { supabase, user, profile }
})

export async function requireAdmin() {
  const session = await requireUser()
  if (session.profile.role !== 'admin') redirect('/dashboard')
  return session
}

/** Only allow same-origin relative paths, e.g. "/dashboard". */
export function safeRedirectPath(path: string | null | undefined, fallback = '/dashboard') {
  if (
    !path ||
    !path.startsWith('/') ||
    path.startsWith('//') ||
    path.includes('\\') ||
    /[\u0000-\u001f]/.test(path)
  ) {
    return fallback
  }
  return path
}
