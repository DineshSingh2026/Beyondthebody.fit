'use client';

import { useEffect, useState } from 'react';
import styles from './MiniHealingRing.module.css';

interface MiniHealingRingProps {
  score: number;
  size?: number;
  label?: string;
  strokeColor?: string;
}

export default function MiniHealingRing({
  score,
  size = 120,
  label = 'Healing',
  strokeColor = 'var(--green)',
}: MiniHealingRingProps) {
  const [mounted, setMounted] = useState(false);
  const r = (size - 8) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={styles.wrap} style={{ width: size }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} className={styles.svg}>
          <circle
            className={styles.bg}
            cx={size / 2}
            cy={size / 2}
            r={r}
            strokeWidth="4"
          />
          <circle
            className={styles.stroke}
            cx={size / 2}
            cy={size / 2}
            r={r}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={mounted ? offset : circumference}
            style={{ stroke: strokeColor }}
          />
        </svg>
        <span className={styles.value} style={{ fontSize: size * 0.2 }}>{score}</span>
      </div>
      {label && <span className={styles.label}>{label}</span>}
    </div>
  );
}
