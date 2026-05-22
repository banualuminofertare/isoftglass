import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, Trash2, ShoppingCart, Package, FileCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import type { OrderItem } from '@/hooks/useOrderItems';
import { productTypeLabels } from '@/hooks/useOrderItems';
import { CreateOrderFromCartDialog } from '@/components/orders/CreateOrderFromCartDialog';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '@/contexts/CurrencyContext';

interface OrderItemsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: OrderItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onClearItems: () => void;
  totalPrice: number;
  totalItems: number;
  isLoading?: boolean;
}

export function OrderItemsPanel({
  open, onOpenChange, items, onUpdateQuantity, onRemoveItem, onClearItems,
  totalPrice, totalItems, isLoading,
}: OrderItemsPanelProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const { formatPrice } = useCurrency();

  const getConfigSummary = (item: OrderItem): string => {
    const config = item.configuration as Record<string, unknown>;
    const parts: string[] = [];
    if (config.dimensions) {
      const dims = config.dimensions as Record<string, number>;
      if (dims.width && dims.height) parts.push(`L: ${dims.width} × A: ${dims.height} mm`);
      else if (dims.length && dims.height) parts.push(`L: ${dims.length} × A: ${dims.height} mm`);
    }
    if (config.glass) {
      const glass = config.glass as Record<string, unknown>;
      if (glass.thickness) parts.push(`${glass.thickness} mm`);
    }
    return parts.join(' • ') || t('calc.customConfig');
  };

  const handleOrderCreated = (orderId: string) => {
    onOpenChange(false);
    navigate('/comenzi');
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              {t('calc.orderProducts')}
              {totalItems > 0 && <Badge variant="secondary" className="ml-2">{totalItems}</Badge>}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-hidden">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Package className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-sm">{t('calc.noOrderProducts')}</p>
                <p className="text-xs mt-1">{t('calc.addFromConfigurators')}</p>
              </div>
            ) : (
              <ScrollArea className="h-full pr-4">
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="bg-muted/50 rounded-lg p-3 border border-border">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{productTypeLabels[item.product_type]}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 truncate">{getConfigSummary(item)}</p>
                          {(() => {
                            const ci = (item.configuration as Record<string, unknown>)?.clientInfo as Record<string, string> | undefined;
                            return ci?.name ? (
                              <p className="text-xs text-primary mt-0.5 truncate">👤 {ci.name}{ci.phone ? ` • ${ci.phone}` : ''}</p>
                            ) : null;
                          })()}
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onRemoveItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-primary">{formatPrice(item.unit_price * item.quantity)}</div>
                          {item.quantity > 1 && <div className="text-xs text-muted-foreground">{formatPrice(item.unit_price)} {t('calc.perPiece')}</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {items.length > 0 && (
            <>
              <Separator />
              <SheetFooter className="flex-col gap-3 sm:flex-col">
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm text-muted-foreground">{t('calc.orderTotal')}</span>
                  <span className="text-xl font-bold text-primary">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex gap-2 w-full">
                  <Button variant="outline" size="sm" className="flex-1" onClick={onClearItems}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('calc.emptyCart')}
                  </Button>
                  <Button size="sm" className="flex-1" onClick={() => setShowCreateOrder(true)}>
                    <FileCheck className="h-4 w-4 mr-2" />
                    {t('calc.finalize')}
                  </Button>
                </div>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <CreateOrderFromCartDialog open={showCreateOrder} onOpenChange={setShowCreateOrder} onSuccess={handleOrderCreated} />
    </>
  );
}