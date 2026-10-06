import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Returns the signed-in user and their profile, or redirects to /login.
 * Cached per request so layouts, pages and actions can all call it.
 */
export const requireUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

  return { supabase, user, profile }
})

export async function requireAdmin() {
  const session = await requireUser()
  if (session.profile.role !== 'admin') redirect('/dashboard')
  return session
}
