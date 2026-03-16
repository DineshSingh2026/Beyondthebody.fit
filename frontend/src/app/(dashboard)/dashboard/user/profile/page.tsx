'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { api, clearToken } from '@/lib/api';
import Avatar from '@/components/ui/Avatar';
import HealingScoreRing from '@/components/dashboard/HealingScoreRing';
import styles from './page.module.css';

const SPECIALIST_ROLES = ['THERAPIST', 'LIFE_COACH', 'HYPNOTHERAPIST', 'MUSIC_TUTOR'];

export default function UserProfilePage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [user, setUser] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const [healingScore, setHealingScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const me = await api.getMe();
        if (me.role === 'ADMIN') { router.replace('/dashboard/admin'); return; }
        if (SPECIALIST_ROLES.includes(me.role)) { router.replace('/dashboard/therapist'); return; }
        setUser(me);
        // Healing score is bonus data — don't block the profile if it fails
        try {
          const d = await api.getUserDashboard(me.id);
          setHealingScore(d.healingScore?.value ?? 0);
        } catch {
          /* non-critical, healing score stays 0 */
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const handleLogout = () => {
    clearToken();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className={styles.page}>
        <p className={styles.muted}>Could not load profile. Please try again.</p>
      </div>
    );
  }

  const roleLabel = user.role.replace(/_/g, ' ');

  const content = (
    <>
      <div className={styles.hero}>
        <Avatar name={user.name} size="lg" />
        <h2 className={styles.name}>{user.name}</h2>
        <p className={styles.email}>{user.email}</p>
        <span className={styles.roleBadge}>{roleLabel}</span>
        {healingScore > 0 && (
          <div className={styles.scoreWrap}>
            <HealingScoreRing score={healingScore} size={80} label="Healing Journey" />
          </div>
        )}
      </div>

      <ul className={styles.menu}>
        <li>
          <a href="/dashboard/user/mood" className={styles.menuLink}>
            <span>💚</span> Mood Tracker
            <span className={styles.menuArrow}>›</span>
          </a>
        </li>
        <li>
          <a href="/dashboard/user/sessions" className={styles.menuLink}>
            <span>📅</span> My Sessions
            <span className={styles.menuArrow}>›</span>
          </a>
        </li>
        <li>
          <a href="/dashboard/user/specialists" className={styles.menuLink}>
            <span>🌟</span> Find Specialists
            <span className={styles.menuArrow}>›</span>
          </a>
        </li>
        <li>
          <a href="/dashboard/user/messages" className={styles.menuLink}>
            <span>💬</span> Messages
            <span className={styles.menuArrow}>›</span>
          </a>
        </li>
      </ul>

      <div className={styles.logoutRow}>
        <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
          <span>⏻</span> Log out
        </button>
      </div>
    </>
  );

  if (!isMobile) {
    return (
      <div className={styles.desktop}>
        <h2 className={styles.desktopTitle}>Profile</h2>
        <p className={styles.desktopSub}>Your account and wellness overview.</p>
        {content}
      </div>
    );
  }

  return <div className={styles.page}>{content}</div>;
}
