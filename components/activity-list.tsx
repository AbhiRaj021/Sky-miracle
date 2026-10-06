import type { Json } from '@/lib/types/database'
import { formatDate } from '@/lib/files'
import Link from 'next/link'

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

function describe(entry: ActivityEntry) {
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
      return `shared ${fileName} with ${d('target_name') ?? 'a user'} (${d('permission') ?? 'view'})`
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

export function ActivityList({ entries, linkFiles = false }: { entries: ActivityEntry[]; linkFiles?: boolean }) {
  if (entries.length === 0) {
    return <p className="text-sm text-slate-400">No activity yet.</p>
  }

  return (
    <ul className="divide-y divide-slate-800/60">
      {entries.map((entry) => (
        <li key={entry.id} className="flex flex-wrap items-baseline justify-between gap-2 py-2.5 text-sm">
          <span>
            <span className="font-medium text-white">{entry.actor?.name ?? 'Deleted user'}</span>{' '}
            <span className="text-slate-400">{describe(entry)}</span>
            {linkFiles && entry.file_id && entry.file && (
              <>
                {' '}
                <Link href={`/dashboard/files/${entry.file_id}`} className="text-blue-400 hover:underline">
                  open
                </Link>
              </>
            )}
          </span>
          <span className="text-xs text-slate-500 whitespace-nowrap">{formatDate(entry.created_at)}</span>
        </li>
      ))}
    </ul>
  )
}
