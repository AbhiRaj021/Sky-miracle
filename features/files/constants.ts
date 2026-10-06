import type { FileType } from '@/lib/types/domain'

export const STORAGE_BUCKET = 'documents'

// Keep in sync with storage.buckets.file_size_limit (008_security_hardening.sql).
export const MAX_FILE_SIZE = 25 * 1024 * 1024

export const FILE_TYPES: Record<FileType, { mime: string; label: string }> = {
  pdf: { mime: 'application/pdf', label: 'PDF' },
  docx: {
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    label: 'Word',
  },
  xlsx: {
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    label: 'Excel',
  },
}

export const ACCEPT_ALL_TYPES = Object.entries(FILE_TYPES)
  .map(([ext, { mime }]) => `.${ext},${mime}`)
  .join(',')

export const FILE_LIST_VIEWS = [
  { key: 'all', label: 'All files' },
  { key: 'mine', label: 'My uploads' },
  { key: 'shared', label: 'Shared with me' },
] as const

export type FileListView = (typeof FILE_LIST_VIEWS)[number]['key']
