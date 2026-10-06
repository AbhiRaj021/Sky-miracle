import 'server-only'
import type { Json } from '@/lib/types/database'
import type { ServerSupabaseClient } from '@/lib/supabase/server'

export type ActivityAction =
  | 'upload'
  | 'new_version'
  | 'download'
  | 'share'
  | 'unshare'
  | 'delete'
  | 'role_change'

/** Best-effort audit log entry; never blocks the main action. */
export async function logActivity(
  supabase: ServerSupabaseClient,
  userId: string,
  action: ActivityAction,
  fileId: string | null,
  details: { [key: string]: Json | undefined } = {},
) {
  const { error } = await supabase.from('activity_logs').insert({ user_id: userId, file_id: fileId, action, details })
  if (error) console.error('Failed to write activity log', error)
}
