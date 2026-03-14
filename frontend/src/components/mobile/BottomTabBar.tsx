'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { UserRole } from '@/lib/dashboard-types';
import { useHaptic } from '@/hooks/useHaptic';
import styles from './BottomTabBar.module.css';

interface TabItem {
  label: string;
  href: string;
  icon: string;
}

const userTabs: (TabItem | 'center')[] = [
  { label: 'Home', href: '/dashboard/user', icon: '🏠' },
  { label: 'Sessions', href: '/dashboard/user/sessions', icon: '📅' },
  'center',
  { label: 'Community', href: '/dashboard/user/community', icon: '💬' },
  { label: 'Profile', href: '/dashboard/user/profile', icon: '👤' },
];

const adminTabs: (TabItem | 'center')[] = [
  { label: 'Overview', href: '/dashboard/admin', icon: '📊' },
  { label: 'Users', href: '/dashboard/admin/users', icon: '👥' },
  { label: 'Specialists', href: '/dashboard/admin/specialists', icon: '🌟' },
  { label: 'Applications', href: '/dashboard/admin/applications', icon: '📋' },
  { label: 'Revenue', href: '/dashboard/admin/revenue', icon: '💰' },
];

const therapistTabs: (TabItem | 'center')[] = [
  { label: 'Home', href: '/dashboard/therapist', icon: '🏠' },
  { label: 'Clients', href: '/dashboard/therapist/clients', icon: '👥' },
  { label: 'Schedule', href: '/dashboard/therapist/schedule', icon: '📅' },
  { label: 'Notes', href: '/dashboard/therapist/notes', icon: '📝' },
  { label: 'Earnings', href: '/dashboard/therapist/earnings', icon: '💰' },
];

function getTabs(role: UserRole): (TabItem | 'center')[] {
  if (role === 'ADMIN') return adminTabs;
  if (['LIFE_COACH', 'HYPNOTHERAPIST', 'THERAPIST', 'MUSIC_TUTOR'].includes(role)) return therapistTabs;
  return userTabs;
}

function getRoleFromPath(pathname: string): UserRole {
  if (pathname?.startsWith('/dashboard/admin')) return 'ADMIN';
  if (pathname?.startsWith('/dashboard/therapist')) return 'LIFE_COACH';
  return 'USER';
}

interface BottomTabBarProps {
  role?: UserRole;
}

export default function BottomTabBar({ role: propRole }: BottomTabBarProps) {
  const pathname = usePathname() ?? '';
  const role = propRole ?? getRoleFromPath(pathname);
  const haptic = useHaptic();
  const tabs = getTabs(role);

  const handleTap = () => {
    haptic.light();
  };

  return (
    <nav className={styles.bar} aria-label="Bottom navigation">
      <div className={styles.nav}>
        {tabs.map((t, i) => {
          if (t === 'center') {
            const isHome = pathname === '/dashboard/user' || pathname === '/dashboard/user/';
            return (
              <div key="center" className={`${styles.centerWrap} ${isHome ? styles.active : ''}`}>
                <Link
                  href="/dashboard/user"
                  className={styles.centerBtn}
                  onClick={handleTap}
                  aria-label="Heal"
                >
                  ✨
                </Link>
                <span className={styles.centerLabel}>Heal</span>
              </div>
            );
          }
          const isActive = pathname === t.href || pathname?.startsWith(t.href + '/');
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`${styles.tab} ${isActive ? styles.active : ''}`}
              onClick={handleTap}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className={styles.tabIcon}>{t.icon}</span>
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
