'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, browseSpecialists } from '@/lib/api';
import type { SpecialistBrowse, SpecialistProfile } from '@/lib/api';
import { useIsMobile } from '@/hooks/useMediaQuery';
import Avatar from '@/components/ui/Avatar';
import styles from './page.module.css';

const roleLabel: Record<string, string> = {
  THERAPIST: 'Therapist',
  LIFE_COACH: 'Life Coach',
  HYPNOTHERAPIST: 'Hypnotherapist',
  MUSIC_TUTOR: 'Music Therapist',
};

const rolePillClass: Record<string, string> = {
  THERAPIST: 'rolePillGreen',
  LIFE_COACH: 'rolePillGold',
  HYPNOTHERAPIST: 'rolePillPurple',
  MUSIC_TUTOR: 'rolePillTeal',
};

const roleDesc: Record<string, string> = {
  THERAPIST: 'Evidence-based therapy for anxiety, trauma & depression',
  LIFE_COACH: 'Goal alignment, burnout recovery & life transitions',
  HYPNOTHERAPIST: 'Habit change & subconscious reprogramming',
  MUSIC_TUTOR: 'Music therapy for emotional regulation',
};

const SESSION_TYPES = ['Consultation', '1:1 Therapy', 'Coaching', 'Hypnosis', 'Mindfulness', 'Follow-up'];

