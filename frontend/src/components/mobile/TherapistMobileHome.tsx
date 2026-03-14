'use client';

import { useState, useEffect } from 'react';
import { emptyTherapistDashboard } from '@/lib/mock-data';
import { api } from '@/lib/api';
import type { SpecialistType } from '@/lib/dashboard-types';
import type { TherapistDashboardData } from '@/lib/dashboard-types';
import MiniHealingRing from './MiniHealingRing';
import MobileCard from './MobileCard';
import HapticButton from './HapticButton';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import styles from './TherapistMobileHome.module.css';

export default function TherapistMobileHome({ specialistId }: { specialistId: string }) {
  const [d, setD] = useState<TherapistDashboardData>(() => emptyTherapistDashboard('THERAPIST'));
  useEffect(() => {
    if (!specialistId) return;
    api.getSpecialistDashboard(specialistId).then(setD).catch(() => {});
  }, [specialistId]);
  const nextSession = d.todaySchedule.find((s) => s.status === 'UPCOMING' || s.status === 'IN_PROGRESS') ?? d.todaySchedule[0];

  return (
    <div className="mobile-card-enter">
      <section className={styles.hero}>
        <Badge variant="green">Therapist</Badge>
        <div className={styles.scoreWrap}>
          <MiniHealingRing score={d.practiceScore} size={100} strokeColor="var(--green)" />
        </div>
        <p className={styles.sub}>{d.stats.sessionsThisWeek} sessions this week</p>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Today&apos;s Schedule</h3>
        <div className={styles.scheduleScroll}>
          {d.todaySchedule.map((s) => (
            <div key={s.id} className={styles.scheduleCard}>
              <span className={styles.time}>{s.time}</span>
              <Avatar name={s.clientName} size="sm" />
              <span className={styles.type}>{s.type}</span>
              <Badge variant={s.status === 'IN_PROGRESS' ? 'green' : s.status === 'COMPLETED' ? 'muted' : 'gold'}>
                {s.status.replace('_', ' ')}
              </Badge>
            </div>
          ))}
        </div>
      </section>

      {nextSession && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Next Session</h3>
          <MobileCard accent="gold">
            <div className={styles.nextRow}>
              <Avatar name={nextSession.clientName} size="md" />
              <div>
                <div className={styles.clientName}>{nextSession.clientName}</div>
                <div className={styles.nextTime}>{nextSession.time} · {nextSession.durationMinutes} min</div>
              </div>
            </div>
            <HapticButton variant="primary" pill fullWidth>Join Session</HapticButton>
          </MobileCard>
        </section>
      )}

      <section className={styles.statsRow}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{d.stats.activeClients}</span>
          <span className={styles.statLabel}>Clients</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{d.stats.sessionsThisWeek}</span>
          <span className={styles.statLabel}>Sessions</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>£{d.earningsThisMonth}</span>
          <span className={styles.statLabel}>Earnings</span>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Pending Requests</h3>
        {d.pendingRequests.slice(0, 3).map((r) => (
          <div key={r.id} className={styles.requestCard}>
            <Avatar name={r.clientName} size="sm" />
            <div className={styles.requestMeta}>
              <span className={styles.requestName}>{r.clientName}</span>
              <span className={styles.requestTime}>{r.proposedTime} — {r.sessionType}</span>
            </div>
            <div className={styles.requestActions}>
              <HapticButton variant="primary" pill>Accept</HapticButton>
              <HapticButton variant="ghost" pill>Decline</HapticButton>
            </div>
          </div>
        ))}
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>My Clients</h3>
        <div className={styles.clientScroll}>
          {d.clients.map((c) => (
            <div key={c.id} className={styles.clientCard}>
              <Avatar name={c.name} size="md" />
              <span className={styles.clientName}>{c.name}</span>
              <span className={styles.muted}>{c.sessionCount} sessions</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
