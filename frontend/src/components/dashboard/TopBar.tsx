'use client';

import type { UserRole } from '@/lib/dashboard-types';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import NotificationPanel from './NotificationPanel';
import styles from './TopBar.module.css';

const roleLabel: Record<string, string> = {
  USER: 'Member',
  ADMIN: 'Platform Admin',
  LIFE_COACH: 'Life Coach',
  HYPNOTHERAPIST: 'Hypnotherapist',
  THERAPIST: 'Therapist',
  MUSIC_TUTOR: 'Music Tutor',
};

const roleBadgeVariant: Record<string, 'gold' | 'green' | 'purple' | 'teal' | 'muted'> = {
  LIFE_COACH: 'gold',
  HYPNOTHERAPIST: 'purple',
  THERAPIST: 'green',
  MUSIC_TUTOR: 'teal',
  ADMIN: 'muted',
  USER: 'muted',
};

interface TopBarProps {
  role: UserRole;
  userName: string;
  subtitle?: string;
  showPulse?: boolean;
  nextSessionIn?: string;
}

export default function TopBar({
  role,
  userName,
  subtitle,
  showPulse = true,
  nextSessionIn,
}: TopBarProps) {
  const isAdmin = role === 'ADMIN';
  const isSpecialist = ['LIFE_COACH', 'HYPNOTHERAPIST', 'THERAPIST', 'MUSIC_TUTOR'].includes(role);
  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <h1 className={styles.greeting}>
          {isAdmin ? (
            <>
              <span className={styles.main}>Admin Command Centre</span>
            </>
          ) : (
            <>
              <span className={styles.main}>Welcome back, {userName}</span>
              {subtitle && <span className={styles.sub}>{subtitle}</span>}
            </>
          )}
        </h1>
        {showPulse && (
          <span className={styles.pulse} title="Live">
            <span className={styles.pulseDot} />
            Live
          </span>
        )}
        {nextSessionIn && isSpecialist && (
          <span className={styles.nextSession}>Next session in {nextSessionIn}</span>
        )}
      </div>
      <div className={styles.right}>
        <NotificationPanel />
        <div className={styles.user}>
          <Avatar name={userName} size="md" />
          <div className={styles.userMeta}>
            <span className={styles.userName}>{userName}</span>
            <Badge variant={roleBadgeVariant[role] || 'muted'}>{roleLabel[role] || role}</Badge>
          </div>
        </div>
      </div>
    </header>
  );
}
