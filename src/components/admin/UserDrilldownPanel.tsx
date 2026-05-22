import { useState, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { Mail, Phone, Building2, Loader2, Package, FileText, Receipt, Calendar, Globe } from 'lucide-react';
import { useAdminUserDrilldown } from '@/hooks/useAdminAnalyticsExtra';
import type { PerUserRow } from '@/hooks/useAdminAnalytics';
import { PeriodSelector, buildPeriod, type PeriodValue } from './PeriodSelector';

const MODULE_LABELS: Record<string, string> = {
  calculators: 'Calculatoare 3D', orders: 'Comenzi', production: 'Producție',
  inventory: 'Inventar', crm: 'CRM', installation: 'Instalare',
  invoicing: 'Facturare', cutting: 'Optimizare', processing: 'Procesare',
  service: 'Service', operational: 'Operațional', reports: 'Rapoarte',
  settings: 'Setări', admin: 'Administrare', dashboard: 'Dashboard', other: 'Altele',
};

const OPERATIONAL_MODULES = ['installation', 'processing', 'operational', 'service', 'cutting'];

function fmtMoney(n: number) {
  return new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON', maximumFractionDigits: 0 }).format(n);
}

export function UserDrilldownPanel({ user, onClose }: { user: PerUserRow | null; onClose: () => void }) {
  const [period, setPeriod] = useState<PeriodValue>(() => buildPeriod('30d'));
  const range = useMemo(() => ({ from: period.from, to: period.to }), [period]);
  const { data, isLoading } = useAdminUserDrilldown(user?.user_id ?? null, range);

  const mailto = data?.profile?.auth_email
    ? `mailto:${data.profile.auth_email}?subject=${encodeURIComponent('Bună de la IsoftGlass')}`
    : null;

  return (
    <Sheet open={!!user} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between gap-2">
            <span>
              {user?.full_name}{' '}
              <span className="text-sm text-muted-foreground font-normal">— {user?.company_name}</span>
            </span>
            {mailto && (
              <Button asChild size="sm" variant="outline">
                <a href={mailto}><Mail className="h-3.5 w-3.5 mr-1" /> Email reactivare</a>
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        {isLoading && (
          <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        )}

        {data && user && (
          <div className="space-y-4 mt-4">
            {/* Profile snapshot */}
            <Card>
              <CardContent className="pt-4 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                {data.profile.auth_email && (
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{data.profile.auth_email}</span>
                  </div>
                )}
                {data.profile.phone && (
                  <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> {data.profile.phone}</div>
                )}
                {data.profile.company_name && (
                  <div className="flex items-center gap-2 min-w-0"><Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> <span className="truncate">{data.profile.company_name}</span></div>
                )}
                <div><Badge variant="outline">{data.profile.role}</Badge></div>
                {data.profile.last_country && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                    <Badge variant="secondary">{data.profile.last_country}</Badge>
                    <span className="text-xs text-muted-foreground">ultima țară</span>
                  </div>
                )}
                {data.profile.days_since_approval != null && (
                  <div className="text-muted-foreground">Aprobat de {data.profile.days_since_approval} zile</div>
                )}
              </CardContent>
            </Card>

            {data.recent_countries && data.recent_countries.length > 1 && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Globe className="h-3.5 w-3.5" /> Istoric țări</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap gap-2 text-xs">
                  {data.recent_countries.map(rc => (
                    <Badge key={rc.country_code} variant="outline">
                      {rc.country_code} · {new Date(rc.last_seen).toLocaleDateString('ro-RO')}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Period selector */}
            <Card>
              <CardContent className="pt-3 pb-3 flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground mr-1">Perioadă:</span>
                <PeriodSelector value={period} onChange={setPeriod} />
              </CardContent>
            </Card>

            {/* Quick stats (period-aware) */}
            {(() => {
              const periodHours = data.sessions.reduce((s, x) => s + (x.hours || 0), 0);
              const activeDays = data.sessions.filter(s => (s.hours || 0) > 0).length;
              const distinctModules = data.modules.length;
              return (
                <div className="grid grid-cols-4 gap-2">
                  <Stat label={`Ore (${period.label})`} value={`${periodHours.toFixed(1)}h`} />
                  <Stat label="Zile active" value={activeDays} />
                  <Stat label="Module" value={distinctModules} />
                  <Stat label="Engagement" value={`${user.engagement_score}/100`} />
                </div>
              );
            })()}

            {/* Sessions chart */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Activitate zilnică ({period.label})</CardTitle></CardHeader>
              <CardContent>
                {data.sessions.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-6 text-center">Fără activitate înregistrată.</div>
                ) : (
                  <ChartContainer config={{ hours: { label: 'Ore', color: 'hsl(var(--primary))' } }} className="h-[180px] w-full">
                    <LineChart data={[...data.sessions].reverse()} margin={{ left: 4, right: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" fontSize={9} />
                      <YAxis fontSize={9} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="hours" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 2 }} />
                    </LineChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            {/* Modules */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Module folosite ({period.label})</CardTitle></CardHeader>
              <CardContent>
                {data.modules.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-4 text-center">—</div>
                ) : (
                  <ChartContainer config={{ hours: { label: 'Ore', color: 'hsl(var(--primary))' } }} className="h-[200px] w-full">
                    <BarChart data={data.modules.map(m => ({ name: MODULE_LABELS[m.module] ?? m.module, hours: m.hours }))} layout="vertical" margin={{ left: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" fontSize={10} />
                      <YAxis type="category" dataKey="name" width={110} fontSize={10} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            {/* Operational modules subset */}
            {(() => {
              const ops = data.modules
                .filter(m => OPERATIONAL_MODULES.includes(m.module))
                .map(m => ({ name: MODULE_LABELS[m.module] ?? m.module, hours: m.hours }));
              return (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Module operaționale folosite ({period.label})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {ops.length === 0 ? (
                      <div className="text-sm text-muted-foreground py-4 text-center">
                        Nu a accesat module operaționale.
                      </div>
                    ) : (
                      <ChartContainer config={{ hours: { label: 'Ore', color: 'hsl(var(--primary))' } }} className="h-[180px] w-full">
                        <BarChart data={ops} layout="vertical" margin={{ left: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" fontSize={10} />
                          <YAxis type="category" dataKey="name" width={110} fontSize={10} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="hours" fill="hsl(var(--accent-foreground))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>
              );
            })()}

            {/* Business: orders + quotes + invoice */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Package className="h-3.5 w-3.5" />
                    Comenzi
                    <Badge variant="secondary" className="ml-auto">{data.orders.count}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground mb-2">Total valoare: <span className="font-semibold text-foreground">{fmtMoney(data.orders.total)}</span></div>
                  {data.orders.recent.length === 0 ? (
                    <div className="text-xs text-muted-foreground">Fără comenzi.</div>
                  ) : (
                    <div className="space-y-1">
                      {data.orders.recent.slice(0, 5).map(o => (
                        <div key={o.id} className="flex items-center justify-between text-xs gap-2 py-1 border-b last:border-0">
                          <span className="font-medium truncate">{o.order_number}</span>
                          <Badge variant="outline" className="text-[10px] px-1.5">{o.status}</Badge>
                          <span className="tabular-nums">{fmtMoney(o.total)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5" />
                    Oferte
                    <Badge variant="secondary" className="ml-auto">{data.quotes.count}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.quotes.recent.length === 0 ? (
                    <div className="text-xs text-muted-foreground">Fără oferte.</div>
                  ) : (
                    <div className="space-y-1">
                      {data.quotes.recent.slice(0, 5).map(q => (
                        <div key={q.id} className="flex items-center justify-between text-xs gap-2 py-1 border-b last:border-0">
                          <span className="font-medium truncate flex-1">{q.ref_number}</span>
                          <span className="text-muted-foreground truncate">{q.product_label}</span>
                          <span className="tabular-nums">{fmtMoney(q.total_price)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {data.last_invoice && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Receipt className="h-3.5 w-3.5" />
                    Ultima factură
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div><div className="text-muted-foreground">Număr</div><div className="font-semibold">{data.last_invoice.invoice_number ?? '—'}</div></div>
                  <div><div className="text-muted-foreground">Total</div><div className="font-semibold">{fmtMoney(data.last_invoice.total)}</div></div>
                  <div><div className="text-muted-foreground">Plătit</div><div className="font-semibold">{fmtMoney(data.last_invoice.paid_amount)}</div></div>
                  <div><div className="text-muted-foreground">Status</div><Badge variant="outline">{data.last_invoice.status}</Badge></div>
                  <div className="col-span-2 flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" /> Emisă: {data.last_invoice.issue_date ?? '—'}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border p-2 text-center">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className="text-sm font-bold">{value}</div>
    </div>
  );
}
