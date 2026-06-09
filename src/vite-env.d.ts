/// <reference types="vite/client" />

// Injected by Vite at build time from package.json `version`
// (see vite.config.ts `define`). Used by src/config/app.ts for BUILD_TAG.
declare const __APP_VERSION__: string;

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
    /** Optional CI-injected build tag (e.g. a git short SHA), overrides package version in the shell. */
    readonly VITE_BUILD_TAG?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
