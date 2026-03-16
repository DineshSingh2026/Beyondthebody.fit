'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { UserRole } from '@/lib/dashboard-types';
import NotificationPanel from '@/components/dashboard/NotificationPanel';
import styles from './TopAppBar.module.css';

const roleTitles: Record<string, string> = {
  '/dashboard/user': 'My Sanctuary',
  '/dashboard/user/sessions': 'Sessions',
  '/dashboard/user/specialists': 'My Specialists',
  '/dashboard/user/mood': 'Mood',
  '/dashboard/user/community': 'Community',
  '/dashboard/user/profile': 'Profile',
  '/dashboard/admin': 'Command Centre',
  '/dashboard/admin/users': 'Users',
  '/dashboard/admin/specialists': 'Specialists',
  '/dashboard/admin/applications': 'Applications',
  '/dashboard/admin/revenue': 'Revenue',
  '/dashboard/therapist': 'My Practice',
  '/dashboard/therapist/clients': 'Clients',
  '/dashboard/therapist/schedule': 'Schedule',
  '/dashboard/therapist/notes': 'Notes',
  '/dashboard/therapist/earnings': 'Earnings',
};

function getTitle(pathname: string): string {
  const exact = roleTitles[pathname];
  if (exact) return exact;
  if (pathname?.startsWith('/dashboard/user')) return 'My Sanctuary';
  if (pathname?.startsWith('/dashboard/admin')) return 'Command Centre';
  if (pathname?.startsWith('/dashboard/therapist')) return 'My Practice';
  return 'Beyond The Body';
}

function showBack(pathname: string): boolean {
  const base = pathname?.replace(/\/$/, '') || '';
  const roots = ['/dashboard/user', '/dashboard/admin', '/dashboard/therapist'];
  if (roots.includes(base)) return false;
  return pathname?.startsWith('/dashboard') ?? false;
}

interface TopAppBarProps {
  title?: string;
  role?: UserRole;
  userName?: string;
}

export default function TopAppBar({
  title,
  role = 'USER',
  userName = 'Alex',
}: TopAppBarProps) {
  const router = useRouter();
  const pathname = usePathname() ?? '';
  const [scrolled, setScrolled] = useState(false);

  const displayTitle = title ?? getTitle(pathname);
  const canBack = showBack(pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className={`${styles.bar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.left}>
        {canBack ? (
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => router.back()}
            aria-label="Back"
          >
            ←
          </button>
        ) : (
          <div className={styles.logoRing}>B</div>
        )}
        <h1 className={styles.title}>{displayTitle}</h1>
      </div>
      <div className={styles.right}>
        {/* Live notification panel — opens downward since bar is at top of screen */}
        <NotificationPanel role={role} direction="down" />
        <div className={styles.avatar}>{initials}</div>
      </div>
    </header>
  );
}
