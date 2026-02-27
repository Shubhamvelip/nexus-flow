import { MainLayout } from '@/components/MainLayout';
import { SettingsContent } from '@/components/SettingsContent';

export default function SettingsPage() {
  return (
    <MainLayout title="Settings">
      <SettingsContent />
    </MainLayout>
  );
}
