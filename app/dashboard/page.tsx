import { DashboardClient } from '@/components/DashboardClient';
import { fetchRecentPolicies, getCompletionStats } from '@/lib/data-service';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard - Knowledge Workflow',
  description: 'View and manage your policies and workflows',
};

async function DashboardContent() {
  const [policies, stats] = await Promise.all([
    fetchRecentPolicies(3),
    getCompletionStats(),
  ]);

  return <DashboardClient policies={policies} stats={stats} />;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-muted-foreground">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
