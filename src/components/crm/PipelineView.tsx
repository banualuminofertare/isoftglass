import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, DollarSign, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/contexts/CurrencyContext';
import type { CrmLead } from '@/hooks/useCrmLeads';

interface PipelineViewProps {
  leads: CrmLead[];
  onUpdateLead: (id: string, updates: Partial<CrmLead>) => Promise<void>;
}

export function PipelineView({ leads, onUpdateLead }: PipelineViewProps) {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  const PIPELINE_STAGES = [
    { key: 'nou', label: t('crm.stageNew'), color: 'bg-muted' },
    { key: 'contactat', label: t('crm.stageContacted'), color: 'bg-chart-1/10' },
    { key: 'interesat', label: t('crm.stageInterested'), color: 'bg-chart-2/10' },
    { key: 'demo', label: t('crm.stageDemo'), color: 'bg-chart-3/10' },
    { key: 'negociere', label: t('crm.stageNegotiation'), color: 'bg-chart-4/10' },
    { key: 'castigat', label: t('crm.stageWon'), color: 'bg-chart-5/10' },
    { key: 'pauza', label: t('crm.stagePaused'), color: 'bg-yellow-500/10' },
    { key: 'pierdut', label: t('crm.stageLost'), color: 'bg-destructive/10' },
  ];

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId);
  };

  const handleDrop = async (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (leadId) {
      await onUpdateLead(leadId, { stage } as any);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '60vh' }}>
      {PIPELINE_STAGES.map(stage => {
        const stageLeads = leads.filter(l => l.stage === stage.key);
        const stageValue = stageLeads.reduce((s, l) => s + (l.estimated_value || 0), 0);

        return (
          <div
            key={stage.key}
            className="flex-shrink-0 w-[260px]"
            onDrop={(e) => handleDrop(e, stage.key)}
            onDragOver={handleDragOver}
          >
            <div className={`rounded-t-lg p-3 ${stage.color}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">{stage.label}</h3>
                <Badge variant="secondary" className="text-xs">{stageLeads.length}</Badge>
              </div>
              {stageValue > 0 && (
                <p className="text-xs text-muted-foreground mt-1">{formatPrice(stageValue)}</p>
              )}
            </div>

            <div className="space-y-2 p-2 rounded-b-lg border border-t-0 min-h-[200px] bg-background">
              {stageLeads.map(lead => (
                <Card
                  key={lead.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead.id)}
                  className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-3 space-y-2">
                    <p className="font-medium text-sm">{lead.full_name}</p>
                    {lead.company_name && (
                      <p className="text-xs text-muted-foreground">{lead.company_name}</p>
                    )}
                    <div className="flex flex-col gap-1">
                      {lead.phone && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />{lead.phone}
                        </span>
                      )}
                      {lead.email && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                          <Mail className="h-3 w-3" />{lead.email}
                        </span>
                      )}
                    </div>
                    {lead.estimated_value > 0 && (
                      <div className="flex items-center gap-1 text-xs font-medium">
                        <DollarSign className="h-3 w-3" />
                        {formatPrice(lead.estimated_value)}
                      </div>
                    )}
                    {lead.next_follow_up && (
                      <div className={`flex items-center gap-1 text-xs ${new Date(lead.next_follow_up) < new Date() ? 'text-destructive' : 'text-muted-foreground'}`}>
                        <Calendar className="h-3 w-3" />
                        {format(new Date(lead.next_follow_up), 'dd.MM')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
