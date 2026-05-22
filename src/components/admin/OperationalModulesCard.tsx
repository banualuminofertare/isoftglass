import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import { useAdminTopModules } from '@/hooks/useAdminAnalytics';
import { MODULE_LABELS, OPERATIONAL_MODULES } from '@/lib/admin-analytics-utils';
import { Loader2 } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

export function OperationalModulesCard({ from, to }: { from: Date; to: Date }) {
  const { data, isLoading } = useAdminTopModules(from, to);

  const chart = useMemo(
    () =>
      (data ?? [])
        .filter(m => OPERATIONAL_MODULES.includes(m.module))
        .sort((a, b) => b.total_hours - a.total_hours)
        .map(m => ({
          name: MODULE_LABELS[m.module] ?? m.module,
          hours: m.total_hours,
          users: m.unique_users,
        })),
    [data]
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Module operaționale</CardTitle>
        <p className="text-xs text-muted-foreground">
          Instalare, Procesare, Operațional, Service, Optimizare sticlă
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[420px] flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : chart.length === 0 ? (
          <div className="h-[420px] flex items-center justify-center text-sm text-muted-foreground">
            Nicio activitate pe modulele operaționale în perioada selectată
          </div>
        ) : (
          <ChartContainer config={{}} className="h-[420px] w-full">
            <BarChart data={chart} layout="vertical" margin={{ left: 8, right: 24 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" fontSize={11} />
              <YAxis type="category" dataKey="name" width={130} fontSize={11} />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0].payload;
                  return (
                    <div className="rounded-md border bg-background px-3 py-2 text-xs shadow-md">
                      <div className="font-medium">{p.name}</div>
                      <div>Ore: <span className="font-medium">{p.hours.toFixed(1)} h</span></div>
                      <div>Utilizatori: <span className="font-medium">{p.users}</span></div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="hours" radius={[0, 6, 6, 0]}>
                {chart.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
