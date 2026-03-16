'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import type { UserRole } from '@/lib/dashboard-types';
import { clearToken } from '@/lib/api';
import NotificationPanel from '@/components/dashboard/NotificationPanel';
import styles from './TopAppBar.module.css';

const roleTitles: Record<string, string> = {
  '/dashboard/user': 'My Sanctuary',
  '/dashboard/user/sessions': 'Sessions',
  '/dashboard/user/specialists': 'My Specialists',
  '/dashboard/user/mood': 'Mood',
  '/dashboard/user/community': 'Community',
  '/dashboard/user/profile': 'Profile',
  '/dashboard/user/messages': 'Messages',
  '/dashboard/admin': 'Command Centre',
  '/dashboard/admin/users': 'Users',
  '/dashboard/admin/specialists': 'Specialists',
  '/dashboard/admin/applications': 'Applications',
  '/dashboard/admin/revenue': 'Revenue',
  '/dashboard/admin/schedule': 'Schedule Call',
  '/dashboard/therapist': 'My Practice',
  '/dashboard/therapist/clients': 'Clients',
  '/dashboard/therapist/schedule': 'Schedule',
  '/dashboard/therapist/notes': 'Notes',
  '/dashboard/therapist/earnings': 'Earnings',
  '/dashboard/therapist/messages': 'Messages',
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
  userName = '',
}: TopAppBarProps) {
  const router = useRouter();
  const pathname = usePathname() ?? '';
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayTitle = title ?? getTitle(pathname);
  const canBack = showBack(pathname);

  const initials = userName
    ? userName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on outside tap
  useEffect(() => {
    if (!menuOpen) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    clearToken();
    setMenuOpen(false);
    router.push('/login');
  };

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
        <NotificationPanel role={role} direction="down" />

        {/* Avatar — tapping opens logout menu */}
        <div className={styles.avatarWrap} ref={menuRef}>
          <button
            type="button"
            className={styles.avatar}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Account menu"
            aria-expanded={menuOpen}
          >
            {initials}
          </button>

          {menuOpen && (
            <div className={styles.menu}>
              {userName && (
                <div className={styles.menuUser}>
                  <span className={styles.menuName}>{userName}</span>
                  <span className={styles.menuRole}>{role?.replace('_', ' ')}</span>
                </div>
              )}
              <button
                type="button"
                className={styles.menuLogout}
                onClick={handleLogout}
              >
                <span>⏻</span>
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
