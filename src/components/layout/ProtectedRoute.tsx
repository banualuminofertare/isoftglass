import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: 'view_clients' | 'view_reports' | 'view_settings' | 'manage_users';
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, requiredPermission, adminOnly = false }: ProtectedRouteProps) {
  const { loading, user } = useAuth();
  const { isAdmin, hasPermission } = usePermissions();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check admin-only routes
  if (adminOnly && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t('ui.accessRestricted')}</h1>
          <p className="text-muted-foreground max-w-md">
            {t('approval.adminOnlyMessage', 'Această pagină este disponibilă doar pentru administratori. Contactează un administrator pentru mai multe detalii.')}
          </p>
          <Button onClick={() => window.history.back()} variant="outline">
            {t('common.back')}
          </Button>
        </div>
      </div>
    );
  }

  // Check specific permission
  if (requiredPermission && !hasPermission(requiredPermission) && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t('ui.accessRestricted')}</h1>
          <p className="text-muted-foreground max-w-md">
            {t('approval.noPermissionMessage', 'Nu ai permisiunile necesare pentru a accesa această pagină.')}
          </p>
          <Button onClick={() => window.history.back()} variant="outline">
            {t('common.back')}
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
