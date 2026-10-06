import Link from 'next/link'
import { formatBytes, formatDate } from '@/lib/format'
import type { FileListItem } from '../queries'
import { FileTypeBadge } from './file-type-badge'

export function FileTable({ files, currentUserId }: { files: FileListItem[]; currentUserId: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-800 text-xs text-slate-500 uppercase">
          <tr>
            <th className="py-2 pr-4 font-medium">Name</th>
            <th className="py-2 pr-4 font-medium">Owner</th>
            <th className="py-2 pr-4 font-medium">Version</th>
            <th className="py-2 pr-4 font-medium">Size</th>
            <th className="py-2 font-medium">Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {files.map((file) => (
            <tr key={file.id} className="hover:bg-slate-800/30">
              <td className="py-3 pr-4">
                <Link
                  href={`/dashboard/files/${file.id}`}
                  className="flex items-center gap-3 font-medium hover:text-blue-400"
                >
                  <FileTypeBadge type={file.file_type} />
                  <span className="truncate">{file.file_name}</span>
                </Link>
              </td>
              <td className="py-3 pr-4 text-slate-400">
                {file.uploaded_by === currentUserId ? 'You' : (file.uploader?.name ?? 'Deleted user')}
              </td>
              <td className="py-3 pr-4 text-slate-400">v{file.current_version}</td>
              <td className="py-3 pr-4 text-slate-400">{formatBytes(file.file_size)}</td>
              <td className="py-3 whitespace-nowrap text-slate-400">{formatDate(file.updated_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
