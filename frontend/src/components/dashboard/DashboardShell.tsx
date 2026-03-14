'use client';

import { usePathname } from 'next/navigation';
import type { UserRole } from '@/lib/dashboard-types';
import AmbientBackground from './AmbientBackground';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import styles from './DashboardShell.module.css';

const pathToRole: Record<string, UserRole> = {
  '/dashboard/user': 'USER',
  '/dashboard/admin': 'ADMIN',
  '/dashboard/therapist': 'LIFE_COACH',
};

const mockUserName: Record<string, string> = {
  '/dashboard/user': 'Alex',
  '/dashboard/admin': 'Admin',
  '/dashboard/therapist': 'Dr. Sarah Chen',
};

const mockSubtitles: Record<string, string> = {
  '/dashboard/therapist': 'Your clients are waiting',
};

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '';
  const role = pathToRole[pathname] ?? 'USER';
  const userName = mockUserName[pathname] ?? 'User';
  const subtitle = mockSubtitles[pathname];
  const healingScore = role === 'USER' ? 72 : 0;
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
