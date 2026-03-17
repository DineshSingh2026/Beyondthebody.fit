'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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

interface SpecialistRow {
  id: string;
  name: string;
  specialty: string;
  avatarUrl?: string | null;
  sessionCount: number;
  rating: number;
  suspended?: boolean;
}

export default function AdminMobileHome() {
  const [s, setS]                 = useState(emptyAdminPlatformStats);
  const [applications, setApps]   = useState(emptyApplications);
  const [activityLog, setLog]     = useState(mockActivityLog);
  const [bookingReqs, setBooking] = useState<any[]>([]);
  const [assignReqs, setAssignReqs] = useState<{ id: string; clientName: string; clientEmail: string; specialistName: string; specialistRole: string; consultationCount: number; createdAt: string }[]>([]);
  const [specialists, setSpec]    = useState<SpecialistRow[]>([]);
  const [sessions, setSessions]   = useState<any[]>([]);
  const [actionId, setActionId]   = useState<string | null>(null);
  const [assignActionId, setAssignActionId] = useState<string | null>(null);
  const [sessionsAllottedPerRequest, setSessionsAllottedPerRequest] = useState<Record<string, string>>({});
  const [approvedAlert, setApprovedAlert] = useState<{ name: string; email: string; tempPassword: string } | null>(null);

  const loadAll = () => {
    api.getAdminPlatformStats().then(setS).catch(() => {});
    api.getAdminApplications().then(setApps).catch(() => {});
    api.getAdminActivityLog().then(setLog).catch(() => {});
    api.getAdminBookingRequests().then(setBooking).catch(() => {});
    api.getAdminAssignmentRequests().then(setAssignReqs).catch(() => {});
    api.getAdminSpecialists().then((d: SpecialistRow[]) => setSpec(Array.isArray(d) ? d : [])).catch(() => {});
    api.getAdminSessions().then((d: any[]) => setSessions(Array.isArray(d) ? d : [])).catch(() => {});
  };

  useEffect(() => { loadAll(); }, []);

  const handleApplicationStatus = (id: string, status: string) => {
    api.patchApplication(id, status).then((res) => {
      api.getAdminApplications().then(setApps).catch(() => {});
      api.getAdminPlatformStats().then(setS).catch(() => {});
      if (status === 'APPROVED' && res.newUser) {
        setApprovedAlert({ name: res.newUser.name, email: res.newUser.email, tempPassword: res.newUser.tempPassword ?? '' });
      }
    }).catch(() => {});
  };

  const handleSuspend = (sp: SpecialistRow, suspended: boolean) => {
    setActionId(sp.id);
    api.patchUserSuspend(sp.id, suspended)
      .then(() => api.getAdminSpecialists().then((d: SpecialistRow[]) => setSpec(Array.isArray(d) ? d : [])))
      .finally(() => setActionId(null));
  };

  const pendingApps      = applications.filter((a) => a.status === 'PENDING').length;
  const pendingBookings  = bookingReqs.filter((b) => b.status === 'PENDING').length;
  const pendingAssignments = assignReqs.length;

  const handleAssignmentAction = (id: string, status: 'approved' | 'rejected') => {
    setAssignActionId(id);
    const raw = sessionsAllottedPerRequest[id]?.trim();
    const sessionsAllotted = raw !== '' && /^\d+$/.test(raw) ? parseInt(raw, 10) : undefined;
    api.patchAdminAssignmentRequest(id, status, status === 'approved' ? { sessionsAllotted } : undefined)
      .then(() => {
        setSessionsAllottedPerRequest((prev) => { const next = { ...prev }; delete next[id]; return next; });
        api.getAdminAssignmentRequests().then(setAssignReqs).catch(() => {});
        api.getAdminPlatformStats().then(setS).catch(() => {});
      })
      .finally(() => setAssignActionId(null));
  };

  return (
    <div className="mobile-card-enter">

      {/* Approved alert */}
      {approvedAlert && (
        <div className={styles.alert}>
          <div className={styles.alertBody}>
            <strong>{approvedAlert.name}</strong> approved. Share credentials:
            <br />Email: <code>{approvedAlert.email}</code>
            <br />Temp password: <code>{approvedAlert.tempPassword}</code>
          </div>
          <button type="button" className={styles.alertClose} onClick={() => setApprovedAlert(null)}>✕</button>
        </div>
      )}

      {/* Stats grid */}
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
          <span className={styles.statLabel}>Avg Rating</span>
          <span className={styles.statValue}>{s.avgSessionRating}</span>
        </div>
      </section>

      {/* Live indicator */}
      <section className={styles.live}>
        <span className={styles.liveDot} />
        <span>{s.liveUsers} online · {s.liveSessions} active sessions</span>
      </section>

      {/* Pending Actions summary */}
      {(pendingApps > 0 || pendingBookings > 0 || pendingAssignments > 0) && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Pending Actions</h3>
          <div className={styles.pendingRow}>
            {pendingAssignments > 0 && (
              <div className={styles.pendingChip} style={{ borderColor: '#d4af37', color: '#d4af37' }}>
                <span className={styles.pendingNum}>{pendingAssignments}</span>
                <span>Assignments</span>
              </div>
            )}
            {pendingApps > 0 && (
              <Link href="/dashboard/admin/applications" className={styles.pendingChip}>
                <span className={styles.pendingNum}>{pendingApps}</span>
                <span>Applications</span>
              </Link>
            )}
            {pendingBookings > 0 && (
              <div className={styles.pendingChip}>
                <span className={styles.pendingNum}>{pendingBookings}</span>
                <span>Booking Requests</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Quick Actions</h3>
        <div className={styles.quickGrid}>
          <Link href="/dashboard/admin/specialists/add" className={styles.quickBtn}>
            <span className={styles.quickIcon}>➕</span>
            <span>Add Therapist</span>
          </Link>
          <Link href="/dashboard/admin/schedule" className={styles.quickBtn}>
            <span className={styles.quickIcon}>📞</span>
            <span>Schedule Call</span>
          </Link>
          <Link href="/dashboard/admin/users" className={styles.quickBtn}>
            <span className={styles.quickIcon}>👥</span>
            <span>All Users</span>
          </Link>
          <Link href="/dashboard/admin/specialists" className={styles.quickBtn}>
            <span className={styles.quickIcon}>🌟</span>
            <span>All Specialists</span>
          </Link>
          <Link href="/dashboard/admin/applications" className={styles.quickBtn}>
            <span className={styles.quickIcon}>📋</span>
            <span>Applications</span>
          </Link>
          <Link href="/dashboard/admin/revenue" className={styles.quickBtn}>
            <span className={styles.quickIcon}>💰</span>
            <span>Revenue</span>
          </Link>
        </div>
      </section>

      {/* Specialist Applications */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Specialist Applications</h3>
        {applications.length === 0 ? (
          <p className={styles.empty}>No applications yet.</p>
        ) : (
          applications.map((app) => (
            <div key={app.id} className={styles.appCard}>
              <Avatar name={app.name} size="md" />
              <div className={styles.appMeta}>
                <span className={styles.appName}>{app.name}</span>
                <Badge variant={specialtyVariant[app.specialty] ?? 'muted'}>{app.specialty.replace('_', ' ')}</Badge>
                <span className={styles.appStatus}>{new Date(app.appliedAt).toLocaleDateString()}</span>
              </div>
              <div className={styles.appActions}>
                <Badge variant={app.status === 'PENDING' ? 'warn' : 'green'}>{app.status}</Badge>
                {app.status === 'PENDING' && (
                  <div className={styles.appBtns}>
                    <button type="button" className={styles.btnApprove} onClick={() => handleApplicationStatus(app.id, 'APPROVED')}>✓ Approve</button>
                    <button type="button" className={styles.btnReject} onClick={() => handleApplicationStatus(app.id, 'REJECTED')}>✕ Reject</button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </section>

      {/* Assignment Requests */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>
          Assignment Requests{assignReqs.length > 0 && <span className={styles.badge}>{assignReqs.length}</span>}
        </h3>
        {assignReqs.length === 0 ? (
          <p className={styles.empty}>No pending assignment requests.</p>
        ) : (
          assignReqs.map((ar) => (
            <div key={ar.id} className={styles.assignCard}>
              <div className={styles.assignInfo}>
                <span className={styles.assignClient}>{ar.clientName}</span>
                <span className={styles.assignEmail}>{ar.clientEmail}</span>
                <span className={styles.assignSp}>{ar.specialistName} · <Badge variant={ar.specialistRole === 'THERAPIST' ? 'green' : ar.specialistRole === 'LIFE_COACH' ? 'gold' : 'purple'}>{ar.specialistRole.replace('_', ' ')}</Badge></span>
                <span className={styles.assignCount}>{ar.consultationCount} consultations done</span>
                <label className={styles.assignSessionsLabel}>
                  Sessions allotted:
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 12"
                    value={sessionsAllottedPerRequest[ar.id] ?? ''}
                    onChange={(e) => setSessionsAllottedPerRequest((prev) => ({ ...prev, [ar.id]: e.target.value }))}
                    className={styles.assignSessionsInput}
                  />
                </label>
              </div>
              <div className={styles.assignActions}>
                <button
                  type="button"
                  className={styles.btnApprove}
                  disabled={assignActionId === ar.id}
                  onClick={() => handleAssignmentAction(ar.id, 'approved')}
                >
                  {assignActionId === ar.id ? '…' : '✓'}
                </button>
                <button
                  type="button"
                  className={styles.btnReject}
                  disabled={assignActionId === ar.id}
                  onClick={() => handleAssignmentAction(ar.id, 'rejected')}
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Consultation Requests */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Consultation Requests</h3>
        {bookingReqs.length === 0 ? (
          <p className={styles.empty}>No consultation requests yet.</p>
        ) : (
          bookingReqs.slice(0, 10).map((br) => (
            <div key={br.id} className={styles.bookingCard}>
              <div className={styles.bookingRow}>
                <span className={styles.bookingUser}>{br.userName}</span>
                <Badge variant={br.status === 'PENDING' ? 'warn' : br.status === 'ACCEPTED' ? 'green' : 'muted'}>
                  {br.status}
                </Badge>
              </div>
              <span className={styles.bookingMeta}>
                → {br.specialistName} · {br.sessionType || '—'}
              </span>
              {br.proposedAt && (
                <span className={styles.bookingTime}>{new Date(br.proposedAt).toLocaleString()}</span>
              )}
            </div>
          ))
        )}
      </section>

      {/* Specialist Roster */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Specialist Roster</h3>
        {specialists.length === 0 ? (
          <p className={styles.empty}>No specialists yet.</p>
        ) : (
          specialists.map((sp) => (
            <div key={sp.id} className={styles.rosterCard}>
              <Avatar name={sp.name} src={sp.avatarUrl} size="sm" />
              <div className={styles.rosterMeta}>
                <span className={styles.rosterName}>{sp.name}</span>
                <Badge variant={specialtyVariant[sp.specialty] ?? 'muted'}>{sp.specialty?.replace('_', ' ')}</Badge>
                <span className={styles.rosterSub}>{sp.sessionCount} sessions · ★ {sp.rating || '—'}</span>
              </div>
              <div className={styles.rosterActions}>
                {sp.suspended && <Badge variant="warn">Suspended</Badge>}
                <Link href={`/dashboard/admin/specialists/${sp.id}`} className={styles.linkBtn}>Metrics</Link>
                {sp.suspended ? (
                  <button type="button" className={styles.btnSm} onClick={() => handleSuspend(sp, false)} disabled={!!actionId}>Unban</button>
                ) : (
                  <button type="button" className={styles.btnDanger} onClick={() => handleSuspend(sp, true)} disabled={!!actionId}>Suspend</button>
                )}
              </div>
            </div>
          ))
        )}
      </section>

      {/* Recent Sessions */}
      {sessions.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Recent Sessions</h3>
          {sessions.slice(0, 8).map((sess: { id: string; userName: string; specialistName: string; durationMinutes: number; rating: number | null; status: string; scheduledDate?: string; scheduledTime?: string; meetingLink?: string | null }) => (
            <div key={sess.id} className={styles.sessionCard}>
              <div className={styles.sessionRow}>
                <span className={styles.sessionUser}>{sess.userName}</span>
                <Badge variant={sess.status === 'COMPLETED' ? 'green' : 'gold'}>{sess.status?.replace('_', ' ')}</Badge>
              </div>
              <span className={styles.sessionMeta}>
                {sess.specialistName} · {sess.durationMinutes} min
                {sess.rating != null ? ` · ★ ${sess.rating}` : ''}
                {sess.scheduledDate ? ` · ${sess.scheduledDate}` : ''}
              </span>
              {sess.meetingLink && sess.status !== 'COMPLETED' && (
                <a
                  href={sess.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.joinLinkAdmin}
                >
                  🎥 Join Meeting
                </a>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Revenue */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Revenue Today</h3>
        <div className={styles.revenueCard}>
          <span className={styles.revenueNum}>£{s.revenueToday.toLocaleString()}</span>
          <span className={styles.delta}>+{s.revenueDeltaPercent}% vs yesterday</span>
        </div>
      </section>

      {/* User Growth */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>User Growth</h3>
        <div className={styles.chartWrap}>
          <MiniChart data={mockUserGrowthChart} height={100} width={320} color="var(--green)" />
        </div>
      </section>

      {/* Activity Log */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Activity Log</h3>
        <ul className={styles.log}>
          {activityLog.slice(0, 8).map((entry) => (
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
