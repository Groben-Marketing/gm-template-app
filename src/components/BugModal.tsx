import { useState } from 'preact/hooks';
import { captureAndSubmit } from '@wayfinder/bug-reporter/client';

// Reusable "Report a Bug" modal (r7c app-clients epic). Wired to the TopNav's
// `onBugReport` button. Captures the current route/build/browser automatically
// and POSTs to the app's own `/api/bug-report`, which signs + forwards the
// report to Workbench (see server: mountBugReporter). No secret in the browser.
//
// Self-contained inline styles so it drops into any app without CSS wiring.

const SEVERITIES = ['minor', 'normal', 'blocking'] as const;

export function BugModal({ buildTag, endpoint = '/api/bug-report', onClose }: {
    buildTag?: string;
    endpoint?: string;
    onClose: () => void;
}) {
    const [what, setWhat] = useState('');
    const [severity, setSeverity] = useState<string>('normal');
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState<string | null>(null);

    async function submit() {
        if (!what.trim() || busy) return;
        setBusy(true);
        try {
            const res = await captureAndSubmit(endpoint, { what: what.trim(), severity }, { buildTag });
            setDone(res.ok ? 'Thanks — the team has it.' : 'Saved, but the report may not have reached us.');
        } catch {
            setDone('Could not send the report. Please try again.');
        }
        setBusy(false);
    }

    return (
        <div role="dialog" aria-modal="true" style={scrim} onClick={onClose}>
            <div style={modal} onClick={e => e.stopPropagation()}>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Report a bug</div>
                {done ? (
                    <>
                        <p style={{ fontSize: 13, color: '#444', margin: '10px 0 16px' }}>{done}</p>
                        <div style={row}><button style={primaryBtn} onClick={onClose}>Close</button></div>
                    </>
                ) : (
                    <>
                        <p style={{ fontSize: 12, color: '#666', margin: '0 0 12px' }}>
                            Page, build, browser and time are captured automatically.
                        </p>
                        <textarea
                            rows={4} value={what} placeholder="What happened? What did you expect instead?"
                            onInput={e => setWhat((e.target as HTMLTextAreaElement).value)}
                            style={textarea}
                        />
                        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                            {SEVERITIES.map(s => (
                                <button key={s} onClick={() => setSeverity(s)}
                                    style={{ ...chip, ...(severity === s ? chipOn : {}) }}>{s}</button>
                            ))}
                        </div>
                        <div style={{ ...row, marginTop: 14 }}>
                            <button style={ghostBtn} onClick={onClose}>Cancel</button>
                            <button style={{ ...primaryBtn, opacity: busy || !what.trim() ? 0.5 : 1 }}
                                disabled={busy || !what.trim()} onClick={submit}>
                                {busy ? 'Sending…' : 'Send report'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

const scrim = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 } as const;
const modal = { background: '#fff', color: '#111', borderRadius: 12, padding: 20, width: 'min(440px, 92vw)', boxShadow: '0 10px 40px rgba(0,0,0,0.25)' } as const;
const textarea = { width: '100%', boxSizing: 'border-box', border: '1px solid #d0d0d0', borderRadius: 8, padding: 8, fontSize: 14, resize: 'vertical' } as const;
const row = { display: 'flex', gap: 8, justifyContent: 'flex-end' } as const;
const chip = { border: '1px solid #d0d0d0', background: '#fff', borderRadius: 999, padding: '4px 12px', fontSize: 12, cursor: 'pointer' } as const;
const chipOn = { background: '#111', color: '#fff', borderColor: '#111' } as const;
const primaryBtn = { background: '#111', color: '#fff', border: 'none', borderRadius: 999, padding: '8px 16px', fontSize: 13, cursor: 'pointer' } as const;
const ghostBtn = { background: 'transparent', color: '#444', border: '1px solid #d0d0d0', borderRadius: 999, padding: '8px 16px', fontSize: 13, cursor: 'pointer' } as const;
