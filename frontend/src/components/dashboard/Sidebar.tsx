'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { clearToken } from '@/lib/api';
import type { UserRole } from '@/lib/dashboard-types';
import HealingScoreRing from './HealingScoreRing';
import styles from './Sidebar.module.css';

interface NavSection {
  title: string;
  items: { label: string; href: string }[];
}

const userNav: NavSection[] = [
  { title: 'My Sanctuary', items: [{ label: 'Dashboard', href: '/dashboard/user' }] },
  { title: 'Specialists', items: [{ label: 'Find a Specialist', href: '/dashboard/user/specialists' }, { label: 'My Specialists', href: '/dashboard/user' }, { label: 'Messages', href: '/dashboard/user/messages' }] },
  { title: 'Sessions', items: [{ label: 'Upcoming & Past', href: '/dashboard/user/sessions' }] },
  { title: 'Wellness', items: [{ label: 'Mood Tracker', href: '/dashboard/user/mood' }, { label: 'Brain Tips', href: '/dashboard/user/tips' }, { label: 'Profile', href: '/dashboard/user/profile' }] },
  { title: 'Community', items: [{ label: 'Feed', href: '/dashboard/user/community' }] },
];

const adminNav: NavSection[] = [
  { title: 'Platform', items: [{ label: 'Overview', href: '/dashboard/admin' }, { label: 'Revenue', href: '/dashboard/admin/revenue' }] },
  { title: 'People', items: [{ label: 'All Users', href: '/dashboard/admin/users' }, { label: 'All Specialists', href: '/dashboard/admin/specialists' }, { label: 'Add Therapist', href: '/dashboard/admin/specialists/add' }, { label: 'Applications', href: '/dashboard/admin/applications' }] },
  { title: 'Content', items: [{ label: 'Sessions', href: '/dashboard/admin' }, { label: 'Schedule call', href: '/dashboard/admin/schedule' }] },
  { title: 'Account', items: [{ label: 'Profile', href: '/dashboard/admin/profile' }] },
];

const therapistNav: NavSection[] = [
  { title: 'My Practice', items: [{ label: 'Overview', href: '/dashboard/therapist' }, { label: 'My Clients', href: '/dashboard/therapist/clients' }, { label: 'Notes', href: '/dashboard/therapist/notes' }] },
  { title: 'Schedule', items: [{ label: 'Calendar & Requests', href: '/dashboard/therapist/schedule' }, { label: 'Messages', href: '/dashboard/therapist/messages' }] },
  { title: 'Account', items: [{ label: 'Earnings', href: '/dashboard/therapist/earnings' }, { label: 'Profile', href: '/dashboard/therapist/profile' }] },
];

function getNav(role: UserRole): NavSection[] {
  if (role === 'ADMIN') return adminNav;
  if (['LIFE_COACH', 'HYPNOTHERAPIST', 'THERAPIST', 'MUSIC_TUTOR'].includes(role)) return therapistNav;
  return userNav;
}

interface SidebarProps {
  role: UserRole;
  healingScore?: number;
}

export default function Sidebar({ role, healingScore = 0 }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const nav = getNav(role);
  const showHealingRing = role === 'USER' && healingScore > 0;

  const handleLogout = () => {
    clearToken();
    router.push('/');
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <img
          src="/img/btb-logo.png"
          alt="Beyond The Body"
          className={styles.logoImg}
        />
      </div>
      {showHealingRing && (
        <div className={styles.scoreWrap}>
          <HealingScoreRing score={healingScore} size={88} />
        </div>
      )}
      <nav className={styles.nav}>
        {nav.map((section, i) => (
          <div key={section.title} className={styles.section}>
            <span className={styles.sectionTitle}>{section.title}</span>
            <ul>
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href.length > 0 && pathname?.startsWith(item.href + '/'));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`${styles.link} ${isActive ? styles.active : ''}`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className={styles.footer}>
        <button type="button" className={styles.logout} onClick={handleLogout}>
          <span className={styles.logoutIcon}>⏻</span>
          Log out
        </button>
      </div>
    </aside>
  );
}
