import { ReactNode } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Lock, CreditCard, Phone, Mail, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface SubscriptionGateProps {
  children: ReactNode;
}

export function SubscriptionGate({ children }: SubscriptionGateProps) {
  const { hasActiveSubscription, plans, loading } = useSubscription();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (hasActiveSubscription) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Abonament Necesar</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Pentru a accesa aplicația, ai nevoie de un abonament activ. Contactează administratorul pentru activare.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {plans.map((plan) => (
            <Card key={plan.id} className="relative">
              {plan.duration_months === 12 && (
                <Badge className="absolute -top-2 right-4 bg-primary">{t('ui.save17')}</Badge>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Plan {plan.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {plan.price} <span className="text-base font-normal text-muted-foreground">{plan.currency}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {plan.duration_months === 1 ? 'pe lună' : 'pe an'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="pt-6 space-y-3">
            <h3 className="font-semibold text-foreground">Cum activez abonamentul?</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                Contactează administratorul pentru detalii de plată
              </p>
              <p className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 shrink-0" />
                Efectuează plata prin transfer bancar
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                Trimite confirmarea plății și abonamentul va fi activat
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button variant="outline" onClick={handleSignOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            Deconectare
          </Button>
        </div>
      </div>
    </div>
  );
}
