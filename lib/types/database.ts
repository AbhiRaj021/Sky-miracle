export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'editor' | 'viewer'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: 'admin' | 'editor' | 'viewer'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'editor' | 'viewer'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      files: {
        Row: {
          id: string
          file_name: string
          file_type: 'pdf' | 'docx' | 'xlsx'
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
          file_type: 'pdf' | 'docx' | 'xlsx'
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
          file_type?: 'pdf' | 'docx' | 'xlsx'
          file_size?: number | null
          storage_path?: string
          uploaded_by?: string | null
          current_version?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
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
      }
      file_permissions: {
        Row: {
          id: string
          file_id: string
          user_id: string
          permission: 'view' | 'edit'
          granted_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          file_id: string
          user_id: string
          permission: 'view' | 'edit'
          granted_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          file_id?: string
          user_id?: string
          permission?: 'view' | 'edit'
          granted_by?: string | null
          created_at?: string
        }
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
      }
    }
  }
}
