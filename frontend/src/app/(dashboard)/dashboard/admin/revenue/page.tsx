'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { api } from '@/lib/api';
import MiniChart from '@/components/dashboard/MiniChart';
import type { AdminPlatformStats } from '@/lib/dashboard-types';
import styles from './page.module.css';

export default function AdminRevenuePage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [stats, setStats] = useState<AdminPlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMe().then((me) => { if (me.role !== 'ADMIN') router.replace('/dashboard/admin'); }).catch(() => {});
    api.getAdminPlatformStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading || !stats) {
    return (
      <div className={styles.page}>
        <p className={styles.muted}>{loading ? 'Loading…' : 'No revenue data.'}</p>
      </div>
    );
  }

  const s = stats;
  const content = (
    <>
      <div className={styles.card}>
        <span className={styles.label}>Revenue today</span>
        <span className={styles.value}>£{s.revenueToday?.toLocaleString() ?? 0}</span>
        <span className={styles.delta}>+{s.revenueDeltaPercent ?? 0}% vs yesterday</span>
      </div>
      {s.revenueSparkline && s.revenueSparkline.length > 0 && (
        <div className={styles.chartWrap}>
          <MiniChart data={s.revenueSparkline} height={80} width={320} color="var(--gold)" />
        </div>
      )}
      <div className={styles.card}>
        <span className={styles.label}>Revenue MTD</span>
        <span className={styles.value}>£{s.revenueMTD?.toLocaleString() ?? 0}</span>
      </div>
    </>
  );

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>Revenue</h2>
      <p className={styles.sub}>Platform revenue overview.</p>
      {content}
    </div>
  );
}
