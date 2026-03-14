'use client';

import { useRef, useState } from 'react';
import styles from './PullToRefresh.module.css';

const PULL_THRESHOLD = 60;
const RESISTANCE = 0.4;

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  disabled?: boolean;
}

export default function PullToRefresh({ onRefresh, children, disabled }: PullToRefreshProps) {
  const startY = useRef(0);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || refreshing) return;
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || refreshing) return;
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    if (scrollTop > 0) return;
    const dy = (e.touches[0].clientY - startY.current) * RESISTANCE;
    setPull(Math.max(0, dy));
  };

  const handleTouchEnd = async () => {
    if (pull >= PULL_THRESHOLD) {
      setRefreshing(true);
      setPull(0);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    } else {
      setPull(0);
    }
  };

  return (
    <div
      className={styles.wrap}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className={`${styles.indicator} ${(pull > 0 || refreshing) ? styles.visible : ''}`}>
        {refreshing ? (
          <div className={styles.spinner} />
        ) : (
          <span style={{ fontSize: 24 }}>↓</span>
        )}
      </div>
      <div className={styles.content} style={pull > 0 ? { transform: `translateY(${pull}px)` } : undefined}>
        {children}
      </div>
    </div>
  );
}
