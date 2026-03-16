'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { emptyTherapistDashboard } from '@/lib/mock-data';
import { api } from '@/lib/api';
import type { TherapistDashboardData } from '@/lib/dashboard-types';
import MiniHealingRing from './MiniHealingRing';
import MobileCard from './MobileCard';
import HapticButton from './HapticButton';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import styles from './TherapistMobileHome.module.css';

interface PendingRequest {
  id: string;
  userId: string;
  clientName: string;
  clientEmail?: string;
  proposedTime: string;
  sessionType: string;
  message?: string;
}

export default function TherapistMobileHome({ specialistId }: { specialistId: string }) {
  const [d, setD] = useState<TherapistDashboardData>(() => emptyTherapistDashboard('THERAPIST'));
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadDashboard = () => {
    if (!specialistId) return;
    api.getSpecialistDashboard(specialistId).then(setD).catch(() => {});
  };

  const loadRequests = () => {
    if (!specialistId) return;
    api.getSpecialistRequests(specialistId)
      .then((r: PendingRequest[]) => setPendingRequests(Array.isArray(r) ? r : []))
      .catch(() => {});
  };

  useEffect(() => {
    loadDashboard();
    loadRequests();
  }, [specialistId]);

  const handleRequest = (requestId: string, status: 'accepted' | 'declined') => {
    if (!specialistId) return;
    setActionId(requestId);
    api.patchBookingRequest(specialistId, requestId, status)
      .then(() => { loadDashboard(); loadRequests(); })
      .finally(() => setActionId(null));
  };

  const nextSession = d.todaySchedule.find((s) => s.status === 'UPCOMING' || s.status === 'IN_PROGRESS') ?? d.todaySchedule[0];

  return (
    <div className="mobile-card-enter">

      {/* Hero — Practice Score */}
      <section className={styles.hero}>
        <Badge variant="green">Therapist</Badge>
        <div className={styles.scoreWrap}>
          <MiniHealingRing score={d.practiceScore} size={100} strokeColor="var(--green)" />
        </div>
        <p className={styles.sub}>{d.stats.sessionsThisWeek} sessions this week</p>
      </section>

      {/* Stats row */}
      <section className={styles.statsRow}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{d.stats.activeClients}</span>
          <span className={styles.statLabel}>Clients</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{d.stats.sessionsThisWeek}</span>
          <span className={styles.statLabel}>Sessions/wk</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>★ {d.stats.avgRating}</span>
          <span className={styles.statLabel}>Rating</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{d.stats.completionRate}%</span>
          <span className={styles.statLabel}>Completion</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>£{d.earningsThisMonth}</span>
          <span className={styles.statLabel}>Earnings</span>
        </div>
      </section>

      {/* Quick actions */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Quick Actions</h3>
        <div className={styles.quickGrid}>
          <Link href="/dashboard/therapist/messages" className={styles.quickBtn}>
            <span className={styles.quickIcon}>💬</span>
            <span>Messages</span>
          </Link>
          <Link href="/dashboard/therapist/schedule" className={styles.quickBtn}>
            <span className={styles.quickIcon}>📅</span>
            <span>Schedule</span>
          </Link>
          <Link href="/dashboard/therapist/notes" className={styles.quickBtn}>
            <span className={styles.quickIcon}>📝</span>
            <span>Notes</span>
          </Link>
          <Link href="/dashboard/therapist/clients" className={styles.quickBtn}>
            <span className={styles.quickIcon}>👥</span>
            <span>Clients</span>
          </Link>
          <Link href="/dashboard/therapist/earnings" className={styles.quickBtn}>
            <span className={styles.quickIcon}>💰</span>
            <span>Earnings</span>
          </Link>
        </div>
      </section>

      {/* Today's schedule */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Today&apos;s Schedule</h3>
        {d.todaySchedule.length === 0 ? (
          <p className={styles.muted}>No sessions today.</p>
        ) : (
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
        )}
      </section>

      {/* Next session CTA */}
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
            <div className={styles.nextBtns}>
              <Link href="/dashboard/therapist/messages">
                <HapticButton variant="ghost" pill>Message</HapticButton>
              </Link>
              <HapticButton variant="primary" pill>Join Session</HapticButton>
            </div>
          </MobileCard>
        </section>
      )}

      {/* Pending consultation requests — with functional Accept/Decline */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>
          Pending Requests {pendingRequests.length > 0 && <span className={styles.badge}>{pendingRequests.length}</span>}
        </h3>
        {pendingRequests.length === 0 ? (
          <p className={styles.muted}>No pending requests.</p>
        ) : (
          pendingRequests.map((r) => (
            <div key={r.id} className={styles.requestCard}>
              <Avatar name={r.clientName} size="sm" />
              <div className={styles.requestMeta}>
                <span className={styles.requestName}>{r.clientName}</span>
                {r.clientEmail && (
                  <span className={styles.requestEmail}>{r.clientEmail}</span>
                )}
                <span className={styles.requestTime}>{r.proposedTime}</span>
                <span className={styles.requestType}>{r.sessionType}</span>
                {r.message && <span className={styles.requestMsg}>&ldquo;{r.message}&rdquo;</span>}
              </div>
              <div className={styles.requestActions}>
                <button
                  type="button"
                  className={styles.btnAccept}
                  onClick={() => handleRequest(r.id, 'accepted')}
                  disabled={actionId === r.id}
                >
                  {actionId === r.id ? '…' : '✓'}
                </button>
                <button
                  type="button"
                  className={styles.btnDecline}
                  onClick={() => handleRequest(r.id, 'declined')}
                  disabled={actionId === r.id}
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* My Clients */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>My Clients</h3>
        {d.clients.length === 0 ? (
          <p className={styles.muted}>No clients yet.</p>
        ) : (
          <div className={styles.clientScroll}>
            {d.clients.map((c) => (
              <div key={c.id} className={styles.clientCard}>
                <Avatar name={c.name} size="md" />
                <span className={styles.clientName}>{c.name}</span>
                <span className={styles.muted}>{c.sessionCount} sessions</span>
                <Link href={`/dashboard/therapist/messages?with=${c.id}`} className={styles.msgLink}>
                  Message
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent notes */}
      {d.recentNotes && d.recentNotes.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Recent Notes</h3>
            <Link href="/dashboard/therapist/notes" className={styles.seeAll}>See all →</Link>
          </div>
          {d.recentNotes.slice(0, 3).map((note) => (
            <div key={note.id} className={styles.noteCard}>
              <span className={styles.noteClient}>{note.clientName}</span>
              <p className={styles.noteExcerpt}>{note.preview}</p>
              <span className={styles.noteTime}>{note.date}</span>
            </div>
          ))}
        </section>
      )}

    </div>
  );
}
