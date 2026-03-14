'use client';

import { useIsMobile } from '@/hooks/useMediaQuery';
import { mockTherapistDashboard } from '@/lib/mock-data';
import type { SpecialistType } from '@/lib/dashboard-types';
import styles from './page.module.css';

export default function TherapistNotesPage() {
  const isMobile = useIsMobile();
  const d = mockTherapistDashboard('THERAPIST' as SpecialistType);

  if (!isMobile) return <div className={styles.desktop}><p>Notes — resize to mobile.</p></div>;

  return (
    <div className={styles.page}>
      {d.recentNotes.map((n) => (
        <div key={n.id} className={styles.card}>
          <span className={styles.client}>{n.clientName}</span>
          <span className={styles.date}>{n.date}</span>
          <p className={styles.preview}>{n.preview}</p>
        </div>
      ))}
    </div>
  );
}
