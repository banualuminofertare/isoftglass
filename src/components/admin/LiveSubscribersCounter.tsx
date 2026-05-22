import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdminLiveUsers, type LiveUser } from '@/hooks/useAdminAnalytics';
import { Users, TrendingUp, TrendingDown, Minus, Circle } from 'lucide-react';
import { MODULE_LABELS, timeAgo } from '@/lib/admin-analytics-utils';

interface Props {
  onPick?: (u: LiveUser) => void;
}

/**
 * Real-time subscribers panel:
 * - Header: big counter + trend vs previous refresh + last-update timestamp
 * - Body: detailed list of currently active subscribers (click → drilldown)
 * Auto-refresh 15s, window 5 min (via useAdminLiveUsers).
 */
export function LiveSubscribersCounter({ onPick }: Props) {
  const { data: liveUsers, isFetching, dataUpdatedAt } = useAdminLiveUsers();
  const users = liveUsers ?? [];
  const current = users.length;

  const [history, setHistory] = useState<number[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    if (!dataUpdatedAt) return;
    setLastUpdate(new Date(dataUpdatedAt));
    setHistory((h) => [...h, current].slice(-10));
  }, [dataUpdatedAt, current]);

  const prev = history.length >= 2 ? history[history.length - 2] : current;
  const delta = current - prev;

  const trendIcon =
    delta > 0 ? <TrendingUp className="h-4 w-4 text-emerald-500" /> :
    delta < 0 ? <TrendingDown className="h-4 w-4 text-rose-500" /> :
    <Minus className="h-4 w-4 text-muted-foreground" />;

  const trendLabel = delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : '±0';
  const trendColor =
    delta > 0 ? 'text-emerald-600' :
    delta < 0 ? 'text-rose-600' :
    'text-muted-foreground';

  return (
    <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-950/20">
      <CardContent className="p-0">
        {/* Header */}
        <div className="py-3 px-4 flex items-center gap-4 flex-wrap border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 ${current > 0 ? 'animate-ping opacity-75' : 'opacity-0'}`} />
              <span className={`relative inline-flex rounded-full h-3 w-3 ${current > 0 ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
            </span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">LIVE</span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-600" />
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tabular-nums leading-none">{current}</span>
              <span className="text-sm text-muted-foreground">abonați activi acum</span>
            </div>
          </div>

          <Badge variant="outline" className={`gap-1 ${trendColor} border-current/30`}>
            {trendIcon}
            <span className="font-medium tabular-nums">{trendLabel}</span>
            <span className="text-xs opacity-70">vs ultimul refresh</span>
          </Badge>

          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            {isFetching && <span className="inline-flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />}
            <span>
              Actualizat: {lastUpdate.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className="opacity-60">· refresh 60s · fereastră 5 min</span>
          </div>
        </div>

        {/* List */}
        <div className="p-3">
          {current === 0 ? (
            <div className="text-sm text-muted-foreground py-4 text-center">
              Niciun abonat activ în acest moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[260px] overflow-auto">
              {users.map((u) => (
                <button
                  key={u.user_id}
                  onClick={() => onPick?.(u)}
                  className="flex items-center gap-3 p-2 rounded-md border border-border hover:bg-accent text-left transition"
                >
                  <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">
                      <span className="font-medium">{u.full_name}</span>
                      <span className="text-muted-foreground"> · </span>
                      <span className="font-semibold">{u.company_name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
                        {MODULE_LABELS[u.current_module ?? 'other'] ?? u.current_module ?? '—'}
                      </Badge>
                      <span>{u.country_code}</span>
                      <span>·</span>
                      <span>{timeAgo(u.last_active)}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
