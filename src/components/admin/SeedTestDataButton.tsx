import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Beaker, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

type Action = { kind: 'seed'; days: number } | { kind: 'clear' } | null;

export function SeedTestDataButton() {
  const [pending, setPending] = useState<Action>(null);
  const [busy, setBusy] = useState(false);
  const qc = useQueryClient();

  const invalidateAll = () => {
    ['admin-analytics', 'admin-live-users', 'admin-all-subscribers',
     'admin-churn-risk', 'admin-activity-trend', 'admin-cohort-retention',
     'admin-top-modules', 'admin-user-analytics']
      .forEach(k => qc.invalidateQueries({ queryKey: [k] }));
  };

  const execute = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      if (pending.kind === 'seed') {
        const { data, error } = await supabase.rpc('seed_admin_test_activity', { _days: pending.days });
        if (error) throw error;
        const r = data as { inserted: number; users: number; days: number };
        toast.success(`Date demo generate`, {
          description: `${r.inserted} evenimente pentru ${r.users} abonați pe ${r.days} zile.`,
        });
      } else {
        const { data, error } = await supabase.rpc('clear_admin_test_activity');
        if (error) throw error;
        const r = data as { deleted: number };
        toast.success(`Date demo șterse`, { description: `${r.deleted} rânduri eliminate.` });
      }
      invalidateAll();
    } catch (e: any) {
      toast.error('Eroare', { description: e.message ?? String(e) });
    } finally {
      setBusy(false);
      setPending(null);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" disabled={busy}>
            {busy ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Beaker className="h-3.5 w-3.5 mr-1.5" />}
            Seed test data
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setPending({ kind: 'seed', days: 30 })}>
            Generează 30 zile demo
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setPending({ kind: 'seed', days: 90 })}>
            Generează 90 zile demo
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setPending({ kind: 'clear' })} className="text-destructive">
            <Trash2 className="h-3.5 w-3.5 mr-2" /> Șterge datele demo
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending?.kind === 'seed' ? `Generezi ${pending.days} zile de date demo?` : 'Ștergi toate datele demo?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.kind === 'seed'
                ? 'Vor fi inserate evenimente sintetice marcate cu prefix __seed__ pentru toți abonații aprobați. Rulând din nou se șterge automat seed-ul anterior. Datele reale NU sunt afectate.'
                : 'Vor fi eliminate doar evenimentele marcate __seed__. Datele reale rămân intacte.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={execute} disabled={busy}>
              {busy && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
              Confirmă
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
