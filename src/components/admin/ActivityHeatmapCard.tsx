import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Calendar } from 'lucide-react';
import { useAdminActivityHeatmap } from '@/hooks/useAdminAnalyticsExtra';

const DOW_LABELS = ['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ', 'Du'];

export function ActivityHeatmapCard({ from, to }: { from: Date; to: Date }) {
  const { data, isLoading } = useAdminActivityHeatmap(from, to);

  const { matrix, max } = useMemo(() => {
    const m: Record<string, { hours: number; users: number }> = {};
    let mx = 0;
    (data ?? []).forEach(c => {
      m[`${c.dow}-${c.hour}`] = { hours: c.hours, users: c.users };
      if (c.hours > mx) mx = c.hours;
    });
    return { matrix: m, max: mx };
  }, [data]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Calendar className="h-4 w-4 text-cyan-500" />
          Heatmap activitate
          <span className="text-xs text-muted-foreground font-normal">— zi × oră (ore active)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <div className="py-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>}
        {!isLoading && (
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* hour header */}
              <div className="flex items-center gap-[2px] mb-1 pl-8">
                {Array.from({ length: 24 }, (_, h) => (
                  <div key={h} className="w-5 text-[9px] text-muted-foreground text-center tabular-nums">
                    {h % 3 === 0 ? h : ''}
                  </div>
                ))}
              </div>
              {DOW_LABELS.map((label, dowIdx) => {
                const dow = dowIdx + 1;
                return (
                  <div key={dow} className="flex items-center gap-[2px] mb-[2px]">
                    <div className="w-7 text-[10px] text-muted-foreground font-medium pr-1">{label}</div>
                    {Array.from({ length: 24 }, (_, hour) => {
                      const cell = matrix[`${dow}-${hour}`];
                      const intensity = cell && max > 0 ? cell.hours / max : 0;
                      const bg = intensity === 0
                        ? 'hsl(var(--muted))'
                        : `hsl(var(--primary) / ${0.15 + intensity * 0.85})`;
                      return (
                        <div
                          key={hour}
                          className="w-5 h-5 rounded-sm relative group cursor-default"
                          style={{ backgroundColor: bg }}
                        >
                          {cell && (
                            <div className="absolute z-10 invisible group-hover:visible bottom-full mb-1 left-1/2 -translate-x-1/2 bg-popover border border-border rounded-md shadow-md px-2 py-1 text-[11px] whitespace-nowrap">
                              <div className="font-medium">{label} {String(hour).padStart(2, '0')}:00</div>
                              <div className="text-muted-foreground">{cell.hours.toFixed(1)}h · {cell.users} useri</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2 mt-3 text-[10px] text-muted-foreground">
              <span>Mai puțin</span>
              {[0.1, 0.3, 0.5, 0.7, 1].map(i => (
                <div key={i} className="w-4 h-4 rounded-sm" style={{ backgroundColor: `hsl(var(--primary) / ${0.15 + i * 0.85})` }} />
              ))}
              <span>Mai mult</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
