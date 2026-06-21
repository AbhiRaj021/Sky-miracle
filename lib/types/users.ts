export type UserRole = 'admin' | 'editor' | 'viewer'
export type FilePermission = 'view' | 'edit'
export type FileType = 'pdf' | 'docx' | 'xlsx'

export interface UserProfile {
  id: string
  email: string
  name: string
  role: UserRole
  avatar_url: string | null
  created_at: string
  updated_at: string
}
