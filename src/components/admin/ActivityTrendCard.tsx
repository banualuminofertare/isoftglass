import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { useAdminActivityTrend } from '@/hooks/useAdminAnalytics';
import { Loader2 } from 'lucide-react';

const PRESETS = [30, 90, 180];

export function ActivityTrendCard() {
  const [days, setDays] = useState(90);
  const range = useMemo(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    return { from, to };
  }, [days]);

  const { data, isLoading } = useAdminActivityTrend(range.from, range.to);

  const chartData = useMemo(
    () => (data ?? []).map(p => ({
      ...p,
      label: new Date(p.day).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' }),
    })),
    [data]
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-sm">Utilizatori activi în timp (DAU / WAU / MAU)</CardTitle>
          <div className="flex gap-1">
            {PRESETS.map(d => (
              <Button
                key={d}
                size="sm"
                variant={days === d ? 'default' : 'outline'}
                className="h-7 px-2 text-xs"
                onClick={() => setDays(d)}
              >
                {d}z
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ChartContainer config={{}} className="h-[300px] w-full">
            <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" fontSize={10} interval="preserveStartEnd" minTickGap={30} />
              <YAxis yAxisId="left" fontSize={10} />
              <YAxis yAxisId="right" orientation="right" fontSize={10} />
              <ChartTooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0].payload;
                  return (
                    <div className="rounded-md border bg-background px-3 py-2 text-xs shadow-md space-y-0.5">
                      <div className="font-medium">{label}</div>
                      <div>DAU: <span className="font-medium">{p.dau}</span></div>
                      <div>WAU (7z): <span className="font-medium">{p.wau}</span></div>
                      <div>MAU (30z): <span className="font-medium">{p.mau}</span></div>
                      <div className="text-muted-foreground">Ore: {p.hours.toFixed(1)} h</div>
                    </div>
                  );
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line yAxisId="left" type="monotone" dataKey="mau" name="MAU (30z)" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              <Line yAxisId="left" type="monotone" dataKey="wau" name="WAU (7z)" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line yAxisId="left" type="monotone" dataKey="dau" name="DAU" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="hours" name="Ore active" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
