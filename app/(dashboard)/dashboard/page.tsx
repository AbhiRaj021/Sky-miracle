import { FileTypeBadge } from '@/components/files/file-type-badge'
import { UploadForm } from '@/components/files/upload-form'
import { requireUser } from '@/lib/auth'
import { formatBytes, formatDate } from '@/lib/files'
import { inputClass, panelClass } from '@/lib/styles'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const VIEWS = [
  { key: 'all', label: 'All files' },
  { key: 'mine', label: 'My uploads' },
  { key: 'shared', label: 'Shared with me' },
] as const

type View = (typeof VIEWS)[number]['key']

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; q?: string }>
}) {
  const { supabase, user, profile } = await requireUser()
  const params = await searchParams
  const view: View = VIEWS.some((v) => v.key === params.view) ? (params.view as View) : 'all'
  const q = (params.q ?? '').trim().slice(0, 100)

  // RLS limits this to files the user may see.
  let query = supabase
    .from('files')
    .select(
      'id, file_name, file_type, file_size, current_version, updated_at, uploaded_by, uploader:profiles!files_uploaded_by_fkey(name)',
    )
    .order('updated_at', { ascending: false })
    .limit(200)

  if (view === 'mine') query = query.eq('uploaded_by', user.id)
  if (view === 'shared') query = query.neq('uploaded_by', user.id)
  if (q) query = query.ilike('file_name', `%${q.replace(/[%_\\]/g, '\\$&')}%`)

  const { data: files, error } = await query
  const canUpload = profile.role !== 'viewer'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          Welcome, {profile.name}!
        </h1>
        <p className="mt-1 text-slate-400">
          {canUpload
            ? 'Upload documents, keep every version, and share them with your team.'
            : 'Here are the documents shared with you.'}
        </p>
      </div>

      {canUpload && (
        <section className={panelClass}>
          <h2 className="mb-4 text-lg font-semibold">Upload a document</h2>
          <UploadForm mode="new" userId={user.id} />
        </section>
      )}

      <section className={panelClass}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1">
            {VIEWS.map((v) => (
              <Link
                key={v.key}
                href={{ pathname: '/dashboard', query: { ...(v.key !== 'all' && { view: v.key }), ...(q && { q }) } }}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition',
                  view === v.key ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white',
                )}
              >
                {v.label}
              </Link>
            ))}
          </div>
          <form className="flex gap-2" action="/dashboard">
            {view !== 'all' && <input type="hidden" name="view" value={view} />}
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by name..."
              className={cn('h-9 w-48 rounded-lg border px-3 text-sm sm:w-64', inputClass)}
            />
          </form>
        </div>

        {error ? (
          <p className="text-sm text-rose-400">Could not load files: {error.message}</p>
        ) : !files || files.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">
            {q ? `No files match "${q}".` : canUpload ? 'No files yet. Upload your first document above.' : 'Nothing has been shared with you yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2 pr-4 font-medium">Name</th>
                  <th className="py-2 pr-4 font-medium">Owner</th>
                  <th className="py-2 pr-4 font-medium">Version</th>
                  <th className="py-2 pr-4 font-medium">Size</th>
                  <th className="py-2 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {files.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-800/30">
                    <td className="py-3 pr-4">
                      <Link href={`/dashboard/files/${file.id}`} className="flex items-center gap-3 font-medium hover:text-blue-400">
                        <FileTypeBadge type={file.file_type} />
                        <span className="truncate">{file.file_name}</span>
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-slate-400">
                      {file.uploaded_by === user.id ? 'You' : (file.uploader?.name ?? 'Deleted user')}
                    </td>
                    <td className="py-3 pr-4 text-slate-400">v{file.current_version}</td>
                    <td className="py-3 pr-4 text-slate-400">{formatBytes(file.file_size)}</td>
                    <td className="py-3 text-slate-400 whitespace-nowrap">{formatDate(file.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
