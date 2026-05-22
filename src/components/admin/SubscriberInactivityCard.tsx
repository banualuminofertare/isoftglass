import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Cell, ReferenceLine,
} from 'recharts';
import type { SubscriberRow } from '@/hooks/useAdminAnalytics';

export const INACTIVITY_WARN_DAYS = 5;
export const INACTIVITY_ALERT_DAYS = 14;

type Status = 'green' | 'orange' | 'red' | 'never';
type Filter = 'all' | 'warn' | 'alert' | 'never';

const STATUS_COLOR: Record<Status, string> = {
  green: '#10b981',
  orange: '#f59e0b',
  red: '#ef4444',
  never: '#94a3b8',
};

const STATUS_LABEL: Record<Status, string> = {
  green: 'Activ',
  orange: `≥${INACTIVITY_WARN_DAYS} zile`,
  red: `≥${INACTIVITY_ALERT_DAYS} zile`,
  never: 'Niciodată',
};

function computeStatus(daysSince: number | null): Status {
  if (daysSince === null) return 'never';
  if (daysSince >= INACTIVITY_ALERT_DAYS) return 'red';
  if (daysSince >= INACTIVITY_WARN_DAYS) return 'orange';
  return 'green';
}

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / 86400000));
}

interface Point {
  user_id: string;
  full_name: string;
  company_name: string;
  days: number | null;
  daysClamped: number;
  status: Status;
  y: number;
  total_hours: number;
  last_active: string | null;
}

