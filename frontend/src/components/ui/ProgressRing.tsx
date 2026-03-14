'use client';

import styles from './ProgressRing.module.css';

interface ProgressRingProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  strokeColor?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function ProgressRing({
  value,
  size = 80,
  strokeWidth = 6,
  strokeColor = 'var(--green)',
  className = '',
  children,
}: ProgressRingProps) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className={`${styles.wrap} ${className}`.trim()} style={{ width: size, height: size }}>
      <svg width={size} height={size} className={styles.svg}>
        <circle
          className={styles.bg}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={strokeWidth}
        />
        <circle
          className={styles.fg}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={strokeWidth}
          stroke={strokeColor}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {children && <div className={styles.content}>{children}</div>}
    </div>
  );
}
