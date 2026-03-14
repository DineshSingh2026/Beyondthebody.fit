'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { api } from '@/lib/api';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import HapticButton from '@/components/mobile/HapticButton';
import type { SpecialistApplication } from '@/lib/dashboard-types';
import styles from './page.module.css';

const variant: Record<string, 'gold' | 'green' | 'purple' | 'teal'> = {
  LIFE_COACH: 'gold', THERAPIST: 'green', HYPNOTHERAPIST: 'purple', MUSIC_TUTOR: 'teal',
};

export default function AdminApplicationsPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [applications, setApplications] = useState<SpecialistApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMe()
      .then((me) => {
        if (me.role !== 'ADMIN') router.replace('/dashboard/admin');
      })
      .catch(() => {});
    api.getAdminApplications()
      .then(setApplications)
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, [router]);

  const handleStatus = (id: string, status: string) => {
    api.patchApplication(id, status).then(() => {
      api.getAdminApplications().then(setApplications).catch(() => {});
    }).catch(() => {});
  };

  if (loading) {
    return <div className={styles.page}><p className={styles.muted}>Loading…</p></div>;
  }

  const content = (
    <>
      {applications.length === 0 ? (
        <p className={styles.empty}>No applications at the moment.</p>
      ) : (
        applications.map((app) => (
          <div key={app.id} className={styles.card}>
            <Avatar name={app.name} size="md" />
            <div className={styles.info}>
              <span className={styles.name}>{app.name}</span>
              <Badge variant={variant[app.specialty] ?? 'muted'}>{app.specialty.replace('_', ' ')}</Badge>
              <span className={styles.date}>{new Date(app.appliedAt).toLocaleDateString()}</span>
            </div>
            <div className={styles.actions}>
              <HapticButton variant="primary" pill onClick={() => handleStatus(app.id, 'APPROVED')}>Approve</HapticButton>
              <HapticButton variant="ghost" pill onClick={() => handleStatus(app.id, 'REJECTED')}>Reject</HapticButton>
            </div>
          </div>
        ))
      )}
    </>
  );

  if (!isMobile) {
    return (
      <div className={styles.desktop}>
        <h2 className={styles.desktopTitle}>Specialist Applications</h2>
        <p className={styles.desktopSub}>Review and approve or reject new applications.</p>
        <div className={styles.grid}>{content}</div>
      </div>
    );
  }

  return <div className={styles.page}>{content}</div>;
}
