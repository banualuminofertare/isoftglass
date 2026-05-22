import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, Loader2, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAlertSettings } from '@/hooks/useAdminAnalyticsExtra';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function AlertSettingsCard() {
  const { data, isLoading } = useAdminAlertSettings();
  const qc = useQueryClient();
  const [churn, setChurn] = useState(70);
  const [days, setDays] = useState(14);
  const [emailOn, setEmailOn] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (data) {
      setChurn(data.churn_threshold);
      setDays(data.inactivity_days);
      setEmailOn(data.email_enabled);
    }
  }, [data]);

  const save = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nu ești autentificat');
      const { error } = await (supabase as any)
        .from('admin_alert_settings')
        .upsert({
          admin_user_id: user.id,
          churn_threshold: churn,
          inactivity_days: days,
          email_enabled: emailOn,
        }, { onConflict: 'admin_user_id' });
      if (error) throw error;
      toast.success('Setări salvate');
      qc.invalidateQueries({ queryKey: ['admin-alert-settings'] });
    } catch (e: any) {
      toast.error(e.message || 'Eroare la salvare');
    } finally {
      setSaving(false);
    }
  };

  const runNow = async () => {
    setTesting(true);
    try {
      const { data: res, error } = await supabase.functions.invoke('admin-churn-alerts', {
        body: { trigger: 'manual' },
      });
      if (error) throw error;
      const churnN = res?.churn_count ?? 0;
      const inactiveN = res?.inactive_count ?? 0;
      if (churnN + inactiveN === 0) {
        toast.success('Niciun abonat nu depășește pragurile setate ✓');
      } else {
        toast.success(`Alertă creată: ${churnN} risc churn, ${inactiveN} inactivi`);
      }
    } catch (e: any) {
      toast.error(e.message || 'Eroare la rulare');
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bell className="h-4 w-4 text-amber-500" />
          Alerte automate
          <span className="text-xs text-muted-foreground font-normal">
            — verificate zilnic la 08:00 (UTC)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-6 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            <div className="space-y-1">
              <Label className="text-xs">Prag scor churn</Label>
              <Input type="number" min={30} max={100} value={churn} onChange={e => setChurn(+e.target.value)} className="h-8" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Zile inactivitate</Label>
              <Input type="number" min={3} max={90} value={days} onChange={e => setDays(+e.target.value)} className="h-8" />
            </div>
            <div className="flex items-center gap-2 h-8">
              <Switch checked={emailOn} onCheckedChange={setEmailOn} id="email-on" />
              <Label htmlFor="email-on" className="text-xs cursor-pointer">Trimite și pe email</Label>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={save} disabled={saving} className="flex-1">
                {saving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                Salvează
              </Button>
              <Button size="sm" variant="outline" onClick={runNow} disabled={testing} title="Rulează verificarea acum">
                {testing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        )}
        {data?.last_sent_at && (
          <div className="text-[10px] text-muted-foreground mt-2">
            Ultima alertă: {new Date(data.last_sent_at).toLocaleString('ro-RO')}
          </div>
        )}
        <div className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
          Alertele in-app apar în clopoțelul de notificări. Emailul folosește adresa contului tău de admin.
        </div>
      </CardContent>
    </Card>
  );
}
