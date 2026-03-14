'use client';

import { motion } from 'framer-motion';
import styles from './StatCard.module.css';

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaPositive?: boolean;
  icon?: string;
  accentColor?: string;
  index?: number;
}

export default function StatCard({
  label,
  value,
  delta,
  deltaPositive = true,
  icon,
  accentColor,
  index = 0,
}: StatCardProps) {
  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ borderColor: 'var(--border2)', background: 'var(--card2)' }}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.label}>{label}</span>
      <span className={styles.value} style={accentColor ? { color: accentColor } : undefined}>
        {value}
      </span>
      {delta != null && (
        <span className={`${styles.delta} ${deltaPositive ? styles.positive : styles.negative}`}>
          {delta}
        </span>
      )}
    </motion.div>
  );
}
