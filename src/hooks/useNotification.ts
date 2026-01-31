import { useCallback } from 'react'
import { useNotificationStore, type NotificationAction } from '../stores/notificationStore'

interface NotificationOptions {
  title: string
  description?: string
  action?: NotificationAction
}

export function useNotification() {
  const addNotification = useNotificationStore((state) => state.addNotification)
  const dismissNotification = useNotificationStore((state) => state.dismissNotification)

  const success = useCallback(
    (options: NotificationOptions) => {
      return addNotification({ type: 'success', ...options })
    },
    [addNotification]
  )

  const info = useCallback(
    (options: NotificationOptions) => {
      return addNotification({ type: 'info', ...options })
    },
    [addNotification]
  )

  const warning = useCallback(
    (options: NotificationOptions) => {
      return addNotification({ type: 'warning', ...options })
    },
    [addNotification]
  )

  const error = useCallback(
    (options: NotificationOptions) => {
      return addNotification({ type: 'error', ...options })
    },
    [addNotification]
  )

  const dismiss = useCallback(
    (id: string) => {
      dismissNotification(id)
    },
    [dismissNotification]
  )

  return {
    success,
    info,
    warning,
    error,
    dismiss,
  }
}
