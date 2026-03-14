'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './NotificationPanel.module.css';

interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  unread?: boolean;
}

interface NotificationPanelProps {
  notifications?: Notification[];
  count?: number;
}

const defaultNotifications: Notification[] = [
  { id: '1', title: 'Session reminder', body: 'Your session with Dr. Sarah Chen starts in 30 minutes.', time: '10 min ago', unread: true },
  { id: '2', title: 'New message', body: 'James Miller sent you a message about your goals.', time: '1 hour ago', unread: true },
  { id: '3', title: 'Streak milestone', body: 'You\'ve hit a 7-day check-in streak. Keep going!', time: 'Yesterday', unread: false },
];

export default function NotificationPanel({
  notifications = defaultNotifications,
  count = 2,
}: NotificationPanelProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {count > 0 && <span className={styles.badge}>{count}</span>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.panel}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.header}>
              <span>Notifications</span>
            </div>
            <div className={styles.list}>
              {notifications.map((n) => (
                <div key={n.id} className={`${styles.item} ${n.unread ? styles.unread : ''}`}>
                  <div className={styles.itemTitle}>{n.title}</div>
                  <div className={styles.itemBody}>{n.body}</div>
                  <div className={styles.itemTime}>{n.time}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
