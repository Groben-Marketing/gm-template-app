// ─── Actionable-signal primitives ──────────────────────────────────────
//
// R7C Nav & Orientation Standard #5: nav surfaces pending work as a signal,
// not a surprise. Attach a `badge` count to any NavItem / NavLink (see
// TopNav.tsx) or render these directly next to headings, tabs, table rows.
//
// Brand-agnostic: colors come from the shell theme tokens in index.css
// (`--shell-badge-*`, `--shell-signal`) — re-theme there, not here.

/**
 * Small numeric chip for "N items need attention". Renders nothing when the
 * count is 0 so surfaces stay calm by default.
 */
export function CountBadge({ count, max = 99 }: { count: number; max?: number }) {
    if (!count) return null;
    return (
        <span
            className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold leading-none bg-[var(--shell-badge-bg)] text-[var(--shell-badge-fg)]"
        >
            {count > max ? `${max}+` : count}
        </span>
    );
}

/**
 * Pulsing "do now" dot — answers "what should I do next?" from anywhere in
 * the app. Place next to the nav label of the view that owns the urgent work.
 */
export function DoNowDot() {
    return (
        <span className="relative ml-1.5 inline-flex w-2 h-2" aria-label="Action required">
            <span className="absolute inline-flex w-full h-full rounded-full bg-[var(--shell-signal)] opacity-75 animate-ping" />
            <span className="relative inline-flex w-2 h-2 rounded-full bg-[var(--shell-signal)]" />
        </span>
    );
}
