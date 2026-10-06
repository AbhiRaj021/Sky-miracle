import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/database'
import { supabaseKey, supabaseUrl } from './env'

/** Supabase client for Client Components (runs in the browser). */
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseKey)
}
