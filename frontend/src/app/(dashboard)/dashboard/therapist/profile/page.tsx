'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api, clearToken } from '@/lib/api';
import s from '../../profile.module.css';

const SPECIALIST_ROLES = ['THERAPIST', 'LIFE_COACH', 'HYPNOTHERAPIST', 'MUSIC_TUTOR'];

const roleLabels: Record<string, string> = {
  THERAPIST: 'Therapist',
  LIFE_COACH: 'Life Coach',
  HYPNOTHERAPIST: 'Hypnotherapist',
  MUSIC_TUTOR: 'Music Tutor',
};

const menuItems = [
  { href: '/dashboard/therapist',          icon: '🏠', label: 'My Practice' },
  { href: '/dashboard/therapist/clients',  icon: '👥', label: 'My Clients' },
  { href: '/dashboard/therapist/schedule', icon: '📅', label: 'Schedule' },
  { href: '/dashboard/therapist/messages', icon: '💬', label: 'Messages' },
  { href: '/dashboard/therapist/earnings', icon: '💰', label: 'Earnings' },
  { href: '/dashboard/therapist/notes',    icon: '📝', label: 'Notes' },
];

export default function TherapistProfilePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [me, setMe]                       = useState<{ id: string; name: string; email: string; role: string; avatarUrl?: string | null } | null>(null);
  const [stats, setStats]                 = useState<{ activeClients: number; sessionsThisWeek: number; avgRating: number; completionRate: number; earningsThisMonth: number } | null>(null);
  const [loading, setLoading]             = useState(true);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving]               = useState(false);
  const [toast, setToast]                 = useState('');

  useEffect(() => {
    (async () => {
      try {
        const user = await api.getMe();
        if (user.role === 'ADMIN') { router.replace('/dashboard/admin'); return; }
        if (!SPECIALIST_ROLES.includes(user.role)) { router.replace('/dashboard/user'); return; }
        setMe(user);
        if (user.avatarUrl) setAvatarPreview(user.avatarUrl);
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
        } catch { /* bonus */ }
      } catch { /* ignore */ } finally { setLoading(false); }
    })();
  }, [router]);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { compressImageFile } = await import('@/lib/avatarCompress');
      const dataUrl = await compressImageFile(file);
      setAvatarPreview(dataUrl);
    } catch {
      const reader = new FileReader();
      reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const saveAvatar = async () => {
    if (!avatarPreview || !me || avatarPreview === me.avatarUrl) return;
    setSaving(true);
    try {
      await api.uploadAvatar(me.id, avatarPreview);
      setMe(u => u ? { ...u, avatarUrl: avatarPreview } : u);
      showToast('Profile photo saved ✓');
    } catch (e) { showToast(e instanceof Error ? e.message : 'Upload failed. Try a smaller image.'); }
    finally { setSaving(false); }
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const initials = me?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? '?';
  const isDirty  = avatarPreview && avatarPreview !== me?.avatarUrl;
  const specialistLabel = me ? (roleLabels[me.role] ?? me.role.replace(/_/g, ' ')) : '';

  const statItems = stats ? [
    { icon: '👥', value: stats.activeClients,    label: 'Clients' },
    { icon: '📅', value: stats.sessionsThisWeek, label: 'Wk Sessions' },
    { icon: '⭐', value: stats.avgRating > 0 ? `${stats.avgRating.toFixed(1)}★` : '—', label: 'Avg Rating' },
    { icon: '✅', value: stats.completionRate > 0 ? `${stats.completionRate}%` : '—', label: 'Completion' },
  ] : [];

  if (loading) return <div className={s.page}><div className={s.center}><div className={s.spinner} /></div></div>;

  return (
    <div className={s.page}>
      {toast && <div className={s.toast}>{toast}</div>}
      <div className={s.inner}>

        {/* ── Hero ── */}
        <div className={s.hero}>
          <div className={s.heroBg}>
            <div className={s.avatarWrap}>
              <div className={s.avatarRing} />
              {avatarPreview
                ? <img src={avatarPreview} alt={me?.name} className={s.avatarImg} />
                : <div className={s.avatarInitials}>{initials}</div>
              }
              <span className={s.cameraBtn} aria-label="Change photo">📷</span>
              <input ref={fileRef} type="file" accept="image/*" className={s.fileInput} onChange={onFileChange} />
            </div>
            {isDirty && (
              <button type="button" className={s.saveAvatarBtn} onClick={saveAvatar} disabled={saving}>
                {saving ? 'Saving…' : '💾 Save Photo'}
              </button>
            )}
            <div className={s.heroText}>
              <h2 className={s.name}>{me?.name}</h2>
              <p className={s.email}>{me?.email}</p>
              <span className={s.rolePill}><span className={s.roleDot} /> {specialistLabel}</span>
              {stats && stats.earningsThisMonth > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
                  <span className={s.earningsChip}>
                    💷 £{stats.earningsThisMonth.toLocaleString()} this month
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        {statItems.length > 0 && (
          <div className={s.statsRow}>
            {statItems.map(st => (
              <div key={st.label} className={s.statCard}>
                <span className={s.statIcon}>{st.icon}</span>
                <span className={s.statValue}>{st.value}</span>
                <span className={s.statLabel}>{st.label}</span>
              </div>
            ))}
          </div>
        )}

        <div className={s.divider} />

        {/* ── Navigation ── */}
        <ul className={s.menu}>
          {menuItems.map(m => (
            <li key={m.href} className={s.menuItem}>
              <a href={m.href} className={s.menuLink}>
                <span className={s.menuIconWrap}>{m.icon}</span>
                <span className={s.menuText}>{m.label}</span>
                <span className={s.menuArrow}>›</span>
              </a>
            </li>
          ))}
        </ul>

        <div className={s.logoutRow}>
          <button type="button" className={s.logoutBtn} onClick={() => { clearToken(); router.push('/login'); }}>
            <span>⏻</span> Sign Out
          </button>
        </div>

      </div>
    </div>
  );
}