export function SubscriberInactivityCard({
  subscribers,
  onOpenUser,
}: {
  subscribers: SubscriberRow[];
  onOpenUser: (s: SubscriberRow) => void;
}) {
  const [filter, setFilter] = useState<Filter>('all');
  const [listOpen, setListOpen] = useState(false);

  const points: Point[] = useMemo(() => {
    // Group by clamped-day bucket, stack vertically within each bucket so dots don't overlap.
    const sorted = subscribers
      .map(s => {
        const d = daysSince(s.last_active);
        return {
          sub: s,
          d,
          clamped: d === null ? 65 : Math.min(d, 60),
          status: computeStatus(d),
        };
      })
      .sort((a, b) => a.clamped - b.clamped);

    const stackCount = new Map<number, number>();
    return sorted.map(({ sub, d, clamped, status }) => {
      const n = stackCount.get(clamped) ?? 0;
      stackCount.set(clamped, n + 1);
      return {
        user_id: sub.user_id,
        full_name: sub.full_name,
        company_name: sub.company_name,
        days: d,
        daysClamped: clamped,
        status,
        y: n + 1,
        total_hours: sub.total_hours,
        last_active: sub.last_active,
      };
    });
  }, [subscribers]);

  const maxStack = useMemo(
    () => points.reduce((m, p) => Math.max(m, p.y), 1),
    [points]
  );


  const counts = useMemo(() => {
    const c = { green: 0, orange: 0, red: 0, never: 0 };
    points.forEach(p => { c[p.status]++; });
    return c;
  }, [points]);

  const filtered = useMemo(() => {
    if (filter === 'all') return points;
    if (filter === 'warn') return points.filter(p => p.status === 'orange');
    if (filter === 'alert') return points.filter(p => p.status === 'red');
    return points.filter(p => p.status === 'never');
  }, [points, filter]);

  const attention = useMemo(
    () => points
      .filter(p => p.status === 'red' || p.status === 'orange' || p.status === 'never')
      .sort((a, b) => {
        const da = a.days === null ? 99999 : a.days;
        const db = b.days === null ? 99999 : b.days;
        return db - da;
      }),
    [points]
  );

  const handleClick = (userId: string) => {
    const sub = subscribers.find(s => s.user_id === userId);
    if (sub) onOpenUser(sub);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-sm">Inactivitate abonați</CardTitle>
          <div className="flex flex-wrap gap-1.5">
            <StatusBadge color={STATUS_COLOR.green} label={`Activ ${counts.green}`} active={filter === 'all'} onClick={() => setFilter('all')} />
            <StatusBadge color={STATUS_COLOR.orange} label={`≥${INACTIVITY_WARN_DAYS}z ${counts.orange}`} active={filter === 'warn'} onClick={() => setFilter(filter === 'warn' ? 'all' : 'warn')} />
            <StatusBadge color={STATUS_COLOR.red} label={`≥${INACTIVITY_ALERT_DAYS}z ${counts.red}`} active={filter === 'alert'} onClick={() => setFilter(filter === 'alert' ? 'all' : 'alert')} />
            <StatusBadge color={STATUS_COLOR.never} label={`Niciodată ${counts.never}`} active={filter === 'never'} onClick={() => setFilter(filter === 'never' ? 'all' : 'never')} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <ChartContainer config={{}} className="h-[260px] w-full">
          <ScatterChart margin={{ top: 10, right: 16, bottom: 24, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="daysClamped"
              name="Zile"
              domain={[0, 66]}
              ticks={[0, 5, 14, 30, 60]}
              tickFormatter={(v) => v >= 65 ? 'Niciodată' : v >= 60 ? '60+' : `${v}z`}
              fontSize={11}
              label={{ value: 'Zile de la ultima activitate', position: 'insideBottom', offset: -10, fontSize: 11 }}
            />
            <YAxis type="number" dataKey="y" hide domain={[0, Math.max(maxStack + 1, 4)]} />
            <ZAxis range={[80, 80]} />
            <ReferenceLine x={INACTIVITY_WARN_DAYS} stroke={STATUS_COLOR.orange} strokeDasharray="4 4" />
            <ReferenceLine x={INACTIVITY_ALERT_DAYS} stroke={STATUS_COLOR.red} strokeDasharray="4 4" />
            <ChartTooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as Point;
                return (
                  <div className="rounded-md border bg-background px-3 py-2 text-xs shadow-md">
                    <div className="font-medium">{p.full_name}</div>
                    <div className="text-muted-foreground">{p.company_name}</div>
                    <div className="mt-1">
                      {p.days === null
                        ? <span className="text-muted-foreground">Fără activitate înregistrată</span>
                        : <>Acum <span className="font-medium">{p.days} {p.days === 1 ? 'zi' : 'zile'}</span></>}
                    </div>
                    <div className="text-muted-foreground">{p.total_hours.toFixed(1)} h total</div>
                  </div>
                );
              }}
            />
            <Scatter
              data={filtered}
              onClick={(d: any) => handleClick(d.user_id)}
              shape="circle"
            >
              {filtered.map((p) => (
                <Cell key={p.user_id} fill={STATUS_COLOR[p.status]} style={{ cursor: 'pointer' }} />
              ))}
            </Scatter>
          </ScatterChart>
        </ChartContainer>

        {attention.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-4">
            Toți abonații sunt activi 🎉
          </div>
        ) : (
          <Collapsible open={listOpen} onOpenChange={setListOpen}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="w-full flex items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  {listOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <span className="font-medium">Abonați care necesită atenție</span>
                  <Badge variant="secondary" className="ml-1">{attention.length}</Badge>
                </span>
                <span className="text-xs text-muted-foreground">
                  {listOpen ? 'Ascunde' : 'Deschide'}
                </span>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="border rounded-md divide-y max-h-96 overflow-auto">
                {attention.map(p => (
                  <div key={p.user_id} className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted/50">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ background: STATUS_COLOR[p.status] }}
                      aria-label={STATUS_LABEL[p.status]}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{p.full_name}</div>
                      <div className="text-xs text-muted-foreground truncate">{p.company_name}</div>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {p.days === null ? 'Niciodată' : `${p.days} ${p.days === 1 ? 'zi' : 'zile'}`}
                    </div>
                    <Button size="sm" variant="ghost" className="h-7" onClick={() => handleClick(p.user_id)}>
                      Deschide
                    </Button>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ color, label, active, onClick }: { color: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs transition-colors ${active ? 'bg-muted' : 'hover:bg-muted/50'}`}
    >
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </button>
  );
}
