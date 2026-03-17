'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { api } from '@/lib/api';
import Avatar from '@/components/ui/Avatar';
import type { ClientRosterEntry } from '@/lib/dashboard-types';
import styles from './page.module.css';

export default function TherapistClientsPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [specialistId, setSpecialistId] = useState<string | null>(null);
  const [clients, setClients] = useState<ClientRosterEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const me = await api.getMe();
        if (me.role === 'ADMIN') { router.replace('/dashboard/admin'); return; }
        if (me.role === 'USER') { router.replace('/dashboard/user'); return; }
        setSpecialistId(me.id);
        const d = await api.getSpecialistDashboard(me.id);
        setClients(d.clients ?? []);
      } catch {
        setClients([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading) {
    return <div className={styles.page}><p className={styles.muted}>Loading…</p></div>;
  }

  const content = clients.length === 0 ? (
    <p className={styles.empty}>No clients yet.</p>
  ) : (
    clients.map((c) => (
      <div key={c.id} className={styles.card}>
        <Avatar name={c.name} src={c.avatar} size="md" />
        <div className={styles.info}>
          <span className={styles.name}>{c.name}</span>
          <span className={styles.meta}>{c.sessionCount} sessions · Last {c.lastSessionDate}</span>
        </div>
        <span className={styles.chevron}>›</span>
      </div>
    ))
  );

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>My Clients</h2>
      <p className={styles.sub}>Clients you have worked with.</p>
      <div className={styles.list}>{content}</div>
    </div>
  );
}
