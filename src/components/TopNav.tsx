import { useState, useEffect, useRef } from 'preact/hooks';
import type { ComponentChildren } from 'preact';

// ─── Types ─────────────────────────────────────────────
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
    desc?: string;
    /** Routes that should highlight this link as the active child within its dropdown. */
    match: string[];
}

export interface NavItem {
    href?: string;
    label: string;
    /** Routes that should highlight this top-level item / dropdown trigger as active.
     *  INVARIANT: when `children` is set, this MUST equal the union of all `children[*].match`. */
    match: string[];
    children?: NavLink[];
}

export interface TopNavBrand {
    /** Visible wordmark text next to the logo. */
    wordmark: string;
    /** Anchor target for the wordmark — typically the app's primary route, e.g. '#dashboard'. */
    homeHref: string;
    /** Optional custom logo node. Omit for the canon sun-mark default. Override with an SVG or `<img>` for a per-app glyph. */
    logo?: ComponentChildren;
}

export interface TopNavProps {
    brand: TopNavBrand;
    navItems: NavItem[];
    /** Current route — matched against each NavItem/NavLink `match` array for highlight state. */
    view: string;
    profile: { name?: string; role?: string } | null;
    version: string;
    /** Parent portal URL for the "Portal Home" link in the user + mobile menus. Omit to hide the link.
     *  R7C ecosystem convention: 'https://r7c.app'. */
    portalHomeUrl?: string;
    onBugReport: () => void;
    onSignOut: () => void;
}

// ─── Default Logo ──────────────────────────────────────

function DefaultLogo() {
    return (
        <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        </div>
    );
}

// ─── Dropdown for grouped nav items ────────────────────

interface NavDropdownProps {
    label: string;
    children: NavLink[];
    active: boolean;
    view: string;
}

