'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styles from './HealingScoreRing.module.css';

interface HealingScoreRingProps {
  score: number;
  size?: number;
  strokeColor?: string;
  label?: string;
}

export default function HealingScoreRing({
  score,
  size = 120,
  strokeColor = 'var(--green)',
  label = 'Healing Journey',
}: HealingScoreRingProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const r = (size - 10) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className={styles.wrap} style={{ width: size, height: size }}>
      <svg width={size} height={size} className={styles.svg}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          className={styles.bg}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={6}
        />
        <motion.circle
          className={styles.fg}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={6}
          stroke={strokeColor}
          strokeDasharray={circumference}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: mounted ? offset : circumference }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ filter: 'url(#glow)' }}
        />
      </svg>
      <div className={styles.content}>
        <motion.span
          className={styles.score}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {score}
        </motion.span>
        {label && <span className={styles.label}>{label}</span>}
      </div>
    </div>
  );
}
