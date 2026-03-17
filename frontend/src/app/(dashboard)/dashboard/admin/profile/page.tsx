'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api, clearToken } from '@/lib/api';
import s from '../../profile.module.css';

const menuItems = [
  { href: '/dashboard/admin',              icon: '📊', label: 'Overview' },
  { href: '/dashboard/admin/users',        icon: '👥', label: 'Manage Users' },
  { href: '/dashboard/admin/specialists',  icon: '🌟', label: 'Manage Specialists' },
  { href: '/dashboard/admin/applications', icon: '📋', label: 'Applications' },
  { href: '/dashboard/admin/revenue',      icon: '💰', label: 'Revenue' },
];

export default function AdminProfilePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [admin, setAdmin]                 = useState<{ id: string; name: string; email: string; role: string; avatarUrl?: string | null } | null>(null);
  const [stats, setStats]                 = useState<{ totalUsers?: number; totalSpecialists?: number; activeSessions?: number; pendingApplications?: number }>({});
  const [loading, setLoading]             = useState(true);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving]               = useState(false);
  const [toast, setToast]                 = useState('');

  useEffect(() => {
    (async () => {
      try {
        const me = await api.getMe();
        if (me.role !== 'ADMIN') { router.replace('/dashboard/user'); return; }
        setAdmin(me);
        if (me.avatarUrl) setAvatarPreview(me.avatarUrl);
        try { const st = await api.getAdminPlatformStats(); setStats(st ?? {}); } catch { /* bonus */ }
      } catch { /* ignore */ } finally { setLoading(false); }
    })();
  }, [router]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const saveAvatar = async () => {
    if (!avatarPreview || !admin || avatarPreview === admin.avatarUrl) return;
    setSaving(true);
    try {
      await api.uploadAvatar(admin.id, avatarPreview);
      setAdmin(u => u ? { ...u, avatarUrl: avatarPreview } : u);
      showToast('Profile photo saved ✓');
    } catch { showToast('Upload failed. Try a smaller image.'); }
    finally { setSaving(false); }
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const initials = admin?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? '?';
  const isDirty  = avatarPreview && avatarPreview !== admin?.avatarUrl;

  const statItems = [
    { icon: '👥', value: stats.totalUsers        ?? '—', label: 'Users' },
    { icon: '🌟', value: stats.totalSpecialists  ?? '—', label: 'Specialists' },
    { icon: '📅', value: stats.activeSessions    ?? '—', label: 'Sessions' },
    { icon: '📋', value: stats.pendingApplications ?? '—', label: 'Pending' },
  ];

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
                ? <img src={avatarPreview} alt={admin?.name} className={s.avatarImg} />
                : <div className={s.avatarInitials}>{initials}</div>
              }
              <div className={s.uploadOverlay}>
                <span className={s.uploadIcon}>📷</span>
                <span className={s.uploadLabel}>Change</span>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className={s.fileInput} onChange={onFileChange} />
            </div>
            {isDirty && (
              <button type="button" className={s.saveAvatarBtn} onClick={saveAvatar} disabled={saving}>
                {saving ? 'Saving…' : 'Save Photo'}
              </button>
            )}
            <div className={s.heroText}>
              <h2 className={s.name}>{admin?.name}</h2>
              <p className={s.email}>{admin?.email}</p>
              <span className={s.rolePill}><span className={s.roleDot} /> Platform Admin</span>
            </div>
          </div>
        </div>

        {/* ── Platform Stats ── */}
        <div className={s.statsRow}>
          {statItems.map(st => (
            <div key={st.label} className={s.statCard}>
              <span className={s.statIcon}>{st.icon}</span>
              <span className={s.statValue}>{st.value}</span>
              <span className={s.statLabel}>{st.label}</span>
            </div>
          ))}
        </div>

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
