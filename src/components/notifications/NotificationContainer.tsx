import { useNotificationStore } from '../../stores/notificationStore'
import { NotificationItem } from './NotificationItem'

export function NotificationContainer() {
  const notifications = useNotificationStore((state) => state.notifications)
  const exitingIds = useNotificationStore((state) => state.exitingIds)

  if (notifications.length === 0) {
    return null
  }

  return (
    <div
      className="fixed z-[100] sm:bottom-4 sm:right-4 sm:w-96 bottom-0 inset-x-0 p-4 sm:p-0 flex flex-col-reverse gap-3 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <NotificationItem
            notification={notification}
            isExiting={exitingIds.has(notification.id)}
          />
        </div>
      ))}
    </div>
  )
}
