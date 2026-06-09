import { useState, useEffect, useRef } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import { CountBadge, DoNowDot } from './CountBadge';

// ─── TopNav — the canonical application shell header ───────────────────
//
// Implements the R7C Nav & Orientation Standard (see README.md → "Nav &
// Orientation Standard"): sticky branded header, ≤5 top-level nav items
// with dropdown grouping, active-state highlight (color + underline),
// count badges, account dropdown (name + role + version + Sign Out +
// Portal Home / Changelog / Reference), and a mobile drawer.
//
// BRAND-AGNOSTIC: every color comes from the shell theme tokens in
// src/index.css (`--shell-*`). To re-skin a new app, edit those tokens —
// never hardcode brand colors in this file. Identity (app name, portal
// URL, version) comes in via props, sourced from src/config/app.ts.
//
// ─── Active-state mechanism ────────────────────────────────────────────
//
// Active-state across the desktop nav, dropdowns, and mobile menu is driven
// entirely by per-link `match` arrays compared against the current `view`
// string. The mechanism's invariant is:
//
//   parent.match = union of all parent.children[*].match
//
// When you add or remove a route from a child link, update the parent's
// `match` to match. The desktop dropdown trigger, the mobile group header,
// and the dropdown's child rows ALL read from this — keep them in sync and
// every surface lights up correctly with zero per-surface logic.

export interface NavLink {
    href: string;
    label: string;
    /** One-line answer to "what can I do here?" — shown under the label in dropdowns. */
    desc?: string;
    /** Routes that should highlight this link as the active child within its dropdown. */
    match: string[];
    /** Pending-work count rendered as a CountBadge. Omit or 0 = no badge. */
    badge?: number;
}

export interface NavItem {
    href?: string;
    label: string;
    /** Routes that should highlight this top-level item / dropdown trigger as active.
     *  INVARIANT: when `children` is set, this MUST equal the union of all `children[*].match`. */
    match: string[];
    children?: NavLink[];
    /** Pending-work count for the whole section — typically the sum of its children's badges. */
    badge?: number;
    /** Pulsing "do now" dot — set true on the ONE item that owns the user's most urgent work. */
    doNow?: boolean;
}

export interface TopNavBrand {
    /** Visible wordmark text next to the logo. */
    wordmark: string;
    /** Anchor target for the logo + wordmark — the app's primary route, e.g. '#home'. */
    homeHref: string;
    /** Optional custom logo node. Omit for the neutral sun-mark default. Override with an SVG or `<img>` for a per-app glyph. */
    logo?: ComponentChildren;
}

export interface TopNavProps {
    brand: TopNavBrand;
    navItems: NavItem[];
    /** Current route — matched against each NavItem/NavLink `match` array for highlight state. */
    view: string;
    profile: { name?: string; role?: string } | null;
    /** Version/build tag shown in the account dropdown + mobile drawer. Source from BUILD_TAG in src/config/app.ts. */
    version: string;
    /** Parent portal URL for the "Portal Home" cross-app link. Source from PORTAL_HOME_URL in src/config/app.ts. Omit to hide. */
    portalHomeUrl?: string;
    /** In-app changelog route. Defaults to '#changelog'. */
    changelogHref?: string;
    /** In-app reference/docs route. Omit to hide the Reference link. */
    referenceHref?: string;
    onBugReport: () => void;
    onSignOut: () => void;
}

// ─── Default Logo ──────────────────────────────────────

function DefaultLogo() {
    return (
        <div className="w-8 h-8 bg-[var(--shell-accent-soft)] rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-[var(--shell-accent-mute)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        </div>
    );
}

// "You are here" underline pinned to the bottom edge of the header bar.
function ActiveUnderline() {
    return <span className="absolute -bottom-[13px] left-2.5 right-2.5 h-[2px] bg-[var(--shell-accent)] rounded-full" />;
}

// ─── Dropdown for grouped nav items ────────────────────

interface NavDropdownProps {
    label: string;
    children: NavLink[];
    active: boolean;
    view: string;
    badge?: number;
}

