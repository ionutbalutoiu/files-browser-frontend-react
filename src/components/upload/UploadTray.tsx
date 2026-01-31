import { useUploadStore, getActiveCount, getOverallProgress } from '../../stores/uploadStore'
import { UploadPanel } from './UploadPanel'

export function UploadTray() {
  const items = useUploadStore((state) => state.items)
  const isPanelOpen = useUploadStore((state) => state.isPanelOpen)
  const togglePanel = useUploadStore((state) => state.togglePanel)
  const setPanel = useUploadStore((state) => state.setPanel)

  const activeCount = getActiveCount(items)
  const overallProgress = getOverallProgress(items)

  // Don't show if no items
  if (items.length === 0) {
    return null
  }

  const hasActive = activeCount > 0
  const statusText = hasActive
    ? `${activeCount} uploading`
    : items.every((item) => item.status === 'done')
      ? 'Complete'
      : 'Uploads'

  return (
    <>
      {/* Panel (renders above tray) */}
      <UploadPanel />

      {/* Tray button */}
      <div className="fixed z-[90] sm:bottom-4 sm:right-4 bottom-0 inset-x-0 sm:inset-x-auto">
        {/* Desktop tray */}
        <button
          onClick={togglePanel}
          className="hidden sm:flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-lg transition-all duration-200 hover:shadow-xl"
        >
          {/* Upload icon */}
          <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl shadow-md ${hasActive ? 'bg-primary' : 'bg-emerald-500'}`}>
            {hasActive ? (
              <svg className="h-4 w-4 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            ) : (
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>

          {/* Status text */}
          <div className="flex-1 text-left">
            <span className="text-sm font-medium">{statusText}</span>
            {hasActive ? (
              <span className="ml-2 text-sm text-muted-foreground">{overallProgress}%</span>
            ) : null}
          </div>

          {/* Toggle indicator */}
          <svg
            className={`h-4 w-4 text-muted-foreground transition-transform ${isPanelOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>

        {/* Mobile tray */}
        <div className="sm:hidden flex items-center justify-between border-t border-border bg-card px-4 py-3 shadow-lg">
          <button
            onClick={togglePanel}
            className="flex flex-1 items-center gap-3"
          >
            {/* Upload icon */}
            <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl shadow-md ${hasActive ? 'bg-primary' : 'bg-emerald-500'}`}>
              {hasActive ? (
                <svg className="h-4 w-4 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              ) : (
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>

            {/* Status text */}
            <div className="flex-1 text-left">
              <span className="text-sm font-medium">{statusText}</span>
              {hasActive ? (
                <span className="ml-2 text-sm text-muted-foreground">{overallProgress}%</span>
              ) : null}
            </div>

            {/* Toggle indicator */}
            <svg
              className={`h-4 w-4 text-muted-foreground transition-transform ${isPanelOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>

          {/* Close button on mobile */}
          <button
            onClick={() => setPanel(false)}
            className="ml-3 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Close upload tray"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}
