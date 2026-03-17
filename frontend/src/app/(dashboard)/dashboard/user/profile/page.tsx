'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api, clearToken } from '@/lib/api';
import HealingScoreRing from '@/components/dashboard/HealingScoreRing';
import s from '../../profile.module.css';

const SPECIALIST_ROLES = ['THERAPIST', 'LIFE_COACH', 'HYPNOTHERAPIST', 'MUSIC_TUTOR'];

const menuItems = [
  { href: '/dashboard/user/mood',        icon: '💚', label: 'Mood Tracker' },
  { href: '/dashboard/user/sessions',    icon: '📅', label: 'My Sessions' },
  { href: '/dashboard/user/specialists', icon: '🌟', label: 'Find Specialists' },
  { href: '/dashboard/user/tips',        icon: '✨', label: 'Brain Tips' },
  { href: '/dashboard/user/community',   icon: '👥', label: 'Community' },
  { href: '/dashboard/user/messages',    icon: '💬', label: 'Messages' },
];

export default function UserProfilePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [user, setUser]                   = useState<{ id: string; name: string; email: string; role: string; avatarUrl?: string | null } | null>(null);
  const [healingScore, setHealingScore]   = useState(0);
  const [stats, setStats]                 = useState({ sessionsCompleted: 0, streak: 0, moodAverage: 0 });
  const [loading, setLoading]             = useState(true);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving]               = useState(false);
  const [toast, setToast]                 = useState('');

  useEffect(() => {
    (async () => {
      try {
        const me = await api.getMe();
        if (me.role === 'ADMIN') { router.replace('/dashboard/admin'); return; }
        if (SPECIALIST_ROLES.includes(me.role)) { router.replace('/dashboard/therapist'); return; }
        setUser(me);
        if (me.avatarUrl) setAvatarPreview(me.avatarUrl);
        try {
          const d = await api.getUserDashboard(me.id);
          setHealingScore(d.healingScore?.value ?? 0);
          setStats({
            sessionsCompleted: d.stats?.sessionsCompleted ?? 0,
            streak: d.stats?.streak ?? 0,
            moodAverage: d.stats?.moodAverage ?? 0,
          });
        } catch { /* bonus data */ }
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
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
    if (!avatarPreview || !user || avatarPreview === user.avatarUrl) return;
    setSaving(true);
    try {
      await api.uploadAvatar(user.id, avatarPreview);
      setUser(u => u ? { ...u, avatarUrl: avatarPreview } : u);
      showToast('Profile photo saved ✓');
    } catch { showToast('Upload failed. Try a smaller image.'); }
    finally { setSaving(false); }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const initials = user?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? '?';
  const isDirty  = avatarPreview && avatarPreview !== user?.avatarUrl;

  if (loading) return <div className={s.page}><div className={s.center}><div className={s.spinner} /></div></div>;

  return (
    <div className={s.page}>
      {toast && <div className={s.toast}>{toast}</div>}
      <div className={s.inner}>

        {/* ── Hero ── */}
        <div className={s.hero}>
          <div className={s.heroBg}>
            {/* Avatar with upload */}
            <div className={s.avatarWrap}>
              <div className={s.avatarRing} />
              {avatarPreview
                ? <img src={avatarPreview} alt={user?.name} className={s.avatarImg} />
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
              <h2 className={s.name}>{user?.name}</h2>
              <p className={s.email}>{user?.email}</p>
              <span className={s.rolePill}><span className={s.roleDot} /> Member</span>
            </div>
          </div>
        </div>

        {/* ── Healing ring ── */}
        {healingScore > 0 && (
          <div className={s.scoreRow}>
            <HealingScoreRing score={healingScore} size={110} label="Healing Journey" />
          </div>
        )}

        {/* ── Stats ── */}
        <div className={s.statsRow}>
          {[
            { icon: '📅', value: stats.sessionsCompleted, label: 'Sessions' },
            { icon: '🔥', value: stats.streak,            label: 'Day Streak' },
            { icon: '😊', value: Number(stats.moodAverage).toFixed(1), label: 'Mood Avg' },
            { icon: '💯', value: healingScore,            label: 'Score' },
          ].map(st => (
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

        {/* ── Logout ── */}
        <div className={s.logoutRow}>
          <button type="button" className={s.logoutBtn} onClick={() => { clearToken(); router.push('/login'); }}>
            <span>⏻</span> Sign Out
          </button>
        </div>

      </div>
    </div>
  );
}
