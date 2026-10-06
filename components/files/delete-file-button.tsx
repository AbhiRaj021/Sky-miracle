'use client'

import { deleteFile } from '@/app/actions/files'
import { useTransition } from 'react'

export function DeleteFileButton({ fileId, fileName }: { fileId: string; fileName: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Delete "${fileName}" and all of its versions? This cannot be undone.`)) return
        startTransition(() => deleteFile(fileId))
      }}
      className="rounded-lg border border-rose-500/30 px-3 py-2 text-sm font-medium text-rose-400 transition hover:bg-rose-500/10 disabled:opacity-50"
    >
      {pending ? 'Deleting...' : 'Delete file'}
    </button>
  )
}
