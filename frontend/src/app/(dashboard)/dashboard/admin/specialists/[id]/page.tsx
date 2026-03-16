'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import Badge from '@/components/ui/Badge';
import styles from './page.module.css';

export default function AdminSpecialistMetricsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getMe().then((me) => { if (me.role !== 'ADMIN') router.replace('/dashboard/admin'); }).catch(() => {});
    if (!id) return;
    api.getAdminSpecialistMetrics(id)
      .then(setData)
      .catch((e) => setError(e?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <div className={styles.page}><p className={styles.muted}>Loading…</p></div>;
  if (error || !data) return <div className={styles.page}><p className={styles.error}>{error || 'Specialist not found'}</p><Link href="/dashboard/admin/specialists">← Back to specialists</Link></div>;

  const { specialist, metrics, clients, todaySchedule } = data;
  return (
    <div className={styles.page}>
      <Link href="/dashboard/admin/specialists" className={styles.back}>← All specialists</Link>
      <h2 className={styles.title}>Specialist metrics: {specialist?.name}</h2>
      <p className={styles.sub}>{specialist?.email} · {specialist?.role} {specialist?.suspended && <Badge variant="warn">Suspended</Badge>}</p>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Metrics</h3>
        <div className={styles.metrics}>
          <div className={styles.metric}><span className={styles.metricValue}>{metrics?.totalSessions ?? 0}</span><span className={styles.metricLabel}>Total sessions</span></div>
          <div className={styles.metric}><span className={styles.metricValue}>{metrics?.completedSessions ?? 0}</span><span className={styles.metricLabel}>Completed</span></div>
          <div className={styles.metric}><span className={styles.metricValue}>{metrics?.pendingRequests ?? 0}</span><span className={styles.metricLabel}>Pending requests</span></div>
          <div className={styles.metric}><span className={styles.metricValue}>{metrics?.clientsCount ?? 0}</span><span className={styles.metricLabel}>Clients</span></div>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Clients ({clients?.length ?? 0})</h3>
        {clients?.length ? (
          <ul className={styles.list}>
            {clients.map((c: any) => <li key={c.id}>{c.name} — {c.sessionCount} sessions, last {c.lastSessionDate}</li>)}
          </ul>
        ) : <p className={styles.muted}>None yet.</p>}
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Today&apos;s schedule</h3>
        {todaySchedule?.length ? (
          <ul className={styles.list}>
            {todaySchedule.map((s: any) => <li key={s.id}>{s.type} — {s.clientName} at {s.scheduledAt ? new Date(s.scheduledAt).toLocaleTimeString() : ''}</li>)}
          </ul>
        ) : <p className={styles.muted}>No sessions today.</p>}
      </section>
    </div>
  );
}
