'use client'

import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { cn } from '@/lib/utils'
import { type Notification, notificationDismissed, selectNotifications } from '../store/notifications-slice'

const AUTO_DISMISS_MS = 5000

const kindClass: Record<Notification['kind'], string> = {
  success: 'border-emerald-500/30 text-emerald-300',
  error: 'border-rose-500/30 text-rose-300',
  info: 'border-blue-500/30 text-blue-300',
}

function Toast({ notification }: { notification: Notification }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const timer = setTimeout(() => dispatch(notificationDismissed(notification.id)), AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [dispatch, notification.id])

  return (
    <div
      role={notification.kind === 'error' ? 'alert' : 'status'}
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-lg border bg-slate-900/95 px-4 py-3 text-sm shadow-xl backdrop-blur',
        kindClass[notification.kind],
      )}
    >
      <p className="flex-1">{notification.message}</p>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => dispatch(notificationDismissed(notification.id))}
        className="text-slate-500 hover:text-white"
      >
        ×
      </button>
    </div>
  )
}

/** Renders global notifications from the Redux store. Mounted once in the root layout. */
export function Toaster() {
  const notifications = useAppSelector(selectNotifications)

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:left-auto sm:w-96"
    >
      {notifications.map((n) => (
        <Toast key={n.id} notification={n} />
      ))}
    </div>
  )
}