function NavDropdown({ label, children, active, view, badge }: NavDropdownProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const close = () => setOpen(false);
        window.addEventListener('hashchange', close);
        return () => window.removeEventListener('hashchange', close);
    }, [open]);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                aria-current={active ? 'page' : undefined}
                className={`relative flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm transition-colors ${
                    active
                        ? 'text-[var(--shell-header-fg)] font-semibold bg-[var(--shell-accent-soft)]'
                        : 'text-[var(--shell-header-muted)] hover:text-[var(--shell-header-fg)] hover:bg-[var(--shell-header-hover)]'
                }`}
            >
                {label}
                {badge ? <CountBadge count={badge} /> : null}
                <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
                {active && <ActiveUnderline />}
            </button>
            {open && (
                <div
                    className="absolute left-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50"
                    style={{ animation: 'fadeUp 0.15s ease-out both' }}
                >
                    {children.map((link) => {
                        const childActive = link.match.includes(view);
                        return (
                            <a
                                key={link.href}
                                href={link.href}
                                aria-current={childActive ? 'page' : undefined}
                                className={`block px-4 py-2.5 transition-colors ${childActive ? 'bg-[var(--shell-accent-tint)]' : 'hover:bg-gray-50'}`}
                            >
                                <p className={`flex items-center text-sm ${childActive ? 'font-semibold text-[var(--shell-accent-strong)]' : 'font-medium text-gray-900'}`}>
                                    {link.label}
                                    {link.badge ? <CountBadge count={link.badge} /> : null}
                                </p>
                                {link.desc && <p className={`text-[11px] ${childActive ? 'text-[var(--shell-accent-strong)] opacity-70' : 'text-gray-400'}`}>{link.desc}</p>}
                            </a>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── User Dropdown ─────────────────────────────────────

interface UserDropdownProps {
    profile: { name?: string; role?: string } | null;
    version: string;
    view: string;
    portalHomeUrl?: string;
    changelogHref: string;
    referenceHref?: string;
    onBugReport: () => void;
    onSignOut: () => void;
}

function UserDropdown({ profile, version, view, portalHomeUrl, changelogHref, referenceHref, onBugReport, onSignOut }: UserDropdownProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    const displayName = profile?.name || 'User';
    const initials = (profile?.name || 'U')
        .split(/\s/).filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join('');

    // Views reachable only through this dropdown still light up the trigger —
    // "you are here" holds even off the main nav.
    const utilSlugs = [changelogHref, referenceHref].filter(Boolean).map((h) => h!.replace(/^#/, ''));
    const isUtilView = utilSlugs.includes(view);

    function utilLinkClass(active: boolean) {
        return `flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${
            active ? 'bg-[var(--shell-accent-tint)] text-[var(--shell-accent-strong)] font-semibold' : 'text-gray-700 hover:bg-gray-50'
        }`;
    }
    function utilIconClass(active: boolean) {
        return `w-4 h-4 shrink-0 ${active ? 'text-[var(--shell-accent)]' : 'text-gray-400'}`;
    }

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-2 text-sm transition-colors ${isUtilView ? 'text-[var(--shell-header-fg)]' : 'text-[var(--shell-header-muted)] hover:text-[var(--shell-header-fg)]'}`}
                aria-label="User menu"
            >
                <div className="w-7 h-7 rounded-full bg-[var(--shell-accent-soft)] flex items-center justify-center text-xs font-semibold text-[var(--shell-accent-mute)]">
                    {initials}
                </div>
                <span className="hidden sm:inline max-w-[140px] truncate">{displayName}</span>
                <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div
                    className="absolute right-0 top-full mt-2 w-60 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50"
                    style={{ animation: 'fadeUp 0.15s ease-out both' }}
                >
                    {/* User info — who am I, what's my role */}
                    <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{profile?.name || 'User'}</p>
                        {profile?.role && (
                            <span className="inline-block mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--shell-accent-strong)] bg-[var(--shell-accent-tint)] px-2 py-0.5 rounded-full">
                                {profile.role}
                            </span>
                        )}
                    </div>

                    {/* Cross-app orientation + utility links */}
                    <div className="py-1">
                        {portalHomeUrl && (
                            <a
                                href={portalHomeUrl}
                                target="_blank"
                                rel="noopener"
                                className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" />
                                </svg>
                                Portal Home
                            </a>
                        )}
                        <a
                            href={changelogHref}
                            onClick={() => setOpen(false)}
                            aria-current={view === changelogHref.replace(/^#/, '') ? 'page' : undefined}
                            className={utilLinkClass(view === changelogHref.replace(/^#/, ''))}
                        >
                            <svg className={utilIconClass(view === changelogHref.replace(/^#/, ''))} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Changelog
                        </a>
                        {referenceHref && (
                            <a
                                href={referenceHref}
                                onClick={() => setOpen(false)}
                                aria-current={view === referenceHref.replace(/^#/, '') ? 'page' : undefined}
                                className={utilLinkClass(view === referenceHref.replace(/^#/, ''))}
                            >
                                <svg className={utilIconClass(view === referenceHref.replace(/^#/, ''))} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                Reference
                            </a>
                        )}
                        <button
                            onClick={() => { setOpen(false); onBugReport(); }}
                            className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Report a Bug
                        </button>
                    </div>

                    {/* Sign out */}
                    <div className="border-t border-gray-100 py-1">
                        <button
                            onClick={() => { setOpen(false); onSignOut(); }}
                            className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-[var(--shell-danger)] hover:bg-[var(--shell-danger-tint)] transition-colors"
                        >
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                        </button>
                    </div>

                    {/* Version/build tag — which build am I looking at */}
                    <div className="border-t border-gray-100 px-4 py-2">
                        <p className="text-[10px] text-gray-400">{version}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Mobile Menu ───────────────────────────────────────

interface MobileMenuProps {
    view: string;
    navItems: NavItem[];
    open: boolean;
    onClose: () => void;
    profile: { name?: string; role?: string } | null;
    version: string;
    portalHomeUrl?: string;
    changelogHref: string;
    referenceHref?: string;
    onBugReport: () => void;
    onSignOut: () => void;
}

function MobileMenu({ view, navItems, open, onClose, profile, version, portalHomeUrl, changelogHref, referenceHref, onBugReport, onSignOut }: MobileMenuProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose();
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        window.addEventListener('hashchange', onClose);
        return () => window.removeEventListener('hashchange', onClose);
    }, [open]);

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    const displayName = profile?.name || 'User';

    // Mobile menu sources its groups from the same navItems as desktop so the
    // per-link `match` arrays stay synchronised. Items without children render
    // as a single ungrouped link.
    const mobileGroups = navItems.map((item) => ({
        label: item.children ? item.label : null,
        badge: item.children ? item.badge : undefined,
        links: item.children
            ? item.children.map((c) => ({ href: c.href, label: c.label, match: c.match, badge: c.badge, doNow: false }))
            : [{ href: item.href!, label: item.label, match: item.match, badge: item.badge, doNow: !!item.doNow }],
    }));

    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    style={{ animation: 'fadeUp 0.15s ease-out both' }}
                />
            )}

            {/* Flex column: the footer reserves its own space and the nav list
                scrolls within the remaining height. */}
            <div
                ref={ref}
                className={`fixed top-0 right-0 h-full w-72 bg-[var(--shell-header-bg)] z-50 flex flex-col transform transition-transform duration-200 ease-out lg:hidden ${open ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] shrink-0">
                    <span className="text-sm font-semibold text-[var(--shell-header-fg)]">{displayName}</span>
                    <button onClick={onClose} className="text-[var(--shell-header-muted)] hover:text-[var(--shell-header-fg)] transition-colors" aria-label="Close menu">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="px-3 py-4 overflow-y-auto flex-1 min-h-0">
                    {mobileGroups.map((group, gi) => (
                        <div key={gi} className="mb-4">
                            {group.label && (
                                <div className="flex items-center px-2 mb-1.5">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--shell-header-muted)] opacity-70">
                                        {group.label}
                                    </p>
                                    {group.badge ? <CountBadge count={group.badge} /> : null}
                                </div>
                            )}
                            {group.links.map((link) => {
                                const active = link.match.includes(view);
                                return (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        aria-current={active ? 'page' : undefined}
                                        className={`relative flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${active
                                            ? 'text-[var(--shell-header-fg)] bg-[var(--shell-accent-soft)] font-semibold'
                                            : 'text-[var(--shell-header-muted)] hover:text-[var(--shell-header-fg)] hover:bg-[var(--shell-header-hover)]'
                                        }`}
                                    >
                                        {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[var(--shell-accent)] rounded-r-full" />}
                                        <span>{link.label}</span>
                                        {link.badge ? <CountBadge count={link.badge} /> : null}
                                        {link.doNow && <DoNowDot />}
                                    </a>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                <div className="border-t border-white/[0.06] px-3 py-3 shrink-0">
                    {portalHomeUrl && (
                        <a
                            href={portalHomeUrl}
                            target="_blank"
                            rel="noopener"
                            className="block px-3 py-1.5 rounded-lg text-sm text-[var(--shell-header-muted)] hover:text-[var(--shell-header-fg)] hover:bg-[var(--shell-header-hover)] transition-colors"
                        >
                            Portal Home
                        </a>
                    )}
                    <a
                        href={changelogHref}
                        aria-current={view === changelogHref.replace(/^#/, '') ? 'page' : undefined}
                        className="block px-3 py-1.5 rounded-lg text-sm text-[var(--shell-header-muted)] hover:text-[var(--shell-header-fg)] hover:bg-[var(--shell-header-hover)] transition-colors"
                    >
                        Changelog
                    </a>
                    {referenceHref && (
                        <a
                            href={referenceHref}
                            aria-current={view === referenceHref.replace(/^#/, '') ? 'page' : undefined}
                            className="block px-3 py-1.5 rounded-lg text-sm text-[var(--shell-header-muted)] hover:text-[var(--shell-header-fg)] hover:bg-[var(--shell-header-hover)] transition-colors"
                        >
                            Reference
                        </a>
                    )}
                    <button
                        onClick={() => { onClose(); onBugReport(); }}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-sm text-[var(--shell-header-muted)] hover:text-[var(--shell-header-fg)] hover:bg-[var(--shell-header-hover)] transition-colors"
                    >
                        Report a Bug
                    </button>
                    {/* Border above Sign Out so it reads as a distinct destructive action */}
                    <div className="border-t border-white/[0.06] mt-1 pt-1">
                        <button
                            onClick={() => { onClose(); onSignOut(); }}
                            className="w-full text-left px-3 py-1.5 rounded-lg text-sm text-[var(--shell-danger)] hover:bg-[var(--shell-header-hover)] transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                    <p className="px-3 pt-2 text-[10px] text-[var(--shell-header-muted)] opacity-70">{version}</p>
                </div>
            </div>
        </>
    );
}

// ─── TopNav ────────────────────────────────────────────

export function TopNav({ brand, navItems, view, profile, version, portalHomeUrl, changelogHref = '#changelog', referenceHref, onBugReport, onSignOut }: TopNavProps) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            <header className="bg-[var(--shell-header-bg)] text-[var(--shell-header-fg)] px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
                {/* Brand — logo + wordmark link home */}
                <div className="flex items-center gap-3 shrink-0">
                    <a href={brand.homeHref} className="flex items-center gap-3 group" aria-label={`${brand.wordmark} — home`}>
                        {brand.logo ?? <DefaultLogo />}
                        <span className="text-base font-bold tracking-tight group-hover:text-[var(--shell-accent-mute)] transition-colors">
                            {brand.wordmark}
                        </span>
                    </a>
                </div>

                {/* Desktop nav */}
                <nav className="hidden lg:flex items-center gap-2 text-sm">
                    {navItems.map((item) =>
                        item.children ? (
                            <NavDropdown
                                key={item.label}
                                label={item.label}
                                children={item.children}
                                active={item.match.includes(view)}
                                view={view}
                                badge={item.badge}
                            />
                        ) : (
                            <a
                                key={item.href}
                                href={item.href}
                                aria-current={item.match.includes(view) ? 'page' : undefined}
                                className={`relative flex items-center px-2.5 py-1 rounded-lg transition-colors ${
                                    item.match.includes(view)
                                        ? 'text-[var(--shell-header-fg)] font-semibold bg-[var(--shell-accent-soft)]'
                                        : 'text-[var(--shell-header-muted)] hover:text-[var(--shell-header-fg)] hover:bg-[var(--shell-header-hover)]'
                                }`}
                            >
                                {item.label}
                                {item.badge ? <CountBadge count={item.badge} /> : null}
                                {item.doNow && <DoNowDot />}
                                {item.match.includes(view) && <ActiveUnderline />}
                            </a>
                        ),
                    )}
                </nav>

                {/* Right side — account control + mobile hamburger */}
                <div className="flex items-center gap-3">
                    <div className="hidden lg:block">
                        <UserDropdown
                            profile={profile}
                            version={version}
                            view={view}
                            portalHomeUrl={portalHomeUrl}
                            changelogHref={changelogHref}
                            referenceHref={referenceHref}
                            onBugReport={onBugReport}
                            onSignOut={onSignOut}
                        />
                    </div>
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="lg:hidden text-[var(--shell-header-muted)] hover:text-[var(--shell-header-fg)] transition-colors"
                        aria-label="Open navigation menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </header>

            <MobileMenu
                view={view}
                navItems={navItems}
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                profile={profile}
                version={version}
                portalHomeUrl={portalHomeUrl}
                changelogHref={changelogHref}
                referenceHref={referenceHref}
                onBugReport={onBugReport}
                onSignOut={onSignOut}
            />
        </>
    );
}
