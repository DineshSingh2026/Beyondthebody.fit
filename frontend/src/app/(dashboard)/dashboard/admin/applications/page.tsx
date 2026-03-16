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
  const [viewApp, setViewApp] = useState<SpecialistApplication | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const refreshList = () => {
    api.getAdminApplications().then(setApplications).catch(() => {});
  };

  const handleStatus = (id: string, status: string, fromModal?: boolean) => {
    setActionLoading(true);
    api.patchApplication(id, status)
      .then((res) => {
        refreshList();
        if (fromModal) setViewApp(null);
        if (status === 'APPROVED' && res.newUser) {
          setSuccessMessage(`${res.newUser.name} can now log in. Temporary password: ${res.newUser.tempPassword}`);
          setTimeout(() => setSuccessMessage(null), 12000);
        }
      })
      .catch(() => {})
      .finally(() => setActionLoading(false));
  };

  if (loading) {
    return <div className={styles.page}><p className={styles.muted}>Loading…</p></div>;
  }

  const content = (
    <>
      {successMessage && <p className={styles.successMsg}>{successMessage}</p>}
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
              <HapticButton variant="secondary" pill onClick={() => setViewApp(app)}>View</HapticButton>
              {app.status === 'PENDING' && (
                <>
                  <HapticButton variant="primary" pill onClick={() => handleStatus(app.id, 'APPROVED')}>Approve</HapticButton>
                  <HapticButton variant="ghost" pill onClick={() => handleStatus(app.id, 'REJECTED')}>Reject</HapticButton>
                </>
              )}
            </div>
          </div>
        ))
      )}
      {viewApp && (
        <div className={styles.overlay} onClick={() => !actionLoading && setViewApp(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Application profile</h3>
            <div className={styles.modalBody}>
              <Avatar name={viewApp.name} size="lg" />
              <dl className={styles.profileList}>
                <dt>Name</dt><dd>{viewApp.name}</dd>
                <dt>Email</dt><dd>{viewApp.email}</dd>
                <dt>Specialty</dt><dd><Badge variant={variant[viewApp.specialty] ?? 'muted'}>{viewApp.specialty.replace('_', ' ')}</Badge></dd>
                <dt>Applied</dt><dd>{new Date(viewApp.appliedAt).toLocaleString()}</dd>
                <dt>Status</dt><dd>{viewApp.status}</dd>
              </dl>
            </div>
            <div className={styles.modalActions}>
              {viewApp.status === 'PENDING' && (
                <>
                  <HapticButton variant="primary" pill onClick={() => handleStatus(viewApp.id, 'APPROVED', true)} disabled={actionLoading}>Approve</HapticButton>
                  <HapticButton variant="ghost" pill onClick={() => handleStatus(viewApp.id, 'REJECTED', true)} disabled={actionLoading}>Reject</HapticButton>
                </>
              )}
              <HapticButton variant="ghost" pill onClick={() => !actionLoading && setViewApp(null)}>Close</HapticButton>
            </div>
          </div>
        </div>
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
