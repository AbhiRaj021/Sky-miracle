export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type Role = 'admin' | 'editor' | 'viewer'
type FileTypeEnum = 'pdf' | 'docx' | 'xlsx'
type PermissionEnum = 'view' | 'edit'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          role: Role
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: Role
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: Role
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      files: {
        Row: {
          id: string
          file_name: string
          file_type: FileTypeEnum
          file_size: number | null
          storage_path: string
          uploaded_by: string | null
          current_version: number
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          file_name: string
          file_type: FileTypeEnum
          file_size?: number | null
          storage_path: string
          uploaded_by?: string | null
          current_version?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          file_name?: string
          file_type?: FileTypeEnum
          file_size?: number | null
          storage_path?: string
          uploaded_by?: string | null
          current_version?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'files_uploaded_by_fkey'
            columns: ['uploaded_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      file_versions: {
        Row: {
          id: string
          file_id: string
          version_number: number
          storage_path: string
          file_size: number | null
          saved_by: string | null
          change_summary: string | null
          created_at: string
        }
        Insert: {
          id?: string
          file_id: string
          version_number: number
          storage_path: string
          file_size?: number | null
          saved_by?: string | null
          change_summary?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          file_id?: string
          version_number?: number
          storage_path?: string
          file_size?: number | null
          saved_by?: string | null
          change_summary?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'file_versions_file_id_fkey'
            columns: ['file_id']
            isOneToOne: false
            referencedRelation: 'files'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'file_versions_saved_by_fkey'
            columns: ['saved_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      file_permissions: {
        Row: {
          id: string
          file_id: string
          user_id: string
          permission: PermissionEnum
          granted_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          file_id: string
          user_id: string
          permission: PermissionEnum
          granted_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          file_id?: string
          user_id?: string
          permission?: PermissionEnum
          granted_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'file_permissions_file_id_fkey'
            columns: ['file_id']
            isOneToOne: false
            referencedRelation: 'files'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'file_permissions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'file_permissions_granted_by_fkey'
            columns: ['granted_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string | null
          file_id: string | null
          action: string
          details: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          file_id?: string | null
          action: string
          details?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          file_id?: string | null
          action?: string
          details?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'activity_logs_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'activity_logs_file_id_fkey'
            columns: ['file_id']
            isOneToOne: false
            referencedRelation: 'files'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<never, never>
    Functions: {
      create_file: {
        Args: {
          p_file_name: string
          p_file_type: string
          p_file_size: number
          p_storage_path: string
        }
        Returns: string
      }
      add_file_version: {
        Args: {
          p_file_id: string
          p_storage_path: string
          p_file_size: number
          p_change_summary: string
        }
        Returns: number
      }
    }
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}
