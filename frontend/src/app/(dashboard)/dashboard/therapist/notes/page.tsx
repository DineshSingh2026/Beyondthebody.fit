'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { api } from '@/lib/api';
import type { SessionNote } from '@/lib/dashboard-types';
import styles from './page.module.css';

export default function TherapistNotesPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const me = await api.getMe();
        if (me.role === 'ADMIN') { router.replace('/dashboard/admin'); return; }
        if (me.role === 'USER') { router.replace('/dashboard/user'); return; }
        const d = await api.getSpecialistDashboard(me.id);
        setNotes(d.recentNotes ?? []);
      } catch {
        setNotes([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading) {
    return <div className={styles.page}><p className={styles.muted}>Loading…</p></div>;
  }

  const content = notes.length === 0 ? (
    <p className={styles.empty}>No session notes yet.</p>
  ) : (
    notes.map((n) => (
      <div key={n.id} className={styles.card}>
        <span className={styles.client}>{n.clientName}</span>
        <span className={styles.date}>{n.date}</span>
        <p className={styles.preview}>{n.preview}</p>
      </div>
    ))
  );

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>Session Notes</h2>
      <p className={styles.sub}>Your recent private notes.</p>
      <div className={styles.list}>{content}</div>
    </div>
  );
}
