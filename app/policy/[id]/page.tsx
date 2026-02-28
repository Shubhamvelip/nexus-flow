import { getPolicyById, PolicyDocument } from '@/lib/firebase';
import { PolicyDetailClient } from '@/components/PolicyDetailClient';
import { notFound } from 'next/navigation';
import { Policy, ChecklistItem, WorkflowStep } from '@/types/policy';

interface PolicyDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PolicyDetailPageProps) {
  const { id } = await params;
  const doc = await getPolicyById(id);
  if (!doc) return { title: 'Policy Not Found' };
  return {
    title: `${doc.title} - Knowledge Workflow`,
    description: doc.input_text || '',
  };
}

export default async function PolicyDetailPage({
  params,
}: PolicyDetailPageProps) {
  const { id } = await params;
  const doc = await getPolicyById(id);

  if (!doc) {
    notFound();
  }

  const checklistTotal = doc.checklist?.length ?? 0;
  const checklistCompleted = doc.checklist?.filter(c => c.completed).length ?? 0;
  const completionPercentage = checklistTotal > 0 ? Math.round((checklistCompleted / checklistTotal) * 100) : 0;

  const seconds = (doc.created_at as any)?.seconds ?? (doc.created_at as any)?._seconds;
  const createdAt = seconds ? new Date(seconds * 1000) : new Date();

  const mappedPolicy: Policy = {
    id: doc.id || id,
    title: doc.title,
    description: doc.input_text || '',
    category: 'General',
    status: completionPercentage === 100 ? 'archived' : 'active',
    createdAt,
    updatedAt: createdAt,
    completionPercentage,
    steps: doc.workflow.map((w, i) => ({
      id: `w-${i}`,
      title: w.step,
      description: w.description,
      order: i,
      status: 'pending' as const,
    })),
    checklist_items: doc.checklist.map((c, i) => ({
      id: c.id,
      title: c.title,
      description: '',
      completed: c.completed,
      order: i,
    })),
    decisionTree: doc.decision_tree as any, // Cast since decision_tree has matching structure
    graph: doc.graph,
  };

  const checklistState = {
    policyId: id,
    items: Object.fromEntries(doc.checklist.map(c => [c.id, c.completed])),
    lastUpdated: new Date()
  };

  return <PolicyDetailClient policy={mappedPolicy} initialState={checklistState} />;
}
