import { DashboardClient } from '@/components/DashboardClient';
import { fetchRecentPolicies, getCompletionStats } from '@/lib/data-service';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard - Knowledge Workflow',
  description: 'View and manage your policies and workflows',
};

async function DashboardData() {
  const [policies, stats] = await Promise.all([
    fetchRecentPolicies(5),
    getCompletionStats(),
  ]);

  return <DashboardClient policies={policies} stats={stats} />;
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64 text-sm text-gray-500">
          Loading dashboard…
        </div>
      }
    >
      <DashboardData />
    </Suspense>
  );
}
