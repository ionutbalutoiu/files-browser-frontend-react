import { createContext, useContext, useCallback, useState, ReactNode, useEffect } from 'react'
import {
  ToastProvider as RadixToastProvider,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastViewport,
  ToastClose,
} from '../components/ui/Toast'

interface ToastData {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
}

interface ToastContextValue {
  toast: (options: Omit<ToastData, 'id'>) => void
  dismissToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

// Global toast function reference for use outside React components
let globalToastFn: ((options: Omit<ToastData, 'id'>) => void) | null = null

/**
 * Global toast function that can be called from anywhere (e.g., QueryClient error handlers).
 * Must be called after ToastProvider mounts.
 */
export function showToast(options: Omit<ToastData, 'id'>) {
  if (globalToastFn) {
    globalToastFn(options)
  } else {
    console.warn('Toast not available yet. ToastProvider may not be mounted.')
  }
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const toast = useCallback((options: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { ...options, id }])

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 10000)
  }, [])

  // Register global toast function
  useEffect(() => {
    globalToastFn = toast
    return () => {
      globalToastFn = null
    }
  }, [toast])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast, dismissToast }}>
      <RadixToastProvider swipeDirection="left">
        {children}
        {toasts.map((t) => (
          <Toast key={t.id} variant={t.variant ?? 'default'} open onOpenChange={() => dismissToast(t.id)}>
            <div className="flex items-start gap-3">
              {t.variant === 'success' ? (
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : t.variant === 'destructive' ? (
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              ) : null}
              <div className="grid gap-1">
                <ToastTitle>{t.title}</ToastTitle>
                {t.description ? <ToastDescription>{t.description}</ToastDescription> : null}
              </div>
            </div>
            <ToastClose />
          </Toast>
        ))}
        <ToastViewport />
      </RadixToastProvider>
    </ToastContext.Provider>
  )
}
