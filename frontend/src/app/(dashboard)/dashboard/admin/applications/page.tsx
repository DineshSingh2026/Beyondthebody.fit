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
  // Approve credentials modal: set when admin clicks Approve
  const [approveApp, setApproveApp] = useState<SpecialistApplication | null>(null);
  const [credEmail, setCredEmail] = useState('');
  const [credPassword, setCredPassword] = useState('');
  const [credConfirm, setCredConfirm] = useState('');
  const [credError, setCredError] = useState('');

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

  useEffect(() => {
    if (approveApp) {
      setCredEmail(approveApp.email || '');
      setCredPassword('');
      setCredConfirm('');
      setCredError('');
    }
  }, [approveApp]);

  const refreshList = () => {
    api.getAdminApplications().then(setApplications).catch(() => {});
  };

  const handleReject = (id: string, fromModal?: boolean) => {
    setActionLoading(true);
    api.patchApplication(id, 'REJECTED')
      .then(() => {
        refreshList();
        if (fromModal) setViewApp(null);
      })
      .catch(() => {})
      .finally(() => setActionLoading(false));
  };

  const handleApproveWithCredentials = () => {
    if (!approveApp) return;
    const email = credEmail.trim();
    if (!email) {
      setCredError('Email is required.');
      return;
    }
    if (credPassword.length < 8) {
      setCredError('Password must be at least 8 characters.');
      return;
    }
    if (credPassword !== credConfirm) {
      setCredError('Passwords do not match.');
      return;
    }
    setCredError('');
    setActionLoading(true);
    api.patchApplication(approveApp.id, 'APPROVED', { email, password: credPassword })
      .then((res) => {
        refreshList();
        setApproveApp(null);
        setViewApp(null);
        if (res.newUser) {
          setSuccessMessage(`${res.newUser.name} can log in with the email and password you set. Share the credentials with them.`);
          setTimeout(() => setSuccessMessage(null), 12000);
        }
      })
      .catch((e) => {
        setCredError(e instanceof Error ? e.message : 'Failed to create account. Try again.');
      })
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
                  <HapticButton variant="primary" pill onClick={() => setApproveApp(app)}>Approve</HapticButton>
                  <HapticButton variant="ghost" pill onClick={() => handleReject(app.id)}>Reject</HapticButton>
                </>
              )}
            </div>
          </div>
        ))
      )}
      {viewApp && (
        <div className={styles.overlay} onClick={() => !actionLoading && setViewApp(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Application — {viewApp.name}</h3>
            <div className={styles.modalBody}>
              <Avatar name={viewApp.name} size="lg" />

              {/* ── Basic ── */}
              <div className={styles.modalSection}>
                <div className={styles.modalSectionTitle}>Basic Information</div>
                <dl className={styles.profileList}>
                  <dt>Name</dt><dd>{viewApp.name}</dd>
                  <dt>Email</dt><dd>{viewApp.email}</dd>
                  <dt>Specialty</dt><dd><Badge variant={variant[viewApp.specialty] ?? 'muted'}>{viewApp.specialty.replace('_', ' ')}</Badge></dd>
                  <dt>Applied</dt><dd>{new Date(viewApp.appliedAt).toLocaleDateString()}</dd>
                  <dt>Status</dt><dd><Badge variant={viewApp.status === 'APPROVED' ? 'green' : viewApp.status === 'REJECTED' ? 'muted' : 'gold'}>{viewApp.status}</Badge></dd>
                  {viewApp.professionalTitle && <><dt>Title</dt><dd>{viewApp.professionalTitle}</dd></>}
                  {viewApp.yearsExperience != null && <><dt>Experience</dt><dd>{viewApp.yearsExperience} years</dd></>}
                  {viewApp.location && <><dt>Location</dt><dd>{viewApp.location}</dd></>}
                </dl>
              </div>

              {/* ── Credentials ── */}
              {(viewApp.qualification || viewApp.certifications || viewApp.licenseNumber) && (
                <div className={styles.modalSection}>
                  <div className={styles.modalSectionTitle}>Credentials</div>
                  <dl className={styles.profileList}>
                    {viewApp.qualification && <><dt>Qualification</dt><dd>{viewApp.qualification}</dd></>}
                    {viewApp.licenseNumber && <><dt>License No.</dt><dd>{viewApp.licenseNumber}</dd></>}
                    {viewApp.certifications && <><dt>Certifications</dt><dd style={{ whiteSpace: 'pre-wrap' }}>{viewApp.certifications}</dd></>}
                  </dl>
                </div>
              )}

              {/* ── Specializations ── */}
              {viewApp.specializations && viewApp.specializations.length > 0 && (
                <div className={styles.modalSection}>
                  <div className={styles.modalSectionTitle}>Specializations</div>
                  <div className={styles.chipRow}>
                    {viewApp.specializations.map((s) => (
                      <span key={s} className={styles.chip}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Services ── */}
              {viewApp.services && viewApp.services.length > 0 && (
                <div className={styles.modalSection}>
                  <div className={styles.modalSectionTitle}>Services</div>
                  <table className={styles.serviceTable}>
                    <thead><tr><th>Service</th><th>Duration</th><th>Price</th><th>Type</th></tr></thead>
                    <tbody>
                      {viewApp.services.map((s, i) => (
                        <tr key={i}>
                          <td>{s.name}</td>
                          <td>{s.duration} min</td>
                          <td>{s.price ? `£${s.price}` : '—'}</td>
                          <td>{s.type}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ── Availability ── */}
              {(viewApp.availableDays?.length || viewApp.availableTimes) && (
                <div className={styles.modalSection}>
                  <div className={styles.modalSectionTitle}>Availability</div>
                  {viewApp.availableDays && viewApp.availableDays.length > 0 && (
                    <div className={styles.chipRow}>
                      {viewApp.availableDays.map((d) => <span key={d} className={styles.chip}>{d}</span>)}
                    </div>
                  )}
                  {viewApp.availableTimes && <p className={styles.modalText}>{viewApp.availableTimes}</p>}
                </div>
              )}

              {/* ── Bio ── */}
              {viewApp.bio && (
                <div className={styles.modalSection}>
                  <div className={styles.modalSectionTitle}>Bio</div>
                  <p className={styles.modalText}>{viewApp.bio}</p>
                </div>
              )}

              {/* ── Media links ── */}
              {(viewApp.profilePhotoUrl || viewApp.introVideoUrl || viewApp.certDocsUrl) && (
                <div className={styles.modalSection}>
                  <div className={styles.modalSectionTitle}>Profile Media</div>
                  <div className={styles.linkRow}>
                    {viewApp.profilePhotoUrl && <a href={viewApp.profilePhotoUrl} target="_blank" rel="noreferrer" className={styles.mediaLink}>📷 Profile Photo</a>}
                    {viewApp.introVideoUrl && <a href={viewApp.introVideoUrl} target="_blank" rel="noreferrer" className={styles.mediaLink}>🎥 Intro Video</a>}
                    {viewApp.certDocsUrl && <a href={viewApp.certDocsUrl} target="_blank" rel="noreferrer" className={styles.mediaLink}>📄 Cert Docs</a>}
                  </div>
                </div>
              )}

              {/* ── Social Proof ── */}
              {(viewApp.clientReviews || viewApp.successStories) && (
                <div className={styles.modalSection}>
                  <div className={styles.modalSectionTitle}>Social Proof</div>
                  {viewApp.clientReviews && <><p className={styles.modalLabel}>Client Reviews</p><p className={styles.modalText}>{viewApp.clientReviews}</p></>}
                  {viewApp.successStories && <><p className={styles.modalLabel}>Success Stories</p><p className={styles.modalText}>{viewApp.successStories}</p></>}
                </div>
              )}

              {/* ── Message ── */}
              {viewApp.message && (
                <div className={styles.modalSection}>
                  <div className={styles.modalSectionTitle}>Message</div>
                  <p className={styles.modalText}>{viewApp.message}</p>
                </div>
              )}
            </div>

            <div className={styles.modalActions}>
              {viewApp.status === 'PENDING' && (
                <>
                  <HapticButton variant="primary" pill onClick={() => setApproveApp(viewApp)} disabled={actionLoading}>✓ Approve</HapticButton>
                  <HapticButton variant="ghost" pill onClick={() => handleReject(viewApp.id, true)} disabled={actionLoading}>✕ Reject</HapticButton>
                </>
              )}
              <HapticButton variant="ghost" pill onClick={() => !actionLoading && setViewApp(null)}>Close</HapticButton>
            </div>
          </div>
        </div>
      )}

      {/* Set login credentials when approving */}
      {approveApp && (
        <div className={styles.overlay} onClick={() => !actionLoading && setApproveApp(null)} style={{ zIndex: 1001 }}>
          <div className={styles.credModal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.credTitle}>Set login for {approveApp.name}</h3>
            <p className={styles.credSub}>Set the email and password the therapist will use to sign in.</p>
            <div className={styles.credForm}>
              <label className={styles.credLabel}>
                Email
                <input
                  type="email"
                  className={styles.credInput}
                  value={credEmail}
                  onChange={(e) => setCredEmail(e.target.value)}
                  placeholder="therapist@example.com"
                  autoComplete="email"
                />
              </label>
              <label className={styles.credLabel}>
                Password (min 8 characters)
                <input
                  type="password"
                  className={styles.credInput}
                  value={credPassword}
                  onChange={(e) => setCredPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </label>
              <label className={styles.credLabel}>
                Confirm password
                <input
                  type="password"
                  className={styles.credInput}
                  value={credConfirm}
                  onChange={(e) => setCredConfirm(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </label>
              {credError && <p className={styles.credError}>{credError}</p>}
            </div>
            <div className={styles.credActions}>
              <button type="button" className={styles.credBtnGhost} onClick={() => !actionLoading && setApproveApp(null)} disabled={actionLoading}>
                Cancel
              </button>
              <button type="button" className={styles.credBtnPrimary} onClick={handleApproveWithCredentials} disabled={actionLoading}>
                {actionLoading ? 'Creating…' : 'Approve & Create Account'}
              </button>
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
