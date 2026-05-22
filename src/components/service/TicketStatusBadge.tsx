import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';

const STATUS_KEYS: Record<string, { key: string; className: string }> = {
  deschis: { key: 'service.status_open', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
  in_evaluare: { key: 'service.status_inEvaluation', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
  programat: { key: 'service.status_scheduled', className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300' },
  in_lucru: { key: 'service.status_inProgress', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' },
  rezolvat: { key: 'service.status_resolved', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
  inchis: { key: 'service.status_closed', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' },
};

const PRIORITY_KEYS: Record<string, { key: string; className: string }> = {
  scazuta: { key: 'service.priority_low', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  medie: { key: 'service.priority_medium', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  urgenta: { key: 'service.priority_urgent', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
  critica: { key: 'service.priority_critical', className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
};

const TYPE_KEYS: Record<string, string> = {
  defect_productie: 'service.type_productionDefect',
  defect_montaj: 'service.type_installationDefect',
  deteriorare_transport: 'service.type_transportDamage',
  reclamatie_client: 'service.type_clientComplaint',
};

const RESULT_KEYS: Record<string, { key: string; className: string }> = {
  rezolvat: { key: 'service.result_resolved', className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  partial: { key: 'service.result_partial', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
  necesita_revenire: { key: 'service.result_needsReturn', className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
};

export function TicketStatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const config = STATUS_KEYS[status];
  const label = config ? t(config.key) : status;
  return <Badge variant="outline" className={config?.className || ''}>{label}</Badge>;
}

export function TicketPriorityBadge({ priority }: { priority: string }) {
  const { t } = useTranslation();
  const config = PRIORITY_KEYS[priority];
  const label = config ? t(config.key) : priority;
  return <Badge variant="outline" className={config?.className || ''}>{label}</Badge>;
}

export function TicketTypeLabel({ type }: { type: string }) {
  const { t } = useTranslation();
  return <span>{TYPE_KEYS[type] ? t(TYPE_KEYS[type]) : type}</span>;
}

export function InterventionResultBadge({ result }: { result: string }) {
  const { t } = useTranslation();
  const config = RESULT_KEYS[result];
  const label = config ? t(config.key) : result;
  return <Badge variant="outline" className={config?.className || ''}>{label}</Badge>;
}