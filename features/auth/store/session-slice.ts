import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Profile } from '@/lib/types/domain'

export type SessionState = {
  profile: Profile | null
}

const initialState: SessionState = {
  profile: null,
}

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    /** Sync the signed-in user's profile from the server. */
    sessionHydrated(state, action: PayloadAction<Profile>) {
      state.profile = action.payload
    },
    profileNameUpdated(state, action: PayloadAction<string>) {
      if (state.profile) state.profile.name = action.payload
    },
    /** Signing out clears all user-specific client state (see other slices). */
    sessionCleared() {
      return initialState
    },
  },
  selectors: {
    selectProfile: (state) => state.profile,
    selectUserId: (state) => state.profile?.id ?? null,
    selectIsAdmin: (state) => state.profile?.role === 'admin',
    selectCanUpload: (state) => state.profile?.role === 'admin' || state.profile?.role === 'editor',
  },
})

export const { sessionHydrated, profileNameUpdated, sessionCleared } = sessionSlice.actions
export const { selectProfile, selectUserId, selectIsAdmin, selectCanUpload } = sessionSlice.selectors
export default sessionSlice
