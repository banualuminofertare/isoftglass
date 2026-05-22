import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { MapPin, Phone, Users, Calendar, Clock, FileText, ClipboardList, Wrench } from 'lucide-react';
import { format } from 'date-fns';
import { getDateLocale } from '@/lib/dateLocale';
import { PDFDownloadButtons } from '@/components/orders/PDFDownloadButtons';
import type { InstallationJob } from '@/hooks/useInstallation';
import { useInstallation } from '@/hooks/useInstallation';
import { useOrderDetails, type Order } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-500',
  in_progress: 'bg-amber-500',
  completed: 'bg-emerald-500',
  postponed: 'bg-orange-500',
  cancelled: 'bg-red-500',
};

const getStatusLabel = (status: string, t: (key: string) => string) => {
  const key = `installation.status.${status}`;
  return t(key);
};

interface InstallationJobDetailsProps {
  job: InstallationJob | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostpone?: (job: InstallationJob) => void;
}

export function InstallationJobDetails({ job, open, onOpenChange, onPostpone }: InstallationJobDetailsProps) {
  const { t } = useTranslation();
  const { role } = useAuth();
  const canSchedule = role === 'admin' || role === 'sales' || role === 'production_manager';
  const { updateJob } = useInstallation();
  const { order: orderDetails, products } = useOrderDetails(job?.order_id || undefined);

  if (!job) return null;

  const checklist = (job.checklist || []) as Array<{ label: string; category?: string; checked?: boolean }>;
  const checkedCount = checklist.filter(i => i.checked).length;
  const progress = checklist.length > 0 ? Math.round((checkedCount / checklist.length) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{job.client_name || t('installation.installationLabel')}</span>
            <Badge className={`${statusColors[job.status]} text-white`}>
              {getStatusLabel(job.status, t)}
            </Badge>
          </DialogTitle>
          <DialogDescription className="sr-only">{t('installation.jobDetailsTitle')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info section */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{format(new Date(job.scheduled_date), 'dd MMMM yyyy', { locale: getDateLocale() })}</span>
            </div>
            {job.scheduled_time && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{format(new Date(`2000-01-01T${job.scheduled_time}`), 'HH:mm')}</span>
              </div>
            )}
            {job.client_phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{job.client_phone}</span>
              </div>
            )}
            {job.team && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{job.team.name}</span>
              </div>
            )}
          </div>

          {(job.address || job.city) && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span>{[job.address, job.city, job.postal_code].filter(Boolean).join(', ')}</span>
            </div>
          )}

          {job.notes && (
            <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">{job.notes}</p>
          )}

          {/* Order link + PDF */}
          {job.order && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {t('installation.linkedOrderLabel')} <span className="font-mono text-primary">{job.order.order_number}</span>
                </h4>
                {orderDetails && products.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <PDFDownloadButtons order={orderDetails as Order} products={products} variant="default" hideQuote productionSheetLabel={t('installation.installationSheet')} />
                  </div>
                )}
              </div>
            </>
          )}

          {/* Checklist progress */}
          {checklist.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Checklist ({checkedCount}/{checklist.length})
                </h4>
                <Progress value={progress} className="h-2" />
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {checklist.map((item, idx) => (
                    <div key={idx} className={`text-xs flex items-center gap-2 ${item.checked ? 'line-through text-muted-foreground' : ''}`}>
                      <span>{item.checked ? '✅' : '⬜'}</span>
                      <span>{item.label}</span>
                      {item.category && (
                        <Badge variant="outline" className="text-[10px] px-1 py-0">
                          {item.category === 'tool' ? '🔧' : item.category === 'material' ? '📦' : '⚙️'}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Action buttons */}
          {(canSchedule || role === 'operator') && (job.status === 'scheduled' || job.status === 'in_progress') && (
            <>
              <Separator />
              <div className="flex gap-2 justify-end">
                {canSchedule && job.status === 'scheduled' && (
                    <Button size="sm" onClick={() => { updateJob.mutate({ id: job.id, status: 'in_progress' }); onOpenChange(false); }}>
                    {t('installation.startJob')}
                  </Button>
                )}
                {(canSchedule || role === 'operator') && job.status === 'in_progress' && (
                  <Button size="sm" onClick={() => { updateJob.mutate({ id: job.id, status: 'completed', completed_at: new Date().toISOString() }); onOpenChange(false); }}>
                    {t('installation.finishJob')}
                  </Button>
                )}
                {canSchedule && (job.status === 'scheduled' || job.status === 'in_progress') && (
                  <Button size="sm" variant="outline" onClick={() => { 
                    if (onPostpone) {
                      onPostpone(job);
                    } else {
                      updateJob.mutate({ id: job.id, status: 'postponed' });
                    }
                    onOpenChange(false); 
                  }}>
                    {t('installation.postponeJob')}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
