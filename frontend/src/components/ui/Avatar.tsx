'use client';

import { useState, useEffect } from 'react';
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
  const [imgError, setImgError] = useState(false);
  const initials = getInitials(name);
  const showImg = src && !imgError;

  useEffect(() => {
    setImgError(false);
  }, [src]);

  return (
    <div className={`${styles.avatar} ${styles[size]} ${className}`.trim()}>
      {showImg ? (
        <img
          src={src!}
          alt={name}
          className={styles.img}
          onError={() => setImgError(true)}
        />
      ) : (
        <span className={styles.initials}>{initials}</span>
      )}
    </div>
  );
}
