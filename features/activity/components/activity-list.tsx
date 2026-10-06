import Link from 'next/link'
import { formatDate } from '@/lib/format'
import { type ActivityEntry, describeActivity } from '../describe'

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
            <span className="text-slate-400">{describeActivity(entry)}</span>
            {linkFiles && entry.file_id && entry.file && (
              <>
                {' '}
                <Link href={`/dashboard/files/${entry.file_id}`} className="text-blue-400 hover:underline">
                  open
                </Link>
              </>
            )}
          </span>
          <span className="text-xs whitespace-nowrap text-slate-500">{formatDate(entry.created_at)}</span>
        </li>
      ))}
    </ul>
  )
}
