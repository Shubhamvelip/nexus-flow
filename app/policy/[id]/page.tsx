import { fetchPolicyById } from '@/lib/data-service';
import { PolicyDetailClient } from '@/components/PolicyDetailClient';
import { notFound } from 'next/navigation';

interface PolicyDetailPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PolicyDetailPageProps) {
  const data = await fetchPolicyById(params.id);
  if (!data) return { title: 'Policy Not Found' };
  return {
    title: `${data.policy.title} - Knowledge Workflow`,
    description: data.policy.description,
  };
}

export default async function PolicyDetailPage({
  params,
}: PolicyDetailPageProps) {
  const data = await fetchPolicyById(params.id);

  if (!data) {
    notFound();
  }

  return <PolicyDetailClient policy={data.policy} initialState={data.checklistState} />;
}
