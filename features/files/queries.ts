import 'server-only'
import { requireUser } from '@/lib/auth/session'
import { getFileAccess } from './access'
import type { FileListView } from './constants'

/** Files the user may see (RLS), newest first, filtered by view and search. */
export async function listFiles({ view, search }: { view: FileListView; search: string }) {
  const { supabase, user } = await requireUser()

  let query = supabase
    .from('files')
    .select(
      'id, file_name, file_type, file_size, current_version, updated_at, uploaded_by, uploader:profiles!files_uploaded_by_fkey(name)',
    )
    .order('updated_at', { ascending: false })
    .limit(200)

  if (view === 'mine') query = query.eq('uploaded_by', user.id)
  if (view === 'shared') query = query.neq('uploaded_by', user.id)
  if (search) query = query.ilike('file_name', `%${search.replace(/[%_\\]/g, '\\$&')}%`)

  const { data, error } = await query
  if (error) throw new Error(`Could not load files: ${error.message}`)
  return data
}

export type FileListItem = Awaited<ReturnType<typeof listFiles>>[number]

/** Everything the file page needs, or null when the file is missing or hidden. */
export async function getFileDetail(fileId: string) {
  const { supabase, user, profile } = await requireUser()

  const { data: file } = await supabase
    .from('files')
    .select('*, uploader:profiles!files_uploaded_by_fkey(name, email)')
    .eq('id', fileId)
    .maybeSingle()
  if (!file) return null

  const [versions, permissions, activity] = await Promise.all([
    supabase
      .from('file_versions')
      .select('id, version_number, file_size, change_summary, created_at, saver:profiles!file_versions_saved_by_fkey(name)')
      .eq('file_id', fileId)
      .order('version_number', { ascending: false }),
    // Owners and admins see every grant; other users only see their own.
    supabase
      .from('file_permissions')
      .select('user_id, permission, created_at, user:profiles!file_permissions_user_id_fkey(name, email, role)')
      .eq('file_id', fileId)
      .order('created_at'),
    supabase
      .from('activity_logs')
      .select('id, action, details, created_at, file_id, actor:profiles!activity_logs_user_id_fkey(name)')
      .eq('file_id', fileId)
      .order('created_at', { ascending: false })
      .limit(25),
  ])

  const grant = permissions.data?.find((p) => p.user_id === user.id)?.permission

  return {
    file,
    versions: versions.data ?? [],
    shares: permissions.data ?? [],
    activity: activity.data ?? [],
    access: getFileAccess(profile, file, grant),
    currentUserId: user.id,
  }
}

export type FileDetail = NonNullable<Awaited<ReturnType<typeof getFileDetail>>>
