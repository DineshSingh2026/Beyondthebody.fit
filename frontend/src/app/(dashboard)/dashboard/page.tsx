'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, getToken } from '@/lib/api';

const SPECIALIST_ROLES = ['THERAPIST', 'LIFE_COACH', 'HYPNOTHERAPIST', 'MUSIC_TUTOR'];

export default function DashboardRootPage() {
  const router = useRouter();

  useEffect(() => {
    // No token at all → send to login
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
      .catch(() => {
        // Token invalid / expired → send to login
        router.replace('/login');
      });
  }, [router]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100dvh',
      background: '#0a1a0f',
    }}>
      <div style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        border: '3px solid #d4af37',
        borderTopColor: 'transparent',
        animation: 'btb-spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes btb-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
