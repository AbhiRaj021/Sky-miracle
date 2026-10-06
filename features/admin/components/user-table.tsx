import { formatDate } from '@/lib/format'
import type { AdminUser } from '../queries'
import { RoleForm } from './role-form'

export function UserTable({ users, currentUserId }: { users: AdminUser[]; currentUserId: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-800 text-xs text-slate-500 uppercase">
          <tr>
            <th className="py-2 pr-4 font-medium">Name</th>
            <th className="py-2 pr-4 font-medium">Email</th>
            <th className="py-2 pr-4 font-medium">Joined</th>
            <th className="py-2 text-right font-medium">Role</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="py-3 pr-4 font-medium">
                {user.name} {user.id === currentUserId && <span className="text-xs text-slate-500">(you)</span>}
              </td>
              <td className="py-3 pr-4 text-slate-400">{user.email}</td>
              <td className="py-3 pr-4 whitespace-nowrap text-slate-400">{formatDate(user.created_at)}</td>
              <td className="py-3 text-right">
                <RoleForm userId={user.id} role={user.role} userName={user.name} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
