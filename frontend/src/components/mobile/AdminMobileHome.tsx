'use client';

import { useState, useEffect } from 'react';
import {
  emptyAdminPlatformStats,
  emptyApplications,
  mockActivityLog,
  mockUserGrowthChart,
} from '@/lib/mock-data';
import { api } from '@/lib/api';
import MiniChart from '@/components/dashboard/MiniChart';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import styles from './AdminMobileHome.module.css';

const specialtyVariant: Record<string, 'gold' | 'green' | 'purple' | 'teal'> = {
  LIFE_COACH: 'gold',
  THERAPIST: 'green',
  HYPNOTHERAPIST: 'purple',
  MUSIC_TUTOR: 'teal',
};

export default function AdminMobileHome() {
  const [s, setS] = useState(emptyAdminPlatformStats);
  const [applications, setApplications] = useState(emptyApplications);
  const [activityLog, setActivityLog] = useState(mockActivityLog);

  useEffect(() => {
    api.getAdminPlatformStats().then(setS).catch(() => {});
    api.getAdminApplications().then(setApplications).catch(() => {});
    api.getAdminActivityLog().then(setActivityLog).catch(() => {});
  }, []);

  const apps = applications;

  return (
    <div className="mobile-card-enter">
      <section className={styles.statsGrid}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Users</span>
          <span className={styles.statValue}>{s.totalUsers}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Specialists</span>
          <span className={styles.statValue}>{s.totalSpecialists}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Sessions (MTD)</span>
          <span className={styles.statValue}>{s.sessionsThisMonth}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Rating</span>
          <span className={styles.statValue}>{s.avgSessionRating}</span>
        </div>
      </section>

      <section className={styles.live}>
        <span className={styles.liveDot} />
        <span>{s.liveUsers} online · {s.liveSessions} active sessions</span>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Specialist Applications</h3>
        {apps.map((app) => (
          <div key={app.id} className={styles.appCard}>
            <Avatar name={app.name} size="md" />
            <div className={styles.appMeta}>
              <span className={styles.appName}>{app.name}</span>
              <Badge variant={specialtyVariant[app.specialty] ?? 'muted'}>{app.specialty.replace('_', ' ')}</Badge>
            </div>
            <span className={styles.appStatus}>{app.status}</span>
          </div>
        ))}
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>User Growth</h3>
        <div className={styles.chartWrap}>
          <MiniChart data={mockUserGrowthChart} height={100} width={320} color="var(--green)" />
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Revenue Today</h3>
        <div className={styles.revenueCard}>
          <span className={styles.revenueNum}>£{s.revenueToday.toLocaleString()}</span>
          <span className={styles.delta}>+{s.revenueDeltaPercent}% vs yesterday</span>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Activity Log</h3>
        <ul className={styles.log}>
          {activityLog.slice(0, 5).map((entry) => (
            <li key={entry.id}>
              <span className={styles.logTime}>{entry.timestamp}</span>
              <span className={styles.logMsg}>{entry.message}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
