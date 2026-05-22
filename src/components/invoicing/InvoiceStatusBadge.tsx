import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import type { InvoiceStatus } from '@/hooks/useInvoices';

const COLORS: Record<InvoiceStatus, string> = {
  draft: 'bg-gray-500',
  issued: 'bg-blue-500',
  partially_paid: 'bg-amber-500',
  paid: 'bg-emerald-500',
  cancelled: 'bg-zinc-400',
  storno: 'bg-rose-600',
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const { t } = useTranslation();
  return <Badge className={cn(COLORS[status], 'text-white')}>{t(`invoicing.statusBadge.${status}`)}</Badge>;
}
