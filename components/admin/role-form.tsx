'use client'

import { updateUserRole } from '@/app/actions/admin'
import { selectClass } from '@/lib/styles'
import type { UserRole } from '@/lib/types/users'
import { useActionState, useEffect, useRef } from 'react'

export function RoleForm({ userId, role }: { userId: string; role: UserRole }) {
  const [state, action, pending] = useActionState(updateUserRole, undefined)
  const selectRef = useRef<HTMLSelectElement>(null)

  // If the change was refused (e.g. removing the last admin), show the saved role again.
  useEffect(() => {
    if (state && !state.success && selectRef.current) selectRef.current.value = role
  }, [state, role])

  return (
    <form action={action} className="flex flex-col items-end gap-1">
      <input type="hidden" name="userId" value={userId} />
      <select
        ref={selectRef}
        name="role"
        defaultValue={role}
        disabled={pending}
        aria-label="Role"
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className={`${selectClass} h-8 text-xs`}
      >
        <option value="admin">Admin</option>
        <option value="editor">Editor</option>
        <option value="viewer">Viewer</option>
      </select>
      {state?.message && !state.success && <p className="max-w-48 text-right text-xs text-rose-400">{state.message}</p>}
      {state?.message && state.success && <p className="text-xs text-emerald-400">Saved</p>}
    </form>
  )
}
