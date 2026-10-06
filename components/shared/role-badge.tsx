import type { UserRole } from '@/lib/types/domain'
import { cn } from '@/lib/utils'

const roleClass: Record<UserRole, string> = {
  admin: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
  editor: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
  viewer: 'border-slate-500/20 bg-slate-500/10 text-slate-300',
}

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span className={cn('inline-flex rounded-full border px-2 py-0.5 text-xs font-medium capitalize', roleClass[role])}>
      {role}
    </span>
  )
}
