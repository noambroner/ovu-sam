/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_SOURCE: string
  readonly VITE_ULM_URL: string
  readonly VITE_ENABLE_DEBUG: string
  readonly VITE_ENABLE_DEV_TOOLS: string
  readonly VITE_PORT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

