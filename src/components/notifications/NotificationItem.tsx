import { memo, useCallback } from 'react'
import type { NotificationData, NotificationType } from '../../stores/notificationStore'
import { useNotificationStore } from '../../stores/notificationStore'

interface NotificationItemProps {
  notification: NotificationData
  isExiting: boolean
}

const typeStyles: Record<NotificationType, { bg: string; icon: React.ReactNode }> = {
  success: {
    bg: 'bg-emerald-500',
    icon: (
      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  info: {
    bg: 'bg-primary',
    icon: (
      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  warning: {
    bg: 'bg-amber-500',
    icon: (
      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  error: {
    bg: 'bg-destructive',
    icon: (
      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
}

export const NotificationItem = memo(function NotificationItem({
  notification,
  isExiting,
}: NotificationItemProps) {
  const dismissNotification = useNotificationStore((state) => state.dismissNotification)
  const { type, title, description, action, id } = notification
  const style = typeStyles[type]

  const handleDismiss = useCallback(() => {
    dismissNotification(id)
  }, [dismissNotification, id])

  const handleAction = useCallback(() => {
    action?.onClick()
    dismissNotification(id)
  }, [action, dismissNotification, id])

  return (
    <div
      className={`group relative flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-lg transition-all duration-200 hover:shadow-xl ${
        isExiting ? 'animate-notification-exit' : 'animate-notification-enter'
      }`}
      role="alert"
    >
      {/* Icon badge */}
      <div
        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl shadow-md ${style.bg}`}
      >
        {style.icon}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description ? (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        ) : null}
        {action ? (
          <button
            onClick={handleAction}
            className="mt-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            {action.label}
          </button>
        ) : null}
      </div>

      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
        aria-label="Dismiss notification"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
})
