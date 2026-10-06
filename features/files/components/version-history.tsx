import { formatBytes, formatDate } from '@/lib/format'
import { panelClass } from '@/lib/styles'
import type { FileDetail } from '../queries'

export function VersionHistory({
  fileId,
  currentVersion,
  versions,
}: {
  fileId: string
  currentVersion: number
  versions: FileDetail['versions']
}) {
  return (
    <section className={panelClass}>
      <h2 className="mb-4 text-lg font-semibold">Version history</h2>
      <ul className="divide-y divide-slate-800/60">
        {versions.map((v) => (
          <li key={v.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
            <div className="min-w-0">
              <p className="font-medium">
                v{v.version_number}
                {v.version_number === currentVersion && (
                  <span className="ml-2 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
                    current
                  </span>
                )}
              </p>
              <p className="text-slate-400">
                {v.saver?.name ?? 'Deleted user'} · {formatDate(v.created_at)} · {formatBytes(v.file_size)}
              </p>
              {v.change_summary && <p className="mt-1 text-slate-300">{v.change_summary}</p>}
            </div>
            <a href={`/api/files/${fileId}/download?version=${v.version_number}`} className="text-blue-400 hover:underline">
              Download
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
