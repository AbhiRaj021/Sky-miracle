import type { Database } from './database'

type Tables = Database['public']['Tables']

export type UserRole = Tables['profiles']['Row']['role']
export type FilePermission = Tables['file_permissions']['Row']['permission']
export type FileType = Tables['files']['Row']['file_type']

export type Profile = Tables['profiles']['Row']
export type FileRecord = Tables['files']['Row']
