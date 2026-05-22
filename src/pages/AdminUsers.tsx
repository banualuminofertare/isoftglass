import { AppLayout } from '@/components/layout/AppLayout';
import { UserManagement } from '@/components/settings/UserManagement';
import { useTranslation } from 'react-i18next';
import { ResizableContent } from '@/components/layout/ResizableContent';

export default function AdminUsers() {
  const { t } = useTranslation();
  return (
    <AppLayout>
      <ResizableContent>
        <div className="space-y-6 w-full pr-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('admin.manageUsers')}</h1>
            <p className="text-muted-foreground">{t('admin.manageUsersDesc')}</p>
          </div>
          <UserManagement />
        </div>
      </ResizableContent>
    </AppLayout>
  );
}
