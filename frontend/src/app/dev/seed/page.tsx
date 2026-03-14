'use client';

import { useState, useEffect } from 'react';

const API_BASE =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000')
    : 'http://localhost:3000';

export default function DevSeedPage() {
  const [seedResult, setSeedResult] = useState<Record<string, unknown> | null>(null);
  const [debugResult, setDebugResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [debugLoading, setDebugLoading] = useState(false);

  const handleSeed = async () => {
    setLoading(true);
    setSeedResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/dev/seed-testuser1`);
      setSeedResult(await res.json().catch(() => ({ error: 'non-JSON response' })));
    } catch (err) {
      setSeedResult({ ok: false, error: err instanceof Error ? err.message : 'Request failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleDebug = async () => {
    setDebugLoading(true);
    setDebugResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/dev/debug-testuser1`);
      setDebugResult(await res.json().catch(() => ({ error: 'non-JSON response' })));
    } catch (err) {
      setDebugResult({ error: err instanceof Error ? err.message : 'Request failed' });
    } finally {
      setDebugLoading(false);
    }
  };

  useEffect(() => { handleDebug(); }, []);

  const btnStyle = (color: string, disabled: boolean): React.CSSProperties => ({
    padding: '12px 24px',
    background: color,
    color: '#070C0A',
    border: 'none',
    borderRadius: 8,
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.7 : 1,
    marginRight: 12,
  });

  return (
    <div style={{ minHeight: '100vh', background: '#070C0A', color: '#F5F7F6', padding: 24, fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ fontSize: 22, marginBottom: 8 }}>Dev: Seed &amp; Debug testuser1</h1>
        <p style={{ color: '#9BAA9F', fontSize: 14, marginBottom: 8 }}>
          Backend: <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>{API_BASE}</code>
        </p>
        <p style={{ color: '#9BAA9F', fontSize: 13, marginBottom: 24 }}>
          Login: <strong>testuser1@test.btb.fit</strong> / <strong>TestUser@123</strong>
        </p>

        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <button type="button" onClick={handleDebug} disabled={debugLoading} style={btnStyle('#7BA4D4', debugLoading)}>
            {debugLoading ? 'Loading...' : 'Check DB State'}
          </button>
          <button type="button" onClick={handleSeed} disabled={loading} style={btnStyle('#5BB89A', loading)}>
            {loading ? 'Seeding...' : 'Seed testuser1'}
          </button>
        </div>

        {debugResult && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, marginBottom: 8, color: '#7BA4D4' }}>DB State</h2>
            <pre style={{ padding: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 8, fontSize: 12, overflow: 'auto', border: '1px solid #333', maxHeight: 400 }}>
              {JSON.stringify(debugResult, null, 2)}
            </pre>
          </div>
        )}

        {seedResult && (
          <div>
            <h2 style={{ fontSize: 16, marginBottom: 8, color: seedResult.ok ? '#5BB89A' : '#c53030' }}>Seed Result</h2>
            <pre style={{ padding: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 8, fontSize: 12, overflow: 'auto', border: `1px solid ${seedResult.ok ? '#5BB89A' : '#c53030'}`, maxHeight: 400 }}>
              {JSON.stringify(seedResult, null, 2)}
            </pre>
            {seedResult.ok && (
              <p style={{ marginTop: 12, color: '#5BB89A', fontSize: 14 }}>
                Done! Refresh the dashboard or <a href="/dashboard/user" style={{ color: '#7BA4D4', textDecoration: 'underline' }}>go to dashboard</a>.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
