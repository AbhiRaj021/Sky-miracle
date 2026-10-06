import { FileFilters } from '@/features/files/components/file-filters'
import { FileTable } from '@/features/files/components/file-table'
import { UploadPanel } from '@/features/files/components/upload-panel'
import { FILE_LIST_VIEWS, type FileListView } from '@/features/files/constants'
import { listFiles } from '@/features/files/queries'
import { requireUser } from '@/lib/auth/session'
import { panelClass } from '@/lib/styles'

function parseView(value: string | undefined): FileListView {
  return FILE_LIST_VIEWS.find((v) => v.key === value)?.key ?? 'all'
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; q?: string }>
}) {
  const { user, profile } = await requireUser()
  const params = await searchParams
  const view = parseView(params.view)
  const search = (params.q ?? '').trim().slice(0, 100)
  const files = await listFiles({ view, search })
  const canUpload = profile.role !== 'viewer'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-3xl font-bold text-transparent">
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
          <h2 className="mb-4 text-lg font-semibold">Upload documents</h2>
          <UploadPanel mode="new" />
        </section>
      )}

      <section className={panelClass}>
        <FileFilters view={view} search={search} />
        {files.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">
            {search
              ? `No files match "${search}".`
              : canUpload
                ? 'No files yet. Upload your first document above.'
                : 'Nothing has been shared with you yet.'}
          </div>
        ) : (
          <FileTable files={files} currentUserId={user.id} />
        )}
      </section>
    </div>
  )
}
