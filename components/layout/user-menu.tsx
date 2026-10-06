'use client'

import { RoleBadge } from '@/components/shared/role-badge'
import { signOut } from '@/features/auth/actions'
import { selectProfile, sessionCleared } from '@/features/auth/store/session-slice'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'

export function UserMenu() {
  const profile = useAppSelector(selectProfile)
  const dispatch = useAppDispatch()

  if (!profile) return null

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm leading-tight font-medium">{profile.name}</p>
        <p className="text-xs text-slate-400">{profile.email}</p>
      </div>
      <RoleBadge role={profile.role} />
      <form
        action={async () => {
          dispatch(sessionCleared())
          await signOut()
        }}
      >
        <button
          type="submit"
          className="rounded-lg border border-slate-800 px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:border-rose-500/40 hover:text-rose-400"
        >
          Log out
        </button>
      </form>
    </div>
  )
}
