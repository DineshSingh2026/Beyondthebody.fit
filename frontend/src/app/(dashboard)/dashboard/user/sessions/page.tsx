'use client';

import { useIsMobile } from '@/hooks/useMediaQuery';
import { mockUserDashboard } from '@/lib/mock-data';
import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import HapticButton from '@/components/mobile/HapticButton';
import SwipeableRow from '@/components/mobile/SwipeableRow';
import styles from './page.module.css';

export default function UserSessionsPage() {
  const isMobile = useIsMobile();
  const d = mockUserDashboard;

  if (!isMobile) {
    return (
      <div className={styles.desktop}>
        <p>Use the sidebar to view upcoming and past sessions, or resize to mobile to see the sessions list.</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.chips}>
        <button type="button" className={`${styles.chip} ${styles.active}`}>All</button>
        <button type="button" className={styles.chip}>Upcoming</button>
        <button type="button" className={styles.chip}>Completed</button>
        <button type="button" className={styles.chip}>Cancelled</button>
      </div>
      <div className={styles.list}>
        {d.upcomingSessions.map((s) => (
          <SwipeableRow
            key={s.id}
            leftAction={{ label: 'Reschedule', onClick: () => {} }}
            rightAction={{ label: 'Cancel', onClick: () => {}, variant: 'danger' }}
          >
            <div className={styles.sessionRow}>
              <span className={styles.time}>{s.time}</span>
              <Avatar name={s.specialistName} size="md" />
              <div className={styles.meta}>
                <span className={styles.name}>{s.specialistName}</span>
                <Badge variant="gold">{s.type}</Badge>
              </div>
              <span className={styles.chevron}>›</span>
            </div>
          </SwipeableRow>
        ))}
      </div>
      <Link href="/dashboard/user/sessions" className={styles.fab}>
        <span>+</span>
      </Link>
    </div>
  );
}
