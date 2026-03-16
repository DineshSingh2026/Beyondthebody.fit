'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import styles from './page.module.css';

export default function AdminSchedulePage() {
  const router = useRouter();
  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [specialists, setSpecialists] = useState<{ id: string; name: string; specialty: string }[]>([]);
  const [userId, setUserId] = useState('');
  const [specialistId, setSpecialistId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [sessionType, setSessionType] = useState('Session');
  const [duration, setDuration] = useState(50);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.getMe().then((me) => { if (me.role !== 'ADMIN') router.replace('/dashboard/admin'); }).catch(() => {});
    Promise.all([api.getAdminUsers(), api.getAdminSpecialists()])
      .then(([u, s]) => {
        setUsers(Array.isArray(u) ? u : []);
        setSpecialists(Array.isArray(s) ? s : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!userId || !specialistId || !date || !time) {
      setError('Please select client, specialist, date and time.');
      return;
    }
    const at = new Date(`${date}T${time}`);
    if (isNaN(at.getTime())) {
      setError('Invalid date or time.');
      return;
    }
    setSubmitting(true);
    api.postAdminSession({
      userId,
      specialistId,
      scheduledAt: at.toISOString(),
      sessionType: sessionType || 'Session',
      durationMinutes: duration,
    })
      .then(() => setSuccess(true))
      .catch((e) => setError(e?.message || 'Failed to schedule'))
      .finally(() => setSubmitting(false));
  };

  if (loading) return <div className={styles.page}><p className={styles.muted}>Loading…</p></div>;

  if (success) {
    return (
      <div className={styles.page}>
        <div className={styles.success}>
          <h2 className={styles.title}>Session scheduled</h2>
          <p>Both client and therapist have been notified via messaging.</p>
          <Link href="/dashboard/admin/schedule" className={styles.link}>Schedule another</Link>
          <Link href="/dashboard/admin" className={styles.link}>Back to dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>Schedule a call</h2>
      <p className={styles.sub}>Schedule a session between a client and a therapist. Both will be notified via Messages.</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <p className={styles.error}>{error}</p>}
        <label className={styles.label}>
          Client
          <select value={userId} onChange={(e) => setUserId(e.target.value)} className={styles.input} required>
            <option value="">Select user</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
            ))}
          </select>
        </label>
        <label className={styles.label}>
          Therapist
          <select value={specialistId} onChange={(e) => setSpecialistId(e.target.value)} className={styles.input} required>
            <option value="">Select specialist</option>
            {specialists.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.specialty?.replace('_', ' ')})</option>
            ))}
          </select>
        </label>
        <label className={styles.label}>
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={styles.input} required />
        </label>
        <label className={styles.label}>
          Time
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={styles.input} required />
        </label>
        <label className={styles.label}>
          Session type
          <input type="text" value={sessionType} onChange={(e) => setSessionType(e.target.value)} className={styles.input} placeholder="e.g. Session" />
        </label>
        <label className={styles.label}>
          Duration (minutes)
          <input type="number" min={15} max={120} value={duration} onChange={(e) => setDuration(Number(e.target.value) || 50)} className={styles.input} />
        </label>
        <div className={styles.actions}>
          <button type="submit" className={styles.submit} disabled={submitting}>{submitting ? 'Scheduling…' : 'Schedule & notify both'}</button>
          <Link href="/dashboard/admin" className={styles.cancel}>Cancel</Link>
        </div>
      </form>
    </div>
  );
}
