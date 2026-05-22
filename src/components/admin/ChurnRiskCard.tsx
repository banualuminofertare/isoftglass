import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdminChurnRisk, type ChurnRiskRow } from '@/hooks/useAdminAnalytics';
import { Loader2, ChevronDown, ChevronRight } from 'lucide-react';

function scoreColor(score: number) {
  if (score >= 80) return 'bg-red-500 text-white';
  if (score >= 60) return 'bg-orange-500 text-white';
  if (score >= 30) return 'bg-yellow-500 text-black';
  return 'bg-emerald-500 text-white';
}

function daysSince(iso: string | null) {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

export function ChurnRiskCard({ onOpenUser }: { onOpenUser: (r: ChurnRiskRow) => void }) {
  const { data, isLoading } = useAdminChurnRisk();
  const rows = data ?? [];
  const [open, setOpen] = useState(false);

  return (
    <Card id="kpi-churn-risk">
      <CardHeader
        className="pb-2 cursor-pointer select-none hover:bg-muted/40 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm flex items-center gap-2">
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            Risc abandonare abonați
          </CardTitle>
          <Badge variant="secondary">{rows.length}</Badge>
        </div>
      </CardHeader>
      {open && (
      <CardContent>
        {isLoading ? (
          <div className="h-32 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-6">
            Niciun abonat cu risc semnificativ 🎉
          </div>
        ) : (
          <div className="max-h-[420px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="text-xs">Abonat</TableHead>
                  <TableHead className="text-xs w-16 text-center">Scor</TableHead>
                  <TableHead className="text-xs">Motiv</TableHead>
                  <TableHead className="text-xs w-16 text-right">Zile</TableHead>
                  <TableHead className="text-xs w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(r => {
                  const d = daysSince(r.last_active);
                  return (
                    <TableRow key={r.user_id}>
                      <TableCell className="py-2">
                        <div className="font-medium text-sm truncate max-w-[180px]">{r.full_name}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[180px]">{r.company_name}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-semibold ${scoreColor(r.score)}`}>
                          {r.score}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">{r.top_reason}</TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {d === null ? '—' : `${d}z`}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" className="h-7" onClick={() => onOpenUser(r)}>
                          Deschide
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      )}
    </Card>
  );
}
