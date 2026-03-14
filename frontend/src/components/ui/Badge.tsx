'use client';

import styles from './Badge.module.css';

type BadgeVariant = 'gold' | 'green' | 'purple' | 'teal' | 'muted' | 'danger' | 'warn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export default function Badge({ children, variant = 'muted', className = '' }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${className}`.trim()}>
      {children}
    </span>
  );
}
