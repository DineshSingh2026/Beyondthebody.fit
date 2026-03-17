'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { api } from '@/lib/api';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import HapticButton from '@/components/mobile/HapticButton';
import styles from './page.module.css';

interface PendingRequest {
  id: string;
  userId: string;
  clientName: string;
  clientEmail?: string;
  clientAvatar?: string;
  proposedTime: string;
  sessionType: string;
  message?: string;
  requestedAt?: string;
}

export default function TherapistSchedulePage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [specialistId, setSpecialistId] = useState<string | null>(null);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [viewRequestId, setViewRequestId] = useState<string | null>(null);
  const [scheduleModal, setScheduleModal] = useState<{ userId: string; clientName: string } | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('10:00');
  const [scheduleType, setScheduleType] = useState('Consultation');
  const [scheduleDur, setScheduleDur] = useState(50);
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);
  const [scheduleError, setScheduleError] = useState('');

  const load = async () => {
    try {
      const me = await api.getMe();
      if (me.role === 'ADMIN') { router.replace('/dashboard/admin'); return; }
      if (me.role === 'USER') { router.replace('/dashboard/user'); return; }
      setSpecialistId(me.id);
      const d = await api.getSpecialistDashboard(me.id);
      setTodaySchedule(d.todaySchedule ?? []);
      const reqs = await api.getSpecialistRequests(me.id);
      setPendingRequests(Array.isArray(reqs) ? reqs : []);
    } catch {
      setTodaySchedule([]);
      setPendingRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [router]);

  const handleAccept = async (requestId: string) => {
    if (!specialistId) return;
    setActionLoading(requestId);
    try {
      await api.patchBookingRequest(specialistId, requestId, 'accepted');
      await load();
      setViewRequestId(null);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (requestId: string) => {
    if (!specialistId) return;
    setActionLoading(requestId);
    try {
      await api.patchBookingRequest(specialistId, requestId, 'declined');
      await load();
      setViewRequestId(null);
    } finally {
      setActionLoading(null);
    }
  };

  const openScheduleModal = (r: PendingRequest) => {
    setScheduleModal({ userId: r.userId, clientName: r.clientName });
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setScheduleDate(d.toISOString().slice(0, 10));
    setScheduleTime('10:00');
    setScheduleType(r.sessionType || 'Consultation');
    setScheduleDur(50);
    setScheduleError('');
  };

  const submitSchedule = async () => {
    if (!specialistId || !scheduleModal) return;
    const at = new Date(`${scheduleDate}T${scheduleTime}`);
    if (isNaN(at.getTime())) { setScheduleError('Invalid date or time'); return; }
    setScheduleSubmitting(true);
    setScheduleError('');
    try {
      await api.postSpecialistSession(specialistId, {
        userId: scheduleModal.userId,
        scheduledAt: at.toISOString(),
        sessionType: scheduleType,
        durationMinutes: scheduleDur,
      });
      setScheduleModal(null);
      await load();
    } catch (e) {
      setScheduleError(e instanceof Error ? e.message : 'Failed to schedule');
    } finally {
      setScheduleSubmitting(false);
    }
  };

  if (loading) {
    return <div className={styles.page}><p className={styles.muted}>Loading…</p></div>;
  }

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>Calendar & Requests</h2>
      <p className={styles.sub}>Today&apos;s schedule and pending consultation requests. View client data, approve or decline, then message or schedule a meeting.</p>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Today&apos;s schedule</h3>
        {todaySchedule.length === 0 ? (
          <p className={styles.empty}>No sessions scheduled for today.</p>
        ) : (
          <div className={styles.list}>
            {todaySchedule.map((s) => (
              <div key={s.id} className={styles.card}>
                <span className={styles.time}>{s.time}</span>
                <Avatar name={s.clientName} src={s.clientAvatarUrl} size="md" />
                <div className={styles.info}>
                  <span className={styles.name}>{s.clientName}</span>
                  <Badge variant="gold">{s.type}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Pending consultation requests</h3>
        {pendingRequests.length === 0 ? (
          <p className={styles.empty}>No pending requests.</p>
        ) : (
          <div className={styles.list}>
            {pendingRequests.map((r) => (
              <div key={r.id} className={styles.requestCard}>
                <div className={styles.requestHeader} onClick={() => setViewRequestId(viewRequestId === r.id ? null : r.id)}>
                  <Avatar name={r.clientName} src={r.clientAvatar} size="md" />
                  <div className={styles.info}>
                    <span className={styles.name}>{r.clientName}</span>
                    <span className={styles.meta}>{r.proposedTime} · {r.sessionType}</span>
                  </div>
                  <span className={styles.viewToggle}>{viewRequestId === r.id ? '▼' : 'View'}</span>
                </div>
                {viewRequestId === r.id && (
                  <div className={styles.requestDetail}>
                    <dl className={styles.dl}>
                      <dt>Email</dt><dd>{r.clientEmail || '—'}</dd>
                      <dt>Proposed time</dt><dd>{r.proposedTime}</dd>
                      <dt>Session type</dt><dd>{r.sessionType}</dd>
                      {r.message && (<><dt>Message</dt><dd>{r.message}</dd></>)}
                    </dl>
                    <div className={styles.requestActions}>
                      <HapticButton variant="primary" pill onClick={() => handleAccept(r.id)} disabled={!!actionLoading}>
                        {actionLoading === r.id ? '…' : 'Approve'}
                      </HapticButton>
                      <HapticButton variant="ghost" pill onClick={() => handleDecline(r.id)} disabled={!!actionLoading}>
                        Decline
                      </HapticButton>
                      <button type="button" className={styles.linkBtn} onClick={() => openScheduleModal(r)}>
                        Schedule meeting
                      </button>
                      <Link href={`/dashboard/therapist/messages?with=${r.userId}`} className={styles.linkBtn}>
                        Message client
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {scheduleModal && (
        <div className={styles.overlay} onClick={() => !scheduleSubmitting && setScheduleModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Schedule meeting with {scheduleModal.clientName}</h3>
            {scheduleError && <p className={styles.modalError}>{scheduleError}</p>}
            <label className={styles.modalLabel}>
              Date
              <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className={styles.modalInput} />
            </label>
            <label className={styles.modalLabel}>
              Time
              <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className={styles.modalInput} />
            </label>
            <label className={styles.modalLabel}>
              Session type
              <input type="text" value={scheduleType} onChange={(e) => setScheduleType(e.target.value)} className={styles.modalInput} placeholder="e.g. Consultation" />
            </label>
            <label className={styles.modalLabel}>
              Duration (minutes)
              <input type="number" min={15} max={120} value={scheduleDur} onChange={(e) => setScheduleDur(Number(e.target.value) || 50)} className={styles.modalInput} />
            </label>
            <div className={styles.modalActions}>
              <button type="button" className={styles.modalBtnPrimary} onClick={submitSchedule} disabled={scheduleSubmitting}>
                {scheduleSubmitting ? 'Scheduling…' : 'Schedule'}
              </button>
              <button type="button" className={styles.modalBtnGhost} onClick={() => !scheduleSubmitting && setScheduleModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
