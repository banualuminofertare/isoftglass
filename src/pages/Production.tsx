import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Factory, Play, ChevronRight, Calendar, User, Clock, AlertCircle, CheckCircle2, Printer, CalendarDays, LayoutGrid } from 'lucide-react';
import { BarcodeLabel } from '@/components/production/BarcodeLabel';
import { ProductionCalendar } from '@/components/production/ProductionCalendar';
import { useProductionJobs, useJobStages, useTeamMembers, useAssignOperator, useUpdateOperatorName, STAGE_LABELS, STAGE_ORDER, type ProductionJob, type ProductionStage } from '@/hooks/useProduction';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ro, enUS, de, it, pl } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';

const STAGE_COLORS: Record<ProductionStage, string> = {
  cutting: 'bg-blue-500/10 border-blue-500/30',
  processing: 'bg-purple-500/10 border-purple-500/30',
  tempering: 'bg-orange-500/10 border-orange-500/30',
  coating: 'bg-pink-500/10 border-pink-500/30',
  assembly: 'bg-green-500/10 border-green-500/30',
  quality_control: 'bg-yellow-500/10 border-yellow-500/30',
  shipping: 'bg-emerald-500/10 border-emerald-500/30',
};

const STAGE_STATUS_ICON: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  in_progress: <Play className="h-4 w-4 text-primary" />,
  pending: <Clock className="h-4 w-4 text-muted-foreground" />,
  skipped: <AlertCircle className="h-4 w-4 text-muted-foreground/50" />,
};

