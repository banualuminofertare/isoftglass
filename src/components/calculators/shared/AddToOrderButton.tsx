import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface AddToOrderButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'compact';
}

export function AddToOrderButton({
  onClick, isLoading, disabled, className, variant = 'default',
}: AddToOrderButtonProps) {
  const { t } = useTranslation();

  if (variant === 'compact') {
    return (
      <Button onClick={onClick} disabled={disabled || isLoading} size="sm" className={cn("gap-2", className)}>
        <Plus className="h-4 w-4" />
        {t('common.add')}
      </Button>
    );
  }

  return (
    <Button onClick={onClick} disabled={disabled || isLoading} className={cn("gap-2", className)}>
      <ShoppingCart className="h-4 w-4" />
      {isLoading ? t('calc.adding') : t('calc.addToOrder')}
    </Button>
  );
}