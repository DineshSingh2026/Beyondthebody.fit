'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { emptyTherapistDashboard } from '@/lib/mock-data';
import { api } from '@/lib/api';
import type { SpecialistType } from '@/lib/dashboard-types';
import type { TherapistDashboardData } from '@/lib/dashboard-types';
import TherapistMobileHome from '@/components/mobile/TherapistMobileHome';
import StatCard from '@/components/dashboard/StatCard';
import SessionCard from '@/components/dashboard/SessionCard';
import MiniChart from '@/components/dashboard/MiniChart';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import ProgressRing from '@/components/ui/ProgressRing';
import styles from './page.module.css';

const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const SPECIALIST_ROLES: SpecialistType[] = ['THERAPIST', 'LIFE_COACH', 'HYPNOTHERAPIST', 'MUSIC_TUTOR'];

export default function TherapistDashboardPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [specialistId, setSpecialistId] = useState<string | null>(null);
  const [role, setRole] = useState<SpecialistType>('THERAPIST');
  const [joinModal, setJoinModal] = useState<{ clientName: string } | null>(null);
  const [d, setD] = useState<TherapistDashboardData>(() => emptyTherapistDashboard('THERAPIST'));
  const [actionId, setActionId] = useState<string | null>(null);

  const loadDashboard = async (id: string) => {
    try {
      const dashboard = await api.getSpecialistDashboard(id);
      setD(dashboard as TherapistDashboardData);
    } catch {
      /* keep current data */
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const me = await api.getMe();
        if (me.role === 'ADMIN') { router.replace('/dashboard/admin'); return; }
        if (me.role === 'USER') { router.replace('/dashboard/user'); return; }
        if (SPECIALIST_ROLES.includes(me.role as SpecialistType)) {
          setSpecialistId(me.id);
          setRole(me.role as SpecialistType);
          await loadDashboard(me.id);
        }
      } catch {
        setD(emptyTherapistDashboard(role));
      }
    })();
  }, [router]);

  const handleRequest = async (requestId: string, status: 'accepted' | 'declined') => {
    if (!specialistId) return;
    setActionId(requestId);
    try {
      await api.patchBookingRequest(specialistId, requestId, status);
      await loadDashboard(specialistId);
    } finally {
      setActionId(null);
    }
  };

  if (isMobile && specialistId) return <TherapistMobileHome specialistId={specialistId} />;
  if (isMobile) return null;

  return (
    <motion.div className={styles.page} initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }}>
      <div className={styles.heroRow}>
        <motion.div className={styles.heroCard} variants={item}>
          <div className={styles.heroCardLabel}>Practice Score</div>
          <ProgressRing value={d.practiceScore} size={100} strokeColor="var(--green)">
            <span className={styles.scoreNum}>{d.practiceScore}</span>
            <span className={styles.scoreLabel}>/100</span>
          </ProgressRing>
          <span className={styles.subLabel}>Your Healing Impact</span>
        </motion.div>
        <motion.div className={styles.heroCard} variants={item}>
          <div className={styles.heroCardLabel}>Today at a Glance</div>
          <div className={styles.todayStats}>
            <div><span className={styles.bigNum}>{d.todayStats.sessionsToday}</span> sessions</div>
            <div><span className={styles.bigNum}>{d.todayStats.hoursBooked}</span> hours booked</div>
            <div><span className={styles.bigNum}>{d.todayStats.newRequests}</span> new requests</div>
            <div>{d.todayStats.completionRate}% completion</div>
          </div>
        </motion.div>
        <motion.div className={styles.heroCard} variants={item}>
          <div className={styles.heroCardLabel}>Earnings This Month</div>
          <span className={styles.earningsNum}>£{d.earningsThisMonth.toLocaleString()}</span>
          <MiniChart data={d.earningsSparkline} height={36} width={180} color="var(--gold)" />
          <span className={styles.delta}>+{d.earningsDeltaPercent}% vs last month</span>
        </motion.div>
      </div>
      <div className={styles.statsRow}>
        <StatCard label="Active Clients" value={d.stats.activeClients} index={0} />
        <StatCard label="Sessions This Week" value={d.stats.sessionsThisWeek} index={1} />
        <StatCard label="Avg Session Rating" value={d.stats.avgRating} index={2} />
        <StatCard label="Completion Rate" value={`${d.stats.completionRate}%`} index={3} />
        <StatCard label="Response Time" value={`${d.stats.responseTimeMinutes} min`} index={4} />
      </div>
      <div className={styles.grid}>
        <div className={styles.leftCol}>
          <motion.section className={styles.section} variants={item}>
            <h2 className={styles.sectionTitle}>Today&apos;s Schedule</h2>
            <div className={styles.scheduleList}>
              {d.todaySchedule.map((s) => (
                <SessionCard
                  key={s.id}
                  clientName={s.clientName}
                  specialistName={s.clientName}
                  type={s.type}
                  time={s.time}
                  duration={s.durationMinutes}
                  status={s.status}
                  onJoin={() => setJoinModal({ clientName: s.clientName })}
                />
              ))}
            </div>
          </motion.section>
          <motion.section className={styles.section} variants={item}>
            <h2 className={styles.sectionTitle}>Client Roster</h2>
            <div className={styles.clientGrid}>
              {d.clients.map((c) => (
                <div key={c.id} className={styles.clientCard}>
                  <Avatar name={c.name} size="md" />
                  <span className={styles.clientName}>{c.name}</span>
                  <span className={styles.muted}>{c.sessionCount} sessions · Last {c.lastSessionDate}</span>
                  <ProgressRing value={c.progressScore} size={48} strokeWidth={4} />
                  <span className={styles.metric}>{c.metricLabel}: {c.metricValue}</span>
                  <div className={styles.clientActions}>
                    <button type="button" className={styles.btnSm}>Message</button>
                    <button type="button" className={styles.btnSm}>Schedule</button>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
          <motion.section className={styles.section} variants={item}>
            <h2 className={styles.sectionTitle}>Session Notes</h2>
            <ul className={styles.notesList}>
              {d.recentNotes.map((n) => (
                <li key={n.id}>
                  <span className={styles.noteClient}>{n.clientName}</span>
                  <span className={styles.muted}>{n.date}</span>
                  <p className={styles.notePreview}>{n.preview}</p>
                  <div className={styles.tags}>
                    {n.tags.map((t) => (
                      <Badge key={t} variant="muted">{t}</Badge>
                    ))}
                  </div>
                  {n.isPrivate && <span className={styles.lock}>🔒</span>}
                </li>
              ))}
            </ul>
          </motion.section>
        </div>
        <aside className={styles.rightCol}>
          <motion.section className={styles.section} variants={item}>
            <h2 className={styles.sectionTitle}>Availability Slots</h2>
            <div className={styles.slotsWeek}>
              <p className={styles.muted}>View full calendar in Schedule → Availability</p>
            </div>
          </motion.section>
          <motion.section className={styles.section} variants={item}>
            <h2 className={styles.sectionTitle}>
              Pending Requests
              {d.pendingRequests.length > 0 && (
                <span className={styles.badge}>{d.pendingRequests.length}</span>
              )}
            </h2>
            {d.pendingRequests.length === 0 ? (
              <p className={styles.muted}>No pending consultation requests.</p>
            ) : (
              d.pendingRequests.map((r) => (
                <div key={r.id} className={styles.requestItem}>
                  <Avatar name={r.clientName} size="sm" />
                  <div style={{ flex: 1 }}>
                    <span className={styles.requestName}>{r.clientName}</span>
                    <span className={styles.muted}>{r.proposedTime} — {r.sessionType}</span>
                    {(r as { message?: string }).message && (
                      <p className={styles.requestMsg}>&ldquo;{(r as { message?: string }).message}&rdquo;</p>
                    )}
                  </div>
                  <div className={styles.requestActions}>
                    <button
                      type="button"
                      className={styles.btnAccept}
                      disabled={actionId === r.id}
                      onClick={() => handleRequest(r.id, 'accepted')}
                    >
                      {actionId === r.id ? '…' : 'Accept'}
                    </button>
                    <button
                      type="button"
                      className={styles.btnDecline}
                      disabled={actionId === r.id}
                      onClick={() => handleRequest(r.id, 'declined')}
                    >
                      {actionId === r.id ? '…' : 'Decline'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </motion.section>
          <motion.section className={styles.section} variants={item}>
            <h2 className={styles.sectionTitle}>Client Milestones</h2>
            <ul className={styles.milestoneList}>
              {d.clientMilestones.map((m, i) => (
                <li key={i}>
                  <strong>{m.clientName}</strong> {m.achievement} 🎉
                  <span className={styles.muted}> {m.date}</span>
                </li>
              ))}
            </ul>
          </motion.section>
          <motion.section className={styles.section} variants={item}>
            <h2 className={styles.sectionTitle}>Your Reviews</h2>
            {d.reviews.map((r) => (
              <div key={r.id} className={styles.reviewItem}>
                <span className={styles.stars}>★ {r.rating}</span>
                <p className={styles.reviewExcerpt}>{r.excerpt}</p>
                <span className={styles.muted}>— {r.clientName}, {r.date}</span>
              </div>
            ))}
          </motion.section>
          <motion.section className={styles.section} variants={item}>
            <h2 className={styles.sectionTitle}>Earnings Breakdown</h2>
            <p className={styles.muted}>{d.earningsBreakdown.sessionsCount} sessions × £{d.earningsBreakdown.rate}</p>
            <p>Pending: £{d.earningsBreakdown.pendingPayout}</p>
            <p>Paid out: £{d.earningsBreakdown.paidOut}</p>
          </motion.section>
        </aside>
      </div>
      <AnimatePresence>
        {joinModal && (
          <motion.div
            className={styles.modalBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setJoinModal(null)}
          >
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <Avatar name={joinModal.clientName} size="lg" />
                <h3>{joinModal.clientName}</h3>
              </div>
              <ul className={styles.checklist}>
                <li>✓ Quiet space</li>
                <li>✓ Notes reviewed</li>
                <li>✓ Camera/mic ready</li>
              </ul>
              <button type="button" className={styles.enterBtn} onClick={() => setJoinModal(null)}>
                Enter Session Room
              </button>
              <button type="button" className={styles.modalClose} onClick={() => setJoinModal(null)}>✕</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
