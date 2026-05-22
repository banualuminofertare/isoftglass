import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderCartButtonProps {
  onClick: () => void;
  itemCount: number;
  className?: string;
}

export function OrderCartButton({
  onClick,
  itemCount,
  className,
}: OrderCartButtonProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      className={cn(
        "relative border-2 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/30 hover:border-emerald-600 hover:ring-emerald-600/50",
        className
      )}
    >
      <ShoppingCart className="h-4 w-4 text-emerald-600" strokeWidth={2.75} />
      {itemCount > 0 && (
        <Badge 
          className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
          variant="default"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </Badge>
      )}
    </Button>
  );
}
