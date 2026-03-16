'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import Badge from '@/components/ui/Badge';
import styles from './page.module.css';

export default function AdminUserMetricsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getMe().then((me) => { if (me.role !== 'ADMIN') router.replace('/dashboard/admin'); }).catch(() => {});
    if (!id) return;
    api.getAdminUserMetrics(id)
      .then(setData)
      .catch((e) => setError(e?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <div className={styles.page}><p className={styles.muted}>Loading…</p></div>;
  if (error || !data) return <div className={styles.page}><p className={styles.error}>{error || 'User not found'}</p><Link href="/dashboard/admin/users">← Back to users</Link></div>;

  const { user, healingScore, metrics, specialists, upcomingSessions } = data;
  return (
    <div className={styles.page}>
      <Link href="/dashboard/admin/users" className={styles.back}>← All users</Link>
      <h2 className={styles.title}>User metrics: {user?.name}</h2>
      <p className={styles.sub}>{user?.email} {user?.suspended && <Badge variant="warn">Suspended</Badge>}</p>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Metrics</h3>
        <div className={styles.metrics}>
          <div className={styles.metric}><span className={styles.metricValue}>{healingScore ?? 0}</span><span className={styles.metricLabel}>Healing score</span></div>
          <div className={styles.metric}><span className={styles.metricValue}>{metrics?.sessionsCompleted ?? 0}</span><span className={styles.metricLabel}>Sessions completed</span></div>
          <div className={styles.metric}><span className={styles.metricValue}>{metrics?.sessionsUpcoming ?? 0}</span><span className={styles.metricLabel}>Upcoming sessions</span></div>
          <div className={styles.metric}><span className={styles.metricValue}>{metrics?.moodAverage?.toFixed?.(1) ?? '—'}</span><span className={styles.metricLabel}>Mood avg (14d)</span></div>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Specialists ({specialists?.length ?? 0})</h3>
        {specialists?.length ? (
          <ul className={styles.list}>
            {specialists.map((s: any) => <li key={s.id}>{s.name} — {s.role} ({s.sessionCount} sessions)</li>)}
          </ul>
        ) : <p className={styles.muted}>None yet.</p>}
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Upcoming sessions</h3>
        {upcomingSessions?.length ? (
          <ul className={styles.list}>
            {upcomingSessions.map((s: any) => <li key={s.id}>{s.type} with {s.specialistName} — {s.scheduledAt ? new Date(s.scheduledAt).toLocaleString() : ''}</li>)}
          </ul>
        ) : <p className={styles.muted}>None scheduled.</p>}
      </section>
    </div>
  );
}
