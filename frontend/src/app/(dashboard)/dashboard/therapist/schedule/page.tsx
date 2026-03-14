'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { api } from '@/lib/api';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import styles from './page.module.css';

export default function TherapistSchedulePage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const me = await api.getMe();
        if (me.role === 'ADMIN') { router.replace('/dashboard/admin'); return; }
        if (me.role === 'USER') { router.replace('/dashboard/user'); return; }
        const d = await api.getSpecialistDashboard(me.id);
        setTodaySchedule(d.todaySchedule ?? []);
        setPendingRequests(d.pendingRequests ?? []);
      } catch {
        setTodaySchedule([]);
        setPendingRequests([]);
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
      <h2 className={styles.title}>Calendar & Requests</h2>
      <p className={styles.sub}>Today&apos;s schedule and pending booking requests.</p>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Today&apos;s schedule</h3>
        {todaySchedule.length === 0 ? (
          <p className={styles.empty}>No sessions scheduled for today.</p>
        ) : (
          <div className={styles.list}>
            {todaySchedule.map((s) => (
              <div key={s.id} className={styles.card}>
                <span className={styles.time}>{s.time}</span>
                <Avatar name={s.clientName} size="md" />
                <div className={styles.info}>
                  <span className={styles.name}>{s.clientName}</span>
                  <Badge variant="gold">{s.type}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Pending requests</h3>
        {pendingRequests.length === 0 ? (
          <p className={styles.empty}>No pending requests.</p>
        ) : (
          <div className={styles.list}>
            {pendingRequests.map((r) => (
              <div key={r.id} className={styles.card}>
                <span className={styles.name}>{r.clientName}</span>
                <span className={styles.meta}>{r.proposedTime ?? r.requestedAt} · {r.sessionType}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
