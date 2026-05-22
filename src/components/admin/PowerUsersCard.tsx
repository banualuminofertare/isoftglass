import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Trophy } from 'lucide-react';
import { useAdminPowerUsers, type PowerUser } from '@/hooks/useAdminAnalyticsExtra';

const MEDALS = ['🥇', '🥈', '🥉', '4', '5'];

export function PowerUsersCard({ from, to, onOpenUser }: { from: Date; to: Date; onOpenUser: (u: PowerUser) => void }) {
  const { data, isLoading } = useAdminPowerUsers(from, to);
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          Power Users
          <span className="text-xs text-muted-foreground font-normal">— top 5 cei mai activi</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <div className="py-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>}
        {!isLoading && (data ?? []).length === 0 && (
          <div className="text-sm text-muted-foreground py-4 text-center">Niciun abonat activ în această perioadă.</div>
        )}
        <div className="space-y-2">
          {(data ?? []).map((u, i) => (
            <button
              key={u.user_id}
              onClick={() => onOpenUser(u)}
              className="w-full flex items-center gap-3 p-2 rounded-md border border-border hover:bg-accent text-left transition"
            >
              <span className="text-xl w-8 text-center shrink-0">{MEDALS[i] ?? i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{u.full_name}</div>
                <div className="text-xs text-muted-foreground truncate">{u.company_name}</div>
              </div>
              <div className="text-right text-xs shrink-0">
                <div className="font-bold text-sm">{u.hours.toFixed(1)}h</div>
                <div className="text-muted-foreground">{u.active_days}z · {u.distinct_modules} mod</div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <div className="text-xs text-muted-foreground">Scor</div>
                <div className="font-bold text-emerald-600">{u.score}</div>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
