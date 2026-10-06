import Link from 'next/link'
import { inputClass } from '@/lib/styles'
import { cn } from '@/lib/utils'
import { FILE_LIST_VIEWS, type FileListView } from '../constants'

/** View tabs and search box. State lives in the URL so it is shareable. */
export function FileFilters({ view, search }: { view: FileListView; search: string }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-1">
        {FILE_LIST_VIEWS.map((v) => (
          <Link
            key={v.key}
            href={{
              pathname: '/dashboard',
              query: { ...(v.key !== 'all' && { view: v.key }), ...(search && { q: search }) },
            }}
            aria-current={view === v.key ? 'page' : undefined}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition',
              view === v.key ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white',
            )}
          >
            {v.label}
          </Link>
        ))}
      </div>
      <form action="/dashboard" role="search">
        {view !== 'all' && <input type="hidden" name="view" value={view} />}
        <input
          name="q"
          defaultValue={search}
          placeholder="Search by name..."
          aria-label="Search files by name"
          className={cn('h-9 w-48 rounded-lg border px-3 text-sm sm:w-64', inputClass)}
        />
      </form>
    </div>
  )
}
