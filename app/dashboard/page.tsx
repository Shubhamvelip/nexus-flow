import { DashboardClient } from '@/components/DashboardClient';

export const metadata = {
  title: 'Dashboard - Knowledge Workflow',
  description: 'View and manage your policies and workflows',
};

export default function DashboardPage() {
  return <DashboardClient />;
}
