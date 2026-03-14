'use client';

import styles from './Avatar.module.css';

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function Avatar({ name, src, size = 'md', className = '' }: AvatarProps) {
  const initials = getInitials(name);
  return (
    <div className={`${styles.avatar} ${styles[size]} ${className}`.trim()}>
      {src ? (
        <img src={src} alt={name} className={styles.img} />
      ) : (
        <span className={styles.initials}>{initials}</span>
      )}
    </div>
  );
}
