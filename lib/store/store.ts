import { combineSlices, configureStore, type ThunkAction, type UnknownAction } from '@reduxjs/toolkit'
import sessionSlice from '@/features/auth/store/session-slice'
import uploadsSlice from '@/features/files/store/uploads-slice'
import notificationsSlice from '@/features/notifications/store/notifications-slice'

const rootReducer = combineSlices(sessionSlice, uploadsSlice, notificationsSlice)

export type RootState = ReturnType<typeof rootReducer>

/**
 * Creates a new store. Called once per browser session by StoreProvider and
 * never shared between requests on the server.
 */
export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type AppDispatch = AppStore['dispatch']
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, UnknownAction>
