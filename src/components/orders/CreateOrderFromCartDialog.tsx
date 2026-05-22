import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Package, User, MapPin, Calendar, FileText, Loader2 } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useQuoteSettings } from '@/hooks/useTVA';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useOrderItemsContext } from '@/contexts/OrderItemsContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import i18next from 'i18next';
import { productTypeLabels } from '@/hooks/useOrderItems';
import type { Json } from '@/integrations/supabase/types';

interface CreateOrderFromCartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (orderId: string) => void;
}

export function CreateOrderFromCartDialog({ 
  open, 
  onOpenChange, 
  onSuccess 
}: CreateOrderFromCartDialogProps) {
  const { clients } = useClients();
  const { t } = useTranslation();
  const { items, totalPrice, clearItems } = useOrderItemsContext();
  const { tvaPercent } = useQuoteSettings();
  const { formatPrice } = useCurrency();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    client_id: '',
    delivery_address: '',
    delivery_date: '',
    notes: '',
  });

  // Extract clientInfo from cart items for auto-creation
  const getClientInfoFromCart = () => {
    for (const item of items) {
      const config = item.configuration as Record<string, unknown>;
      const ci = config?.clientInfo as Record<string, string> | undefined;
      if (ci?.name) return ci;
    }
    return null;
  };

  const cartClientInfo = getClientInfoFromCart();
  const cartClientName = cartClientInfo?.name?.trim() || '';

  // Auto-fill client when dialog opens
  useEffect(() => {
    if (open && cartClientName) {
      const match = clients.find(c => 
        c.name.toLowerCase() === cartClientName.toLowerCase()
      );
      if (match) {
        setFormData(prev => ({ ...prev, client_id: match.id }));
      }
    }
  }, [open, clients, cartClientName]);

  // formatPrice is now from CurrencyContext

  const getConfigSummary = (config: Record<string, unknown>): string => {
    const parts: string[] = [];

    if (config.dimensions) {
      const dims = config.dimensions as Record<string, number>;
      if (dims.width && dims.height) {
        parts.push(`L: ${dims.width} × A: ${dims.height} mm`);
      } else if (dims.length && dims.height) {
        parts.push(`L: ${dims.length} × A: ${dims.height} mm`);
      }
    }

    if (config.glass) {
      const glass = config.glass as Record<string, unknown>;
      if (glass.thickness) {
        parts.push(`${glass.thickness} mm`);
      }
    }

    return parts.join(' • ') || t('orders.customConfig');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error(i18next.t('orders.emptyCart'));
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(i18next.t('toasts.notAuthenticated'));

      // Auto-create client from cart info if none selected
      let clientId = formData.client_id || null;
      if (!clientId) {
        const cartClientInfo = getClientInfoFromCart();
        if (cartClientInfo?.name?.trim()) {
          // Check if client already exists
          const { data: existing } = await supabase
            .from('clients')
            .select('id')
            .ilike('name', cartClientInfo.name.trim())
            .limit(1);

          if (existing && existing.length > 0) {
            clientId = existing[0].id;
          } else {
            const { data: newClient } = await supabase
              .from('clients')
              .insert({
                name: cartClientInfo.name.trim(),
                phone: cartClientInfo.phone?.trim() || null,
                email: cartClientInfo.email?.trim() || null,
                client_type: 'person',
                created_by: user.id,
              })
              .select('id')
              .single();
            if (newClient) clientId = newClient.id;
          }
        }
      }

      const selectedClient = clients.find(c => c.id === clientId);
      const discountPercent = selectedClient?.discount_percent || 0;

      // Calculate totals
      const subtotal = totalPrice;
      const discountAmount = (subtotal * discountPercent) / 100;
      const afterDiscount = subtotal - discountAmount;
      const taxPercent = tvaPercent;
      const taxAmount = (afterDiscount * taxPercent) / 100;
      const total = afterDiscount + taxAmount;

      // Generate order number
      const { data: orderNumber, error: orderNumError } = await supabase.rpc('generate_order_number');
      if (orderNumError) throw orderNumError;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          client_id: clientId,
          created_by: user.id,
          assigned_to: user.id,
          delivery_address: formData.delivery_address || null,
          delivery_date: formData.delivery_date || null,
          notes: formData.notes || null,
          status: 'quote',
          subtotal,
          discount_percent: discountPercent,
          discount_amount: discountAmount,
          tax_percent: taxPercent,
          tax_amount: taxAmount,
          total,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order products from cart items
      const orderProducts = items.map(item => {
        // Extract full_config from configuration (the entire calculator config is spread into configuration)
        const configObj = item.configuration as Record<string, unknown>;
        const { clientInfo, ...fullConfig } = configObj;
        // Ensure priceBreakdown is always present in full_config for detailed preview display
        if (!fullConfig.priceBreakdown) {
          fullConfig.priceBreakdown = { total: item.unit_price };
        }
        return {
          order_id: order.id,
          product_type: item.product_type,
          configuration: item.configuration as Json,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.unit_price * item.quantity,
          notes: item.notes,
          full_config: fullConfig as Json,
        };
      });

      const { error: productsError } = await supabase
        .from('order_products')
        .insert(orderProducts);

      if (productsError) throw productsError;

      // Add to order history
      await supabase.from('order_history').insert({
        order_id: order.id,
        to_status: 'quote',
        changed_by: user.id,
        notes: `Comandă creată din coș cu ${items.length} produse`,
      });

      // Clear cart
      await clearItems();

      toast.success(i18next.t('toasts.orderCreated'), {
        description: `Nr. ${orderNumber}`,
      });

      // Reset form
      setFormData({
        client_id: '',
        delivery_address: '',
        delivery_date: '',
        notes: '',
      });

      onOpenChange(false);
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      onSuccess?.(order.id);

    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(i18next.t('orders.createError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedClient = clients.find(c => c.id === formData.client_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            {t('orders.createFromCart')}
          </DialogTitle>
          <DialogDescription className="sr-only">{t('ui.fillOrderDetails')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {/* Cart Summary */}
              <div className="bg-muted/50 rounded-lg p-3 border">
                <div className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Package className="h-4 w-4" />
                  {t('orders.cartProducts')} ({items.length})
                </div>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {productTypeLabels[item.product_type]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {getConfigSummary(item.configuration)}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-xs">×{item.quantity}</span>
                        )}
                      </div>
                      <span className="font-medium">
                        {formatPrice(item.unit_price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              {/* Client (read-only, from cart) */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Client
                </Label>
                <Input
                  value={selectedClient?.name || cartClientName || ''}
                  disabled
                  placeholder={t('orders.noClientInfo')}
                  className="bg-muted"
                />
                {selectedClient?.company_name && (
                  <p className="text-xs text-muted-foreground">{selectedClient.company_name}</p>
                )}
                {selectedClient?.discount_percent != null && selectedClient.discount_percent > 0 && (
                  <p className="text-xs text-green-600">
                    {t('orders.clientDiscount')}: {selectedClient.discount_percent}% 
                    (-{formatPrice((totalPrice * selectedClient.discount_percent) / 100)})
                  </p>
                )}
              </div>

              {/* Delivery Address */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {t('orders.deliveryAddress')}
                </Label>
                <Textarea
                  value={formData.delivery_address}
                  onChange={(e) => setFormData(prev => ({ ...prev, delivery_address: e.target.value }))}
                  placeholder={t('orders.fullDeliveryAddress')}
                  rows={2}
                />
              </div>

              {/* Delivery Date */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {t('orders.deliveryDate')}
                </Label>
                <Input
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, delivery_date: e.target.value }))}
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                   {t('common.notes')}
                </Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={t('orders.notesPlaceholder')}
                  rows={2}
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting || items.length === 0}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('orders.creating')}
                </>
              ) : (
                t('orders.createOrder')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
