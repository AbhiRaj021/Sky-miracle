'use client'

import Link from 'next/link'
import { Spinner } from '@/components/ui/spinner'
import { formatBytes } from '@/lib/format'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { cn } from '@/lib/utils'
import {
  finishedUploadsCleared,
  selectUploadsForTarget,
  type Upload,
  uploadDismissed,
} from '../store/uploads-slice'

const statusLabel: Record<Upload['status'], string> = {
  uploading: 'Uploading...',
  registering: 'Saving...',
  done: 'Done',
  error: 'Failed',
}

/** Live list of uploads for one target ("new" or a file id), read from Redux. */
export function UploadQueue({ targetKey }: { targetKey: string }) {
  const dispatch = useAppDispatch()
  const uploads = useAppSelector((state) => selectUploadsForTarget(state, targetKey))

  if (uploads.length === 0) return null
  const hasFinished = uploads.some((u) => u.status === 'done' || u.status === 'error')

  return (
    <div className="space-y-2">
      <ul className="divide-y divide-slate-800/60 rounded-lg border border-slate-800">
        {uploads.map((upload) => {
          const busy = upload.status === 'uploading' || upload.status === 'registering'
          return (
            <li key={upload.id} className="flex items-center gap-3 px-3 py-2 text-sm">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {upload.status === 'done' && upload.fileId && targetKey === 'new' ? (
                    <Link href={`/dashboard/files/${upload.fileId}`} className="hover:text-blue-400">
                      {upload.fileName}
                    </Link>
                  ) : (
                    upload.fileName
                  )}
                </p>
                <p className={cn('text-xs', upload.status === 'error' ? 'text-rose-400' : 'text-slate-500')}>
                  {upload.status === 'error' ? upload.error : `${formatBytes(upload.size)}`}
                  {upload.status === 'done' && targetKey !== 'new' && ` · version ${upload.version}`}
                </p>
              </div>
              <span
                className={cn(
                  'flex items-center gap-2 text-xs',
                  upload.status === 'done' && 'text-emerald-400',
                  upload.status === 'error' && 'text-rose-400',
                  busy && 'text-slate-400',
                )}
              >
                {busy && <Spinner className="h-3 w-3" />}
                {statusLabel[upload.status]}
              </span>
              {!busy && (
                <button
                  type="button"
                  aria-label={`Dismiss ${upload.fileName}`}
                  onClick={() => dispatch(uploadDismissed(upload.id))}
                  className="text-slate-500 hover:text-white"
                >
                  ×
                </button>
              )}
            </li>
          )
        })}
      </ul>
      {hasFinished && (
        <button
          type="button"
          onClick={() => dispatch(finishedUploadsCleared(targetKey))}
          className="text-xs text-slate-400 hover:text-white"
        >
          Clear finished
        </button>
      )}
    </div>
  )
}
