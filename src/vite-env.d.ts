/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_ORIGIN: string
  readonly VITE_FILES_ORIGIN: string
  readonly VITE_SHARE_ORIGIN: string
  readonly VITE_SHARE_URL_TEMPLATE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
