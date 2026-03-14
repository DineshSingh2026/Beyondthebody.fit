'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/useMediaQuery';
import MoodPicker from '@/components/mobile/MoodPicker';
import HapticButton from '@/components/mobile/HapticButton';
import { mockUserDashboard } from '@/lib/mock-data';
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
  const [moodLog, setMoodLog] = useState(mockUserDashboard.moodLog);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getMe()
      .then((me) => {
        if (me.role === 'ADMIN') {
          router.replace('/dashboard/admin');
          return;
        }
        if (SPECIALIST_ROLES.includes(me.role)) {
          router.replace('/dashboard/therapist');
          return;
        }
        setUserId(me.id);
        return api.getMoodLog(me.id);
      })
      .then((log) => { if (log) setMoodLog(log); })
      .catch(() => {});
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

  if (!isMobile) {
    return (
      <div className={styles.desktop}>
        <p>Mood tracker — resize to mobile or open on a phone.</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
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
    </div>
  );
}
