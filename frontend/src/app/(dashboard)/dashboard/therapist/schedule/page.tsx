'use client';

import { useIsMobile } from '@/hooks/useMediaQuery';
import styles from './page.module.css';

export default function TherapistSchedulePage() {
  const isMobile = useIsMobile();
  if (!isMobile) return <div className={styles.desktop}><p>Schedule — resize to mobile.</p></div>;
  return (
    <div className={styles.page}>
      <h3 className={styles.title}>Calendar &amp; availability</h3>
      <p className={styles.muted}>View and manage your schedule here.</p>
    </div>
  );
}
