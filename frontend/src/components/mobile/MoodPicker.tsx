'use client';

import { useHaptic } from '@/hooks/useHaptic';
import styles from './MoodPicker.module.css';

const MOODS = [
  { emoji: '😔', label: 'Struggling' },
  { emoji: '😟', label: 'Low' },
  { emoji: '😐', label: 'Neutral' },
  { emoji: '🙂', label: 'Better' },
  { emoji: '😊', label: 'Good' },
  { emoji: '😄', label: 'Great' },
  { emoji: '🌟', label: 'Thriving' },
] as const;

interface MoodPickerProps {
  value?: number;
  onChange?: (index: number) => void;
}

export default function MoodPicker({ value = 3, onChange }: MoodPickerProps) {
  const haptic = useHaptic();
  const selectedIndex = Math.min(MOODS.length - 1, Math.max(0, value));

  return (
    <div className={styles.wrap}>
      <div className={styles.emojiRow}>
        {MOODS.map((m, i) => (
          <button
            key={m.emoji}
            type="button"
            className={`${styles.emojiBtn} ${i === selectedIndex ? styles.selected : styles.unselected}`}
            onClick={() => {
              haptic.light();
              onChange?.(i);
            }}
            aria-label={m.label}
            aria-pressed={i === selectedIndex}
          >
            {m.emoji}
          </button>
        ))}
      </div>
      <span className={styles.label}>{MOODS[selectedIndex].label}</span>
    </div>
  );
}
