'use client';

import { useIsMobile } from '@/hooks/useMediaQuery';
import { mockApplications } from '@/lib/mock-data';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import HapticButton from '@/components/mobile/HapticButton';
import styles from './page.module.css';

const variant: Record<string, 'gold' | 'green' | 'purple' | 'teal'> = {
  LIFE_COACH: 'gold', THERAPIST: 'green', HYPNOTHERAPIST: 'purple', MUSIC_TUTOR: 'teal',
};

export default function AdminApplicationsPage() {
  const isMobile = useIsMobile();
  if (!isMobile) return <div className={styles.desktop}><p>Applications — resize to mobile.</p></div>;

  return (
    <div className={styles.page}>
      {mockApplications.map((app) => (
        <div key={app.id} className={styles.card}>
          <Avatar name={app.name} size="md" />
          <div className={styles.info}>
            <span className={styles.name}>{app.name}</span>
            <Badge variant={variant[app.specialty] ?? 'muted'}>{app.specialty.replace('_', ' ')}</Badge>
            <span className={styles.date}>{new Date(app.appliedAt).toLocaleDateString()}</span>
          </div>
          <div className={styles.actions}>
            <HapticButton variant="primary" pill>Approve</HapticButton>
            <HapticButton variant="ghost" pill>Reject</HapticButton>
          </div>
        </div>
      ))}
    </div>
  );
}
