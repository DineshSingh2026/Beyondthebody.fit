'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/useMediaQuery';
import MoodPicker from '@/components/mobile/MoodPicker';
import HapticButton from '@/components/mobile/HapticButton';
import { api } from '@/lib/api';
import MiniChart from '@/components/dashboard/MiniChart';
import styles from './page.module.css';

const SPECIALIST_ROLES = ['THERAPIST', 'LIFE_COACH', 'HYPNOTHERAPIST', 'MUSIC_TUTOR'];

export default function UserMoodPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [userId, setUserId] = useState<string | null>(null);
  const [moodIndex, setMoodIndex] = useState(3);
  const [note, setNote] = useState('');
  const [moodLog, setMoodLog] = useState<import('@/lib/dashboard-types').MoodDay[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const me = await api.getMe();
        if (me.role === 'ADMIN') { router.replace('/dashboard/admin'); return; }
        if (SPECIALIST_ROLES.includes(me.role)) { router.replace('/dashboard/therapist'); return; }
        setUserId(me.id);
        const log = await api.getMoodLog(me.id) as import('@/lib/dashboard-types').MoodDay[];
        setMoodLog(log);
      } catch { /* keep default mood log */ }
    })();
  }, [router]);

  const handleLog = () => {
    if (!userId) return;
    const date = new Date().toISOString().slice(0, 10);
    const value = moodIndex + 1;
    setSubmitting(true);
    api.postMoodLog(userId, { date, value, note })
      .then(() => {
        setNote('');
        return api.getMoodLog(userId);
      })
      .then(setMoodLog)
      .catch(() => {})
      .finally(() => setSubmitting(false));
  };

  const moodData = moodLog.slice(-30).map((m) => m.value);

  const mainContent = (
    <>
      <h2 className={styles.heading}>How are you feeling?</h2>
      <MoodPicker value={moodIndex} onChange={setMoodIndex} />
      <textarea
        className={styles.textarea}
        placeholder="What's on your mind? (optional)"
        rows={4}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <HapticButton variant="primary" pill fullWidth className={styles.submit} onClick={handleLog} disabled={submitting}>
        {submitting ? 'Saving…' : 'Log Mood'}
      </HapticButton>
      <hr className={styles.divider} />
      <h3 className={styles.sectionTitle}>Your journey so far</h3>
      <div className={styles.chartWrap}>
        <MiniChart data={moodData} height={120} width={320} color="var(--green)" />
      </div>
      <ul className={styles.history}>
        {moodLog.slice(-7).reverse().map((day) => (
          <li key={day.date}>
            <span className={styles.date}>{day.date}</span>
            <span className={styles.emoji}>{day.value >= 7 ? '😊' : day.value >= 5 ? '🙂' : '😐'}</span>
            {day.note && <span className={styles.note}>{day.note}</span>}
          </li>
        ))}
      </ul>
    </>
  );

  if (!isMobile) {
    return (
      <div className={styles.desktop}>
        <h2 className={styles.desktopTitle}>Mood Tracker</h2>
        <p className={styles.desktopSub}>Log how you feel and track your journey.</p>
        <div className={styles.desktopContent}>{mainContent}</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>{mainContent}</div>
  );
}
