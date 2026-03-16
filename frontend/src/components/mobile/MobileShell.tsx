'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { UserRole } from '@/lib/dashboard-types';
import { api } from '@/lib/api';
import TopAppBar from './TopAppBar';
import BottomTabBar from './BottomTabBar';
import InstallPrompt from './InstallPrompt';
import styles from './MobileShell.module.css';

function getRoleFromPath(pathname: string): UserRole {
  if (pathname?.startsWith('/dashboard/admin')) return 'ADMIN';
  if (pathname?.startsWith('/dashboard/therapist')) return 'LIFE_COACH';
  return 'USER';
}

export default function MobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '';
  const pathRole = getRoleFromPath(pathname);

  const [role, setRole] = useState<UserRole>(pathRole);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    api.getMe()
      .then((me) => {
        setUserName(me.name);
        if (me.role === 'ADMIN') setRole('ADMIN');
        else if (['THERAPIST', 'LIFE_COACH', 'HYPNOTHERAPIST', 'MUSIC_TUTOR'].includes(me.role)) {
          setRole(me.role as UserRole);
        } else {
          setRole('USER');
        }
      })
      .catch(() => {
        // No auth — keep path-based role, empty name
      });
  }, []);

  // Keep role in sync with path changes (e.g. admin navigates to sub-pages)
  useEffect(() => {
    setRole((prev) => {
      // If we already got the real role from API, don't override with path guess
      if (prev === 'USER' && pathRole !== 'USER') return pathRole;
      if (prev === 'LIFE_COACH' && pathRole === 'ADMIN') return pathRole;
      return prev;
    });
  }, [pathRole]);

  return (
    <div className={styles.wrap}>
      <TopAppBar role={role} userName={userName} />
      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>
      <BottomTabBar role={role} />
      <InstallPrompt />
    </div>
  );
}
