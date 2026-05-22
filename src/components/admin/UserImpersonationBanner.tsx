import { useAdminImpersonation } from '@/contexts/AdminImpersonationContext';
import { Button } from '@/components/ui/button';
import { UserCog, X } from 'lucide-react';

export function UserImpersonationBanner() {
  const { isImpersonating, targetUserName, clearTarget } = useAdminImpersonation();

  if (!isImpersonating) return null;

  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-between text-sm font-medium">
      <div className="flex items-center gap-2">
        <UserCog className="h-4 w-4" />
        <span>Lucrezi pe contul: <strong>{targetUserName}</strong></span>
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="h-7 gap-1 text-amber-950 hover:bg-amber-600 hover:text-amber-950"
        onClick={clearTarget}
      >
        <X className="h-3 w-3" />
        Revino la contul meu
      </Button>
    </div>
  );
}
