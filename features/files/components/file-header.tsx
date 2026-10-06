import { formatBytes, formatDate } from '@/lib/format'
import { panelClass } from '@/lib/styles'
import type { FileDetail } from '../queries'
import { DeleteFileButton } from './delete-file-button'
import { FileTypeBadge } from './file-type-badge'

export function FileHeader({ file, access }: Pick<FileDetail, 'file' | 'access'>) {
  return (
    <section className={panelClass}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-3">
            <FileTypeBadge type={file.file_type} />
            <h1 className="truncate text-2xl font-bold">{file.file_name}</h1>
          </div>
          <p className="text-sm text-slate-400">
            Version {file.current_version} · {formatBytes(file.file_size)} · Uploaded by{' '}
            {access.isOwner ? 'you' : (file.uploader?.name ?? 'a deleted user')} on {formatDate(file.created_at)}
          </p>
          <p className="text-sm text-slate-500">Your access: {access.label}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {file.file_type === 'pdf' && (
            <a
              href={`/api/files/${file.id}/download?mode=view`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
            >
              Open
            </a>
          )}
          <a
            href={`/api/files/${file.id}/download`}
            className="rounded-lg bg-gradient-to-r from-blue-600 to-emerald-500 px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Download
          </a>
          {access.canDelete && <DeleteFileButton fileId={file.id} fileName={file.file_name} />}
        </div>
      </div>
    </section>
  )
}
