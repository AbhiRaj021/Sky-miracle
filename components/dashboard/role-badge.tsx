import { cn } from '@/lib/utils'
import type { UserRole } from '@/lib/types/users'

const styles: Record<UserRole, string> = {
  admin: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  editor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  viewer: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
}

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span className={cn('inline-flex rounded-full border px-2 py-0.5 text-xs font-medium capitalize', styles[role])}>
      {role}
    </span>
  )
}
