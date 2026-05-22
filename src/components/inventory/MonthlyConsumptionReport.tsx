import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { FileBarChart, Download, Loader2 } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

const MONTHS = [
  'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
  'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie',
];

const UNIT_LABELS: Record<string, string> = {
  sqm: 'm²', lm: 'ml', pcs: 'buc', kg: 'kg', l: 'l',
};

interface ConsumptionRow {
  material_id: string;
  code: string;
  name: string;
  unit: string;
  unit_price: number;
  total_quantity: number;
  total_value: number;
}

export function MonthlyConsumptionReport() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const now = new Date();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [generated, setGenerated] = useState(false);
  const [queryParams, setQueryParams] = useState({ month: 0, year: 0 });

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['monthly-consumption', queryParams.month, queryParams.year, user?.id],
    enabled: generated && queryParams.month > 0 && !!user?.id,
    queryFn: async () => {
      const startDate = new Date(queryParams.year, queryParams.month - 1, 1).toISOString();
      const endDate = new Date(queryParams.year, queryParams.month, 1).toISOString();

      const { data, error } = await supabase
        .from('stock_movements')
        .select('material_id, quantity, materials(code, name, unit, unit_price)')
        .eq('movement_type', 'out')
        .gte('created_at', startDate)
        .lt('created_at', endDate);

      if (error) throw error;

      const map = new Map<string, ConsumptionRow>();
      for (const row of data || []) {
        const mat = row.materials as any;
        if (!mat) continue;
        const existing = map.get(row.material_id);
        const qty = Math.abs(Number(row.quantity));
        if (existing) {
          existing.total_quantity += qty;
          existing.total_value = existing.total_quantity * existing.unit_price;
        } else {
          map.set(row.material_id, {
            material_id: row.material_id,
            code: mat.code,
            name: mat.name,
            unit: mat.unit,
            unit_price: Number(mat.unit_price) || 0,
            total_quantity: qty,
            total_value: qty * (Number(mat.unit_price) || 0),
          });
        }
      }
      return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code));
    },
  });

  const totalValue = rows.reduce((sum, r) => sum + r.total_value, 0);

  const handleGenerate = () => {
    setQueryParams({ month: Number(month), year: Number(year) });
    setGenerated(true);
  };

  const handleDownloadCSV = () => {
    const header = 'Cod Produs,Nume Produs,Cantitate,Unitate,Pret Unitar (RON),Valoare (RON)';
    const csvRows = rows.map(r =>
      `"${r.code}","${r.name}",${r.total_quantity.toFixed(3)},${UNIT_LABELS[r.unit] || r.unit},${r.unit_price.toFixed(2)},${r.total_value.toFixed(2)}`
    );
    csvRows.push(`,,,,Total,${totalValue.toFixed(2)}`);
    const blob = new Blob([header + '\n' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consum_${MONTHS[Number(month) - 1]}_${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentYear = now.getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setGenerated(false); }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileBarChart className="h-4 w-4 mr-2" />
          {t('reports.consumption.buttonLabel')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('reports.consumption.title')}</DialogTitle>
          <DialogDescription>{t('reports.consumption.description')}</DialogDescription>
        </DialogHeader>

        <div className="flex items-end gap-3">
          <div className="space-y-2">
            <Label>Luna</Label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => (
                  <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>An</Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {years.map(y => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleGenerate} disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Generează
          </Button>
        </div>

        {generated && !isLoading && (
          <div className="space-y-4 mt-4">
            {rows.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                Nu s-au găsit mișcări de tip „ieșire" pentru {MONTHS[Number(month) - 1]} {year}.
              </p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cod Produs</TableHead>
                      <TableHead>Nume Produs</TableHead>
                      <TableHead className="text-right">Cantitate</TableHead>
                      <TableHead>Unitate</TableHead>
                      <TableHead className="text-right">Valoare (RON)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map(r => (
                      <TableRow key={r.material_id}>
                        <TableCell className="font-mono text-sm">{r.code}</TableCell>
                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell className="text-right tabular-nums">{r.total_quantity.toFixed(3)}</TableCell>
                        <TableCell>{UNIT_LABELS[r.unit] || r.unit}</TableCell>
                        <TableCell className="text-right tabular-nums font-medium">{r.total_value.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t-2 font-bold">
                      <TableCell colSpan={4} className="text-right">Total:</TableCell>
                      <TableCell className="text-right tabular-nums">{formatPrice(totalValue)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <div className="flex justify-end">
                  <Button variant="outline" onClick={handleDownloadCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    Descarcă CSV
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
