import { Component, type ComponentChildren, type VNode } from 'preact';

// R7C Fault-Isolation Standard — the SPA error-boundary primitive.
// Wrap the app shell AND each routed view so a render/runtime error in one view
// degrades to a recoverable fallback instead of unmounting the whole SPA to a
// blank white screen. This is the "fail by itself" rule made real on the client:
// one view's crash must not cascade to the rest of the app.
// See docs/fault-isolation-standard.md.
//
// Usage — wrap once at the root, and again around each routed view:
//   <ErrorBoundary><App /></ErrorBoundary>
//   <ErrorBoundary label={view}>{renderView()}</ErrorBoundary>

interface ErrorBoundaryProps {
    children: ComponentChildren;
    /** Shown in the fallback + logged, so you know WHICH boundary caught it. */
    label?: string;
    /** Custom fallback. Receives the error + a reset() to retry the subtree. */
    fallback?: (error: Error, reset: () => void) => VNode;
    /** Report hook (Sentry, console, an /api/client-error route). */
    onError?: (error: Error, info: { label?: string }) => void;
}

interface ErrorBoundaryState {
    error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { error: null };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { error };
    }

    componentDidCatch(error: Error) {
        // Never swallow silently — log so the failure is visible, then render the
        // fallback. The rest of the app keeps running.
        const tag = this.props.label ? ` ${this.props.label}` : '';
        console.error(`[ErrorBoundary${tag}]`, error);
        this.props.onError?.(error, { label: this.props.label });
    }

    reset = () => this.setState({ error: null });

    render() {
        const { error } = this.state;
        if (!error) return this.props.children;
        if (this.props.fallback) return this.props.fallback(error, this.reset);

        return (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Something went wrong</h3>
                <p className="text-sm text-gray-500 max-w-xs">
                    {this.props.label
                        ? `The ${this.props.label} view hit an unexpected error. The rest of the app is still working.`
                        : 'This section hit an unexpected error. The rest of the app is still working.'}
                </p>
                <button
                    onClick={this.reset}
                    className="mt-4 px-4 py-2 text-sm font-semibold text-[var(--shell-accent-fg)] bg-[var(--shell-accent)] hover:opacity-90 rounded-lg transition-opacity shadow-sm"
                >
                    Try again
                </button>
            </div>
        );
    }
}
