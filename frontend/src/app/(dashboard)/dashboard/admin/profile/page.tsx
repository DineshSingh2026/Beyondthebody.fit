'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { api, clearToken } from '@/lib/api';
import Avatar from '@/components/ui/Avatar';
import styles from './page.module.css';

interface PlatformStats {
  totalUsers?: number;
  totalSpecialists?: number;
  activeSessions?: number;
  pendingApplications?: number;
  totalRevenue?: number;
}

export default function AdminProfilePage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [admin, setAdmin] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const [stats, setStats] = useState<PlatformStats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const me = await api.getMe();
        if (me.role !== 'ADMIN') { router.replace('/dashboard/user'); return; }
        setAdmin(me);
        try {
          const s = await api.getAdminPlatformStats();
          setStats(s ?? {});
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
  if (error || !admin) {
    return <div className={styles.page}><p className={styles.muted}>Could not load profile.</p></div>;
  }

  const statItems = [
    { label: 'Total Users',       value: stats.totalUsers        ?? '—', icon: '👥' },
    { label: 'Specialists',       value: stats.totalSpecialists  ?? '—', icon: '🌟' },
    { label: 'Active Sessions',   value: stats.activeSessions    ?? '—', icon: '📅' },
    { label: 'Pending Apps',      value: stats.pendingApplications ?? '—', icon: '📋' },
  ];

  const content = (
    <>
      <div className={styles.hero}>
        <Avatar name={admin.name} size="lg" />
        <h2 className={styles.name}>{admin.name}</h2>
        <p className={styles.email}>{admin.email}</p>
        <span className={styles.roleBadge}>Platform Admin</span>
      </div>

      <div className={styles.statsGrid}>
        {statItems.map((s) => (
          <div key={s.label} className={styles.statCard}>
            <span className={styles.statIcon}>{s.icon}</span>
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      <ul className={styles.menu}>
        <li>
          <a href="/dashboard/admin" className={styles.menuLink}>
            <span>📊</span> Overview
            <span className={styles.menuArrow}>›</span>
          </a>
        </li>
        <li>
          <a href="/dashboard/admin/users" className={styles.menuLink}>
            <span>👥</span> Manage Users
            <span className={styles.menuArrow}>›</span>
          </a>
        </li>
        <li>
          <a href="/dashboard/admin/specialists" className={styles.menuLink}>
            <span>🌟</span> Manage Specialists
            <span className={styles.menuArrow}>›</span>
          </a>
        </li>
        <li>
          <a href="/dashboard/admin/applications" className={styles.menuLink}>
            <span>📋</span> Applications
            <span className={styles.menuArrow}>›</span>
          </a>
        </li>
        <li>
          <a href="/dashboard/admin/revenue" className={styles.menuLink}>
            <span>💰</span> Revenue
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
        <h2 className={styles.desktopTitle}>Admin Profile</h2>
        <p className={styles.desktopSub}>Your account and platform overview.</p>
        {content}
      </div>
    );
  }

  return <div className={styles.page}>{content}</div>;
}
