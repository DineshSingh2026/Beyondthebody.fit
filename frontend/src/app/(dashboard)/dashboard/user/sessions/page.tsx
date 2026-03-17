'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/useMediaQuery';
import Link from 'next/link';
import { api } from '@/lib/api';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import HapticButton from '@/components/mobile/HapticButton';
import SwipeableRow from '@/components/mobile/SwipeableRow';
import type { SessionSummary, SessionQuota } from '@/lib/dashboard-types';
import styles from './page.module.css';

const SPECIALIST_ROLES = ['THERAPIST', 'LIFE_COACH', 'HYPNOTHERAPIST', 'MUSIC_TUTOR'];

export default function UserSessionsPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [userId, setUserId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [sessionQuota, setSessionQuota] = useState<SessionQuota | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  useEffect(() => {
    (async () => {
      try {
        const me = await api.getMe();
        if (me.role === 'ADMIN') { router.replace('/dashboard/admin'); return; }
        if (SPECIALIST_ROLES.includes(me.role)) { router.replace('/dashboard/therapist'); return; }
        setUserId(me.id);
        const data = await api.getUserSessions(me.id);
        setSessions(data.sessions ?? []);
        setSessionQuota(data.sessionQuota ?? null);
      } catch {
        setSessions([]);
        setSessionQuota(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const filtered = sessions.filter((s) => {
    if (filter === 'upcoming') return s.status === 'UPCOMING' || s.status === 'IN_PROGRESS';
    if (filter === 'completed') return s.status === 'COMPLETED';
    return true;
  });

  const sessionList = (
    <div className={styles.list}>
      {filtered.length === 0 ? (
        <p className={styles.empty}>
          {filter === 'completed' ? 'No past sessions yet.' : filter === 'upcoming' ? 'No upcoming sessions.' : 'No sessions yet.'}
          <br />
          <Link href="/dashboard/user/specialists">Find a specialist</Link> to book one.
        </p>
      ) : (
        filtered.map((s) => (
          <SwipeableRow
            key={s.id}
            leftAction={{ label: 'Reschedule', onClick: () => {} }}
            rightAction={{ label: 'Cancel', onClick: () => {}, variant: 'danger' }}
          >
            <div className={styles.sessionRow}>
              <span className={styles.time}>{s.time}</span>
              <Avatar name={s.specialistName} src={s.specialistAvatarUrl} size="md" />
              <div className={styles.meta}>
                <span className={styles.name}>{s.specialistName}</span>
                <Badge variant="gold">{s.type}</Badge>
              </div>
              <span className={styles.chevron}>›</span>
            </div>
          </SwipeableRow>
        ))
      )}
    </div>
  );

  const chips = (
    <div className={styles.chips}>
      <button
        type="button"
        className={`${styles.chip} ${filter === 'all' ? styles.active : ''}`}
        onClick={() => setFilter('all')}
      >
        All
      </button>
      <button
        type="button"
        className={`${styles.chip} ${filter === 'upcoming' ? styles.active : ''}`}
        onClick={() => setFilter('upcoming')}
      >
        Upcoming
      </button>
      <button
        type="button"
        className={`${styles.chip} ${filter === 'completed' ? styles.active : ''}`}
        onClick={() => setFilter('completed')}
      >
        Completed
      </button>
    </div>
  );

  if (loading && !userId) {
    return (
      <div className={styles.page}>
        <p className={styles.muted}>Loading…</p>
      </div>
    );
  }

  const quotaBlock = sessionQuota && (
    <div className={styles.quotaBar}>
      <span className={styles.quotaLabel}>Sessions</span>
      <span className={styles.quotaValue}>{sessionQuota.sessionsRemaining}/{sessionQuota.sessionsAllotted}</span>
    </div>
  );

  if (!isMobile) {
    return (
      <div className={styles.desktop}>
        <h2 className={styles.desktopTitle}>Sessions</h2>
        <p className={styles.desktopSub}>Upcoming and past sessions with your specialists.</p>
        {quotaBlock}
        {chips}
        {sessionList}
        <Link href="/dashboard/user/specialists" className={styles.bookLink}>
          Book a session
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {quotaBlock}
      {chips}
      {sessionList}
      <Link href="/dashboard/user/specialists" className={styles.fab}>
        <span>+</span>
      </Link>
    </div>
  );
}
