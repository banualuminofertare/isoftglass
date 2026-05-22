import { User, Phone, Mail, Tag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import type { ClientType } from '@/hooks/useClients';

interface ClientInfoFieldsProps {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  onNameChange: (name: string) => void;
  onPhoneChange: (phone: string) => void;
  onEmailChange: (email: string) => void;
  clientType?: ClientType;
  onClientTypeChange?: (type: ClientType) => void;
}

export function ClientInfoFields({ 
  clientName, clientPhone, clientEmail, 
  onNameChange, onPhoneChange, onEmailChange,
  clientType, onClientTypeChange,
}: ClientInfoFieldsProps) {
  const { t } = useTranslation();

  const clientTypeLabels: Record<ClientType, string> = {
    person: t('calc.personType'),
    company: t('calc.companyType'),
    distributor: t('calc.distributorType'),
  };

  return (
    <Card>
      <CardContent className="p-4">
        <Label className="text-sm font-bold mb-3 block text-primary">{t('calc.clientInfo')}</Label>
        <div className="grid grid-cols-1 gap-3">
          {onClientTypeChange && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Tag className="h-3.5 w-3.5 text-primary" strokeWidth={2.75} />
                <Label className="text-xs font-semibold text-primary">{t('calc.clientType')}</Label>
              </div>
              <Select value={clientType || 'person'} onValueChange={(v) => onClientTypeChange(v as ClientType)}>
                <SelectTrigger className="font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(clientTypeLabels) as ClientType[]).map(type => (
                    <SelectItem key={type} value={type} className="font-semibold">{clientTypeLabels[type]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2.75} />
              <Label className="text-xs font-semibold text-emerald-600">{t('calc.clientName')}</Label>
            </div>
            <Input
              placeholder={t('calc.clientNamePlaceholder')}
              value={clientName}
              onChange={(e) => onNameChange(e.target.value)}
              maxLength={100}
              className="font-semibold"
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-amber-600" strokeWidth={2.75} />
              <Label className="text-xs font-semibold text-amber-600">{t('calc.clientPhone')}</Label>
            </div>
            <Input
              placeholder={t('calc.clientPhonePlaceholder')}
              value={clientPhone}
              onChange={(e) => onPhoneChange(e.target.value)}
              maxLength={20}
              className="font-semibold"
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-sky-400" strokeWidth={2.75} />
              <Label className="text-xs font-semibold text-sky-400">{t('calc.clientEmail')}</Label>
            </div>
            <Input
              placeholder={t('calc.clientEmailPlaceholder')}
              type="email"
              value={clientEmail}
              onChange={(e) => onEmailChange(e.target.value)}
              maxLength={100}
              className="font-semibold"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}