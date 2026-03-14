'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/useMediaQuery';
import {
  emptyAdminPlatformStats,
  emptyApplications,
  emptyAdminSessions,
  emptySpecialistRoster,
  emptyActivityLog,
  mockSessionsDailyChart,
  mockUserGrowthChart,
} from '@/lib/mock-data';
import { api } from '@/lib/api';
import AdminMobileHome from '@/components/mobile/AdminMobileHome';
import StatCard from '@/components/dashboard/StatCard';
import MiniChart from '@/components/dashboard/MiniChart';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import ProgressRing from '@/components/ui/ProgressRing';
import styles from './page.module.css';

const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const SPECIALIST_ROLES = ['THERAPIST', 'LIFE_COACH', 'HYPNOTHERAPIST', 'MUSIC_TUTOR'];

export default function AdminDashboardPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [stats, setStats] = useState(emptyAdminPlatformStats);
  const [applications, setApplications] = useState(emptyApplications);
  const [sessions, setSessions] = useState(emptyAdminSessions);
  const [roster, setRoster] = useState(emptySpecialistRoster);
  const [activityLog, setActivityLog] = useState(emptyActivityLog);

  useEffect(() => {
    api.getMe()
      .then((me) => {
        if (me.role === 'USER') {
          router.replace('/dashboard/user');
          return;
        }
        if (SPECIALIST_ROLES.includes(me.role)) {
          router.replace('/dashboard/therapist');
          return;
        }
      })
      .catch(() => {});
  }, [router]);

  useEffect(() => {
    api.getAdminPlatformStats().then(setStats).catch(() => setStats(emptyAdminPlatformStats));
    api.getAdminApplications().then(setApplications).catch(() => setApplications(emptyApplications));
    api.getAdminSessions().then(setSessions).catch(() => setSessions(emptyAdminSessions));
    api.getAdminSpecialists().then(setRoster).catch(() => setRoster(emptySpecialistRoster));
    api.getAdminActivityLog().then(setActivityLog).catch(() => setActivityLog(emptyActivityLog));
  }, []);

  const [approvedAlert, setApprovedAlert] = useState<{ name: string; email: string; role: string; tempPassword: string } | null>(null);

  const handleApplicationStatus = (id: string, status: string) => {
    api.patchApplication(id, status).then((res) => {
      api.getAdminApplications().then(setApplications).catch(() => {});
      api.getAdminPlatformStats().then(setStats).catch(() => {});
      if (status === 'APPROVED' && res.newUser) {
        setApprovedAlert({ name: res.newUser.name, email: res.newUser.email, role: res.newUser.role, tempPassword: res.newUser.tempPassword });
      }
    }).catch(() => {});
  };

  if (isMobile) return <AdminMobileHome />;

  const s = stats;
  return (
    <motion.div className={styles.page} initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }}>
      {approvedAlert && (
        <div className={styles.approvedAlert}>
          <div className={styles.approvedAlertInner}>
            <span className={styles.approvedAlertIcon}>✅</span>
            <div>
              <strong>{approvedAlert.name}</strong> has been approved as <strong>{approvedAlert.role.replace('_', ' ')}</strong>.
              <br />
              Account created — share these login credentials with them:
              <div className={styles.approvedCredentials}>
                <span>Email: <code>{approvedAlert.email}</code></span>
                <span>Temp Password: <code>{approvedAlert.tempPassword}</code></span>
                <span className={styles.approvedNote}>Ask them to change their password after first login.</span>
              </div>
            </div>
            <button className={styles.approvedClose} onClick={() => setApprovedAlert(null)}>✕</button>
          </div>
        </div>
      )}
      <div className={styles.heroRow}>
        <motion.div className={styles.heroCard} variants={item}>
          <div className={styles.heroCardLabel}>Platform Health</div>
          <div className={styles.platformScoreWrap}>
            <ProgressRing value={s.platformScore} size={100} strokeColor="var(--green)">
              <span className={styles.platformScoreNum}>{s.platformScore}</span>
              <span className={styles.platformScoreLabel}>/100</span>
            </ProgressRing>
            <div className={styles.platformSub}>
              <span>Uptime {s.uptimePercent}%</span>
              <span>Active sessions: {s.activeSessions}</span>
              <span>Error rate: {s.errorRate}%</span>
            </div>
          </div>
        </motion.div>
        <motion.div className={styles.heroCard} variants={item}>
          <div className={styles.heroCardLabel}>Revenue Today</div>
          <span className={styles.revenueNum}>£{s.revenueToday.toLocaleString()}</span>
          <MiniChart data={s.revenueSparkline} height={40} width={200} color="var(--gold)" />
          <span className={styles.deltaPositive}>+{s.revenueDeltaPercent}% vs yesterday</span>
        </motion.div>
        <motion.div className={styles.heroCard} variants={item}>
          <div className={styles.heroCardLabel}>Active Right Now</div>
          <div className={styles.liveStats}>
            <div><span className={styles.liveNum}>{s.liveUsers}</span> users</div>
            <div><span className={styles.liveNum}>{s.liveSessions}</span> sessions</div>
            <div><span className={styles.liveNum}>{s.specialistsOnline}</span> specialists</div>
          </div>
        </motion.div>
      </div>
      <div className={styles.statsRow}>
        <StatCard label="Total Users" value={s.totalUsers} index={0} />
        <StatCard label="Total Specialists" value={s.totalSpecialists} index={1} />
        <StatCard label="Sessions This Month" value={s.sessionsThisMonth} index={2} />
        <StatCard label="Avg Session Rating" value={s.avgSessionRating} index={3} />
        <StatCard label="Revenue MTD" value={`£${(s.revenueMTD / 1000).toFixed(0)}k`} index={4} />
        <StatCard label="New Applications" value={s.newApplications} index={5} />
      </div>
      <div className={styles.grid}>
        <div className={styles.leftCol}>
          <motion.section className={styles.section} variants={item}>
            <h2 className={styles.sectionTitle}>Specialist Applications</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Specialty</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {applications.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div className={styles.tableUser}>
                        <Avatar name={a.name} size="sm" />
                        {a.name}
                      </div>
                    </td>
                    <td><Badge variant={a.specialty === 'LIFE_COACH' ? 'gold' : a.specialty === 'THERAPIST' ? 'green' : a.specialty === 'HYPNOTHERAPIST' ? 'purple' : 'teal'}>{a.specialty.replace('_', ' ')}</Badge></td>
                    <td className={styles.muted}>{new Date(a.appliedAt).toLocaleDateString()}</td>
                    <td><Badge variant={a.status === 'PENDING' ? 'warn' : 'muted'}>{a.status}</Badge></td>
                    <td>
                      {a.status === 'PENDING' && (
                        <>
                          <button type="button" className={styles.btnSm} onClick={() => handleApplicationStatus(a.id, 'APPROVED')}>Approve</button>
                          <button type="button" className={styles.btnSm} onClick={() => handleApplicationStatus(a.id, 'REJECTED')}>Reject</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.section>
          <motion.section className={styles.section} variants={item}>
            <h2 className={styles.sectionTitle}>Recent Sessions</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Specialist</th>
                  <th>Duration</th>
                  <th>Rating</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((sess) => (
                  <tr key={sess.id}>
                    <td>{sess.userName}</td>
                    <td>{sess.specialistName}</td>
                    <td>{sess.durationMinutes} min</td>
                    <td className={styles.gold}>{sess.rating != null ? `★ ${sess.rating}` : '—'}</td>
                    <td><Badge variant={sess.status === 'COMPLETED' ? 'green' : 'gold'}>{sess.status.replace('_', ' ')}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.section>
          <motion.section className={styles.section} variants={item}>
            <h2 className={styles.sectionTitle}>Platform Analytics — Daily Sessions (30 days)</h2>
            <div className={styles.barChartWrap}>
              {mockSessionsDailyChart.map((v, i) => (
                <div
                  key={i}
                  className={styles.bar}
                  style={{ height: `${(v / 60) * 100}%`, background: i === mockSessionsDailyChart.length - 1 ? 'var(--gold)' : 'var(--green)' }}
                />
              ))}
            </div>
          </motion.section>
          <motion.section className={styles.section} variants={item}>
            <h2 className={styles.sectionTitle}>User Growth — Monthly signups</h2>
            <div className={styles.areaChartWrap}>
              <MiniChart data={mockUserGrowthChart.slice(-12)} height={120} width={600} color="var(--green)" />
            </div>
          </motion.section>
        </div>
        <aside className={styles.rightCol}>
          <motion.section className={styles.section} variants={item}>
            <h2 className={styles.sectionTitle}>Specialist Roster</h2>
            <div className={styles.rosterList}>
              {roster.map((sp) => (
                <div key={sp.id} className={styles.rosterItem}>
                  <Avatar name={sp.name} size="sm" />
                  <div>
                    <span className={styles.rosterName}>{sp.name}</span>
                    <Badge variant={sp.specialty === 'LIFE_COACH' ? 'gold' : sp.specialty === 'THERAPIST' ? 'green' : sp.specialty === 'HYPNOTHERAPIST' ? 'purple' : 'teal'}>{sp.specialty.replace('_', ' ')}</Badge>
                  </div>
                  <span className={styles.muted}>{sp.sessionCount} sessions · ★ {sp.rating}</span>
                </div>
              ))}
            </div>
          </motion.section>
          <motion.section className={styles.section} variants={item}>
            <h2 className={styles.sectionTitle}>Pending Actions</h2>
            <ul className={styles.pendingList}>
              <li>Applications to Review: <strong>{applications.filter((a) => a.status === 'PENDING').length}</strong></li>
              <li>Reports Flagged: <strong>0</strong></li>
              <li>Support Tickets: <strong>2</strong></li>
            </ul>
          </motion.section>
          <motion.section className={styles.section} variants={item}>
            <h2 className={styles.sectionTitle}>Recent Activity Log</h2>
            <ul className={styles.activityList}>
              {activityLog.map((log) => (
                <li key={log.id}>
                  <span className={styles.muted}>{log.timestamp}</span>
                  <span>{log.message}</span>
                </li>
              ))}
            </ul>
          </motion.section>
        </aside>
      </div>
    </motion.div>
  );
}
