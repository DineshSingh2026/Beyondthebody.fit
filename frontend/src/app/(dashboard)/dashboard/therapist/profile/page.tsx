'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { api, clearToken } from '@/lib/api';
import Avatar from '@/components/ui/Avatar';
import styles from './page.module.css';

const SPECIALIST_ROLES = ['THERAPIST', 'LIFE_COACH', 'HYPNOTHERAPIST', 'MUSIC_TUTOR'];

const roleLabels: Record<string, string> = {
  THERAPIST: 'Therapist',
  LIFE_COACH: 'Life Coach',
  HYPNOTHERAPIST: 'Hypnotherapist',
  MUSIC_TUTOR: 'Music Tutor',
};

export default function TherapistProfilePage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [me, setMe] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const [stats, setStats] = useState<{
    activeClients: number;
    sessionsThisWeek: number;
    avgRating: number;
    completionRate: number;
    earningsThisMonth: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const user = await api.getMe();
        if (user.role === 'ADMIN') { router.replace('/dashboard/admin'); return; }
        if (!SPECIALIST_ROLES.includes(user.role)) { router.replace('/dashboard/user'); return; }
        setMe(user);
        try {
          const d = await api.getSpecialistDashboard(user.id);
          if (d?.stats) {
            setStats({
              activeClients: d.stats.activeClients ?? 0,
              sessionsThisWeek: d.stats.sessionsThisWeek ?? 0,
              avgRating: d.stats.avgRating ?? 0,
              completionRate: d.stats.completionRate ?? 0,
              earningsThisMonth: d.earningsThisMonth ?? 0,
            });
          }
        } catch { /* stats are bonus */ }
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
    return <div className={styles.page}><div className={styles.spinner} /></div>;
  }
  if (error || !me) {
    return <div className={styles.page}><p className={styles.muted}>Could not load profile.</p></div>;
  }

  const specialistLabel = roleLabels[me.role] ?? me.role.replace(/_/g, ' ');

  const statItems = stats ? [
    { label: 'Active Clients',  value: stats.activeClients,                         icon: '👥' },
    { label: 'Sessions/Week',   value: stats.sessionsThisWeek,                      icon: '📅' },
    { label: 'Avg Rating',      value: stats.avgRating > 0 ? `${stats.avgRating.toFixed(1)}★` : '—', icon: '⭐' },
    { label: 'Completion',      value: stats.completionRate > 0 ? `${stats.completionRate}%` : '—', icon: '✅' },
  ] : [];

  const content = (
    <>
      <div className={styles.hero}>
        <Avatar name={me.name} size="lg" />
        <h2 className={styles.name}>{me.name}</h2>
        <p className={styles.email}>{me.email}</p>
        <span className={styles.roleBadge}>{specialistLabel}</span>
        {stats && stats.earningsThisMonth > 0 && (
          <p className={styles.earnings}>
            £{stats.earningsThisMonth.toLocaleString()} this month
          </p>
        )}
      </div>

      {statItems.length > 0 && (
        <div className={styles.statsGrid}>
          {statItems.map((s) => (
            <div key={s.label} className={styles.statCard}>
              <span className={styles.statIcon}>{s.icon}</span>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      <ul className={styles.menu}>
        <li>
          <a href="/dashboard/therapist" className={styles.menuLink}>
            <span>🏠</span> My Practice
            <span className={styles.menuArrow}>›</span>
          </a>
        </li>
        <li>
          <a href="/dashboard/therapist/clients" className={styles.menuLink}>
            <span>👥</span> My Clients
            <span className={styles.menuArrow}>›</span>
          </a>
        </li>
        <li>
          <a href="/dashboard/therapist/schedule" className={styles.menuLink}>
            <span>📅</span> Schedule
            <span className={styles.menuArrow}>›</span>
          </a>
        </li>
        <li>
          <a href="/dashboard/therapist/messages" className={styles.menuLink}>
            <span>💬</span> Messages
            <span className={styles.menuArrow}>›</span>
          </a>
        </li>
        <li>
          <a href="/dashboard/therapist/earnings" className={styles.menuLink}>
            <span>💰</span> Earnings
            <span className={styles.menuArrow}>›</span>
          </a>
        </li>
        <li>
          <a href="/dashboard/therapist/notes" className={styles.menuLink}>
            <span>📝</span> Notes
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
        <h2 className={styles.desktopTitle}>My Profile</h2>
        <p className={styles.desktopSub}>Your account and practice overview.</p>
        {content}
      </div>
    );
  }

  return <div className={styles.page}>{content}</div>;
}
