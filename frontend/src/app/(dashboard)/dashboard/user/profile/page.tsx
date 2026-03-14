'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { api } from '@/lib/api';
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

  useEffect(() => {
    (async () => {
      try {
        const me = await api.getMe();
        if (me.role === 'ADMIN') { router.replace('/dashboard/admin'); return; }
        if (SPECIALIST_ROLES.includes(me.role)) { router.replace('/dashboard/therapist'); return; }
        setUser(me);
        const d = await api.getUserDashboard(me.id);
        setHealingScore(d.healingScore?.value ?? 0);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading || !user) {
    return (
      <div className={styles.page}>
        <p className={styles.muted}>Loading profile…</p>
      </div>
    );
  }

  const content = (
    <>
      <div className={styles.hero}>
        <Avatar name={user.name} size="lg" />
        <h2 className={styles.name}>{user.name}</h2>
        <p className={styles.email}>{user.email}</p>
        <div className={styles.scoreWrap}>
          <HealingScoreRing score={healingScore} size={80} label="Healing Journey" />
        </div>
      </div>
      <ul className={styles.menu}>
        <li><a href="#settings">Settings</a></li>
        <li><a href="#notifications">Notifications</a></li>
        <li><a href="#privacy">Privacy</a></li>
        <li><a href="#support">Support</a></li>
      </ul>
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
