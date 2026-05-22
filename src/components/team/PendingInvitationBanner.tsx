import { usePendingInvitation } from '@/hooks/usePendingInvitation';
import { Trans, useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Users, Check, X, Loader2 } from 'lucide-react';

export function PendingInvitationBanner() {
  const { t } = useTranslation();
  const { invitation, loading, acceptInvitation, declineInvitation } = usePendingInvitation();

  if (!invitation) return null;

  return (
    <div className="bg-primary/10 border-b border-primary/20 px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
      <div className="flex items-center gap-2 text-sm">
        <Users className="h-4 w-4 text-primary shrink-0" />
        <span>
          <Trans
            i18nKey="settings.team.invitedToTeam"
            values={{ name: invitation.company_name }}
            components={{ strong: <strong /> }}
          />
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={acceptInvitation}
          disabled={loading}
          className="h-7 gap-1"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
          {t('settings.team.accept')}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={declineInvitation}
          disabled={loading}
          className="h-7 gap-1 text-muted-foreground"
        >
          <X className="h-3 w-3" />
          {t('settings.team.decline')}
        </Button>
      </div>
    </div>
  );
}