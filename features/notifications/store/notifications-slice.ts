import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'
import { sessionCleared } from '@/features/auth/store/session-slice'

export type NotificationKind = 'success' | 'error' | 'info'

export type Notification = {
  id: string
  kind: NotificationKind
  message: string
}

export type NotificationsState = {
  items: Notification[]
}

// Oldest toasts are dropped beyond this many.
export const MAX_NOTIFICATIONS = 5

const initialState: NotificationsState = {
  items: [],
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    notify: {
      reducer(state, action: PayloadAction<Notification>) {
        state.items.push(action.payload)
        if (state.items.length > MAX_NOTIFICATIONS) {
          state.items.splice(0, state.items.length - MAX_NOTIFICATIONS)
        }
      },
      prepare(kind: NotificationKind, message: string) {
        return { payload: { id: nanoid(), kind, message } }
      },
    },
    notificationDismissed(state, action: PayloadAction<string>) {
      state.items = state.items.filter((n) => n.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder.addCase(sessionCleared, () => initialState)
  },
  selectors: {
    selectNotifications: (state) => state.items,
  },
})

export const { notify, notificationDismissed } = notificationsSlice.actions
export const { selectNotifications } = notificationsSlice.selectors
export default notificationsSlice
