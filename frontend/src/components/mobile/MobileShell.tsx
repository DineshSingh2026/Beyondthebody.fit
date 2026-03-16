'use client';

import { usePathname } from 'next/navigation';
import type { UserRole } from '@/lib/dashboard-types';
import TopAppBar from './TopAppBar';
import BottomTabBar from './BottomTabBar';
import InstallPrompt from './InstallPrompt';
import styles from './MobileShell.module.css';

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

export default function MobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '';
  const role = pathToRole[pathname] ?? 'USER';
  const userName = mockUserName[pathname] ?? 'User';

  return (
    <div className={styles.wrap}>
      <TopAppBar
        role={role}
        userName={userName}
      />
      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>
      <BottomTabBar role={role} />
      <InstallPrompt />
    </div>
  );
}
