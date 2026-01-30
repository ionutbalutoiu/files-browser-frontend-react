import * as ToastPrimitive from '@radix-ui/react-toast'
import { forwardRef } from 'react'

export const ToastProvider = ToastPrimitive.Provider

export const ToastViewport = forwardRef<
  HTMLOListElement,
  ToastPrimitive.ToastViewportProps
>(({ className = '', ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={`fixed bottom-0 left-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 md:max-w-[420px] ${className}`}
    {...props}
  />
))
ToastViewport.displayName = 'ToastViewport'

type ToastVariant = 'default' | 'destructive' | 'success'

const variantStyles: Record<ToastVariant, string> = {
  default: 'border border-border bg-card text-foreground',
  destructive: 'border-destructive bg-destructive text-destructive-foreground',
  success: 'border-emerald-500 bg-emerald-500 text-white',
}

export interface ToastProps extends ToastPrimitive.ToastProps {
  variant?: ToastVariant
}

export const Toast = forwardRef<HTMLLIElement, ToastProps>(
  ({ className = '', variant = 'default', ...props }, ref) => (
    <ToastPrimitive.Root
      ref={ref}
      className={`group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border p-4 pr-10 shadow-lg backdrop-blur-sm transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-left-full data-[state=open]:slide-in-from-left-full ${variantStyles[variant]} ${className}`}
      {...props}
    />
  )
)
Toast.displayName = 'Toast'

export const ToastAction = forwardRef<
  HTMLButtonElement,
  ToastPrimitive.ToastActionProps
>(({ className = '', ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={`inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring disabled:pointer-events-none disabled:opacity-50 ${className}`}
    {...props}
  />
))
ToastAction.displayName = 'ToastAction'

export const ToastClose = forwardRef<
  HTMLButtonElement,
  ToastPrimitive.ToastCloseProps
>(({ className = '', ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={`absolute right-3 top-3 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring group-hover:opacity-100 ${className}`}
    toast-close=""
    {...props}
  >
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  </ToastPrimitive.Close>
))
ToastClose.displayName = 'ToastClose'

export const ToastTitle = forwardRef<
  HTMLDivElement,
  ToastPrimitive.ToastTitleProps
>(({ className = '', ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={`text-sm font-semibold ${className}`}
    {...props}
  />
))
ToastTitle.displayName = 'ToastTitle'

export const ToastDescription = forwardRef<
  HTMLDivElement,
  ToastPrimitive.ToastDescriptionProps
>(({ className = '', ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={`text-sm opacity-90 ${className}`}
    {...props}
  />
))
ToastDescription.displayName = 'ToastDescription'
