import 'server-only'
import { requireAdmin } from '@/lib/auth/session'

export async function getAdminOverview() {
  const { supabase, user } = await requireAdmin()

  const [users, files, activity] = await Promise.all([
    supabase.from('profiles').select('id, name, email, role, created_at').order('created_at'),
    supabase.from('files').select('id', { count: 'exact', head: true }),
    supabase
      .from('activity_logs')
      .select(
        'id, action, details, created_at, file_id, actor:profiles!activity_logs_user_id_fkey(name), file:files!activity_logs_file_id_fkey(file_name)',
      )
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const roleCounts = { admin: 0, editor: 0, viewer: 0 }
  for (const u of users.data ?? []) roleCounts[u.role]++

  return {
    currentUserId: user.id,
    users: users.data ?? [],
    fileCount: files.count ?? 0,
    roleCounts,
    activity: activity.data ?? [],
  }
}

export type AdminUser = Awaited<ReturnType<typeof getAdminOverview>>['users'][number]
