// ════════════════════════════════════════════════════════════════════
// APP CONFIG  —  ONE PLACE FOR PER-APP IDENTITY + ORIENTATION CONSTANTS
// ════════════════════════════════════════════════════════════════════
// Every value an app author fills in to make the shell *this* app lives
// here, NOT hardcoded inside components. The shell (TopNav, breadcrumbs,
// account dropdown) reads from this module.
//
// CUSTOMIZE THESE per app:

/** Visible app name shown in the header wordmark + browser title. */
export const APP_NAME = 'App Name';

/** The app's primary/home route hash. Logo + wordmark link here. */
export const HOME_HREF = '#home';

/**
 * Parent portal URL for the "Portal Home" cross-app orientation link.
 *
 *   • GM / Groben-Marketing apps → 'https://grocrm.app'
 *   • R7C apps                   → 'https://r7c.app'
 *
 * Default below points at grocrm.app because this template lives in the
 * Groben-Marketing org. CHANGE IT for R7C apps. Set to undefined to hide
 * the Portal Home link entirely (standalone apps with no parent portal).
 */
export const PORTAL_HOME_URL: string | undefined = 'https://grocrm.app';

/**
 * In-app routes for the cross-app orientation links surfaced in the
 * account dropdown. Leave a route undefined to hide that link.
 */
export const CHANGELOG_HREF = '#changelog';
export const REFERENCE_HREF: string | undefined = '#reference';

/**
 * Build / version tag shown in the account dropdown.
 *
 * Prefers a build-time-injected value (set `VITE_BUILD_TAG` in CI or pass
 * `define: { __BUILD_TAG__: ... }`), then falls back to the package.json
 * version baked in by Vite at build (see vite.config.ts `define`), then a
 * dev placeholder. Keeping this in config means components never reach for
 * env vars directly.
 */
export const BUILD_TAG: string =
    (import.meta.env.VITE_BUILD_TAG as string | undefined) ||
    (typeof __APP_VERSION__ !== 'undefined' ? `v${__APP_VERSION__}` : 'dev');