export default function UserSpecialistsPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [userId, setUserId] = useState<string | null>(null);
  const [specialists, setSpecialists] = useState<SpecialistBrowse[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set());
  const [consultCounts, setConsultCounts] = useState<Record<string, number>>({});
  const [assignedIds, setAssignedIds] = useState<Set<string>>(new Set());
  const [assignmentPendingIds, setAssignmentPendingIds] = useState<Set<string>>(new Set());
  const [assignLoading, setAssignLoading] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

  // View profile modal
  const [viewSp, setViewSp] = useState<SpecialistBrowse | null>(null);
  const [viewProfile, setViewProfile] = useState<SpecialistProfile | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Request consultation modal
  const [showRequestModal, setShowRequestModal] = useState<SpecialistBrowse | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [proposedDate, setProposedDate] = useState('');
  const [proposedTime, setProposedTime] = useState('10:00');
  const [sessionType, setSessionType] = useState('Consultation');
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const me = await api.getMe();
        if (me.role === 'ADMIN') { router.replace('/dashboard/admin'); return; }
        if (['THERAPIST','LIFE_COACH','HYPNOTHERAPIST','MUSIC_TUTOR'].includes(me.role)) { router.replace('/dashboard/therapist'); return; }
        setUserId(me.id);
        const [list, requests, , assignReqs] = await Promise.all([
          browseSpecialists(),
          api.getBookingRequests(me.id).catch(() => [] as { specialistId: string; status: string }[]),
          api.getSpecialists(me.id).catch(() => [] as { id: string }[]),
          api.getAssignmentRequests(me.id).catch(() => [] as { specialistId: string; status: string }[]),
        ]);
        setSpecialists(list);
        const pendingReqIds = new Set(
          (requests || []).filter((r: { status: string }) => r.status === 'PENDING').map((r: { specialistId: string }) => r.specialistId)
        );
        setRequestedIds(pendingReqIds);
        const counts: Record<string, number> = {};
        (requests || []).forEach((r: { specialistId: string; status: string }) => {
          if (r.status === 'ACCEPTED' || r.status === 'COMPLETED') counts[r.specialistId] = (counts[r.specialistId] || 0) + 1;
        });
        setConsultCounts(counts);
        setAssignedIds(new Set((assignReqs || []).filter((r: { status: string }) => r.status === 'APPROVED').map((r: { specialistId: string }) => r.specialistId)));
        setAssignmentPendingIds(new Set((assignReqs || []).filter((r: { status: string }) => r.status === 'PENDING').map((r: { specialistId: string }) => r.specialistId)));
      } catch { /* fallback stays empty */ }
      finally { setLoading(false); }
    })();
  }, [router]);

  const roles = ['ALL', 'THERAPIST', 'LIFE_COACH', 'HYPNOTHERAPIST', 'MUSIC_TUTOR'];
  const filtered = filter === 'ALL' ? specialists : specialists.filter(s => s.role === filter);

  // ── Open View Profile modal ──
  const openViewProfile = async (sp: SpecialistBrowse) => {
    setViewSp(sp);
    setViewProfile(null);
    setViewLoading(true);
    try {
      const p = await api.getSpecialistProfile(sp.id);
      setViewProfile(p);
    } catch { /* keep null — modal shows what we have */ }
    finally { setViewLoading(false); }
  };

  // ── Open Request Consultation modal ──
  const openRequestModal = (sp: SpecialistBrowse) => {
    setViewSp(null); // close view modal if open
    setShowRequestModal(sp);
    setError('');
    const d = new Date(); d.setDate(d.getDate() + 1);
    setProposedDate(d.toISOString().slice(0, 10));
    setProposedTime('10:00');
    setSessionType('Consultation');
    setMessage('');
  };

  const handleSubmitRequest = async () => {
    if (!showRequestModal || !userId) return;
    const at = new Date(`${proposedDate}T${proposedTime}`);
    if (isNaN(at.getTime())) { setError('Please pick a valid date and time.'); return; }
    setSubmitLoading(true);
    setError('');
    try {
      await api.postBookingRequest(userId, {
        specialistId: showRequestModal.id,
        proposedAt: at.toISOString(),
        sessionType,
        message: message.trim() || undefined,
      });
      setRequestedIds(prev => new Set(prev).add(showRequestModal.id));
      setShowRequestModal(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed. Try again.');
    } finally { setSubmitLoading(false); }
  };

  const handleAssignmentRequest = async (sp: SpecialistBrowse) => {
    if (!userId) return;
    setAssignLoading(sp.id);
    setAssignSuccess(null);
    try {
      const res = await api.postAssignmentRequest(userId, sp.id);
      if (res.alreadyAssigned) {
        setAssignedIds(prev => new Set(prev).add(sp.id));
      } else {
        setAssignmentPendingIds(prev => new Set(prev).add(sp.id));
        setAssignSuccess(sp.id);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Request failed.';
      if (msg.includes('already pending')) setAssignmentPendingIds(prev => new Set(prev).add(sp.id));
      else alert(msg);
    } finally { setAssignLoading(null); }
  };

  if (loading) {
    return <div className={styles.loadingWrap}><div className={styles.loadingText}>Finding your perfect specialist…</div></div>;
  }

  return (
    <div className={isMobile ? styles.mobilePage : styles.desktopPage}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerAccent} />
        <h1 className={styles.title}>Find a Specialist</h1>
        <p className={styles.subtitle}>Expert-matched care. Vetted professionals. All RCI-compliant.</p>
      </div>

      {/* ── Filters ── */}
      <div className={styles.filters}>
        {roles.map(r => (
          <button key={r} className={`${styles.filterBtn}${filter === r ? ` ${styles.filterActive}` : ''}`} onClick={() => setFilter(r)} type="button">
            {r === 'ALL' ? 'All' : roleLabel[r] || r}
          </button>
        ))}
      </div>

      {/* ── Cards ── */}
      {filtered.length === 0 ? (
        <div className={styles.empty}><span>🌱</span><p>No specialists in this category yet.</p></div>
      ) : (
        <div className={isMobile ? styles.mobileList : styles.desktopGrid}>
          {filtered.map(sp => {
            const isAssigned = assignedIds.has(sp.id);
            const isPending = assignmentPendingIds.has(sp.id) || assignSuccess === sp.id;
            const canAssign = (consultCounts[sp.id] || 0) >= 2;
            const isRequested = requestedIds.has(sp.id);
            const consultsDone = consultCounts[sp.id] || 0;
            const pillClass = styles[rolePillClass[sp.role] || 'rolePillGreen'];

            return (
              <div key={sp.id} className={styles.card}>
                <div className={styles.cardGlow} />
                <div className={styles.cardBody}>
                  {/* Top row: avatar + name */}
                  <div className={styles.cardTop}>
                    <div className={styles.avatarWrap}>
                      <div className={styles.avatarRing} />
                      <Avatar name={sp.name} src={sp.avatarUrl} size="lg" className={styles.avatarImg} />
                    </div>
                    <div className={styles.cardInfo}>
                      <h3 className={styles.name}>{sp.name}</h3>
                      <div className={styles.roleRow}>
                        <span className={`${styles.rolePill} ${pillClass}`}>{roleLabel[sp.role] || sp.role}</span>
                        {sp.rating != null && <span className={styles.rating}>★ {sp.rating.toFixed(1)}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Mini stats */}
                  <div className={styles.miniStats}>
                    {sp.sessionCount > 0 && (
                      <span className={styles.miniStat}><span className={styles.miniStatVal}>{sp.sessionCount}</span> sessions</span>
                    )}
                    {sp.rating != null && sp.rating >= 4.8 && (
                      <span className={styles.miniStat}>⭐ Top Rated</span>
                    )}
                  </div>

                  <p className={styles.desc}>{roleDesc[sp.role] || 'Specialist care tailored for you.'}</p>

                  <div className={styles.cardBadges}>
                    <span className={styles.trustBadge}>✓ RCI Compliant</span>
                    <span className={styles.trustBadge}>✓ Vetted</span>
                  </div>

                  {!isAssigned && consultsDone > 0 && consultsDone < 2 && (
                    <div className={styles.consultHint}>{consultsDone}/2 consultations completed</div>
                  )}
                </div>

                {/* Status or action buttons */}
                {isAssigned ? (
                  <div className={styles.statusRow}>
                    <div className={styles.assignedTag}>✅ Assigned — Your Specialist</div>
                  </div>
                ) : isPending ? (
                  <div className={styles.statusRow}>
                    <div className={styles.requested}>🕐 Assignment request sent — awaiting admin approval</div>
                  </div>
                ) : isRequested ? (
                  <div className={styles.statusRow}>
                    <div className={styles.requested}>💚 Request sent — the specialist will respond shortly</div>
                  </div>
                ) : (
                  <div className={styles.cardFooter}>
                    <button type="button" className={styles.viewBtn} onClick={() => openViewProfile(sp)}>
                      👁 View Profile
                    </button>
                    {canAssign ? (
                      <button type="button" className={styles.assignBtn} disabled={assignLoading === sp.id || !userId} onClick={() => handleAssignmentRequest(sp)}>
                        {assignLoading === sp.id ? 'Sending…' : '🤝 Get Assigned'}
                      </button>
                    ) : (
                      <button type="button" className={styles.requestBtn} onClick={() => openRequestModal(sp)} disabled={!userId}>
                        {consultsDone === 1 ? 'Book 2nd Consultation' : 'Request Consultation'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── View Profile Modal ── */}
      {viewSp && (
        <div className={styles.overlay} onClick={() => setViewSp(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalGlow} />
            <div className={styles.modalHeader}>
              <div className={styles.modalAvatarWrap}>
                <div className={styles.modalAvatarRing} />
                <Avatar name={viewSp.name} src={viewProfile?.avatarUrl ?? viewSp.avatarUrl} size="lg" className={styles.modalAvatarImg} />
              </div>
              <h2 className={styles.modalName}>{viewSp.name}</h2>
              <div className={styles.modalRoleRow}>
                <span className={`${styles.rolePill} ${styles[rolePillClass[viewSp.role] || 'rolePillGreen']}`}>
                  {roleLabel[viewSp.role] || viewSp.role}
                </span>
                {viewSp.rating != null && <span className={styles.rating}>★ {viewSp.rating.toFixed(1)}</span>}
              </div>
            </div>

            {viewLoading ? (
              <div className={styles.modalLoading}>Loading profile…</div>
            ) : viewProfile ? (
              <>
                {/* Stats */}
                <div className={styles.modalStats}>
                  <div className={styles.modalStatBox}>
                    <span className={styles.modalStatVal}>{viewProfile.sessionCount}</span>
                    <span className={styles.modalStatLabel}>Sessions</span>
                  </div>
                  <div className={styles.modalStatBox}>
                    <span className={styles.modalStatVal}>{viewProfile.clientCount}</span>
                    <span className={styles.modalStatLabel}>Clients</span>
                  </div>
                  <div className={styles.modalStatBox}>
                    <span className={styles.modalStatVal}>{viewProfile.rating ? `${viewProfile.rating}★` : '—'}</span>
                    <span className={styles.modalStatLabel}>Rating</span>
                  </div>
                </div>

                {viewProfile.bio && (
                  <>
                    <div className={styles.modalDivider} />
                    <div className={styles.modalSection}>
                      <h4 className={styles.modalSectionTitle}>About</h4>
                      <p className={styles.modalSectionText}>{viewProfile.bio}</p>
                    </div>
                  </>
                )}

                {viewProfile.approach && (
                  <>
                    <div className={styles.modalDivider} />
                    <div className={styles.modalSection}>
                      <h4 className={styles.modalSectionTitle}>Therapeutic Approach</h4>
                      <p className={styles.modalSectionText}>{viewProfile.approach}</p>
                    </div>
                  </>
                )}

                {viewProfile.specializations.length > 0 && (
                  <>
                    <div className={styles.modalDivider} />
                    <div className={styles.modalSection}>
                      <h4 className={styles.modalSectionTitle}>Specializations</h4>
                      <div className={styles.modalTags}>
                        {viewProfile.specializations.map(s => <span key={s} className={styles.modalTag}>{s}</span>)}
                      </div>
                    </div>
                  </>
                )}

                {viewProfile.qualifications.length > 0 && (
                  <>
                    <div className={styles.modalDivider} />
                    <div className={styles.modalSection}>
                      <h4 className={styles.modalSectionTitle}>Qualifications</h4>
                      <div className={styles.modalTags}>
                        {viewProfile.qualifications.map(q => <span key={q} className={styles.modalTag}>{q}</span>)}
                      </div>
                    </div>
                  </>
                )}

                {viewProfile.experience && (
                  <>
                    <div className={styles.modalDivider} />
                    <div className={styles.modalSection}>
                      <h4 className={styles.modalSectionTitle}>Experience</h4>
                      <p className={styles.modalSectionText}>{viewProfile.experience}</p>
                    </div>
                  </>
                )}

                {viewProfile.languages.length > 0 && (
                  <>
                    <div className={styles.modalDivider} />
                    <div className={styles.modalSection}>
                      <h4 className={styles.modalSectionTitle}>Languages</h4>
                      <div className={styles.modalTags}>
                        {viewProfile.languages.map(l => <span key={l} className={styles.modalTag}>{l}</span>)}
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className={styles.modalSection}>
                <p className={styles.modalSectionText}>{roleDesc[viewSp.role] || 'Specialist care tailored for you.'}</p>
                <div style={{ marginTop: 12 }} className={styles.cardBadges}>
                  <span className={styles.trustBadge}>✓ RCI Compliant</span>
                  <span className={styles.trustBadge}>✓ Vetted</span>
                </div>
              </div>
            )}

            <div className={styles.modalDivider} />
            <div className={styles.modalFooter}>
              {!assignedIds.has(viewSp.id) && !(assignmentPendingIds.has(viewSp.id)) && !requestedIds.has(viewSp.id) && (
                <button type="button" className={styles.modalBtnPrimary} onClick={() => { openRequestModal(viewSp); }}>
                  Request Consultation
                </button>
              )}
              <button type="button" className={styles.modalBtnGhost} onClick={() => setViewSp(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Request Consultation Modal ── */}
      {showRequestModal && (
        <div className={styles.overlay} onClick={() => !submitLoading && setShowRequestModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalGlow} />
            <div className={styles.requestModal}>
              <h3 className={styles.modalTitle}>Request consultation with {showRequestModal.name}</h3>
              {error && <p className={styles.modalError}>{error}</p>}
              <label className={styles.modalLabel}>
                Preferred date
                <input type="date" value={proposedDate} onChange={e => setProposedDate(e.target.value)} className={styles.modalInput} />
              </label>
              <label className={styles.modalLabel}>
                Preferred time
                <input type="time" value={proposedTime} onChange={e => setProposedTime(e.target.value)} className={styles.modalInput} />
              </label>
              <label className={styles.modalLabel}>
                Session type
                <select value={sessionType} onChange={e => setSessionType(e.target.value)} className={styles.modalInput}>
                  {SESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              <label className={styles.modalLabel}>
                Message (optional)
                <textarea value={message} onChange={e => setMessage(e.target.value)} className={styles.modalInput} rows={2} placeholder="Brief note for the specialist" />
              </label>
              <div className={styles.modalActions}>
                <button type="button" className={styles.modalBtnPrimary} onClick={handleSubmitRequest} disabled={submitLoading}>
                  {submitLoading ? 'Sending…' : 'Send Request'}
                </button>
                <button type="button" className={styles.modalBtnGhost} onClick={() => !submitLoading && setShowRequestModal(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.footer}>
        <span>🔒 All sessions are confidential.</span>
      </div>
    </div>
  );
}
