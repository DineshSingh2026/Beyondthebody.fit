'use client';

import { useState } from 'react';

const API_BASE =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000')
    : 'http://localhost:3000';

export default function DevSeedPage() {
  const [result, setResult] = useState<{ ok?: boolean; message?: string; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSeed = async () => {
    setLoading(true);
    setResult(null);
    try {
      const url = `${API_BASE}/api/dev/seed-testuser1`;
      const res = await fetch(url);
      const data = await res.json().catch(() => ({}));
      setResult(data);
    } catch (err) {
      setResult({
        ok: false,
        error: err instanceof Error ? err.message : 'Request failed. Is the API running and CORS allowed?',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--dark, #070C0A)',
        color: 'var(--text, #F5F7F6)',
        padding: 24,
        fontFamily: 'var(--font-body, sans-serif)',
      }}
    >
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <h1 style={{ fontSize: 20, marginBottom: 8 }}>Seed test user (dev / live)</h1>
        <p style={{ color: 'var(--text-muted, #9BAA9F)', fontSize: 14, marginBottom: 24 }}>
          Calls the backend to fill <strong>testuser1@test.btb.fit</strong> with sessions, mood, milestones,
          community posts, and upcoming sessions — same data you see locally. Use after deploy so the live
          dashboard shows the presentation data.
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          Backend: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: 4 }}>{API_BASE}</code>
        </p>
        <button
          type="button"
          onClick={handleSeed}
          disabled={loading}
          style={{
            padding: '12px 24px',
            background: 'var(--green, #5BB89A)',
            color: 'var(--dark)',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Calling API…' : 'Seed testuser1'}
        </button>
        {result && (
          <pre
            style={{
              marginTop: 24,
              padding: 16,
              background: 'rgba(0,0,0,0.3)',
              borderRadius: 8,
              fontSize: 13,
              overflow: 'auto',
              border: `1px solid ${result.ok ? 'var(--green)' : 'var(--error, #c53030)'}`,
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
        {result?.ok && (
          <p style={{ marginTop: 16, color: 'var(--green)', fontSize: 14 }}>
            Done. Log in as <strong>testuser1@test.btb.fit</strong> / <strong>TestUser@123</strong> and refresh the dashboard.
          </p>
        )}
      </div>
    </div>
  );
}
