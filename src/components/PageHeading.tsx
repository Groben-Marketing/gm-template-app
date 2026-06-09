import type { ComponentChildren } from 'preact';
import { Breadcrumb, type Crumb } from './Breadcrumb';

// ─── PageHeading ───────────────────────────────────────────────────────
//
// R7C Nav & Orientation Standard #4: every view opens by answering
// "what can I do here?". Use this at the top of EVERY routed view —
// title states the place, description states the job to be done there.
//
// Pass `crumbs` on nested views (standard #9) and `actions` for the
// view's primary action button(s) so they always sit in the same spot.

interface PageHeadingProps {
    title: string;
    /** One sentence: what the user does on this view. Not marketing copy. */
    description?: string;
    /** Breadcrumb trail for nested views — last item is the current page. */
    crumbs?: Crumb[];
    /** Primary action button(s), right-aligned next to the title. */
    actions?: ComponentChildren;
}

export function PageHeading({ title, description, crumbs, actions }: PageHeadingProps) {
    return (
        <div className="mb-8">
            {crumbs && crumbs.length > 0 && <Breadcrumb items={crumbs} />}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
                    {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
                </div>
                {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
            </div>
        </div>
    );
}
