// Fetch wrapper for Hono API calls.
// In dev, Vite proxies /api/* to localhost:3000.
// In production, Caddy proxies /api/* to the Hono container.
//
// R7C Fault-Isolation Standard: every call is time-boxed with an AbortController
// so a hung backend can't freeze the UI, and idempotent GETs retry with backoff
// so a transient blip doesn't surface as a hard failure. Writes never auto-retry
// (a retried POST could double-submit). See docs/fault-isolation-standard.md.

const API_BASE = '';  // Same origin — no need to specify host

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_GET_RETRIES = 2;        // idempotent reads only
const RETRY_BASE_DELAY_MS = 300;

/** Typed API error — carries the HTTP status and parsed body for callers. */
export class ApiError extends Error {
    status: number;
    body?: unknown;
    constructor(message: string, status: number, body?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.body = body;
    }
}

interface ApiOptions {
    method?: string;
    body?: unknown;
    token?: string;
    /** Per-call timeout override (ms). Default 10s. */
    timeoutMs?: number;
    /** Retry count for idempotent GETs. Default 2. Forced to 0 for writes. */
    retries?: number;
    /** External AbortSignal to cancel (e.g. on unmount / route change). */
    signal?: AbortSignal;
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function api<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
    const {
        method = 'GET',
        body,
        token,
        timeoutMs = DEFAULT_TIMEOUT_MS,
        retries = method === 'GET' ? DEFAULT_GET_RETRIES : 0,
        signal: externalSignal,
    } = options;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let lastErr: unknown;
    for (let attempt = 0; attempt <= retries; attempt++) {
        // Time-box each attempt; fold in the caller's cancel signal.
        const timeout = new AbortController();
        const timer = setTimeout(() => timeout.abort(), timeoutMs);
        const onExternalAbort = () => timeout.abort();
        externalSignal?.addEventListener('abort', onExternalAbort);

        try {
            const res = await fetch(`${API_BASE}${path}`, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined,
                signal: timeout.signal,
            });

            const data = (await res.json().catch(() => ({}))) as { error?: string };
            if (!res.ok) {
                const err = new ApiError(data.error || `API error: ${res.status}`, res.status, data);
                // 5xx may be transient → retry a GET; 4xx is the caller's fault → fail fast.
                if (res.status >= 500 && attempt < retries) {
                    lastErr = err;
                    await sleep(RETRY_BASE_DELAY_MS * 2 ** attempt);
                    continue;
                }
                throw err;
            }
            return data as T;
        } catch (err) {
            lastErr = err;
            // Caller-initiated cancellation and 4xx errors are terminal — don't retry.
            if (externalSignal?.aborted) throw err;
            if (err instanceof ApiError && err.status < 500) throw err;
            if (attempt < retries) {
                await sleep(RETRY_BASE_DELAY_MS * 2 ** attempt);
                continue;
            }
        } finally {
            clearTimeout(timer);
            externalSignal?.removeEventListener('abort', onExternalAbort);
        }
    }

    if (lastErr instanceof Error) throw lastErr;
    throw new Error(`API request failed: ${path}`);
}

// Convenience methods
export const get    = <T = unknown>(path: string, opts?: ApiOptions) => api<T>(path, { ...opts, method: 'GET' });
export const post   = <T = unknown>(path: string, body: unknown, opts?: ApiOptions) => api<T>(path, { ...opts, method: 'POST', body });
export const put    = <T = unknown>(path: string, body: unknown, opts?: ApiOptions) => api<T>(path, { ...opts, method: 'PUT', body });
export const del    = <T = unknown>(path: string, opts?: ApiOptions) => api<T>(path, { ...opts, method: 'DELETE' });
