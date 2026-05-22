import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from 'react-i18next';

interface Subscriber {
  user_id: string;
  full_name: string | null;
  company_name: string | null;
}

interface TransferResult {
  copied: number;
  updated: number;
  skipped: number;
  errors: number;
  source_total: number;
}

interface BulkResultEntry {
  name: string;
  copied: number;
  updated: number;
  skipped: number;
  errors: number;
}

interface PricingCategoryTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: string;
  categoryLabel: string;
  itemCount: number;
  suppliers?: string[];
}

export function PricingCategoryTransferDialog({
  open,
  onOpenChange,
  category,
  categoryLabel,
  itemCount,
  suppliers = [],
}: PricingCategoryTransferDialogProps) {
  const { t } = useTranslation();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('__all__');
  const [overwrite, setOverwrite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferResult, setTransferResult] = useState<TransferResult | null>(null);
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number; name: string } | null>(null);
  const [bulkResults, setBulkResults] = useState<BulkResultEntry[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelectedUserId('');
    setSelectedSupplier('__all__');
    setOverwrite(false);
    setTransferResult(null);
    setBulkProgress(null);
    setBulkResults([]);
    setDetailsOpen(false);
    loadSubscribers();
  }, [open]);

  const filteredCount = useMemo(() => {
    if (selectedSupplier === '__all__') return itemCount;
    return null;
  }, [selectedSupplier, itemCount]);

  const loadSubscribers = async () => {
    setIsLoading(true);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, full_name, company_name')
      .eq('is_approved', true);

    if (!profiles) {
      setIsLoading(false);
      return;
    }

    const { data: adminRoles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    const adminIds = new Set((adminRoles || []).map(r => r.user_id));
    const filtered = profiles.filter(p => !adminIds.has(p.user_id));
    setSubscribers(filtered);
    setIsLoading(false);
  };

  const getSubscriberLabel = (sub: Subscriber) =>
    sub.company_name ? `${sub.company_name} - ${sub.full_name || 'Fără nume'}` : sub.full_name || 'Fără nume';

  const handleTransfer = async () => {
    if (!selectedUserId) {
      toast.error(t('ui.selectSubscriberRequired'));
      return;
    }

    setIsTransferring(true);
    setTransferResult(null);
    setBulkResults([]);

    try {
      if (selectedUserId === '__all__') {
        // Bulk transfer to all subscribers
        const results: BulkResultEntry[] = [];
        for (let i = 0; i < subscribers.length; i++) {
          const sub = subscribers[i];
          setBulkProgress({ current: i + 1, total: subscribers.length, name: getSubscriberLabel(sub) });

          try {
            const { data, error } = await supabase.functions.invoke('transfer-pricing-category', {
              body: {
                category,
                target_user_id: sub.user_id,
                overwrite,
                supplier_filter: selectedSupplier === '__all__' ? null : selectedSupplier,
              },
            });

            if (error) {
              results.push({ name: getSubscriberLabel(sub), copied: 0, updated: 0, skipped: 0, errors: 1 });
            } else {
              results.push({
                name: getSubscriberLabel(sub),
                copied: data.copied ?? 0,
                updated: data.updated ?? 0,
                skipped: data.skipped ?? 0,
                errors: data.errors ?? 0,
              });
            }
          } catch {
            results.push({ name: getSubscriberLabel(sub), copied: 0, updated: 0, skipped: 0, errors: 1 });
          }
        }
        setBulkResults(results);
        setBulkProgress(null);
      } else {
        // Single subscriber transfer
        const { data, error } = await supabase.functions.invoke('transfer-pricing-category', {
          body: {
            category,
            target_user_id: selectedUserId,
            overwrite,
            supplier_filter: selectedSupplier === '__all__' ? null : selectedSupplier,
          },
        });

        if (error) throw error;

        setTransferResult({
          copied: data.copied ?? 0,
          updated: data.updated ?? 0,
          skipped: data.skipped ?? 0,
          errors: data.errors ?? 0,
          source_total: data.source_total ?? 0,
        });
      }
    } catch (err: any) {
      console.error('Transfer error:', err);
      toast.error(t('ui.transferError') + ': ' + (err.message || t('ui.unknownError')));
    } finally {
      setIsTransferring(false);
    }
  };

  const selectedSubscriber = subscribers.find(s => s.user_id === selectedUserId);

  const hasResults = transferResult !== null || bulkResults.length > 0;

  const renderSingleResult = () => {
    if (!transferResult) return null;
    const { copied, updated, skipped, errors, source_total } = transferResult;
    const totalProcessed = copied + updated + skipped;
    const isComplete = totalProcessed === source_total && errors === 0;

    return (
      <div className="space-y-3 py-2">
        <div className="rounded-lg border bg-muted/50 p-4 space-y-2 text-sm">
          <div className="flex items-center gap-2 font-semibold text-base">
            {isComplete ? (
              <><CheckCircle2 className="h-5 w-5 text-green-600" /> Transfer complet</>
            ) : (
              <><AlertTriangle className="h-5 w-5 text-destructive" /> Transfer cu probleme</>
            )}
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-1">
            <span className="text-muted-foreground">{t('ui.source')}</span>
            <span className="font-medium">{source_total} produse</span>
            <span className="text-muted-foreground">Copiate noi:</span>
            <span className="font-medium">{copied}</span>
            <span className="text-muted-foreground">Actualizate:</span>
            <span className="font-medium">{updated}</span>
            <span className="text-muted-foreground">{t('ui.skipped')}</span>
            <span className="font-medium">{skipped}</span>
            {errors > 0 && (
              <>
                <span className="text-destructive">Erori:</span>
                <span className="font-medium text-destructive">{errors}</span>
              </>
            )}
          </div>
          <Separator />
          <div className={`font-semibold ${isComplete ? 'text-green-600' : 'text-destructive'}`}>
            {isComplete
              ? `✅ Total procesat: ${totalProcessed} / ${source_total}`
              : `⚠️ Total procesat: ${totalProcessed} / ${source_total} — ${source_total - totalProcessed + errors} neprocesat(e)`
            }
          </div>
        </div>
      </div>
    );
  };

  const renderBulkResult = () => {
    if (bulkResults.length === 0) return null;

    const totals = bulkResults.reduce(
      (acc, r) => ({
        copied: acc.copied + r.copied,
        updated: acc.updated + r.updated,
        skipped: acc.skipped + r.skipped,
        errors: acc.errors + r.errors,
      }),
      { copied: 0, updated: 0, skipped: 0, errors: 0 }
    );

    const hasErrors = totals.errors > 0;

    return (
      <div className="space-y-3 py-2">
        <div className="rounded-lg border bg-muted/50 p-4 space-y-2 text-sm">
          <div className="flex items-center gap-2 font-semibold text-base">
            {!hasErrors ? (
              <><CheckCircle2 className="h-5 w-5 text-green-600" /> Transfer complet — {bulkResults.length} abonați</>
            ) : (
              <><AlertTriangle className="h-5 w-5 text-destructive" /> Transfer cu probleme — {bulkResults.length} abonați</>
            )}
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-1">
            <span className="text-muted-foreground">Copiate noi:</span>
            <span className="font-medium">{totals.copied}</span>
            <span className="text-muted-foreground">Actualizate:</span>
            <span className="font-medium">{totals.updated}</span>
            <span className="text-muted-foreground">{t('ui.skipped')}</span>
            <span className="font-medium">{totals.skipped}</span>
            {totals.errors > 0 && (
              <>
                <span className="text-destructive">Erori:</span>
                <span className="font-medium text-destructive">{totals.errors}</span>
              </>
            )}
          </div>
        </div>

        <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full flex items-center gap-1 text-xs">
              {detailsOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              Detalii per abonat
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="max-h-48 overflow-y-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Abonat</TableHead>
                    <TableHead className="text-xs text-center">Noi</TableHead>
                    <TableHead className="text-xs text-center">Upd</TableHead>
                    <TableHead className="text-xs text-center">Err</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bulkResults.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs py-1">{r.name}</TableCell>
                      <TableCell className="text-xs text-center py-1">{r.copied}</TableCell>
                      <TableCell className="text-xs text-center py-1">{r.updated}</TableCell>
                      <TableCell className={`text-xs text-center py-1 ${r.errors > 0 ? 'text-destructive font-semibold' : ''}`}>{r.errors}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  };

  const renderProgress = () => {
    if (!bulkProgress) return null;
    const pct = Math.round((bulkProgress.current / bulkProgress.total) * 100);
    return (
      <div className="space-y-2 py-4">
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Transferat {bulkProgress.current}/{bulkProgress.total}</span>
        </div>
        <p className="text-xs text-muted-foreground truncate">{bulkProgress.name}</p>
        <Progress value={pct} className="h-2" />
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Transferă categorie
          </DialogTitle>
          <DialogDescription>
            Transferă produsele din <Badge variant="secondary">{categoryLabel}</Badge> către un abonat, cu prețurile setate la 0.
          </DialogDescription>
        </DialogHeader>

        {bulkProgress ? (
          <>
            {renderProgress()}
          </>
        ) : hasResults ? (
          <>
            {renderSingleResult()}
            {renderBulkResult()}
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Închide</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Abonat destinatar</Label>
                {isLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Se încarcă abonații...
                  </div>
                ) : (
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('ui.selectSubscriber')} />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      <SelectItem value="__all__">📢 Toți abonații ({subscribers.length})</SelectItem>
                      <Separator className="my-1" />
                      {subscribers.map((sub, index) => (
                        <React.Fragment key={sub.user_id}>
                          <SelectItem value={sub.user_id}>
                            {getSubscriberLabel(sub)}
                          </SelectItem>
                          {index < subscribers.length - 1 && <Separator className="my-1" />}
                        </React.Fragment>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {suppliers.length > 0 && (
                <div className="space-y-2">
                  <Label>Furnizor</Label>
                  <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('ui.allSuppliers')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">{t('ui.allSuppliers')}</SelectItem>
                      {suppliers.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('ui.updateExisting')}</Label>
                  <p className="text-xs text-muted-foreground">
                    Actualizează foto, denumire și metadate, păstrând prețul
                  </p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className={`text-xs font-semibold ${overwrite ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {overwrite ? 'ON' : 'OFF'}
                  </span>
                  <Switch checked={overwrite} onCheckedChange={setOverwrite} />
                </div>
              </div>

              <div className="rounded-lg border bg-muted/50 p-3 text-sm">
                <p>
                  {filteredCount !== null ? (
                    <><strong>{filteredCount}</strong> produse din <strong>{categoryLabel}</strong> vor fi copiate</>
                  ) : (
                    <>Produsele din <strong>{categoryLabel}</strong> de la <strong>{selectedSupplier}</strong> vor fi copiate</>
                  )}
                </p>
                {selectedUserId === '__all__' ? (
                  <p className="text-muted-foreground mt-1">
                    Către: <strong>toți cei {subscribers.length} abonați</strong>
                  </p>
                ) : selectedSubscriber ? (
                  <p className="text-muted-foreground mt-1">
                    Către: <strong>{getSubscriberLabel(selectedSubscriber)}</strong>
                  </p>
                ) : null}
                <p className="text-muted-foreground mt-1" dangerouslySetInnerHTML={{ __html: t('ui.newProductsZeroPrice') }} />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isTransferring}>
                Anulează
              </Button>
              <Button onClick={handleTransfer} disabled={!selectedUserId || isTransferring}>
                {isTransferring ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Se transferă...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {selectedUserId === '__all__' ? `Transferă la toți (${subscribers.length})` : 'Transferă'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
