import type { Json } from '@/lib/types/database'

export type ActivityEntry = {
  id: string
  action: string
  details: Json
  created_at: string
  file_id: string | null
  actor: { name: string } | null
  file?: { file_name: string } | null
}

function detail(details: Json, key: string) {
  if (details && typeof details === 'object' && !Array.isArray(details)) {
    const value = details[key]
    return value == null ? undefined : String(value)
  }
  return undefined
}

/** Human-readable description of an activity log entry (without the actor). */
export function describeActivity(entry: ActivityEntry) {
  const d = (key: string) => detail(entry.details, key)
  const fileName = entry.file?.file_name ?? d('file_name') ?? 'a file'

  switch (entry.action) {
    case 'upload':
      return `uploaded ${fileName}`
    case 'new_version':
      return `saved version ${d('version') ?? ''} of ${fileName}`
    case 'download':
      return `downloaded ${fileName}${d('version') ? ` (v${d('version')})` : ''}`
    case 'share':
      return `shared ${fileName} with ${d('target_name') ?? 'a user'} (${d('permission') === 'edit' ? 'can edit' : 'can view'})`
    case 'unshare':
      return `removed someone's access to ${fileName}`
    case 'delete':
      return `deleted ${fileName}`
    case 'role_change':
      return `changed ${d('target_name') ?? 'a user'}'s role from ${d('from')} to ${d('to')}`
    default:
      return entry.action
  }
}
