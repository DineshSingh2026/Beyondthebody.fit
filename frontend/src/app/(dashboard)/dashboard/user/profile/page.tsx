'use client';

import { useIsMobile } from '@/hooks/useMediaQuery';
import { mockUserDashboard } from '@/lib/mock-data';
import Avatar from '@/components/ui/Avatar';
import styles from './page.module.css';

export default function UserProfilePage() {
  const isMobile = useIsMobile();
  const d = mockUserDashboard;

  if (!isMobile) {
    return (
      <div className={styles.desktop}>
        <p>Profile & settings — resize to mobile.</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <Avatar name={d.user.name} size="lg" />
        <h2 className={styles.name}>{d.user.name}</h2>
        <p className={styles.email}>{d.user.email}</p>
      </div>
      <ul className={styles.menu}>
        <li><a href="#settings">Settings</a></li>
        <li><a href="#notifications">Notifications</a></li>
        <li><a href="#privacy">Privacy</a></li>
        <li><a href="#support">Support</a></li>
      </ul>
    </div>
  );
}
