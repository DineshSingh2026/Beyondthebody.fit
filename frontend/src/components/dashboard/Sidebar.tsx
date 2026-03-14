'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import type { UserRole } from '@/lib/dashboard-types';
import HealingScoreRing from './HealingScoreRing';
import styles from './Sidebar.module.css';

interface NavSection {
  title: string;
  items: { label: string; href: string }[];
}

const userNav: NavSection[] = [
  { title: 'My Sanctuary', items: [{ label: 'Dashboard', href: '/dashboard/user' }] },
  { title: 'Sessions', items: [{ label: 'Upcoming', href: '/dashboard/user#sessions' }, { label: 'Past', href: '/dashboard/user#past' }] },
  { title: 'Wellness', items: [{ label: 'Mood Tracker', href: '/dashboard/user#mood' }, { label: 'Milestones', href: '/dashboard/user#milestones' }] },
  { title: 'Community', items: [{ label: 'Feed', href: '/dashboard/user#community' }] },
  { title: 'Support', items: [{ label: 'Resources', href: '/dashboard/user#support' }] },
];

const adminNav: NavSection[] = [
  { title: 'Platform', items: [{ label: 'Overview', href: '/dashboard/admin' }, { label: 'Analytics', href: '/dashboard/admin#analytics' }, { label: 'Revenue', href: '/dashboard/admin#revenue' }] },
  { title: 'People', items: [{ label: 'All Users', href: '/dashboard/admin#users' }, { label: 'All Specialists', href: '/dashboard/admin#specialists' }, { label: 'Applications', href: '/dashboard/admin#applications' }] },
  { title: 'Content', items: [{ label: 'Sessions', href: '/dashboard/admin#sessions' }, { label: 'Resources', href: '/dashboard/admin#resources' }, { label: 'Brain Tips', href: '/dashboard/admin#brain-tips' }] },
  { title: 'System', items: [{ label: 'Settings', href: '/dashboard/admin#settings' }, { label: 'Integrations', href: '/dashboard/admin#integrations' }, { label: 'Logs', href: '/dashboard/admin#logs' }] },
];

const therapistNav: NavSection[] = [
  { title: 'My Practice', items: [{ label: 'Overview', href: '/dashboard/therapist' }, { label: 'My Clients', href: '/dashboard/therapist#clients' }, { label: 'Sessions', href: '/dashboard/therapist#sessions' }, { label: 'Notes', href: '/dashboard/therapist#notes' }] },
  { title: 'Schedule', items: [{ label: 'Calendar', href: '/dashboard/therapist#calendar' }, { label: 'Availability', href: '/dashboard/therapist#availability' }, { label: 'Requests', href: '/dashboard/therapist#requests' }] },
  { title: 'Progress', items: [{ label: 'Client Outcomes', href: '/dashboard/therapist#outcomes' }, { label: 'Reviews', href: '/dashboard/therapist#reviews' }, { label: 'Milestones', href: '/dashboard/therapist#milestones' }] },
  { title: 'Resources', items: [{ label: 'My Toolkit', href: '/dashboard/therapist#toolkit' }, { label: 'Brain Tips', href: '/dashboard/therapist#brain-tips' }, { label: 'Documents', href: '/dashboard/therapist#documents' }] },
  { title: 'Account', items: [{ label: 'Profile', href: '/dashboard/therapist#profile' }, { label: 'Earnings', href: '/dashboard/therapist#earnings' }, { label: 'Settings', href: '/dashboard/therapist#settings' }] },
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
  const nav = getNav(role);
  const showHealingRing = role === 'USER' && healingScore > 0;
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoRing}>B</div>
        <span className={styles.logoText}>Beyond <em>The Body</em></span>
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
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '#');
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
    </aside>
  );
}
