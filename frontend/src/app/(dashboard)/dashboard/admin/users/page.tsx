'use client';

import { useIsMobile } from '@/hooks/useMediaQuery';
import styles from './page.module.css';

export default function AdminUsersPage() {
  const isMobile = useIsMobile();
  if (!isMobile) return <div className={styles.desktop}><p>Users — resize to mobile.</p></div>;
  return <div className={styles.page}><h3 className={styles.title}>All Users</h3><p className={styles.muted}>User list</p></div>;
}
