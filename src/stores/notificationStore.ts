import { create } from 'zustand'

export type NotificationType = 'success' | 'info' | 'warning' | 'error'

export interface NotificationAction {
  label: string
  onClick: () => void
}

export interface NotificationData {
  id: string
  type: NotificationType
  title: string
  description?: string
  action?: NotificationAction
  createdAt: number
}

export interface NotificationOptions {
  type: NotificationType
  title: string
  description?: string
  action?: NotificationAction
}

// Auto-dismiss durations by type (in ms)
const DISMISS_DURATIONS: Record<NotificationType, number> = {
  success: 4000,
  info: 5000,
  warning: 8000,
  error: 10000,
}

const MAX_VISIBLE = 3

interface NotificationState {
  notifications: NotificationData[]
  exitingIds: Set<string>

  // Actions
  addNotification: (options: NotificationOptions) => string
  dismissNotification: (id: string) => void
  removeNotification: (id: string) => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  exitingIds: new Set(),

  addNotification: (options) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const notification: NotificationData = {
      id,
      type: options.type,
      title: options.title,
      createdAt: Date.now(),
      ...(options.description !== undefined && { description: options.description }),
      ...(options.action !== undefined && { action: options.action }),
    }

    set((state) => {
      let notifications = [...state.notifications, notification]

      // If we exceed max, remove oldest (FIFO)
      while (notifications.length > MAX_VISIBLE) {
        notifications = notifications.slice(1)
      }

      return { notifications }
    })

    // Schedule auto-dismiss
    const duration = DISMISS_DURATIONS[options.type]
    setTimeout(() => {
      get().dismissNotification(id)
    }, duration)

    return id
  },

  dismissNotification: (id) => {
    const state = get()
    // Skip if already exiting or doesn't exist
    if (state.exitingIds.has(id) || !state.notifications.some((n) => n.id === id)) {
      return
    }

    // Mark as exiting for animation
    set((state) => ({
      exitingIds: new Set([...state.exitingIds, id]),
    }))

    // Remove after animation completes
    setTimeout(() => {
      get().removeNotification(id)
    }, 200)
  },

  removeNotification: (id) => {
    set((state) => {
      const newExitingIds = new Set(state.exitingIds)
      newExitingIds.delete(id)
      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        exitingIds: newExitingIds,
      }
    })
  },
}))

// Global function for use outside React components
export function showNotification(options: NotificationOptions): string {
  return useNotificationStore.getState().addNotification(options)
}

export function dismissNotification(id: string): void {
  useNotificationStore.getState().dismissNotification(id)
}
