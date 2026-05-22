import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminCohortRetention } from '@/hooks/useAdminAnalytics';
import { Loader2 } from 'lucide-react';

function cellBg(pct: number | null) {
  if (pct === null || pct === undefined) return 'bg-muted/30 text-muted-foreground';
  if (pct >= 80) return 'bg-emerald-600 text-white';
  if (pct >= 60) return 'bg-emerald-500 text-white';
  if (pct >= 40) return 'bg-emerald-400 text-white';
  if (pct >= 20) return 'bg-emerald-300 text-emerald-950';
  if (pct > 0) return 'bg-emerald-100 text-emerald-900';
  return 'bg-muted text-muted-foreground';
}

function fmtMonth(s: string) {
  const [y, m] = s.split('-');
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString('ro-RO', { month: 'short', year: 'numeric' });
}

export function CohortRetentionCard() {
  const { data, isLoading } = useAdminCohortRetention(6);
  const rows = data ?? [];
  const cols: Array<'m0' | 'm1' | 'm2' | 'm3' | 'm4' | 'm5'> = ['m0', 'm1', 'm2', 'm3', 'm4', 'm5'];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Retenție pe cohorte lunare</CardTitle>
        <p className="text-xs text-muted-foreground">
          Procent abonați din fiecare lună de înscriere care au fost activi în lunile următoare
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-32 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-6">
            Nu există date suficiente
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-xs border-separate border-spacing-1">
              <thead>
                <tr>
                  <th className="text-left font-medium text-muted-foreground px-2">Cohortă</th>
                  <th className="text-right font-medium text-muted-foreground px-2">Total</th>
                  {cols.map((c, i) => (
                    <th key={c} className="text-center font-medium text-muted-foreground w-14">M{i}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.cohort_month}>
                    <td className="px-2 py-1 font-medium whitespace-nowrap">{fmtMonth(r.cohort_month)}</td>
                    <td className="px-2 py-1 text-right text-muted-foreground">{r.cohort_size}</td>
                    {cols.map(c => {
                      const v = r[c] as number;
                      return (
                        <td key={c} className="text-center">
                          <div className={`rounded-md py-1.5 font-semibold ${cellBg(v)}`}>
                            {v === null || v === undefined ? '—' : `${v}%`}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
