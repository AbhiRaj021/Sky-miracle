import { ActivityList } from '@/components/activity-list'
import { RoleForm } from '@/components/admin/role-form'
import { requireAdmin } from '@/lib/auth'
import { formatDate } from '@/lib/files'
import { panelClass } from '@/lib/styles'

export default async function AdminPage() {
  const { supabase, user } = await requireAdmin()

  const [{ data: users }, { count: fileCount }, { data: activity }] = await Promise.all([
    supabase.from('profiles').select('id, name, email, role, created_at').order('created_at'),
    supabase.from('files').select('id', { count: 'exact', head: true }),
    supabase
      .from('activity_logs')
      .select(
        'id, action, details, created_at, file_id, actor:profiles!activity_logs_user_id_fkey(name), file:files!activity_logs_file_id_fkey(file_name)',
      )
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const counts = { admin: 0, editor: 0, viewer: 0 }
  for (const u of users ?? []) counts[u.role]++

  const stats = [
    { label: 'Users', value: users?.length ?? 0 },
    { label: 'Admins / Editors / Viewers', value: `${counts.admin} / ${counts.editor} / ${counts.viewer}` },
    { label: 'Files', value: fileCount ?? 0 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin</h1>
        <p className="mt-1 text-slate-400">Manage user roles and review activity across the workspace.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className={panelClass}>
            <p className="text-sm text-slate-400">{s.label}</p>
            <p className="mt-1 text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <section className={panelClass}>
        <h2 className="mb-1 text-lg font-semibold">Users</h2>
        <p className="mb-4 text-sm text-slate-400">
          Viewers can only read files shared with them. Editors can upload and edit. Admins can do everything.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-4 font-medium">Name</th>
                <th className="py-2 pr-4 font-medium">Email</th>
                <th className="py-2 pr-4 font-medium">Joined</th>
                <th className="py-2 text-right font-medium">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(users ?? []).map((u) => (
                <tr key={u.id}>
                  <td className="py-3 pr-4 font-medium">
                    {u.name} {u.id === user.id && <span className="text-xs text-slate-500">(you)</span>}
                  </td>
                  <td className="py-3 pr-4 text-slate-400">{u.email}</td>
                  <td className="py-3 pr-4 text-slate-400 whitespace-nowrap">{formatDate(u.created_at)}</td>
                  <td className="py-3 text-right">
                    <RoleForm userId={u.id} role={u.role} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={panelClass}>
        <h2 className="mb-2 text-lg font-semibold">Recent activity</h2>
        <ActivityList entries={activity ?? []} linkFiles />
      </section>
    </div>
  )
}
