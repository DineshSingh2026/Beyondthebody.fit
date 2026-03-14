import '@/styles/dashboard.css';
import AdaptiveDashboardShell from '@/components/dashboard/AdaptiveDashboardShell';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdaptiveDashboardShell>{children}</AdaptiveDashboardShell>;
}
