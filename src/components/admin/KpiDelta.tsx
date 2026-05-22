import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function KpiDelta({ current, previous, invertColors = false }: { current: number; previous: number; invertColors?: boolean }) {
  if (previous === 0 && current === 0) return null;
  if (previous === 0) {
    return <div className="text-[10px] text-muted-foreground mt-1">prima perioadă</div>;
  }
  const delta = ((current - previous) / previous) * 100;
  const abs = Math.abs(delta);
  if (abs < 0.5) {
    return (
      <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
        <Minus className="h-3 w-3" /> stabil vs perioada anterioară
      </div>
    );
  }
  const positive = invertColors ? delta < 0 : delta > 0;
  return (
    <div className={cn(
      'text-[10px] mt-1 flex items-center gap-1 font-medium',
      positive ? 'text-emerald-600' : 'text-rose-600',
    )}>
      {delta > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {delta > 0 ? '+' : ''}{delta.toFixed(0)}% vs perioada anterioară
    </div>
  );
}
