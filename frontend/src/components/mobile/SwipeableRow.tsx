'use client';

import { useRef, useState } from 'react';
import styles from './SwipeableRow.module.css';

const THRESHOLD = 80;
const MAX_REVEAL = 160;

interface SwipeableRowProps {
  children: React.ReactNode;
  leftAction?: { label: string; onClick: () => void; variant?: 'gold' | 'danger' };
  rightAction?: { label: string; onClick: () => void; variant?: 'gold' | 'danger' };
}

export default function SwipeableRow({
  children,
  leftAction,
  rightAction,
}: SwipeableRowProps) {
  const startX = useRef(0);
  const [offset, setOffset] = useState(0);

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - startX.current;
    const clamped = Math.max(-MAX_REVEAL, Math.min(MAX_REVEAL, dx));
    setOffset(clamped);
  };

  const onTouchEnd = () => {
    if (offset < -THRESHOLD && leftAction) {
      setOffset(-MAX_REVEAL);
      setTimeout(() => {
        leftAction.onClick();
        setOffset(0);
      }, 100);
    } else if (offset > THRESHOLD && rightAction) {
      setOffset(MAX_REVEAL);
      setTimeout(() => {
        rightAction.onClick();
        setOffset(0);
      }, 100);
    } else {
      setOffset(0);
    }
  };

  const showLeft = offset < 0 && leftAction;
  const showRight = offset > 0 && rightAction;

  return (
    <div className={styles.wrap}>
      <div
        className={styles.track}
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className={styles.content}>{children}</div>
        {leftAction && (
          <button
            type="button"
            className={`${styles.action} ${styles[`action${leftAction.variant === 'danger' ? 'Danger' : 'Gold'}`]}`}
            onClick={() => { leftAction.onClick(); setOffset(0); }}
          >
            {leftAction.label}
          </button>
        )}
        {rightAction && (
          <button
            type="button"
            className={`${styles.action} ${styles[`action${rightAction.variant === 'danger' ? 'Danger' : 'Gold'}`]}`}
            onClick={() => { rightAction.onClick(); setOffset(0); }}
          >
            {rightAction.label}
          </button>
        )}
      </div>
    </div>
  );
}