function NavDropdown({ label, children, active, view }: NavDropdownProps) {
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
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm transition-colors ${
                    active
                        ? 'text-white font-semibold bg-purple-500/15'
                        : 'text-purple-300/70 hover:text-white hover:bg-white/[0.04]'
                }`}
            >
                {label}
                <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {open && (
                <div
                    className="absolute left-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50"
                    style={{ animation: 'fadeUp 0.15s ease-out both' }}
                >
                    {children.map((link) => {
                        const childActive = link.match.includes(view);
                        return (
                            <a
                                key={link.href}
                                href={link.href}
                                aria-current={childActive ? 'page' : undefined}
                                className={`block px-4 py-2.5 transition-colors ${childActive ? 'bg-purple-50' : 'hover:bg-gray-50'}`}
                            >
                                <p className={`text-sm ${childActive ? 'font-semibold text-purple-700' : 'font-medium text-gray-900'}`}>{link.label}</p>
                                {link.desc && <p className={`text-[11px] ${childActive ? 'text-purple-500/80' : 'text-gray-400'}`}>{link.desc}</p>}
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
    onBugReport: () => void;
    onSignOut: () => void;
}

function UserDropdown({ profile, version, view, portalHomeUrl, onBugReport, onSignOut }: UserDropdownProps) {
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

    const isUtilView = ['changelog'].includes(view);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-2 text-sm transition-colors ${isUtilView ? 'text-white' : 'text-purple-300/70 hover:text-white'}`}
                aria-label="User menu"
            >
                <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-semibold text-purple-300">
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
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{profile?.name || 'User'}</p>
                        {profile?.role && (
                            <span className="inline-block mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                                {profile.role}
                            </span>
                        )}
                    </div>

                    {/* Utility links */}
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
                            href="#changelog"
                            onClick={() => setOpen(false)}
                            aria-current={view === 'changelog' ? 'page' : undefined}
                            className={`flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${view === 'changelog' ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                            <svg className={`w-4 h-4 shrink-0 ${view === 'changelog' ? 'text-purple-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Changelog
                        </a>
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
                            className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                        </button>
                    </div>
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
    onBugReport: () => void;
    onSignOut: () => void;
}

function MobileMenu({ view, navItems, open, onClose, profile, version, portalHomeUrl, onBugReport, onSignOut }: MobileMenuProps) {
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
        links: item.children
            ? item.children.map((c) => ({ href: c.href, label: c.label, match: c.match }))
            : [{ href: item.href!, label: item.label, match: item.match }],
    }));

    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    style={{ animation: 'fadeUp 0.15s ease-out both' }}
                />
            )}

            <div
                ref={ref}
                className={`fixed top-0 right-0 h-full w-72 bg-[#1a1625] z-50 transform transition-transform duration-200 ease-out lg:hidden ${open ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                    <span className="text-sm font-semibold text-white">{displayName}</span>
                    <button onClick={onClose} className="text-purple-300/70 hover:text-white transition-colors" aria-label="Close menu">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="px-3 py-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
                    {mobileGroups.map((group, gi) => (
                        <div key={gi} className="mb-4">
                            {group.label && (
                                <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-purple-400/50">
                                    {group.label}
                                </p>
                            )}
                            {group.links.map((link) => {
                                const active = link.match.includes(view);
                                return (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        aria-current={active ? 'page' : undefined}
                                        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${active
                                            ? 'text-white bg-purple-500/15 font-semibold'
                                            : 'text-purple-300/70 hover:text-white hover:bg-white/[0.04]'
                                        }`}
                                    >
                                        {link.label}
                                    </a>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 border-t border-white/[0.06] px-3 py-3">
                    <div className="flex items-center justify-between px-2 mb-3">
                        <span className="text-[10px] text-purple-400/50">{version}</span>
                        <a
                            href="#changelog"
                            aria-current={view === 'changelog' ? 'page' : undefined}
                            className={`text-[10px] transition-colors ${view === 'changelog' ? 'text-purple-200 font-semibold' : 'text-purple-400/50 hover:text-purple-300'}`}
                        >
                            Changelog
                        </a>
                    </div>
                    {portalHomeUrl && (
                        <a
                            href={portalHomeUrl}
                            target="_blank"
                            rel="noopener"
                            className="block px-3 py-2 rounded-lg text-sm text-purple-300/70 hover:text-white hover:bg-white/[0.04] transition-colors mb-1"
                        >
                            Portal Home
                        </a>
                    )}
                    <button
                        onClick={() => { onClose(); onBugReport(); }}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm text-purple-300/70 hover:text-white hover:bg-white/[0.04] transition-colors mb-1"
                    >
                        Report a Bug
                    </button>
                    <button
                        onClick={() => { onClose(); onSignOut(); }}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </>
    );
}

// ─── TopNav ────────────────────────────────────────────

export function TopNav({ brand, navItems, view, profile, version, portalHomeUrl, onBugReport, onSignOut }: TopNavProps) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            <header className="bg-[#1a1625] text-white px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
                {/* Brand */}
                <div className="flex items-center gap-3 shrink-0">
                    {brand.logo ?? <DefaultLogo />}
                    <a href={brand.homeHref} className="text-base font-bold tracking-tight hover:text-purple-200 transition-colors">
                        {brand.wordmark}
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
                            />
                        ) : (
                            <a
                                key={item.href}
                                href={item.href}
                                aria-current={item.match.includes(view) ? 'page' : undefined}
                                className={`px-2.5 py-1 rounded-lg transition-colors ${
                                    item.match.includes(view)
                                        ? 'text-white font-semibold bg-purple-500/15'
                                        : 'text-purple-300/70 hover:text-white hover:bg-white/[0.04]'
                                }`}
                            >
                                {item.label}
                            </a>
                        ),
                    )}
                </nav>

                {/* Right side */}
                <div className="flex items-center gap-3">
                    <div className="hidden lg:block">
                        <UserDropdown
                            profile={profile}
                            version={version}
                            view={view}
                            portalHomeUrl={portalHomeUrl}
                            onBugReport={onBugReport}
                            onSignOut={onSignOut}
                        />
                    </div>
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="lg:hidden text-purple-300/70 hover:text-white transition-colors"
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
                onBugReport={onBugReport}
                onSignOut={onSignOut}
            />
        </>
    );
}
