import { describe, expect, it } from 'vitest'
import { sessionCleared } from '@/features/auth/store/session-slice'
import { makeStore } from '@/lib/store/store'
import { MAX_NOTIFICATIONS, notificationDismissed, notify, selectNotifications } from './notifications-slice'

describe('notifications slice', () => {
  it('adds notifications with unique ids', () => {
    const store = makeStore()
    store.dispatch(notify('success', 'Saved'))
    store.dispatch(notify('error', 'Failed'))

    const items = selectNotifications(store.getState())
    expect(items.map((n) => [n.kind, n.message])).toEqual([
      ['success', 'Saved'],
      ['error', 'Failed'],
    ])
    expect(items[0].id).not.toBe(items[1].id)
  })

  it('keeps only the newest notifications', () => {
    const store = makeStore()
    for (let i = 0; i < MAX_NOTIFICATIONS + 2; i++) store.dispatch(notify('info', `#${i}`))

    const items = selectNotifications(store.getState())
    expect(items).toHaveLength(MAX_NOTIFICATIONS)
    expect(items[0].message).toBe('#2')
  })

  it('dismisses and clears on sign out', () => {
    const store = makeStore()
    store.dispatch(notify('info', 'a'))
    store.dispatch(notify('info', 'b'))
    const [first] = selectNotifications(store.getState())

    store.dispatch(notificationDismissed(first.id))
    expect(selectNotifications(store.getState()).map((n) => n.message)).toEqual(['b'])

    store.dispatch(sessionCleared())
    expect(selectNotifications(store.getState())).toEqual([])
  })
})
