import type { FileType } from '@/lib/types/users'

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

export const ACCEPT_ATTRIBUTE = Object.entries(FILE_TYPES)
  .map(([ext, { mime }]) => `.${ext},${mime}`)
  .join(',')

export function getFileType(fileName: string): FileType | null {
  const ext = fileName.split('.').pop()?.toLowerCase()
  return ext && ext in FILE_TYPES ? (ext as FileType) : null
}

// Objects are stored as "<uploader uuid>/<random uuid>.<ext>".
const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
const STORAGE_PATH_RE = new RegExp(`^(${UUID})/${UUID}\\.(pdf|docx|xlsx)$`)

export function buildStoragePath(userId: string, fileType: FileType) {
  return `${userId}/${crypto.randomUUID()}.${fileType}`
}

export function parseStoragePath(path: string) {
  const match = STORAGE_PATH_RE.exec(path)
  return match ? { userId: match[1], fileType: match[2] as FileType } : null
}

export function validateUpload(file: File): string | null {
  if (!getFileType(file.name)) return 'Only PDF, Word (.docx) and Excel (.xlsx) files are supported.'
  if (file.size === 0) return 'The file is empty.'
  if (file.size > MAX_FILE_SIZE) return `Files must be ${formatBytes(MAX_FILE_SIZE)} or smaller.`
  return null
}

export function formatBytes(bytes: number | null | undefined) {
  if (bytes == null) return '—'
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unit]}`
}

export function formatDate(value: string) {
  return new Date(value).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
