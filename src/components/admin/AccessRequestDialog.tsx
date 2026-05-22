import { useIncomingAccessRequests } from '@/hooks/useAccessRequest';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Check, X } from 'lucide-react';
import { useState, forwardRef } from 'react';
import { toast } from 'sonner';
import i18next from 'i18next';

export const AccessRequestDialog = forwardRef<HTMLDivElement>((_, ref) => {
  const { pendingRequest, respondToRequest } = useIncomingAccessRequests();
  const [responding, setResponding] = useState(false);

  if (!pendingRequest) return null;

  const handleRespond = async (accept: boolean) => {
    setResponding(true);
    try {
      await respondToRequest(pendingRequest.id, accept);
      toast.success(accept ? i18next.t('admin.accessGranted') : i18next.t('admin.accessDenied'));
    } catch (err) {
      toast.error(i18next.t('admin.accessRequestError'));
    } finally {
      setResponding(false);
    }
  };

  return (
    <AlertDialog open={true}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
            <ShieldAlert className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <AlertDialogTitle className="text-center">{i18next.t('admin.accessRequestTitle')}</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {i18next.t('admin.accessRequestDesc')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2 sm:justify-center">
          <Button
            variant="destructive"
            onClick={() => handleRespond(false)}
            disabled={responding}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            {i18next.t('admin.deny')}
          </Button>
          <Button
            onClick={() => handleRespond(true)}
            disabled={responding}
            className="gap-2"
          >
            <Check className="h-4 w-4" />
            {i18next.t('admin.allowAccess')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});
AccessRequestDialog.displayName = 'AccessRequestDialog';
