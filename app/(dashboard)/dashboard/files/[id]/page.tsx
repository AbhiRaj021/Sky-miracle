import { revokeShare } from '@/app/actions/files'
import { ActivityList } from '@/components/activity-list'
import { RoleBadge } from '@/components/dashboard/role-badge'
import { DeleteFileButton } from '@/components/files/delete-file-button'
import { FileTypeBadge } from '@/components/files/file-type-badge'
import { ShareForm } from '@/components/files/share-form'
import { UploadForm } from '@/components/files/upload-form'
import { requireUser } from '@/lib/auth'
import { formatBytes, formatDate } from '@/lib/files'
import { panelClass } from '@/lib/styles'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import * as z from 'zod'

export default async function FilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!z.uuid().safeParse(id).success) notFound()

  const { supabase, user, profile } = await requireUser()

  const { data: file } = await supabase
    .from('files')
    .select('*, uploader:profiles!files_uploaded_by_fkey(name, email)')
    .eq('id', id)
    .maybeSingle()
  if (!file) notFound()

  const isOwner = file.uploaded_by === user.id
  const isAdmin = profile.role === 'admin'
  const canManage = isAdmin || isOwner

  const [{ data: versions }, { data: permissions }, { data: activity }] = await Promise.all([
    supabase
      .from('file_versions')
      .select('id, version_number, file_size, change_summary, created_at, saver:profiles!file_versions_saved_by_fkey(name)')
      .eq('file_id', id)
      .order('version_number', { ascending: false }),
    // Owners/admins see every grant; other users only see their own.
    supabase
      .from('file_permissions')
      .select('user_id, permission, created_at, user:profiles!file_permissions_user_id_fkey(name, email, role)')
      .eq('file_id', id)
      .order('created_at'),
    supabase
      .from('activity_logs')
      .select('id, action, details, created_at, file_id, actor:profiles!activity_logs_user_id_fkey(name)')
      .eq('file_id', id)
      .order('created_at', { ascending: false })
      .limit(25),
  ])

  const myPermission = permissions?.find((p) => p.user_id === user.id)?.permission
  const canEdit = isAdmin || (profile.role === 'editor' && (isOwner || myPermission === 'edit'))

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white">
        ← Back to files
      </Link>

      <section className={panelClass}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <div className="flex items-center gap-3">
              <FileTypeBadge type={file.file_type} />
              <h1 className="truncate text-2xl font-bold">{file.file_name}</h1>
            </div>
            <p className="text-sm text-slate-400">
              Version {file.current_version} · {formatBytes(file.file_size)} · Uploaded by{' '}
              {isOwner ? 'you' : (file.uploader?.name ?? 'a deleted user')} on {formatDate(file.created_at)}
            </p>
            <p className="text-sm text-slate-500">
              Your access: {isAdmin ? 'admin' : isOwner ? 'owner' : canEdit ? 'can edit' : 'can view'}
            </p>
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
            {isAdmin && <DeleteFileButton fileId={file.id} fileName={file.file_name} />}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          {canEdit && (
            <section className={panelClass}>
              <h2 className="mb-4 text-lg font-semibold">Upload a new version</h2>
              <UploadForm mode="version" userId={user.id} fileId={file.id} fileType={file.file_type} />
            </section>
          )}

          <section className={panelClass}>
            <h2 className="mb-4 text-lg font-semibold">Version history</h2>
            <ul className="divide-y divide-slate-800/60">
              {(versions ?? []).map((v) => (
                <li key={v.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium">
                      v{v.version_number}
                      {v.version_number === file.current_version && (
                        <span className="ml-2 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">current</span>
                      )}
                    </p>
                    <p className="text-slate-400">
                      {v.saver?.name ?? 'Deleted user'} · {formatDate(v.created_at)} · {formatBytes(v.file_size)}
                    </p>
                    {v.change_summary && <p className="mt-1 text-slate-300">{v.change_summary}</p>}
                  </div>
                  <a
                    href={`/api/files/${file.id}/download?version=${v.version_number}`}
                    className="text-sm text-blue-400 hover:underline"
                  >
                    Download
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-6 lg:col-span-2">
          {canManage && (
            <section className={panelClass}>
              <h2 className="mb-1 text-lg font-semibold">Sharing</h2>
              <p className="mb-4 text-sm text-slate-400">Admins can always see every file.</p>
              <ShareForm fileId={file.id} />
              <ul className="mt-4 divide-y divide-slate-800/60">
                {(permissions ?? []).length === 0 && (
                  <li className="py-2 text-sm text-slate-400">Not shared with anyone yet.</li>
                )}
                {(permissions ?? []).map((p) => (
                  <li key={p.user_id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {p.user?.name ?? 'Deleted user'} {p.user && <RoleBadge role={p.user.role} />}
                      </p>
                      <p className="truncate text-slate-400">
                        {p.user?.email} · {p.permission === 'edit' ? 'can edit' : 'can view'}
                      </p>
                    </div>
                    <form action={revokeShare}>
                      <input type="hidden" name="fileId" value={file.id} />
                      <input type="hidden" name="userId" value={p.user_id} />
                      <button type="submit" className="text-xs text-rose-400 hover:underline">
                        Remove
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className={panelClass}>
            <h2 className="mb-2 text-lg font-semibold">Activity</h2>
            <ActivityList entries={activity ?? []} />
          </section>
        </div>
      </div>
    </div>
  )
}
