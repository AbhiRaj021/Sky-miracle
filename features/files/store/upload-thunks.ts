import { nanoid } from '@reduxjs/toolkit'
import { selectUserId } from '@/features/auth/store/session-slice'
import { notify } from '@/features/notifications/store/notifications-slice'
import { createClient } from '@/lib/supabase/client'
import type { AppThunk } from '@/lib/store/store'
import type { FileType } from '@/lib/types/domain'
import { registerFile, registerVersion } from '../actions'
import { FILE_TYPES, STORAGE_BUCKET } from '../constants'
import { buildStoragePath, getFileType, validateUpload } from '../utils'
import {
  targetKeyOf,
  uploadFailed,
  uploadRegistering,
  uploadStarted,
  uploadSucceeded,
  type UploadTarget,
} from './uploads-slice'

/**
 * Uploads one file straight from the browser to Supabase Storage (policies
 * only allow the user's own folder), then registers it with a Server Action
 * that writes the database rows. Progress is tracked in the uploads slice.
 * Resolves to true when the upload was saved.
 */
export const uploadFile =
  (file: File, target: UploadTarget, requiredType?: FileType): AppThunk<Promise<boolean>> =>
  async (dispatch, getState) => {
    const id = nanoid()
    dispatch(
      uploadStarted({ id, fileName: file.name, size: file.size, targetKey: targetKeyOf(target), startedAt: Date.now() }),
    )

    const fail = (error: string) => {
      dispatch(uploadFailed({ id, error }))
      dispatch(notify('error', `${file.name}: ${error}`))
      return false
    }

    const userId = selectUserId(getState())
    if (!userId) return fail('You are signed out. Please log in again.')

    const problem = validateUpload(file, requiredType)
    if (problem) return fail(problem)

    const fileType = getFileType(file.name)!
    const storagePath = buildStoragePath(userId, fileType)
    const { error: uploadError } = await createClient()
      .storage.from(STORAGE_BUCKET)
      .upload(storagePath, file, { contentType: FILE_TYPES[fileType].mime, upsert: false })
    if (uploadError) return fail(`Upload failed: ${uploadError.message}`)

    dispatch(uploadRegistering(id))

    if (target.kind === 'new') {
      const result = await registerFile({ fileName: file.name, storagePath })
      if (!result.ok) return fail(result.error)
      dispatch(uploadSucceeded({ id, fileId: result.data, version: 1 }))
      dispatch(notify('success', `Uploaded ${file.name}.`))
    } else {
      const result = await registerVersion({ fileId: target.fileId, storagePath, changeSummary: target.changeSummary })
      if (!result.ok) return fail(result.error)
      dispatch(uploadSucceeded({ id, fileId: target.fileId, version: result.data }))
      dispatch(notify('success', `Saved ${file.name} as version ${result.data}.`))
    }

    return true
  }
