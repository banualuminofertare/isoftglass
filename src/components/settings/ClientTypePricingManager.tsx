import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Users, Building2, Truck } from 'lucide-react';
import { useClientTypePricing } from '@/hooks/useClientTypePricing';
import { toast } from 'sonner';
import type { ClientType } from '@/hooks/useClients';
import { useTranslation } from 'react-i18next';

const getClientTypeConfig = (t: any): Record<ClientType, { label: string; icon: React.ReactNode; description: string }> => ({
  person: {
    label: t('clientPricing.person'),
    icon: <Users className="h-5 w-5" />,
    description: t('clientPricing.personDesc'),
  },
  company: {
    label: t('clientPricing.company'),
    icon: <Building2 className="h-5 w-5" />,
    description: t('clientPricing.companyDesc'),
  },
  distributor: {
    label: t('clientPricing.distributor'),
    icon: <Truck className="h-5 w-5" />,
    description: t('clientPricing.distributorDesc'),
  },
});

export function ClientTypePricingManager() {
  const { t } = useTranslation();
  const clientTypeConfig = useMemo(() => getClientTypeConfig(t), [t]);
  const { pricingRules, isLoading, updateMarkup, resetToBase } = useClientTypePricing();
  const [pending, setPending] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (pricingRules.length > 0) {
      const initial: Record<string, number> = {};
      pricingRules.forEach(r => { initial[r.client_type] = r.markup_percent; });
      setPending(initial);
    }
  }, [pricingRules]);

  const hasChanges = pricingRules.some(r => pending[r.client_type] !== r.markup_percent);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      for (const rule of pricingRules) {
        const newValue = pending[rule.client_type];
        if (newValue !== undefined && newValue !== rule.markup_percent) {
          await updateMarkup(rule.client_type as ClientType, newValue);
        }
      }
      toast.success(t('clientPricing.savedSuccess'));
    } catch {
      // error handled in hook
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {t('clientPricing.title')}
        </CardTitle>
        <CardDescription>
          {t('clientPricing.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {(Object.keys(clientTypeConfig) as ClientType[]).map(type => {
          const cfg = clientTypeConfig[type];
          const currentValue = pending[type] ?? 0;
          const originalValue = pricingRules.find(r => r.client_type === type)?.markup_percent ?? 0;
          const isChanged = currentValue !== originalValue;

          return (
            <div key={type} className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${isChanged ? 'border-primary/50 bg-primary/5' : 'border-border bg-card hover:bg-muted/30'}`}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2 rounded-md bg-muted">
                  {cfg.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{cfg.label}</span>
                    {isChanged && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-primary border-primary/50">
                        {t('clientPricing.modified')}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{cfg.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.5"
                  min="-100"
                  max="500"
                  value={currentValue}
                  onChange={(e) => setPending(prev => ({ ...prev, [type]: parseFloat(e.target.value) || 0 }))}
                  className="w-24 h-9 text-right"
                />
                <span className="text-sm text-muted-foreground font-medium">%</span>
              </div>
            </div>
          );
        })}

        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('clientPricing.saving')}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t('clientPricing.saveMarkups')}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
