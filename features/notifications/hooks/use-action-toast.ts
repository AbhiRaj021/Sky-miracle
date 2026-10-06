'use client'

import { useEffect } from 'react'
import type { FormState } from '@/lib/action-state'
import { useAppDispatch } from '@/lib/store/hooks'
import { notify } from '../store/notifications-slice'

/**
 * Shows a toast for the general message of a `useActionState` result.
 * Field errors stay inline next to their inputs.
 */
export function useActionToast(state: FormState, onSuccess?: () => void) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!state) return
    if (state.message) dispatch(notify(state.success ? 'success' : 'error', state.message))
    if (state.success) onSuccess?.()
    // Run once per action result; onSuccess identity is irrelevant.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, dispatch])
}
