'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import * as z from 'zod'
import { logActivity } from '@/features/activity/log'
import { type ActionResult, type FormState, validationError } from '@/lib/action-state'
import { requireAdmin, requireUser } from '@/lib/auth/session'
import type { ServerSupabaseClient } from '@/lib/supabase/server'
import type { FileType } from '@/lib/types/domain'
import { STORAGE_BUCKET } from './constants'
import { RegisterFileSchema, RegisterVersionSchema, RevokeShareSchema, ShareFormSchema } from './schemas'
import { getFileType, parseStoragePath } from './utils'

/**
 * Checks an object the caller just uploaded to storage and returns its real
 * size. Paths must be "<caller uuid>/<uuid>.<ext>" with the expected type.
 */
async function inspectUpload(
  supabase: ServerSupabaseClient,
  userId: string,
  storagePath: string,
  fileType: FileType,
): Promise<ActionResult<number>> {
  const parsed = parseStoragePath(storagePath)
  if (!parsed || parsed.userId !== userId || parsed.fileType !== fileType) {
    return { ok: false, error: 'Invalid upload path.' }
  }

  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).info(storagePath)
  if (error || !data) {
    return { ok: false, error: 'Uploaded file not found. Please try again.' }
  }
  return { ok: true, data: data.size ?? 0 }
}

async function discardUpload(supabase: ServerSupabaseClient, storagePath: string) {
  await supabase.storage.from(STORAGE_BUCKET).remove([storagePath])
}

/** Registers a new file after the browser uploaded it to storage. */
export async function registerFile(input: z.input<typeof RegisterFileSchema>): Promise<ActionResult<string>> {
  const parsed = RegisterFileSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Invalid upload.' }

  const { supabase, user, profile } = await requireUser()
  const { fileName, storagePath } = parsed.data

  if (profile.role === 'viewer') return { ok: false, error: 'Viewers cannot upload files.' }

  const fileType = getFileType(fileName)
  if (!fileType) return { ok: false, error: 'Unsupported file type.' }

  const size = await inspectUpload(supabase, user.id, storagePath, fileType)
  if (!size.ok) return size

  const { data: fileId, error } = await supabase.rpc('create_file', {
    p_file_name: fileName,
    p_file_type: fileType,
    p_file_size: size.data,
    p_storage_path: storagePath,
  })

  if (error || !fileId) {
    await discardUpload(supabase, storagePath)
    return { ok: false, error: error?.message ?? 'Could not save the file.' }
  }

  revalidatePath('/dashboard')
  return { ok: true, data: fileId }
}

/** Registers a new version of an existing file after the browser uploaded it. */
export async function registerVersion(
  input: z.input<typeof RegisterVersionSchema>,
): Promise<ActionResult<number>> {
  const parsed = RegisterVersionSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Invalid upload.' }

  const { supabase, user } = await requireUser()
  const { fileId, storagePath, changeSummary } = parsed.data

  const { data: file } = await supabase.from('files').select('id, file_type').eq('id', fileId).maybeSingle()
  if (!file) {
    await discardUpload(supabase, storagePath)
    return { ok: false, error: 'File not found.' }
  }

  const size = await inspectUpload(supabase, user.id, storagePath, file.file_type)
  if (!size.ok) {
    await discardUpload(supabase, storagePath)
    return size
  }

  const { data: version, error } = await supabase.rpc('add_file_version', {
    p_file_id: fileId,
    p_storage_path: storagePath,
    p_file_size: size.data,
    p_change_summary: changeSummary ?? '',
  })

  if (error || version == null) {
    await discardUpload(supabase, storagePath)
    return { ok: false, error: error?.message ?? 'Could not save the new version.' }
  }

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/files/${fileId}`)
  return { ok: true, data: version }
}

/** Admin only: deletes a file, all its versions and their stored objects. */
export async function deleteFile(fileId: string): Promise<ActionResult> {
  if (!z.uuid().safeParse(fileId).success) return { ok: false, error: 'Invalid file.' }

  const { supabase, user } = await requireAdmin()

  const { data: file } = await supabase
    .from('files')
    .select('id, file_name, file_versions(storage_path)')
    .eq('id', fileId)
    .maybeSingle()
  if (!file) return { ok: false, error: 'File not found.' }

  const paths = file.file_versions.map((v) => v.storage_path)
  if (paths.length > 0) {
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove(paths)
    if (error) return { ok: false, error: `Could not delete stored files: ${error.message}` }
  }

  const { error } = await supabase.from('files').delete().eq('id', file.id)
  if (error) return { ok: false, error: `Could not delete file: ${error.message}` }

  await logActivity(supabase, user.id, 'delete', null, { file_name: file.file_name })

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function shareFile(_state: FormState, formData: FormData): Promise<FormState> {
  const parsed = ShareFormSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return validationError(parsed.error)

  const { supabase, user } = await requireUser()
  const { fileId, email, permission } = parsed.data

  const { data: file } = await supabase
    .from('files')
    .select('id, file_name, uploaded_by')
    .eq('id', fileId)
    .maybeSingle()
  if (!file) return { message: 'File not found.' }

  const { data: target } = await supabase.from('profiles').select('id, name, role').eq('email', email).maybeSingle()
  if (!target) return { errors: { email: ['No user with that email address.'] } }

  if (target.id === file.uploaded_by) {
    return { errors: { email: ['This user owns the file.'] } }
  }
  if (target.role === 'admin') {
    return { errors: { email: ['Admins already have access to every file.'] } }
  }
  if (permission === 'edit' && target.role === 'viewer') {
    return {
      errors: { permission: ['Viewers can only get view access. Ask an admin to make them an editor first.'] },
    }
  }

  // RLS only lets admins and the file owner write permissions.
  const { error } = await supabase
    .from('file_permissions')
    .upsert({ file_id: fileId, user_id: target.id, permission, granted_by: user.id }, { onConflict: 'file_id,user_id' })
  if (error) return { message: 'You do not have permission to share this file.' }

  await logActivity(supabase, user.id, 'share', fileId, {
    file_name: file.file_name,
    target_name: target.name,
    permission,
  })

  revalidatePath(`/dashboard/files/${fileId}`)
  return { success: true, message: `Shared with ${target.name} (${permission === 'edit' ? 'can edit' : 'can view'}).` }
}

export async function revokeShare(input: z.input<typeof RevokeShareSchema>): Promise<ActionResult> {
  const parsed = RevokeShareSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Invalid request.' }

  const { supabase, user } = await requireUser()
  const { fileId, userId } = parsed.data

  const { data: removed, error } = await supabase
    .from('file_permissions')
    .delete()
    .eq('file_id', fileId)
    .eq('user_id', userId)
    .select('user_id')

  if (error || !removed || removed.length === 0) {
    return { ok: false, error: 'You do not have permission to change sharing for this file.' }
  }

  await logActivity(supabase, user.id, 'unshare', fileId, { target_id: userId })

  revalidatePath(`/dashboard/files/${fileId}`)
  return { ok: true, data: undefined }
}
