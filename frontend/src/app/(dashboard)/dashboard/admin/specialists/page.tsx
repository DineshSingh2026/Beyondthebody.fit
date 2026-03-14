'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Avatar from '@/components/ui/Avatar';
import styles from './page.module.css';

interface SpecialistRow {
  id: string;
  name: string;
  specialty: string;
  active?: boolean;
  sessionCount: number;
  rating: number;
}

export default function AdminSpecialistsPage() {
  const router = useRouter();
  const [specialists, setSpecialists] = useState<SpecialistRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMe().then((me) => { if (me.role !== 'ADMIN') router.replace('/dashboard/admin'); }).catch(() => {});
    api.getAdminSpecialists()
      .then((data: SpecialistRow[]) => setSpecialists(Array.isArray(data) ? data : []))
      .catch(() => setSpecialists([]))
      .finally(() => setLoading(false));
  }, [router]);

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
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>Specialist Roster</h2>
      <p className={styles.sub}>All active specialists on the platform.</p>
      {content}
    </div>
  );
}
