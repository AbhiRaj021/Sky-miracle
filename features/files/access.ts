import type { FilePermission, UserRole } from '@/lib/types/domain'

export type FileAccess = {
  isAdmin: boolean
  isOwner: boolean
  /** Upload new versions. Mirrors private.can_edit_file in the database. */
  canEdit: boolean
  /** Share and unshare. Mirrors private.can_manage_file. */
  canManage: boolean
  canDelete: boolean
  label: 'admin' | 'owner' | 'can edit' | 'can view'
}

/** UI-side view of the database access rules; RLS remains the source of truth. */
export function getFileAccess(
  user: { id: string; role: UserRole },
  file: { uploaded_by: string | null },
  grant: FilePermission | undefined,
): FileAccess {
  const isAdmin = user.role === 'admin'
  const isOwner = file.uploaded_by === user.id
  // A role is a ceiling: viewers never edit, even with an "edit" grant.
  const canEdit = isAdmin || (user.role === 'editor' && (isOwner || grant === 'edit'))

  return {
    isAdmin,
    isOwner,
    canEdit,
    canManage: isAdmin || isOwner,
    canDelete: isAdmin,
    label: isAdmin ? 'admin' : isOwner ? 'owner' : canEdit ? 'can edit' : 'can view',
  }
}
