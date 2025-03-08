/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
  readonly GEMINI_API_KEY: string;
  readonly VITE_GEMINI_API_KEY?: string;
  readonly SUPABASE_API_KEY?: string;
  readonly SUPABASE_PROJECT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 