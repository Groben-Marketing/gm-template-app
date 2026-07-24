import { render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { TopNav, type NavItem } from './components/TopNav';
import { PageHeading } from './components/PageHeading';
import { EmptyState } from './components/EmptyState';
import { Breadcrumb } from './components/Breadcrumb';
import { ErrorBoundary } from './components/ErrorBoundary';
import { BugModal } from './components/BugModal';
import { HomeView } from './views/Home';
import {
    APP_NAME,
    HOME_HREF,
    PORTAL_HOME_URL,
    CHANGELOG_HREF,
    REFERENCE_HREF,
    BUILD_TAG,
} from './config/app';
import './index.css';

// ─── NAV_ITEMS — the app's map ─────────────────────────────────────────
//
// R7C Nav & Orientation Standard #2: ≤5 top-level items, dropdowns group
// sub-pages, and EVERY routable view appears in some item's `match[]`
// (nested detail views ride on their parent's match — see 'detail' below).
// If you add a route and no nav item matches it, the user is lost: fix the
// nav, don't ship the orphan.
//
// Placeholder items below — replace with your app's real sections.
const NAV_ITEMS: NavItem[] = [
    // 'detail' rides on Dashboard's match so drilling into an item keeps
    // the Dashboard tab lit ("you are here" survives nesting).
    { href: '#home', label: 'Dashboard', match: ['home', 'detail'] },
    {
        label: 'Work',
        // INVARIANT: union of the children's match arrays. Badge = sum of children's.
        match: ['queue', 'archive'],
        badge: 3,
        children: [
            { href: '#queue', label: 'Queue', desc: 'Items awaiting your action', match: ['queue'], badge: 3 },
            { href: '#archive', label: 'Archive', desc: 'Completed items', match: ['archive'] },
        ],
    },
];

function App() {
    const [route, setRoute] = useState(location.hash.slice(1) || 'home');
    const [bugOpen, setBugOpen] = useState(false);

    useEffect(() => {
        const handler = () => setRoute(location.hash.slice(1) || 'home');
        window.addEventListener('hashchange', handler);
        return () => window.removeEventListener('hashchange', handler);
    }, []);

    const [view, param] = route.includes('/')
        ? [route.split('/')[0], route.split('/')[1]]
        : [route, undefined];

    // DEMO profile. In a real app, load the Supabase profile after auth:
    //   supabase.from('profiles').select('name, role').eq('id', session.user.id).single()
    // and gate the whole shell behind a session check (see src/lib/supabase.ts).
    const profile = { name: 'Demo User', role: 'Admin' };

    const renderView = () => {
        switch (view) {
            case 'detail':    return <DetailView id={param} />;
            case 'queue':     return <QueueView />;
            case 'archive':   return <ArchiveView />;
            case 'changelog': return <ChangelogView />;
            case 'reference': return <ReferenceView />;
            default:          return <HomeView />;
        }
    };

    return (
        <div className="min-h-screen">
            <TopNav
                brand={{ wordmark: APP_NAME, homeHref: HOME_HREF }}
                navItems={NAV_ITEMS}
                view={view}
                profile={profile}
                version={BUILD_TAG}
                portalHomeUrl={PORTAL_HOME_URL}
                changelogHref={CHANGELOG_HREF}
                referenceHref={REFERENCE_HREF}
                // Reusable bug reporter (@wayfinder/bug-reporter) — opens the modal,
                // which POSTs to /api/bug-report (server signs + forwards to Workbench).
                onBugReport={() => setBugOpen(true)}
                // Real app: import { signOut } from './lib/supabase' and reload.
                onSignOut={() => alert('Wire onSignOut to supabase signOut().')}
            />
            <main>
                {/* Fault-Isolation Standard: each view renders inside its own
                    boundary, keyed by route so navigating clears a prior crash.
                    A render error in one view degrades to a recoverable fallback
                    instead of blanking the whole SPA. */}
                <ErrorBoundary key={view} label={view}>
                    {renderView()}
                </ErrorBoundary>
            </main>
            {bugOpen && <BugModal buildTag={BUILD_TAG} onClose={() => setBugOpen(false)} />}
        </div>
    );
}

// ─── Demo views ────────────────────────────────────────────────────────
// Each routed view opens with PageHeading (standard #4 — "what can I do
// here"). Nested views add a Breadcrumb trail (standard #9). Replace these
// with your real views; keep the pattern.

interface DetailViewProps {
    id?: string;
}

function DetailView({ id }: DetailViewProps) {
    return (
        <div className="max-w-3xl mx-auto p-6" style={{ animation: 'fadeUp 0.35s ease-out both' }}>
            {/* Nested view → breadcrumb back-affordance (standard #9) */}
            <Breadcrumb items={[
                { label: 'Dashboard', href: '#home' },
                { label: `Item ${id ?? ''}` },
            ]} />
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h1 className="text-xl font-bold text-gray-900 mb-2">Detail View</h1>
                <p className="text-sm text-gray-500 mb-4">Viewing item <strong>{id}</strong></p>
            </div>
        </div>
    );
}

function QueueView() {
    return (
        <div className="max-w-5xl mx-auto p-6">
            <PageHeading
                title="Queue"
                description="Items awaiting your action. Work them top-down — oldest first."
            />
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <EmptyState
                    title="Queue is clear"
                    message="New items land here when they're submitted. Nothing needs your attention right now."
                    actionLabel="View archive"
                    onAction={() => { location.hash = 'archive'; }}
                />
            </div>
        </div>
    );
}

function ArchiveView() {
    return (
        <div className="max-w-5xl mx-auto p-6">
            <PageHeading
                title="Archive"
                description="Completed items, newest first. Read-only."
            />
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <EmptyState
                    title="No completed items yet"
                    message="Items move here automatically when you complete them in the Queue."
                />
            </div>
        </div>
    );
}

function ChangelogView() {
    return (
        <div className="max-w-3xl mx-auto p-6">
            <PageHeading
                title="Changelog"
                description="What shipped, version by version."
            />
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <p className="text-sm text-gray-500">
                    Render <code>CHANGELOG.md</code> here — fetch it from the server or import it at build time.
                </p>
            </div>
        </div>
    );
}

function ReferenceView() {
    return (
        <div className="max-w-3xl mx-auto p-6">
            <PageHeading
                title="How To"
                description="How this app works — concepts, workflows, and answers."
            />
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <p className="text-sm text-gray-500">
                    Put the app's user-facing reference/help content here.
                </p>
            </div>
        </div>
    );
}

// Root boundary — the last line of defense. If the shell itself throws, the
// user still gets a recoverable screen, never a blank white page.
render(
    <ErrorBoundary>
        <App />
    </ErrorBoundary>,
    document.getElementById('app')!,
);
