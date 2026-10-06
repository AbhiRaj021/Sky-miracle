'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatBytes } from '@/lib/format'
import { useAppDispatch } from '@/lib/store/hooks'
import { inputClass, primaryButtonClass } from '@/lib/styles'
import type { FileType } from '@/lib/types/domain'
import { cn } from '@/lib/utils'
import { ACCEPT_ALL_TYPES, FILE_TYPES, MAX_FILE_SIZE } from '../constants'
import { uploadFile } from '../store/upload-thunks'
import { targetKeyOf, type UploadTarget } from '../store/uploads-slice'
import { acceptAttributeFor } from '../utils'
import { UploadQueue } from './upload-queue'

type Props = { mode: 'new' } | { mode: 'version'; fileId: string; fileType: FileType }

/**
 * Drag-and-drop uploader. New files accept several at once; new versions take
 * one file plus an optional change note. Upload state lives in Redux.
 */
export function UploadPanel(props: Props) {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const summaryRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [selected, setSelected] = useState<File[]>([])

  const isVersion = props.mode === 'version'
  const requiredType = isVersion ? props.fileType : undefined
  const targetKey = targetKeyOf(isVersion ? { kind: 'version', fileId: props.fileId } : { kind: 'new' })

  function pick(files: FileList | null) {
    const list = Array.from(files ?? [])
    setSelected(isVersion ? list.slice(0, 1) : list)
  }

  async function start() {
    if (selected.length === 0) return
    const target: UploadTarget = isVersion
      ? { kind: 'version', fileId: props.fileId, changeSummary: summaryRef.current?.value }
      : { kind: 'new' }

    const files = selected
    setSelected([])
    if (inputRef.current) inputRef.current.value = ''
    if (summaryRef.current) summaryRef.current.value = ''

    const results = await Promise.all(files.map((file) => dispatch(uploadFile(file, target, requiredType))))
    if (results.some(Boolean)) router.refresh()
  }

  return (
    <div className="space-y-4">
      <label
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          pick(e.dataTransfer.files)
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-4 py-8 text-center transition',
          dragging ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 hover:border-slate-700',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          multiple={!isVersion}
          accept={requiredType ? acceptAttributeFor(requiredType) : ACCEPT_ALL_TYPES}
          onChange={(e) => pick(e.target.files)}
        />
        <span className="text-sm font-medium">
          {selected.length > 0
            ? selected.map((f) => f.name).join(', ')
            : `Drop ${isVersion ? 'a file' : 'files'} here or click to browse`}
        </span>
        <span className="text-xs text-slate-500">
          {requiredType ? `${FILE_TYPES[requiredType].label} (.${requiredType}) only` : 'PDF, Word (.docx) or Excel (.xlsx)'} ·
          up to {formatBytes(MAX_FILE_SIZE)} each
        </span>
      </label>

      {isVersion && (
        <Input ref={summaryRef} type="text" maxLength={500} placeholder="What changed? (optional)" className={inputClass} />
      )}

      <div className="flex justify-end">
        <Button type="button" onClick={start} disabled={selected.length === 0} className={primaryButtonClass}>
          {isVersion ? 'Upload new version' : selected.length > 1 ? `Upload ${selected.length} files` : 'Upload'}
        </Button>
      </div>

      <UploadQueue targetKey={targetKey} />
    </div>
  )
}
