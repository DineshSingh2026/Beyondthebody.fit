'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import type { UserRole } from '@/lib/dashboard-types';
import { clearToken } from '@/lib/api';
import NotificationPanel from '@/components/dashboard/NotificationPanel';
import Avatar from '@/components/ui/Avatar';
import styles from './TopAppBar.module.css';

const WHATSAPP_NUMBER = '919502575669';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

const roleTitles: Record<string, string> = {
  '/dashboard/user': 'My Sanctuary',
  '/dashboard/user/sessions': 'Sessions',
  '/dashboard/user/specialists': 'My Specialists',
  '/dashboard/user/mood': 'Mood',
  '/dashboard/user/community': 'Community',
  '/dashboard/user/profile': 'Profile',
  '/dashboard/user/messages': 'Messages',
  '/dashboard/user/tips': 'Brain Tips',
  '/dashboard/admin': 'Command Centre',
  '/dashboard/admin/users': 'Users',
  '/dashboard/admin/specialists': 'Specialists',
  '/dashboard/admin/applications': 'Applications',
  '/dashboard/admin/revenue': 'Revenue',
  '/dashboard/admin/schedule': 'Schedule Call',
  '/dashboard/admin/profile': 'My Profile',
  '/dashboard/therapist': 'My Practice',
  '/dashboard/therapist/clients': 'Clients',
  '/dashboard/therapist/schedule': 'Schedule',
  '/dashboard/therapist/notes': 'Notes',
  '/dashboard/therapist/earnings': 'Earnings',
  '/dashboard/therapist/messages': 'Messages',
  '/dashboard/therapist/profile': 'My Profile',
};

function getTitle(pathname: string): string {
  const exact = roleTitles[pathname];
  if (exact) return exact;
  if (pathname?.startsWith('/dashboard/user')) return 'My Sanctuary';
  if (pathname?.startsWith('/dashboard/admin')) return 'Command Centre';
  if (pathname?.startsWith('/dashboard/therapist')) return 'My Practice';
  return 'Beyond The Body';
}

function showBack(pathname: string): boolean {
  const base = pathname?.replace(/\/$/, '') || '';
  const roots = ['/dashboard/user', '/dashboard/admin', '/dashboard/therapist'];
  if (roots.includes(base)) return false;
  return pathname?.startsWith('/dashboard') ?? false;
}

interface TopAppBarProps {
  title?: string;
  role?: UserRole;
  userName?: string;
  avatarUrl?: string | null;
}

export default function TopAppBar({
  title,
  role = 'USER',
  userName = '',
  avatarUrl,
}: TopAppBarProps) {
  const router = useRouter();
  const pathname = usePathname() ?? '';
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayTitle = title ?? getTitle(pathname);
  const canBack = showBack(pathname);
  const isAdmin = role === 'ADMIN';
  const showWhatsApp = !isAdmin;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on outside tap
  useEffect(() => {
    if (!menuOpen) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    clearToken();
    setMenuOpen(false);
    router.push('/login');
  };

  const handleRefresh = () => {
    setSpinning(true);
    setTimeout(() => {
      window.location.reload();
    }, 200);
  };

  return (
    <>
    <header className={`${styles.bar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.left}>
        {canBack ? (
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => router.back()}
            aria-label="Back"
          >
            ←
          </button>
        ) : (
          <img
            src="/img/btb-logo.png"
            alt="Beyond The Body"
            className={styles.logoImg}
          />
        )}
      </div>

      <div className={styles.right}>
        {/* WhatsApp support button — visible for user & therapist */}
        {showWhatsApp && (
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className={styles.waBtn}
            aria-label="WhatsApp support"
            title="Chat on WhatsApp"
          >
            {/* WhatsApp SVG icon */}
            <svg viewBox="0 0 24 24" className={styles.waIcon} aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
        )}

        {/* Refresh button — all roles */}
        <button
          type="button"
          className={`${styles.refreshBtn} ${spinning ? styles.refreshSpin : ''}`}
          onClick={handleRefresh}
          aria-label="Refresh"
          title="Refresh"
        >
          ↻
        </button>

        {/* Notification panel */}
        <NotificationPanel role={role} direction="down" />

        {/* Avatar — tapping opens logout menu */}
        <div className={styles.avatarWrap} ref={menuRef}>
          <button
            type="button"
            className={styles.avatar}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Account menu"
            aria-expanded={menuOpen}
          >
            <Avatar name={userName || 'User'} src={avatarUrl} size="md" className={styles.avatarInner} />
          </button>

          {menuOpen && (
            <div className={styles.menu}>
              {userName && (
                <div className={styles.menuUser}>
                  <span className={styles.menuName}>{userName}</span>
                  <span className={styles.menuRole}>{role?.replace('_', ' ')}</span>
                </div>
              )}
              {showWhatsApp && (
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.menuWhatsApp}
                >
                  <span>💬</span>
                  WhatsApp Support
                </a>
              )}
              <button
                type="button"
                className={styles.menuLogout}
                onClick={handleLogout}
              >
                <span>⏻</span>
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>

    {/* Page title — sits cleanly below the action bar */}
    <div className={styles.pageTitleBar}>
      <h1 className={styles.pageTitle}>{displayTitle}</h1>
    </div>
    </>
  );
}
