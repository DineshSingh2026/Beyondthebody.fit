'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, browseSpecialists } from '@/lib/api';
import type { SpecialistBrowse } from '@/lib/api';
import { useIsMobile } from '@/hooks/useMediaQuery';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import styles from './page.module.css';

const roleLabel: Record<string, string> = {
  THERAPIST: 'Therapist',
  LIFE_COACH: 'Life Coach',
  HYPNOTHERAPIST: 'Hypnotherapist',
  MUSIC_TUTOR: 'Music Therapist',
};

const roleBadge: Record<string, 'green' | 'gold' | 'purple' | 'teal'> = {
  THERAPIST: 'green',
  LIFE_COACH: 'gold',
  HYPNOTHERAPIST: 'purple',
  MUSIC_TUTOR: 'teal',
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
  const [showModal, setShowModal] = useState<SpecialistBrowse | null>(null);
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
        const [list, requests] = await Promise.all([browseSpecialists(), api.getBookingRequests(me.id).catch(() => [])]);
        setSpecialists(list);
        const pending = new Set((requests || []).map((r: { specialistId: string }) => r.specialistId));
        setRequestedIds(pending);
      } catch {
        // fallback stays empty
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const roles = ['ALL', 'THERAPIST', 'LIFE_COACH', 'HYPNOTHERAPIST', 'MUSIC_TUTOR'];
  const filtered = filter === 'ALL' ? specialists : specialists.filter(s => s.role === filter);

  const openRequestModal = (sp: SpecialistBrowse) => {
    setShowModal(sp);
    setError('');
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setProposedDate(d.toISOString().slice(0, 10));
    setProposedTime('10:00');
    setSessionType('Consultation');
    setMessage('');
  };

  const handleSubmitRequest = async () => {
    if (!showModal || !userId) return;
    const at = new Date(`${proposedDate}T${proposedTime}`);
    if (isNaN(at.getTime())) { setError('Please pick a valid date and time.'); return; }
    setSubmitLoading(true);
    setError('');
    try {
      await api.postBookingRequest(userId, {
        specialistId: showModal.id,
        proposedAt: at.toISOString(),
        sessionType,
        message: message.trim() || undefined,
      });
      setRequestedIds(prev => new Set(prev).add(showModal.id));
      setShowModal(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed. Try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.loadingText}>Finding your perfect specialist…</div>
      </div>
    );
  }

  return (
    <div className={isMobile ? styles.mobilePage : styles.desktopPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>Find a Specialist</h1>
        <p className={styles.subtitle}>Expert-matched care. Vetted professionals. All RCI-compliant.</p>
      </div>

      <div className={styles.filters}>
        {roles.map(r => (
          <button
            key={r}
            className={`${styles.filterBtn}${filter === r ? ` ${styles.filterActive}` : ''}`}
            onClick={() => setFilter(r)}
            type="button"
          >
            {r === 'ALL' ? 'All' : roleLabel[r] || r}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <span>🌱</span>
          <p>No specialists in this category yet. Check back soon!</p>
        </div>
      ) : (
        <div className={isMobile ? styles.mobileList : styles.desktopGrid}>
          {filtered.map(sp => (
            <div key={sp.id} className={styles.card}>
              <div className={styles.cardTop}>
                <Avatar name={sp.name} size={isMobile ? 'md' : 'lg'} />
                <div className={styles.cardInfo}>
                  <h3 className={styles.name}>{sp.name}</h3>
                  <Badge variant={roleBadge[sp.role] || 'green'}>{roleLabel[sp.role] || sp.role}</Badge>
                  {sp.rating != null && (
                    <span className={styles.rating}>★ {sp.rating.toFixed(1)}</span>
                  )}
                  {sp.sessionCount > 0 && (
                    <span className={styles.sessions}>{sp.sessionCount} sessions completed</span>
                  )}
                </div>
              </div>
              <p className={styles.desc}>{roleDesc[sp.role] || 'Specialist care tailored for you.'}</p>
              <div className={styles.cardBadges}>
                <span className={styles.trustBadge}>✓ RCI Compliant</span>
                <span className={styles.trustBadge}>✓ Vetted</span>
                {sp.rating != null && sp.rating >= 4.8 && <span className={styles.trustBadge}>⭐ Top Rated</span>}
              </div>
              {requestedIds.has(sp.id) ? (
                <div className={styles.requested}>
                  <span>💚</span> Request sent — the specialist will respond shortly.
                </div>
              ) : (
                <button
                  className={styles.requestBtn}
                  type="button"
                  onClick={() => openRequestModal(sp)}
                  disabled={!userId}
                >
                  Request for consultation
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className={styles.overlay} onClick={() => !submitLoading && setShowModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Request consultation with {showModal.name}</h3>
            {error && <p className={styles.modalError}>{error}</p>}
            <label className={styles.modalLabel}>
              Preferred date
              <input type="date" value={proposedDate} onChange={(e) => setProposedDate(e.target.value)} className={styles.modalInput} />
            </label>
            <label className={styles.modalLabel}>
              Preferred time
              <input type="time" value={proposedTime} onChange={(e) => setProposedTime(e.target.value)} className={styles.modalInput} />
            </label>
            <label className={styles.modalLabel}>
              Session type
              <select value={sessionType} onChange={(e) => setSessionType(e.target.value)} className={styles.modalInput}>
                {SESSION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label className={styles.modalLabel}>
              Message (optional)
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} className={styles.modalInput} rows={2} placeholder="Brief note for the specialist" />
            </label>
            <div className={styles.modalActions}>
              <button type="button" className={styles.modalBtnPrimary} onClick={handleSubmitRequest} disabled={submitLoading}>
                {submitLoading ? 'Sending…' : 'Send request'}
              </button>
              <button type="button" className={styles.modalBtnGhost} onClick={() => !submitLoading && setShowModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.footer}>
        <span>🔒 All sessions are confidential. Not sure who to pick?</span>
        <a href="/dashboard/user" className={styles.footerLink}>Get expert-matched for free →</a>
      </div>
    </div>
  );
}
