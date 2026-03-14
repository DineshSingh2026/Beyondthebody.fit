'use client';

import { useState } from 'react';
import { useIsMobile } from '@/hooks/useMediaQuery';
import MoodPicker from '@/components/mobile/MoodPicker';
import HapticButton from '@/components/mobile/HapticButton';
import { mockUserDashboard } from '@/lib/mock-data';
import MiniChart from '@/components/dashboard/MiniChart';
import styles from './page.module.css';

export default function UserMoodPage() {
  const isMobile = useIsMobile();
  const [moodIndex, setMoodIndex] = useState(3);
  const d = mockUserDashboard;
  const moodData = d.moodLog.slice(-30).map((m) => m.value);

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
      />
      <HapticButton variant="primary" pill fullWidth className={styles.submit}>
        Log Mood
      </HapticButton>
      <hr className={styles.divider} />
      <h3 className={styles.sectionTitle}>Your journey so far</h3>
      <div className={styles.chartWrap}>
        <MiniChart data={moodData} height={120} width={320} color="var(--green)" />
      </div>
      <ul className={styles.history}>
        {d.moodLog.slice(-7).reverse().map((day) => (
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
