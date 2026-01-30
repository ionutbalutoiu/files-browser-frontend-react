import * as ContextMenuPrimitive from '@radix-ui/react-context-menu'
import { forwardRef } from 'react'

export const ContextMenu = ContextMenuPrimitive.Root
export const ContextMenuTrigger = ContextMenuPrimitive.Trigger
export const ContextMenuGroup = ContextMenuPrimitive.Group
export const ContextMenuPortal = ContextMenuPrimitive.Portal
export const ContextMenuSub = ContextMenuPrimitive.Sub
export const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup

export const ContextMenuContent = forwardRef<
  HTMLDivElement,
  ContextMenuPrimitive.ContextMenuContentProps
>(({ className = '', ...props }, ref) => (
  <ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.Content
      ref={ref}
      className={`z-50 min-w-[10rem] overflow-hidden rounded-xl border border-border bg-popover/95 p-1.5 text-popover-foreground shadow-lg backdrop-blur-sm animate-in fade-in-80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ${className}`}
      {...props}
    />
  </ContextMenuPrimitive.Portal>
))
ContextMenuContent.displayName = 'ContextMenuContent'

export const ContextMenuItem = forwardRef<
  HTMLDivElement,
  ContextMenuPrimitive.ContextMenuItemProps & { inset?: boolean }
>(({ className = '', inset, ...props }, ref) => (
  <ContextMenuPrimitive.Item
    ref={ref}
    className={`relative flex cursor-pointer select-none items-center rounded-lg px-2.5 py-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${inset ? 'pl-8' : ''} ${className}`}
    {...props}
  />
))
ContextMenuItem.displayName = 'ContextMenuItem'

export const ContextMenuCheckboxItem = forwardRef<
  HTMLDivElement,
  ContextMenuPrimitive.ContextMenuCheckboxItemProps
>(({ className = '', children, checked = false, ...props }, ref) => (
  <ContextMenuPrimitive.CheckboxItem
    ref={ref}
    className={`relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.CheckboxItem>
))
ContextMenuCheckboxItem.displayName = 'ContextMenuCheckboxItem'

export const ContextMenuRadioItem = forwardRef<
  HTMLDivElement,
  ContextMenuPrimitive.ContextMenuRadioItemProps
>(({ className = '', children, ...props }, ref) => (
  <ContextMenuPrimitive.RadioItem
    ref={ref}
    className={`relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <svg className="h-2 w-2 fill-current" viewBox="0 0 8 8">
          <circle cx="4" cy="4" r="4" />
        </svg>
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.RadioItem>
))
ContextMenuRadioItem.displayName = 'ContextMenuRadioItem'

export const ContextMenuLabel = forwardRef<
  HTMLDivElement,
  ContextMenuPrimitive.ContextMenuLabelProps & { inset?: boolean }
>(({ className = '', inset, ...props }, ref) => (
  <ContextMenuPrimitive.Label
    ref={ref}
    className={`px-2 py-1.5 text-sm font-semibold ${inset ? 'pl-8' : ''} ${className}`}
    {...props}
  />
))
ContextMenuLabel.displayName = 'ContextMenuLabel'

export const ContextMenuSeparator = forwardRef<
  HTMLDivElement,
  ContextMenuPrimitive.ContextMenuSeparatorProps
>(({ className = '', ...props }, ref) => (
  <ContextMenuPrimitive.Separator
    ref={ref}
    className={`-mx-1 my-1 h-px bg-border ${className}`}
    {...props}
  />
))
ContextMenuSeparator.displayName = 'ContextMenuSeparator'

export function ContextMenuShortcut({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={`ml-auto text-xs tracking-widest text-muted-foreground ${className}`}
      {...props}
    />
  )
}

export const ContextMenuSubTrigger = forwardRef<
  HTMLDivElement,
  ContextMenuPrimitive.ContextMenuSubTriggerProps & { inset?: boolean }
>(({ className = '', inset, children, ...props }, ref) => (
  <ContextMenuPrimitive.SubTrigger
    ref={ref}
    className={`flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground ${inset ? 'pl-8' : ''} ${className}`}
    {...props}
  >
    {children}
    <svg
      className="ml-auto h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  </ContextMenuPrimitive.SubTrigger>
))
ContextMenuSubTrigger.displayName = 'ContextMenuSubTrigger'

export const ContextMenuSubContent = forwardRef<
  HTMLDivElement,
  ContextMenuPrimitive.ContextMenuSubContentProps
>(({ className = '', ...props }, ref) => (
  <ContextMenuPrimitive.SubContent
    ref={ref}
    className={`z-50 min-w-[10rem] overflow-hidden rounded-xl border border-border bg-popover/95 p-1.5 text-popover-foreground shadow-lg backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ${className}`}
    {...props}
  />
))
ContextMenuSubContent.displayName = 'ContextMenuSubContent'
