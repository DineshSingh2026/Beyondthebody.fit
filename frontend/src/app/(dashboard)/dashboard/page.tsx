'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getToken } from '@/lib/api';

const SPECIALIST_ROLES = ['THERAPIST', 'LIFE_COACH', 'HYPNOTHERAPIST', 'MUSIC_TUTOR'];

export default function DashboardRootPage() {
  const router = useRouter();
  const [retries, setRetries] = useState(0);

  useEffect(() => {
    // No token at all → send to login immediately
    if (!getToken()) {
      router.replace('/login');
      return;
    }

    api.getMe()
      .then((me) => {
        if (me.role === 'ADMIN') {
          router.replace('/dashboard/admin');
        } else if (SPECIALIST_ROLES.includes(me.role)) {
          router.replace('/dashboard/therapist');
        } else {
          router.replace('/dashboard/user');
        }
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        // Only force-logout on clear auth failures, not network errors
        if (msg.includes('401') || msg.includes('403') || msg.includes('Unauthorized') || msg.includes('Forbidden')) {
          router.replace('/login');
        } else if (retries < 3) {
          // Retry up to 3 times for transient network errors
          setTimeout(() => setRetries((r) => r + 1), 1500);
        } else {
          // After 3 retries still failing → go to login but preserve token
          router.replace('/login');
        }
      });
  }, [router, retries]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100dvh',
      background: '#0a1a0f',
      gap: 16,
    }}>
      <div style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        border: '3px solid #d4af37',
        borderTopColor: 'transparent',
        animation: 'btb-spin 0.8s linear infinite',
      }} />
      {retries > 0 && (
        <p style={{ color: '#9ca89e', fontSize: 13 }}>Reconnecting…</p>
      )}
      <style>{`@keyframes btb-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
