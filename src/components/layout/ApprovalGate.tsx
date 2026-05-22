import { ReactNode, forwardRef } from 'react';
import { useApprovalStatus } from '@/hooks/useApprovalStatus';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Clock, LogOut, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface ApprovalGateProps {
  children: ReactNode;
}

export const ApprovalGate = forwardRef<HTMLDivElement, ApprovalGateProps>(({ children }, ref) => {
  const { isApproved, loading } = useApprovalStatus();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isApproved) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="mx-auto w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <Clock className="h-10 w-10 text-amber-600 dark:text-amber-400" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">{t('approval.title')}</h1>
          <p className="text-muted-foreground">
            {t('approval.message', { email: user?.email })}
          </p>
        </div>

        <Card className="border-amber-200 dark:border-amber-800">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-start gap-3 text-left">
              <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">{t('approval.whatNext')}</p>
                <p>{t('approval.info')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button variant="outline" onClick={handleSignOut} className="gap-2">
          <LogOut className="h-4 w-4" />
          {t('common.logout')}
        </Button>
      </div>
    </div>
  );
});
ApprovalGate.displayName = 'ApprovalGate';
