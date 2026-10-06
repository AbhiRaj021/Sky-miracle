'use client'

import { useTransition } from 'react'
import { notify } from '@/features/notifications/store/notifications-slice'
import { useAppDispatch } from '@/lib/store/hooks'
import { revokeShare } from '../actions'

export function RevokeShareButton({ fileId, userId, userName }: { fileId: string; userId: string; userName: string }) {
  const dispatch = useAppDispatch()
  const [pending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await revokeShare({ fileId, userId })
          dispatch(result.ok ? notify('success', `Removed ${userName}'s access.`) : notify('error', result.error))
        })
      }
      className="text-xs text-rose-400 hover:underline disabled:opacity-50"
    >
      {pending ? 'Removing...' : 'Remove'}
    </button>
  )
}
