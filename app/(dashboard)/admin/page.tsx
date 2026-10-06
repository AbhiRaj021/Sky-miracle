import { PageHeader } from '@/components/shared/page-header'
import { ActivityList } from '@/features/activity/components/activity-list'
import { StatCards } from '@/features/admin/components/stat-cards'
import { UserTable } from '@/features/admin/components/user-table'
import { getAdminOverview } from '@/features/admin/queries'
import { panelClass } from '@/lib/styles'

export default async function AdminPage() {
  const { currentUserId, users, fileCount, roleCounts, activity } = await getAdminOverview()

  return (
    <div className="space-y-6">
      <PageHeader title="Admin" description="Manage user roles and review activity across the workspace." />

      <StatCards
        stats={[
          { label: 'Users', value: users.length },
          {
            label: 'Admins / Editors / Viewers',
            value: `${roleCounts.admin} / ${roleCounts.editor} / ${roleCounts.viewer}`,
          },
          { label: 'Files', value: fileCount },
        ]}
      />

      <section className={panelClass}>
        <h2 className="mb-1 text-lg font-semibold">Users</h2>
        <p className="mb-4 text-sm text-slate-400">
          Viewers can only read files shared with them. Editors can upload and edit. Admins can do everything.
        </p>
        <UserTable users={users} currentUserId={currentUserId} />
      </section>

      <section className={panelClass}>
        <h2 className="mb-2 text-lg font-semibold">Recent activity</h2>
        <ActivityList entries={activity} linkFiles />
      </section>
    </div>
  )
}
