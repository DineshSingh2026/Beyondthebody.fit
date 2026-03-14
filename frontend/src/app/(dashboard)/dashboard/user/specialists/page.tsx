'use client';

import { useIsMobile } from '@/hooks/useMediaQuery';
import { mockUserDashboard } from '@/lib/mock-data';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import HapticButton from '@/components/mobile/HapticButton';
import styles from './page.module.css';

export default function UserSpecialistsPage() {
  const isMobile = useIsMobile();
  const d = mockUserDashboard;

  if (!isMobile) {
    return (
      <div className={styles.desktop}>
        <p>My Specialists — resize to mobile.</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {d.specialists.map((sp) => (
        <div key={sp.id} className={styles.card}>
          <Avatar name={sp.name} size="lg" />
          <div className={styles.info}>
            <h3 className={styles.name}>{sp.name}</h3>
            <Badge variant={sp.type === 'THERAPIST' ? 'green' : sp.type === 'LIFE_COACH' ? 'gold' : 'purple'}>
              {sp.type.replace('_', ' ')}
            </Badge>
            <span className={styles.rating}>★ {sp.rating} · {sp.sessionCount} sessions</span>
          </div>
          <HapticButton variant="secondary" pill>Message</HapticButton>
        </div>
      ))}
    </div>
  );
}
