'use client';

import { useIsMobile } from '@/hooks/useMediaQuery';
import styles from './page.module.css';

export default function AdminSpecialistsPage() {
  const isMobile = useIsMobile();
  if (!isMobile) return <div className={styles.desktop}><p>Specialists — resize to mobile.</p></div>;
  return <div className={styles.page}><h3 className={styles.title}>Specialist Roster</h3></div>;
}
