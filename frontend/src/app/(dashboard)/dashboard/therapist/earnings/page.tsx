'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { api } from '@/lib/api';
import MiniChart from '@/components/dashboard/MiniChart';
import styles from './page.module.css';

export default function TherapistEarningsPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [earningsThisMonth, setEarningsThisMonth] = useState(0);
  const [sparkline, setSparkline] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const me = await api.getMe();
        if (me.role === 'ADMIN') { router.replace('/dashboard/admin'); return; }
        if (me.role === 'USER') { router.replace('/dashboard/user'); return; }
        const d = await api.getSpecialistDashboard(me.id);
        setEarningsThisMonth(d.earningsThisMonth ?? 0);
        setSparkline(d.earningsSparkline ?? []);
      } catch {
        setEarningsThisMonth(0);
        setSparkline([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading) {
    return <div className={styles.page}><p className={styles.muted}>Loading…</p></div>;
  }

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>Earnings</h2>
      <p className={styles.sub}>Your earnings this month.</p>
      <div className={styles.card}>
        <span className={styles.label}>This month</span>
        <span className={styles.value}>£{earningsThisMonth.toLocaleString()}</span>
      </div>
      {sparkline.length > 0 && (
        <div className={styles.chartWrap}>
          <MiniChart data={sparkline} height={80} width={320} color="var(--gold)" />
        </div>
      )}
    </div>
  );
}
