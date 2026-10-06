import { cn } from '@/lib/utils'
import type { FileType } from '@/lib/types/users'

const styles: Record<FileType, string> = {
  pdf: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  docx: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  xlsx: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
}

export function FileTypeBadge({ type }: { type: FileType }) {
  return (
    <span
      className={cn(
        'inline-flex w-12 justify-center rounded-md border px-1.5 py-0.5 text-[11px] font-semibold uppercase',
        styles[type],
      )}
    >
      {type}
    </span>
  )
}
