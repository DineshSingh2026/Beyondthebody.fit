'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import styles from './page.module.css';

interface SpecialistRow {
  id: string;
  name: string;
  email?: string;
  specialty: string;
  active?: boolean;
  suspended?: boolean;
  sessionCount: number;
  rating: number;
}

export default function AdminSpecialistsPage() {
  const router = useRouter();
  const [specialists, setSpecialists] = useState<SpecialistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = () => api.getAdminSpecialists().then((data: SpecialistRow[]) => setSpecialists(Array.isArray(data) ? data : [])).catch(() => setSpecialists([]));

  useEffect(() => {
    api.getMe().then((me) => { if (me.role !== 'ADMIN') router.replace('/dashboard/admin'); }).catch(() => {});
    load().finally(() => setLoading(false));
  }, [router]);

  const handleSuspend = (sp: SpecialistRow, suspended: boolean) => {
    setActionId(sp.id);
    api.patchUserSuspend(sp.id, suspended).then(load).finally(() => setActionId(null));
  };

  if (loading) {
    return <div className={styles.page}><p className={styles.muted}>Loading…</p></div>;
  }

  const content = specialists.length === 0 ? (
    <p className={styles.empty}>No specialists yet.</p>
  ) : (
    <div className={styles.list}>
      {specialists.map((sp) => (
        <div key={sp.id} className={styles.card}>
          <Avatar name={sp.name} size="md" />
          <div className={styles.info}>
            <span className={styles.name}>{sp.name}</span>
            <span className={styles.specialty}>{sp.specialty?.replace('_', ' ')}</span>
            <span className={styles.meta}>{sp.sessionCount} sessions · ★ {sp.rating || '—'}</span>
            <div className={styles.row}>
              {sp.suspended && <Badge variant="warn">Suspended</Badge>}
              <Link href={`/dashboard/admin/specialists/${sp.id}`} className={styles.link}>View metrics</Link>
              {sp.suspended ? (
                <button type="button" className={styles.btnSm} onClick={() => handleSuspend(sp, false)} disabled={!!actionId}>Unsuspend</button>
              ) : (
                <button type="button" className={styles.btnDanger} onClick={() => handleSuspend(sp, true)} disabled={!!actionId}>Suspend</button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>Specialist Roster</h2>
      <p className={styles.sub}>All specialists. Suspend or view full metrics.</p>
      {content}
    </div>
  );
}
