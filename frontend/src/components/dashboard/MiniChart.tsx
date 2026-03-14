'use client';

import { motion } from 'framer-motion';
import styles from './MiniChart.module.css';

interface MiniChartProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  className?: string;
}

function buildSmoothPath(values: number[], w: number, h: number): string {
  if (values.length < 2) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = w / (values.length - 1);
  const points = values.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  });
  return 'M' + points.join(' L');
}

export default function MiniChart({
  data,
  color = 'var(--green)',
  height = 32,
  width = 120,
  className = '',
}: MiniChartProps) {
  const pathD = buildSmoothPath(data, width, height);
  return (
    <svg
      className={`${styles.chart} ${className}`.trim()}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <motion.path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </svg>
  );
}
