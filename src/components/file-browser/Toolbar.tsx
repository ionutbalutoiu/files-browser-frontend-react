import { Button } from '../ui/Button'
import { SimpleTooltip } from '../ui/Tooltip'
import { useUIStore } from '../../stores/uiStore'
import { triggerUpload } from '../upload/UploadDropzone'

export function Toolbar() {
  const openDialog = useUIStore((state) => state.openDialog)

  const handleNewFolder = () => {
    openDialog('newFolder')
  }

  const handleUpload = () => {
    triggerUpload()
  }

  return (
    <div className="flex items-center gap-1">
      <SimpleTooltip content="New Folder">
        <Button variant="ghost" size="sm" onClick={handleNewFolder} className="h-8 px-2.5">
          <svg
            className="h-4 w-4 sm:mr-1.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            />
          </svg>
          <span className="hidden sm:inline text-sm">New Folder</span>
        </Button>
      </SimpleTooltip>

      <SimpleTooltip content="Upload Files">
        <Button variant="ghost" size="sm" onClick={handleUpload} className="h-8 px-2.5">
          <svg
            className="h-4 w-4 sm:mr-1.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          <span className="hidden sm:inline text-sm">Upload</span>
        </Button>
      </SimpleTooltip>
    </div>
  )
}
