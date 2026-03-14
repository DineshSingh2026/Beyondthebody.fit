'use client';

import { useIsMobile } from '@/hooks/useMediaQuery';
import { mockTherapistDashboard } from '@/lib/mock-data';
import Avatar from '@/components/ui/Avatar';
import type { SpecialistType } from '@/lib/dashboard-types';
import styles from './page.module.css';

export default function TherapistClientsPage() {
  const isMobile = useIsMobile();
  const d = mockTherapistDashboard('THERAPIST' as SpecialistType);

  if (!isMobile) {
    return <div className={styles.desktop}><p>Clients — resize to mobile.</p></div>;
  }

  return (
    <div className={styles.page}>
      {d.clients.map((c) => (
        <div key={c.id} className={styles.card}>
          <Avatar name={c.name} size="md" />
          <div className={styles.info}>
            <span className={styles.name}>{c.name}</span>
            <span className={styles.meta}>{c.sessionCount} sessions · Last {c.lastSessionDate}</span>
          </div>
          <span className={styles.chevron}>›</span>
        </div>
      ))}
    </div>
  );
}
