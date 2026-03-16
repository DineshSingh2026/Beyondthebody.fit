'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import type { UserRole } from '@/lib/dashboard-types';
import styles from './NotificationPanel.module.css';

export interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  unread?: boolean;
}

const defaultNotifications: Notification[] = [
  { id: '1', title: 'Session reminder', body: 'Your session with Dr. Sarah Chen starts in 30 minutes.', time: '10 min ago', unread: true },
  { id: '2', title: 'New message', body: 'James Miller sent you a message about your goals.', time: '1 hour ago', unread: true },
  { id: '3', title: 'Streak milestone', body: "You've hit a 7-day check-in streak. Keep going!", time: 'Yesterday', unread: false },
  { id: '4', title: 'Tip of the day', body: 'Try 5-4-3-2-1 grounding when you feel overwhelmed.', time: '2 days ago', unread: false },
];

interface NotificationPanelProps {
  role?: UserRole;
  /** 'up' (default — opens above trigger, desktop) or 'down' (opens below, mobile top bar) */
  direction?: 'up' | 'down';
}

export default function NotificationPanel({ role, direction = 'up' }: NotificationPanelProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    role === 'ADMIN' ? [] : defaultNotifications.map((n) => ({ ...n }))
  );
  const [adminPending, setAdminPending] = useState({ applications: 0, bookings: 0, assignments: 0 });
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (role === 'ADMIN' && open) {
      api.getAdminNotifications().then((res) => {
        setNotifications(
          (res.notifications || []).map((n) => ({
            id: n.id,
            title: n.title,
            body: n.message || '',
            time: n.timestamp || '',
            unread: true,
          }))
        );
        setAdminPending({ applications: res.pendingApplications || 0, bookings: res.pendingBookingRequests || 0, assignments: res.pendingAssignments || 0 });
      }).catch(() => {});
    }
  }, [role, open]);

  const unreadCount = role === 'ADMIN' ? notifications.length + (adminPending.applications + adminPending.bookings + adminPending.assignments) : notifications.filter((n) => n.unread).length;

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [open]);

  const clearAll = () => {
    setNotifications([]);
  };

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className={`${styles.panel} ${direction === 'down' ? styles.panelDown : ''}`}
            initial={{ opacity: 0, y: direction === 'down' ? 8 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: direction === 'down' ? 8 : -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.header}>
              <span>Notifications</span>
              <div className={styles.headerActions}>
                {role === 'ADMIN' && (adminPending.applications > 0 || adminPending.bookings > 0 || adminPending.assignments > 0) && (
                  <span className={styles.pendingSummary}>
                    {adminPending.applications > 0 && `${adminPending.applications} applications`}
                    {adminPending.applications > 0 && (adminPending.bookings > 0 || adminPending.assignments > 0) && ' · '}
                    {adminPending.bookings > 0 && `${adminPending.bookings} booking requests`}
                    {adminPending.bookings > 0 && adminPending.assignments > 0 && ' · '}
                    {adminPending.assignments > 0 && `${adminPending.assignments} assignment requests`}
                  </span>
                )}
                {role !== 'ADMIN' && unreadCount > 0 && (
                  <button type="button" className={styles.clearBtn} onClick={markAllRead}>
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button type="button" className={styles.clearBtn} onClick={clearAll}>
                    Clear all
                  </button>
                )}
              </div>
            </div>
            <div className={styles.list}>
              {notifications.length === 0 ? (
                <div className={styles.empty}>{role === 'ADMIN' ? 'No activity yet' : 'No notifications'}</div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className={`${styles.item} ${n.unread ? styles.unread : ''}`}>
                    <div className={styles.itemContent}>
                      <div className={styles.itemTitle}>{n.title}</div>
                      <div className={styles.itemBody}>{n.body}</div>
                      <div className={styles.itemTime}>{n.time}</div>
                    </div>
                    <button
                      type="button"
                      className={styles.dismissBtn}
                      onClick={() => dismiss(n.id)}
                      aria-label="Dismiss"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
