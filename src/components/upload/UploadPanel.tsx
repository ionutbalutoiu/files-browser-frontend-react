import { useUploadStore } from '../../stores/uploadStore'
import { UploadItemComponent } from './UploadItem'

export function UploadPanel() {
  const items = useUploadStore((state) => state.items)
  const isPanelOpen = useUploadStore((state) => state.isPanelOpen)
  const clearCompleted = useUploadStore((state) => state.clearCompleted)

  const hasCompleted = items.some((item) => item.status === 'done' || item.status === 'failed')

  if (!isPanelOpen || items.length === 0) {
    return null
  }

  return (
    <div className="fixed z-[90] sm:bottom-20 sm:right-4 sm:w-96 bottom-16 inset-x-0 sm:inset-x-auto animate-panel-enter">
      <div className="sm:mx-0 mx-4 rounded-xl border border-border bg-card shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold">Uploads</h3>
          {hasCompleted ? (
            <button
              onClick={clearCompleted}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Clear
            </button>
          ) : null}
        </div>

        {/* Items list */}
        <div className="max-h-64 overflow-y-auto">
          {items.map((item) => (
            <UploadItemComponent key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}
