import Link from 'next/link'
import { notFound } from 'next/navigation'
import * as z from 'zod'
import { ActivityList } from '@/features/activity/components/activity-list'
import { FileHeader } from '@/features/files/components/file-header'
import { SharePanel } from '@/features/files/components/share-panel'
import { UploadPanel } from '@/features/files/components/upload-panel'
import { VersionHistory } from '@/features/files/components/version-history'
import { getFileDetail } from '@/features/files/queries'
import { panelClass } from '@/lib/styles'

export default async function FilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!z.uuid().safeParse(id).success) notFound()

  const detail = await getFileDetail(id)
  if (!detail) notFound()
  const { file, versions, shares, activity, access } = detail

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white">
        ← Back to files
      </Link>

      <FileHeader file={file} access={access} />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          {access.canEdit && (
            <section className={panelClass}>
              <h2 className="mb-4 text-lg font-semibold">Upload a new version</h2>
              <UploadPanel mode="version" fileId={file.id} fileType={file.file_type} />
            </section>
          )}
          <VersionHistory fileId={file.id} currentVersion={file.current_version} versions={versions} />
        </div>

        <div className="space-y-6 lg:col-span-2">
          {access.canManage && <SharePanel fileId={file.id} shares={shares} />}
          <section className={panelClass}>
            <h2 className="mb-2 text-lg font-semibold">Activity</h2>
            <ActivityList entries={activity} />
          </section>
        </div>
      </div>
    </div>
  )
}
