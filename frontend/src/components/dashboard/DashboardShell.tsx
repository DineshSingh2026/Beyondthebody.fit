'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type { UserRole } from '@/lib/dashboard-types';
import { api } from '@/lib/api';
import AmbientBackground from './AmbientBackground';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import styles from './DashboardShell.module.css';

const pathSubtitles: Record<string, string> = {
  '/dashboard/therapist': 'Your clients are waiting',
};

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '';
  const [userName, setUserName] = useState<string>('');
  const [role, setRole] = useState<UserRole>('USER');
  const [healingScore, setHealingScore] = useState(0);

  useEffect(() => {
    api.getMe()
      .then((me) => {
        setUserName(me.name);
        setRole(me.role as UserRole);
        setHealingScore(0);
      })
      .catch(() => {
        setUserName('User');
        setRole('USER');
      });
  }, []);

  const subtitle = pathSubtitles[pathname];
  return (
    <div className={styles.wrap}>
      <AmbientBackground />
      <Sidebar role={role} healingScore={healingScore} />
      <div className={styles.main}>
        <TopBar
          role={role}
          userName={userName}
          subtitle={subtitle}
          nextSessionIn={role !== 'USER' && role !== 'ADMIN' ? '42 min' : undefined}
        />
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
