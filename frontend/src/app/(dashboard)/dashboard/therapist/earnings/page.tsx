'use client';

import { useIsMobile } from '@/hooks/useMediaQuery';
import { mockTherapistDashboard } from '@/lib/mock-data';
import type { SpecialistType } from '@/lib/dashboard-types';
import styles from './page.module.css';

export default function TherapistEarningsPage() {
  const isMobile = useIsMobile();
  const d = mockTherapistDashboard('THERAPIST' as SpecialistType);
  const eb = d.earningsBreakdown;

  if (!isMobile) return <div className={styles.desktop}><p>Earnings — resize to mobile.</p></div>;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <span className={styles.label}>This month</span>
        <span className={styles.value}>£{d.earningsThisMonth.toLocaleString()}</span>
      </div>
      <div className={styles.breakdown}>
        <p>{eb.sessionsCount} sessions × £{eb.rate}</p>
        <p>Pending: £{eb.pendingPayout}</p>
        <p>Paid out: £{eb.paidOut}</p>
      </div>
    </div>
  );
}
