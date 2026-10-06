'use client'

import { useState, useTransition } from 'react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { notify } from '@/features/notifications/store/notifications-slice'
import { useAppDispatch } from '@/lib/store/hooks'
import { deleteFile } from '../actions'

export function DeleteFileButton({ fileId, fileName }: { fileId: string; fileName: string }) {
  const dispatch = useAppDispatch()
  const [confirming, setConfirming] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleConfirm() {
    setConfirming(false)
    startTransition(async () => {
      // Redirects to /dashboard on success.
      const result = await deleteFile(fileId)
      if (!result.ok) dispatch(notify('error', result.error))
    })
  }

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => setConfirming(true)}
        className="rounded-lg border border-rose-500/30 px-3 py-2 text-sm font-medium text-rose-400 transition hover:bg-rose-500/10 disabled:opacity-50"
      >
        {pending ? 'Deleting...' : 'Delete file'}
      </button>
      <ConfirmDialog
        open={confirming}
        title="Delete this file?"
        description={`"${fileName}" and all of its versions will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleConfirm}
        onCancel={() => setConfirming(false)}
      />
    </>
  )
}
