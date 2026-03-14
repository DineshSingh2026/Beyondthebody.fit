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

export default function UserSpecialistsPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [userId, setUserId] = useState<string | null>(null);
  const [specialists, setSpecialists] = useState<SpecialistBrowse[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [requested, setRequested] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        const me = await api.getMe();
        if (me.role === 'ADMIN') { router.replace('/dashboard/admin'); return; }
        if (['THERAPIST','LIFE_COACH','HYPNOTHERAPIST','MUSIC_TUTOR'].includes(me.role)) { router.replace('/dashboard/therapist'); return; }
        setUserId(me.id);
        const list = await browseSpecialists();
        setSpecialists(list);
      } catch {
        // fallback stays empty
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const roles = ['ALL', 'THERAPIST', 'LIFE_COACH', 'HYPNOTHERAPIST', 'MUSIC_TUTOR'];
  const filtered = filter === 'ALL' ? specialists : specialists.filter(s => s.role === filter);

  const handleRequest = (sp: SpecialistBrowse) => {
    setRequested(prev => new Set(prev).add(sp.id));
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
              {requested.has(sp.id) ? (
                <div className={styles.requested}>
                  <span>💚</span> Request sent — we&apos;ll confirm your session within 24 hours.
                </div>
              ) : (
                <button
                  className={styles.requestBtn}
                  type="button"
                  onClick={() => handleRequest(sp)}
                  disabled={!userId}
                >
                  Request a Session
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className={styles.footer}>
        <span>🔒 All sessions are confidential. Not sure who to pick?</span>
        <a href="/dashboard/user" className={styles.footerLink}>Get expert-matched for free →</a>
      </div>
    </div>
  );
}
