'use client'

import { useActionState, useEffect, useRef } from 'react'
import { useActionToast } from '@/features/notifications/hooks/use-action-toast'
import { selectClass } from '@/lib/styles'
import type { UserRole } from '@/lib/types/domain'
import { updateUserRole } from '../actions'

export function RoleForm({ userId, role, userName }: { userId: string; role: UserRole; userName: string }) {
  const [state, action, pending] = useActionState(updateUserRole, undefined)
  const selectRef = useRef<HTMLSelectElement>(null)
  useActionToast(state)

  // If the change was refused (e.g. removing the last admin), show the saved role again.
  useEffect(() => {
    if (state && !state.success && selectRef.current) selectRef.current.value = role
  }, [state, role])

  return (
    <form action={action}>
      <input type="hidden" name="userId" value={userId} />
      <select
        ref={selectRef}
        name="role"
        defaultValue={role}
        disabled={pending}
        aria-label={`Role for ${userName}`}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className={`${selectClass} h-8 text-xs`}
      >
        <option value="admin">Admin</option>
        <option value="editor">Editor</option>
        <option value="viewer">Viewer</option>
      </select>
    </form>
  )
}
