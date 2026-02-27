import { MainLayout } from '@/components/shared/MainLayout';
import { PoliciesContent } from '@/components/PoliciesContent';

export default function PoliciesPage() {
  return (
    <MainLayout title="All Policies">
      <PoliciesContent />
    </MainLayout>
  );
}
