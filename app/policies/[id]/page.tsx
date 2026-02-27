import { MainLayout } from '@/components/MainLayout';
import { PolicyDetailContent } from '@/components/PolicyDetailContent';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PolicyDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <MainLayout title="Policy Details">
      <PolicyDetailContent policyId={id} />
    </MainLayout>
  );
}