export default function Production() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const dateFnsLocales: Record<string, typeof ro> = { ro, en: enUS, de, it, pl };
  const currentLocale = dateFnsLocales[i18n.language] || ro;
  const { jobs, jobsByStage, isLoading, advanceStage, startJob } = useProductionJobs();
  const [selectedJob, setSelectedJob] = useState<ProductionJob | null>(null);
  const [showBarcode, setShowBarcode] = useState(false);

  const { stages } = useJobStages(selectedJob?.id);
  const { members: teamMembers } = useTeamMembers();
  const assignOperator = useAssignOperator();
  const updateOperatorName = useUpdateOperatorName();

  const translatedStageLabels: Record<ProductionStage, string> = {
    cutting: t('opDashboard.stages.cutting'),
    processing: t('opDashboard.stages.processing'),
    tempering: t('opDashboard.stages.tempering'),
    coating: t('opDashboard.stages.coating'),
    assembly: t('opDashboard.stages.assembly'),
    quality_control: t('opDashboard.stages.quality_control'),
    shipping: t('opDashboard.stages.shipping'),
  };

  const handleStartJob = async (job: ProductionJob) => {
    if (!job.started_at) { await startJob.mutateAsync(job.id); }
  };

  const handleAdvanceStage = async (job: ProductionJob) => {
    await advanceStage.mutateAsync({ jobId: job.id });
    setSelectedJob(null);
  };

  const handleUpdateOperatorName = async (stageId: string, name: string) => {
    await updateOperatorName.mutateAsync({ stageId, operatorName: name });
  };

  const totalJobs = jobs.length;
  const inProgressJobs = jobs.filter(j => j.started_at && !j.completed_at).length;

  return (
    <AppLayout title={t('production.title')}>
      <div className="space-y-6">
        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-2 border-blue-500"><CardContent className="pt-4"><div className="flex items-center gap-2"><Factory className="h-5 w-5 text-blue-500" /><div><p className="text-2xl font-bold">{totalJobs}</p><p className="text-xs text-muted-foreground">{t('production.totalActiveSheets')}</p></div></div></CardContent></Card>
          <Card className="border-2 border-green-500"><CardContent className="pt-4"><div className="flex items-center gap-2"><Play className="h-5 w-5 text-green-500" /><div><p className="text-2xl font-bold">{inProgressJobs}</p><p className="text-xs text-muted-foreground">{t('production.inWork')}</p></div></div></CardContent></Card>
          <Card className="border-2 border-orange-500"><CardContent className="pt-4"><div className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-orange-500" /><div><p className="text-2xl font-bold">{jobsByStage.cutting?.length || 0}</p><p className="text-xs text-muted-foreground">{t('production.awaitingCutting')}</p></div></div></CardContent></Card>
          <Card className="border-2 border-emerald-500"><CardContent className="pt-4"><div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-500" /><div><p className="text-2xl font-bold">{jobsByStage.shipping?.length || 0}</p><p className="text-xs text-muted-foreground">{t('production.readyToShip')}</p></div></div></CardContent></Card>
        </div>

        {/* Tabs: Kanban / Calendar */}
        <Tabs defaultValue="kanban">
          <TabsList>
            <TabsTrigger value="kanban" className="flex items-center gap-1.5">
              <LayoutGrid className="h-4 w-4" />
              {t('production.kanbanView')}
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {t('production.calendarView')}
            </TabsTrigger>
          </TabsList>

          {/* Kanban Tab */}
          <TabsContent value="kanban">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Factory className="h-5 w-5" />
                  {t('production.kanbanBoard')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">{t('common.loading')}</div>
                ) : totalJobs === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t('production.noActiveSheets')}
                  </div>
                ) : (
                  <ScrollArea className="w-full pb-4">
                    <div className="flex gap-4 min-w-max">
                      {STAGE_ORDER.map((stage) => (
                        <div key={stage} className="w-72 flex-shrink-0">
                          <div className={cn("rounded-lg border p-3", STAGE_COLORS[stage])}>
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-medium text-sm">{translatedStageLabels[stage]}</h3>
                              <Badge variant="secondary" className="text-xs">
                                {jobsByStage[stage]?.length || 0}
                              </Badge>
                            </div>
                            <div className="space-y-2 min-h-[200px]">
                              {jobsByStage[stage]?.map((job) => (
                                <Card 
                                  key={job.id} 
                                  className="cursor-pointer hover:shadow-md transition-shadow"
                                  onClick={() => setSelectedJob(job)}
                                >
                                  <CardContent className="p-3">
                                    <div className="flex justify-between items-start mb-2">
                                      <span className="font-mono text-xs font-bold text-primary">
                                        {job.job_number}
                                      </span>
                                      {job.priority > 0 && (
                                        <Badge variant="destructive" className="text-xs">
                                          {t('production.priority')}
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm font-medium truncate">
                                      {job.orders?.order_number}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {job.client_name || job.orders?.clients?.name || t('production.unknownClient')}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                      {job.due_date && (
                                        <span className="flex items-center gap-1">
                                          <Calendar className="h-3 w-3" />
                                          {format(new Date(job.due_date), 'dd MMM', { locale: currentLocale })}
                                        </span>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <ProductionCalendar jobs={jobs} onSelectJob={setSelectedJob} />
          </TabsContent>
        </Tabs>

        {/* Job Detail Dialog */}
        <Dialog open={!!selectedJob} onOpenChange={() => { setSelectedJob(null); setShowBarcode(false); }}>
          <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="font-mono text-primary">{selectedJob?.job_number}</span>
              </DialogTitle>
              <DialogDescription className="sr-only">{t('ui.productionJobDetails')}</DialogDescription>
            </DialogHeader>
            {selectedJob && (
              <div className="space-y-4 overflow-y-auto pr-2 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-muted-foreground">{t('production.order')}</p><p className="font-medium">{selectedJob.orders?.order_number}</p></div>
                  <div><p className="text-xs text-muted-foreground">{t('common.client')}</p><p className="font-medium">{selectedJob.client_name || selectedJob.orders?.clients?.name || t('production.unknownClient')}</p></div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('production.currentStage')}</p>
                    <Badge className={cn(STAGE_COLORS[selectedJob.current_stage], "text-foreground hover:text-foreground")}>{translatedStageLabels[selectedJob.current_stage]}</Badge>
                  </div>
                  {selectedJob.due_date && (
                    <div><p className="text-xs text-muted-foreground">{t('dashboard.deadline')}</p><p className="font-medium flex items-center gap-1"><Calendar className="h-4 w-4" />{format(new Date(selectedJob.due_date), 'dd MMM yyyy', { locale: currentLocale })}</p></div>
                  )}
                </div>

                {/* Stage list with operator assignment */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">{t('production.stageProgress')}</p>
                  <div className="space-y-1.5">
                    {STAGE_ORDER.map((stage) => {
                      const currentIndex = STAGE_ORDER.indexOf(selectedJob.current_stage);
                      const stageIndex = STAGE_ORDER.indexOf(stage);
                      const isCompleted = stageIndex < currentIndex;
                      const isCurrent = stageIndex === currentIndex;
                      const isFuture = stageIndex > currentIndex;
                      const stageRecord = stages.find(s => s.stage === stage);
                      const canAssign = isCurrent || isFuture;
                      const statusKey = isCompleted ? 'completed' : isCurrent ? 'in_progress' : 'pending';

                      return (
                        <div key={stage} className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
                          isCurrent ? "bg-primary/10 border border-primary/20" : "bg-muted/30"
                        )}>
                          {STAGE_STATUS_ICON[statusKey]}
                          <span className={cn("flex-1 font-medium", isCompleted && "text-muted-foreground line-through")}>
                            {translatedStageLabels[stage]}
                          </span>
                          {canAssign && stageRecord ? (
                            <Input
                              className="w-[160px] h-8 text-xs"
                              placeholder={t('production.operatorName')}
                              defaultValue={stageRecord.operator_name || ''}
                              onBlur={(e) => handleUpdateOperatorName(stageRecord.id, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  (e.target as HTMLInputElement).blur();
                                }
                              }}
                            />
                          ) : stageRecord?.operator_name ? (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {stageRecord.operator_name}
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedJob.notes && (
                  <div>
                    <p className="text-xs text-muted-foreground">Note</p>
                    <p className="text-sm">{selectedJob.notes}</p>
                  </div>
                )}

                {showBarcode && (
                  <BarcodeLabel
                    jobNumber={selectedJob.job_number}
                    orderNumber={selectedJob.orders?.order_number}
                    clientName={selectedJob.orders?.clients?.name}
                    dueDate={selectedJob.due_date ? format(new Date(selectedJob.due_date), 'dd MMM yyyy', { locale: currentLocale }) : undefined}
                    currentStage={translatedStageLabels[selectedJob.current_stage]}
                  />
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBarcode(!showBarcode)}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    {showBarcode ? t('production.hideLabel') : t('production.printLabel')}
                  </Button>
                </div>

                <div className="flex gap-2">
                  {!selectedJob.started_at ? (
                    <Button className="flex-1" onClick={() => handleStartJob(selectedJob)} disabled={startJob.isPending}>
                      <Play className="h-4 w-4 mr-2" />{t('production.startProduction')}
                    </Button>
                  ) : (
                    <Button className="flex-1" onClick={() => handleAdvanceStage(selectedJob)} disabled={advanceStage.isPending}>
                      <ChevronRight className="h-4 w-4 mr-2" />
                      {STAGE_ORDER.indexOf(selectedJob.current_stage) === STAGE_ORDER.length - 1
                        ? t('production.finish')
                        : `${t('production.goTo')} ${translatedStageLabels[STAGE_ORDER[STAGE_ORDER.indexOf(selectedJob.current_stage) + 1]]}`}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
