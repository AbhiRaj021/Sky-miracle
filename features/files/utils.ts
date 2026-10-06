import { formatBytes } from '@/lib/format'
import type { FileType } from '@/lib/types/domain'
import { FILE_TYPES, MAX_FILE_SIZE } from './constants'

export function getFileType(fileName: string): FileType | null {
  const dot = fileName.lastIndexOf('.')
  if (dot <= 0) return null
  const ext = fileName.slice(dot + 1).toLowerCase()
  return ext in FILE_TYPES ? (ext as FileType) : null
}

export function acceptAttributeFor(fileType: FileType) {
  return `.${fileType},${FILE_TYPES[fileType].mime}`
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

/** Returns an error message, or null when the file can be uploaded. */
export function validateUpload(file: { name: string; size: number }, requiredType?: FileType): string | null {
  const fileType = getFileType(file.name)
  if (!fileType) return 'Only PDF, Word (.docx) and Excel (.xlsx) files are supported.'
  if (requiredType && fileType !== requiredType) {
    return `New versions must be ${FILE_TYPES[requiredType].label} (.${requiredType}) files.`
  }
  if (file.size === 0) return 'The file is empty.'
  if (file.size > MAX_FILE_SIZE) return `Files must be ${formatBytes(MAX_FILE_SIZE)} or smaller.`
  return null
}

/** "Report.pdf" + version 2 → "Report (v2).pdf" */
export function versionedFileName(fileName: string, version: number) {
  return fileName.replace(/(\.[^.]+)?$/, ` (v${version})$1`)
}
