/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL: string;
  // add more custom env vars here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
