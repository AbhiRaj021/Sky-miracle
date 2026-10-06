'use server'

import * as z from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin, requireUser } from '@/lib/auth'
import { logActivity } from '@/lib/activity'
import {
  ActionResult,
  FormState,
  RegisterFileSchema,
  RegisterVersionSchema,
  ShareFormSchema,
} from '@/lib/definitions'
import { getFileType, parseStoragePath, STORAGE_BUCKET } from '@/lib/files'

type Supabase = Awaited<ReturnType<typeof requireUser>>['supabase']

/**
 * Checks an object the caller just uploaded to storage and returns its real
 * size. Paths must be "<caller uuid>/<uuid>.<ext>" with the expected type.
 */
async function inspectUpload(
  supabase: Supabase,
  userId: string,
  storagePath: string,
  fileType: string,
): Promise<{ ok: true; size: number } | { ok: false; error: string }> {
  const parsed = parseStoragePath(storagePath)
  if (!parsed || parsed.userId !== userId || parsed.fileType !== fileType) {
    return { ok: false, error: 'Invalid upload path.' }
  }

  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).info(storagePath)
  if (error || !data) {
    return { ok: false, error: 'Uploaded file not found. Please try again.' }
  }
  return { ok: true, size: data.size ?? 0 }
}

async function discardUpload(supabase: Supabase, storagePath: string) {
  await supabase.storage.from(STORAGE_BUCKET).remove([storagePath])
}

export async function registerFile(input: z.input<typeof RegisterFileSchema>): Promise<ActionResult<string>> {
  const parsed = RegisterFileSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Invalid upload.' }

  const { supabase, user, profile } = await requireUser()
  const { fileName, storagePath } = parsed.data

  if (profile.role === 'viewer') {
    return { ok: false, error: 'Viewers cannot upload files.' }
  }

  const fileType = getFileType(fileName)
  if (!fileType) return { ok: false, error: 'Unsupported file type.' }

  const upload = await inspectUpload(supabase, user.id, storagePath, fileType)
  if (!upload.ok) return upload

  const { data: fileId, error } = await supabase.rpc('create_file', {
    p_file_name: fileName,
    p_file_type: fileType,
    p_file_size: upload.size,
    p_storage_path: storagePath,
  })

  if (error || !fileId) {
    await discardUpload(supabase, storagePath)
    return { ok: false, error: error?.message ?? 'Could not save the file.' }
  }

  revalidatePath('/dashboard')
  return { ok: true, data: fileId }
}

export async function registerVersion(input: z.input<typeof RegisterVersionSchema>): Promise<ActionResult<number>> {
  const parsed = RegisterVersionSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Invalid upload.' }

  const { supabase, user } = await requireUser()
  const { fileId, storagePath, changeSummary } = parsed.data

  const { data: file } = await supabase
    .from('files')
    .select('id, file_type')
    .eq('id', fileId)
    .maybeSingle()

  if (!file) {
    await discardUpload(supabase, storagePath)
    return { ok: false, error: 'File not found.' }
  }

  const upload = await inspectUpload(supabase, user.id, storagePath, file.file_type)
  if (!upload.ok) {
    await discardUpload(supabase, storagePath)
    return { ok: false, error: `${upload.error} New versions must be ${file.file_type.toUpperCase()} files.` }
  }

  const { data: version, error } = await supabase.rpc('add_file_version', {
    p_file_id: fileId,
    p_storage_path: storagePath,
    p_file_size: upload.size,
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

export async function deleteFile(fileId: string) {
  if (!z.uuid().safeParse(fileId).success) return

  const { supabase, user } = await requireAdmin()

  const { data: file } = await supabase
    .from('files')
    .select('id, file_name, file_versions(storage_path)')
    .eq('id', fileId)
    .maybeSingle()
  if (!file) redirect('/dashboard')

  await logActivity(supabase, user.id, 'delete', file.id, { file_name: file.file_name })

  const paths = file.file_versions.map((v) => v.storage_path)
  if (paths.length > 0) {
    const { error: storageError } = await supabase.storage.from(STORAGE_BUCKET).remove(paths)
    if (storageError) throw new Error(`Could not delete stored files: ${storageError.message}`)
  }

  const { error } = await supabase.from('files').delete().eq('id', file.id)
  if (error) throw new Error(`Could not delete file: ${error.message}`)

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function shareFile(state: FormState, formData: FormData): Promise<FormState> {
  const parsed = ShareFormSchema.safeParse({
    fileId: formData.get('fileId'),
    email: formData.get('email'),
    permission: formData.get('permission'),
  })
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors }
  }

  const { supabase, user } = await requireUser()
  const { fileId, email, permission } = parsed.data

  const { data: file } = await supabase
    .from('files')
    .select('id, file_name, uploaded_by')
    .eq('id', fileId)
    .maybeSingle()
  if (!file) return { message: 'File not found.' }

  const { data: target } = await supabase
    .from('profiles')
    .select('id, name, role')
    .eq('email', email)
    .maybeSingle()
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
    .upsert(
      { file_id: fileId, user_id: target.id, permission, granted_by: user.id },
      { onConflict: 'file_id,user_id' },
    )
  if (error) return { message: 'You do not have permission to share this file.' }

  await logActivity(supabase, user.id, 'share', fileId, {
    file_name: file.file_name,
    target_name: target.name,
    permission,
  })

  revalidatePath(`/dashboard/files/${fileId}`)
  return { success: true, message: `Shared with ${target.name} (${permission}).` }
}

export async function revokeShare(formData: FormData) {
  const parsed = z
    .object({ fileId: z.uuid(), userId: z.uuid() })
    .safeParse({ fileId: formData.get('fileId'), userId: formData.get('userId') })
  if (!parsed.success) return

  const { supabase, user } = await requireUser()
  const { fileId, userId } = parsed.data

  const { data: removed } = await supabase
    .from('file_permissions')
    .delete()
    .eq('file_id', fileId)
    .eq('user_id', userId)
    .select('user_id')

  if (removed && removed.length > 0) {
    await logActivity(supabase, user.id, 'unshare', fileId, { target_id: userId })
  }

  revalidatePath(`/dashboard/files/${fileId}`)
}
