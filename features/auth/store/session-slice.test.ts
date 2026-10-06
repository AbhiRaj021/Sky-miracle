import { describe, expect, it } from 'vitest'
import { makeStore } from '@/lib/store/store'
import type { Profile } from '@/lib/types/domain'
import {
  profileNameUpdated,
  selectCanUpload,
  selectIsAdmin,
  selectProfile,
  selectUserId,
  sessionCleared,
  sessionHydrated,
} from './session-slice'

const profile = (role: Profile['role']): Profile => ({
  id: '11111111-1111-4111-8111-111111111111',
  email: 'a@example.com',
  name: 'Alice',
  role,
  avatar_url: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
})

describe('session slice', () => {
  it('starts signed out', () => {
    const state = makeStore().getState()
    expect(selectProfile(state)).toBeNull()
    expect(selectUserId(state)).toBeNull()
    expect(selectIsAdmin(state)).toBe(false)
    expect(selectCanUpload(state)).toBe(false)
  })

  it('derives permissions from the hydrated role', () => {
    const store = makeStore()
    store.dispatch(sessionHydrated(profile('viewer')))
    expect(selectCanUpload(store.getState())).toBe(false)

    store.dispatch(sessionHydrated(profile('editor')))
    expect(selectCanUpload(store.getState())).toBe(true)
    expect(selectIsAdmin(store.getState())).toBe(false)

    store.dispatch(sessionHydrated(profile('admin')))
    expect(selectIsAdmin(store.getState())).toBe(true)
  })

  it('updates the name and clears on sign out', () => {
    const store = makeStore()
    store.dispatch(sessionHydrated(profile('editor')))
    store.dispatch(profileNameUpdated('Alicia'))
    expect(selectProfile(store.getState())?.name).toBe('Alicia')

    store.dispatch(sessionCleared())
    expect(selectProfile(store.getState())).toBeNull()
  })

  it('ignores name updates while signed out', () => {
    const store = makeStore()
    store.dispatch(profileNameUpdated('Nobody'))
    expect(selectProfile(store.getState())).toBeNull()
  })
})
