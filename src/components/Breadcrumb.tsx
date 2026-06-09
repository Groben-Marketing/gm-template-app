// ─── Breadcrumb ────────────────────────────────────────────────────────
//
// R7C Nav & Orientation Standard #9: nested views always carry a
// back-affordance. Render at the top of any view that lives "inside" a
// nav item (detail pages, wizards, drill-downs) so the user can see where
// they are and step back without the browser button.
//
// The last item is the current page: no link, `aria-current="page"`.

export interface Crumb {
    label: string;
    /** Omit on the final (current-page) crumb. */
    href?: string;
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
    return (
        <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-1.5 text-sm">
                {items.map((item, i) => {
                    const last = i === items.length - 1;
                    return (
                        <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
                            {i > 0 && (
                                <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            )}
                            {last || !item.href ? (
                                <span aria-current={last ? 'page' : undefined} className="font-medium text-gray-900">
                                    {item.label}
                                </span>
                            ) : (
                                <a href={item.href} className="text-gray-500 hover:text-[var(--shell-accent-strong)] transition-colors">
                                    {item.label}
                                </a>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
