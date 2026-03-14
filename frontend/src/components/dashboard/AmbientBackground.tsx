'use client';

import styles from './AmbientBackground.module.css';

export default function AmbientBackground() {
  return (
    <div className={styles.ambient} aria-hidden>
      <div className={styles.glowGreen} />
      <div className={styles.glowGold} />
    </div>
  );
}
