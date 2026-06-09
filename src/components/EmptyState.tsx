// R7C Nav & Orientation Standard #4: empty states explain, they don't just
// sit there. Always pass a `message` that says what WILL appear here and how
// to make it appear — plus an action button when there's a next step.
interface EmptyStateProps {
    title?: string;
    /** What will show up here and how the user makes that happen. */
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{title || 'Nothing here yet'}</h3>
            {message && <p className="text-sm text-gray-500 max-w-xs">{message}</p>}
            {actionLabel && (
                <button
                    onClick={onAction}
                    className="mt-4 px-4 py-2 text-sm font-semibold text-[var(--shell-accent-fg)] bg-[var(--shell-accent)] hover:opacity-90 rounded-lg transition-opacity shadow-sm"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
