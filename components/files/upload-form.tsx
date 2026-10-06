'use client'

import { registerFile, registerVersion } from '@/app/actions/files'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ACCEPT_ATTRIBUTE,
  buildStoragePath,
  FILE_TYPES,
  formatBytes,
  getFileType,
  MAX_FILE_SIZE,
  STORAGE_BUCKET,
  validateUpload,
} from '@/lib/files'
import { errorBoxClass, inputClass, primaryButtonClass, successBoxClass } from '@/lib/styles'
import type { FileType } from '@/lib/types/users'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

type Props =
  | { mode: 'new'; userId: string }
  | { mode: 'version'; userId: string; fileId: string; fileType: FileType }

type Status = { kind: 'idle' } | { kind: 'uploading' } | { kind: 'error' | 'success'; message: string }

/**
 * Uploads straight from the browser to Supabase Storage (storage policies
 * only allow the user's own folder), then registers the object with a
 * server action that writes the database rows.
 */
export function UploadForm(props: Props) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const file = formData.get('file')
    if (!(file instanceof File) || file.size === 0) {
      setStatus({ kind: 'error', message: 'Choose a file to upload.' })
      return
    }

    const problem = validateUpload(file)
    if (problem) {
      setStatus({ kind: 'error', message: problem })
      return
    }

    const fileType = getFileType(file.name)!
    if (props.mode === 'version' && fileType !== props.fileType) {
      setStatus({ kind: 'error', message: `New versions must be ${FILE_TYPES[props.fileType].label} (.${props.fileType}) files.` })
      return
    }

    setStatus({ kind: 'uploading' })
    const storagePath = buildStoragePath(props.userId, fileType)
    const supabase = createClient()
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, { contentType: FILE_TYPES[fileType].mime, upsert: false })

    if (uploadError) {
      setStatus({ kind: 'error', message: `Upload failed: ${uploadError.message}` })
      return
    }

    const result =
      props.mode === 'new'
        ? await registerFile({ fileName: file.name, storagePath })
        : await registerVersion({
            fileId: props.fileId,
            storagePath,
            changeSummary: String(formData.get('changeSummary') ?? ''),
          })

    if (!result.ok) {
      setStatus({ kind: 'error', message: result.error })
      return
    }

    formRef.current?.reset()
    setStatus({
      kind: 'success',
      message: props.mode === 'new' ? `Uploaded ${file.name}.` : `Saved as version ${result.data}.`,
    })
    router.refresh()
  }

  const uploading = status.kind === 'uploading'

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
      {(status.kind === 'error' || status.kind === 'success') && (
        <div className={status.kind === 'error' ? errorBoxClass : successBoxClass}>{status.message}</div>
      )}
      <Input
        name="file"
        type="file"
        required
        accept={props.mode === 'version' ? `.${props.fileType},${FILE_TYPES[props.fileType].mime}` : ACCEPT_ATTRIBUTE}
        disabled={uploading}
        className={`${inputClass} file:mr-3 file:text-slate-300`}
      />
      {props.mode === 'version' && (
        <Input
          name="changeSummary"
          type="text"
          maxLength={500}
          placeholder="What changed? (optional)"
          disabled={uploading}
          className={inputClass}
        />
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-500">
          {props.mode === 'version'
            ? `.${props.fileType} only`
            : 'PDF, Word (.docx) or Excel (.xlsx)'}{' '}
          · up to {formatBytes(MAX_FILE_SIZE)}
        </p>
        <Button type="submit" disabled={uploading} className={primaryButtonClass}>
          {uploading ? 'Uploading...' : props.mode === 'new' ? 'Upload' : 'Upload new version'}
        </Button>
      </div>
    </form>
  )
}
