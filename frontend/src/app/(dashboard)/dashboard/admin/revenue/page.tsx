'use client';

import { useIsMobile } from '@/hooks/useMediaQuery';
import { mockAdminPlatformStats } from '@/lib/mock-data';
import MiniChart from '@/components/dashboard/MiniChart';
import styles from './page.module.css';

export default function AdminRevenuePage() {
  const isMobile = useIsMobile();
  const s = mockAdminPlatformStats;
  if (!isMobile) return <div className={styles.desktop}><p>Revenue — resize to mobile.</p></div>;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <span className={styles.label}>Revenue today</span>
        <span className={styles.value}>£{s.revenueToday.toLocaleString()}</span>
        <span className={styles.delta}>+{s.revenueDeltaPercent}% vs yesterday</span>
      </div>
      <div className={styles.chartWrap}>
        <MiniChart data={s.revenueSparkline} height={80} width={320} color="var(--gold)" />
      </div>
      <div className={styles.card}>
        <span className={styles.label}>Revenue MTD</span>
        <span className={styles.value}>£{s.revenueMTD.toLocaleString()}</span>
      </div>
    </div>
  );
}
