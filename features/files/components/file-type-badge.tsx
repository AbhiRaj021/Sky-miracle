import type { FileType } from '@/lib/types/domain'
import { cn } from '@/lib/utils'

const typeClass: Record<FileType, string> = {
  pdf: 'border-rose-500/20 bg-rose-500/10 text-rose-400',
  docx: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
  xlsx: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
}

export function FileTypeBadge({ type }: { type: FileType }) {
  return (
    <span
      className={cn(
        'inline-flex w-12 shrink-0 justify-center rounded-md border px-1.5 py-0.5 text-[11px] font-semibold uppercase',
        typeClass[type],
      )}
    >
      {type}
    </span>
  )
}
