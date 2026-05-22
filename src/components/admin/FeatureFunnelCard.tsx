import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Filter } from 'lucide-react';
import { useAdminFeatureFunnel } from '@/hooks/useAdminAnalyticsExtra';

export function FeatureFunnelCard({ from, to }: { from: Date; to: Date }) {
  const { data, isLoading } = useAdminFeatureFunnel(from, to);
  const steps = data ?? [];
  const max = steps[0]?.users ?? 1;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Filter className="h-4 w-4 text-violet-500" />
          Funnel adopție
          <span className="text-xs text-muted-foreground font-normal">— abonați distincți per pas</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <div className="py-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>}
        <div className="space-y-3">
          {steps.map((s, i) => {
            const pct = max > 0 ? (s.users / max) * 100 : 0;
            const prev = i > 0 ? steps[i - 1].users : null;
            const conv = prev && prev > 0 ? (s.users / prev) * 100 : null;
            const drop = prev !== null ? prev - s.users : null;
            return (
              <div key={s.step} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{i + 1}. {s.label}</span>
                  <span className="font-bold tabular-nums">{s.users} abonați</span>
                </div>
                <div className="h-7 rounded-md bg-muted overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all"
                    style={{ width: `${Math.max(pct, 2)}%` }}
                  />
                </div>
                {conv !== null && (
                  <div className="text-xs text-muted-foreground flex justify-between">
                    <span>Conversie din pasul anterior: <span className="font-medium text-foreground">{conv.toFixed(0)}%</span></span>
                    {drop !== null && drop > 0 && (
                      <span className="text-rose-500">−{drop} pierduți</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
