'use client';

import { useIsMobile } from '@/hooks/useMediaQuery';
import DashboardShell from './DashboardShell';
import MobileShell from '@/components/mobile/MobileShell';

export default function AdaptiveDashboardShell({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileShell>{children}</MobileShell>;
  }

  return <DashboardShell>{children}</DashboardShell>;
}
