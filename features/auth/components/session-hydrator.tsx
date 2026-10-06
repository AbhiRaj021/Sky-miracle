'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store/hooks'
import type { Profile } from '@/lib/types/domain'
import { sessionHydrated } from '../store/session-slice'

/**
 * Copies the server-loaded profile into the Redux store. The first sync runs
 * during the initial render so client components below can read it right
 * away; later changes (e.g. after a profile update) sync in an effect.
 */
export function SessionHydrator({ profile }: { profile: Profile }) {
  const store = useAppStore()

  // Lazy state initializer: runs once, before children render. Idempotent.
  useState(() => store.dispatch(sessionHydrated(profile)))

  useEffect(() => {
    store.dispatch(sessionHydrated(profile))
  }, [store, profile])

  return null
}
