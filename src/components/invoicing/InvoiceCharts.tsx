import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  PieChart, Pie, Cell,
} from 'recharts';
import type { Invoice } from '@/hooks/useInvoices';
import { format, startOfMonth } from 'date-fns';
import { ro, enUS, de, it, fr, es, nl, pl, hr } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/contexts/CurrencyContext';

interface Props {
  invoices: Invoice[];
}

const COLORS = {
  invoiced: 'hsl(217 91% 60%)',
  paid: 'hsl(142 71% 45%)',
  outstanding: 'hsl(38 92% 50%)',
  cancelled: 'hsl(0 84% 60%)',
};

const LOCALES: Record<string, any> = { ro, en: enUS, de, it, fr, es, nl, pl, hr };

export function InvoiceCharts({ invoices }: Props) {
  const { t, i18n } = useTranslation();
  const { convert, currencyLabel, currency } = useCurrency();
  const dateLocale = LOCALES[i18n.language?.slice(0, 2)] || enUS;

  const toBase = (inv: any) => Number(inv.exchange_rate) > 0 ? Number(inv.exchange_rate) : 1;

  const stats = useMemo(() => {
    let invoiced = 0, paid = 0, outstanding = 0, cancelled = 0;
    invoices.forEach(inv => {
      const rate = toBase(inv);
      const total = (Number(inv.total) || 0) * rate;
      const paidAmt = (Number(inv.paid_amount) || 0) * rate;
      if (inv.status === 'cancelled' || inv.status === 'storno') {
        cancelled += total;
        return;
      }
      if (inv.status === 'draft') return;
      invoiced += total;
      paid += paidAmt;
      outstanding += Math.max(0, total - paidAmt);
    });
    return { invoiced, paid, outstanding, cancelled };
  }, [invoices]);

  const monthly = useMemo(() => {
    const map = new Map<string, { key: string; label: string; invoiced: number; paid: number; outstanding: number; cancelled: number }>();
    invoices.forEach(inv => {
      const d = startOfMonth(new Date(inv.issue_date));
      const key = format(d, 'yyyy-MM');
      if (!map.has(key)) {
        map.set(key, {
          key,
          label: format(d, 'LLL yy', { locale: dateLocale }),
          invoiced: 0, paid: 0, outstanding: 0, cancelled: 0,
        });
      }
      const row = map.get(key)!;
      const rate = toBase(inv);
      const total = (Number(inv.total) || 0) * rate;
      const paidAmt = (Number(inv.paid_amount) || 0) * rate;
      if (inv.status === 'cancelled' || inv.status === 'storno') {
        row.cancelled += total;
        return;
      }
      if (inv.status === 'draft') return;
      row.invoiced += total;
      row.paid += paidAmt;
      row.outstanding += Math.max(0, total - paidAmt);
    });
    return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key)).slice(-12);
  }, [invoices, dateLocale]);

  const pieData = [
    { name: t('invoicing.charts.paid'), value: stats.paid, color: COLORS.paid },
    { name: t('invoicing.charts.outstanding'), value: stats.outstanding, color: COLORS.outstanding },
    { name: t('invoicing.charts.cancelled'), value: stats.cancelled, color: COLORS.cancelled },
  ].filter(d => d.value > 0);

  const digits = currency === 'EUR' ? 2 : 0;
  const fmt = (n: number) => `${convert(n).toLocaleString(i18n.language || 'ro-RO', { maximumFractionDigits: digits, minimumFractionDigits: digits })} ${currencyLabel}`;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label={t('invoicing.charts.invoiced')} value={convert(stats.invoiced)} color={COLORS.invoiced} lng={i18n.language} currencyLabel={currencyLabel} digits={digits} />
        <StatCard label={t('invoicing.charts.paid')} value={convert(stats.paid)} color={COLORS.paid} lng={i18n.language} currencyLabel={currencyLabel} digits={digits} />
        <StatCard label={t('invoicing.charts.outstanding')} value={convert(stats.outstanding)} color={COLORS.outstanding} lng={i18n.language} currencyLabel={currencyLabel} digits={digits} />
        <StatCard label={t('invoicing.charts.cancelled')} value={convert(stats.cancelled)} color={COLORS.cancelled} lng={i18n.language} currencyLabel={currencyLabel} digits={digits} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-base">{t('invoicing.charts.monthlyTitle')}</CardTitle></CardHeader>
          <CardContent>
            {monthly.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">{t('invoicing.charts.noData')}</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                  <Tooltip
                    formatter={(v: any) => fmt(Number(v))}
                    contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 6 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="invoiced" name={t('invoicing.charts.invoiced')} fill={COLORS.invoiced} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="paid" name={t('invoicing.charts.paid')} fill={COLORS.paid} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="outstanding" name={t('invoicing.charts.outstanding')} fill={COLORS.outstanding} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="cancelled" name={t('invoicing.charts.cancelled')} fill={COLORS.cancelled} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">{t('invoicing.charts.distributionTitle')}</CardTitle></CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">{t('invoicing.charts.noData')}</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip
                    formatter={(v: any) => fmt(Number(v))}
                    contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 6 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, lng, currencyLabel = 'RON', digits = 2 }: { label: string; value: number; color: string; lng?: string; currencyLabel?: string; digits?: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs uppercase text-muted-foreground tracking-wide">{label}</div>
        <div className="text-2xl font-bold mt-1" style={{ color }}>
          {value.toLocaleString(lng || 'ro-RO', { maximumFractionDigits: digits, minimumFractionDigits: digits })}
        </div>
        <div className="text-xs text-muted-foreground">{currencyLabel}</div>
      </CardContent>
    </Card>
  );
}
