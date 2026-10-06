import { RoleBadge } from '@/components/shared/role-badge'
import { panelClass } from '@/lib/styles'
import type { FileDetail } from '../queries'
import { RevokeShareButton } from './revoke-share-button'
import { ShareForm } from './share-form'

export function SharePanel({ fileId, shares }: { fileId: string; shares: FileDetail['shares'] }) {
  return (
    <section className={panelClass}>
      <h2 className="mb-1 text-lg font-semibold">Sharing</h2>
      <p className="mb-4 text-sm text-slate-400">Admins can always see every file.</p>
      <ShareForm fileId={fileId} />
      <ul className="mt-4 divide-y divide-slate-800/60">
        {shares.length === 0 && <li className="py-2 text-sm text-slate-400">Not shared with anyone yet.</li>}
        {shares.map((share) => (
          <li key={share.user_id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
            <div className="min-w-0">
              <p className="flex items-center gap-2 truncate font-medium">
                {share.user?.name ?? 'Deleted user'} {share.user && <RoleBadge role={share.user.role} />}
              </p>
              <p className="truncate text-slate-400">
                {share.user?.email} · {share.permission === 'edit' ? 'can edit' : 'can view'}
              </p>
            </div>
            <RevokeShareButton fileId={fileId} userId={share.user_id} userName={share.user?.name ?? 'this user'} />
          </li>
        ))}
      </ul>
    </section>
  )
}
