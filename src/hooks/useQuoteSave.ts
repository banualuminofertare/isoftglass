import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useTVA } from '@/hooks/useTVA';
import { useAuth } from '@/hooks/useAuth';
import { captureCanvasSnapshot } from '@/lib/captureCanvasSnapshot';
import i18next from 'i18next';
import type { PriceBreakdown } from '@/types/calculators';

interface QuoteSaveOptions {
  productType: string;
  productLabel: string;
  getConfigDetails: () => { label: string; value: string }[];
  price: PriceBreakdown;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  markupPercent?: number;
  fullConfig?: any;
  editingOrderProductId?: string | null;
}

export function useQuoteSave() {
  const { toast } = useToast();
  const tvaPercent = useTVA();
  const { companyId } = useAuth();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const saveQuote = async (options: QuoteSaveOptions) => {
    setIsSaving(true);
    try {
      // Calculate final price including custom amount and markup
      const customAmount = options.fullConfig?.customAmount ?? 0;
      const totalWithCustom = options.price.total + customAmount;
      const markupAmount = totalWithCustom * ((options.markupPercent ?? 0) / 100);
      const finalPrice = Math.round((totalWithCustom + markupAmount) * 100) / 100;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: i18next.t('toasts.error'), description: i18next.t('toasts.notAuthenticated'), variant: 'destructive' });
        return false;
      }

      const configDetails = options.getConfigDetails();
      const snapshotBase64 = captureCanvasSnapshot() || undefined;

      // UPDATE MODE: update existing order product
      if (options.editingOrderProductId) {
        const { data: existingProduct } = await supabase
          .from('order_products')
          .select('order_id')
          .eq('id', options.editingOrderProductId)
          .single();

        if (!existingProduct) throw new Error('Produsul nu a fost găsit');

        // Update order product
        await supabase.from('order_products').update({
          product_type: options.productType,
          configuration: configDetails as any,
          quantity: 1,
          unit_price: finalPrice,
          total_price: finalPrice,
          notes: options.productLabel,
          full_config: { ...(options.fullConfig ?? {}), priceBreakdown: options.price, markupPercent: options.markupPercent ?? 0, snapshotBase64 } as any,
        } as any).eq('id', options.editingOrderProductId);

        // Recalculate order totals from ALL products
        const { data: allProducts } = await supabase
          .from('order_products')
          .select('total_price')
          .eq('order_id', existingProduct.order_id);

        const newTotal = (allProducts || []).reduce((sum, p) => sum + (p.total_price || 0), 0);

        // Update client info on the order if provided
        const clientName = options.clientName?.trim();
        let clientId: string | null = null;
        if (clientName) {
          const { data: existingClients } = await supabase
            .from('clients')
            .select('id')
            .ilike('name', clientName)
            .limit(1);

          if (existingClients && existingClients.length > 0) {
            clientId = existingClients[0].id;
          } else {
            const { data: newClient } = await supabase
              .from('clients')
              .insert({
                name: clientName,
                phone: options.clientPhone?.trim() || null,
                email: options.clientEmail?.trim() || null,
                client_type: 'person' as const,
                created_by: user.id,
                company_id: companyId,
              } as any)
              .select('id')
              .single();
            if (newClient) clientId = newClient.id;
          }
        }

        await supabase.from('orders').update({
          subtotal: newTotal,
          total: newTotal,
          ...(clientId ? { client_id: clientId } : {}),
        }).eq('id', existingProduct.order_id);

        // Invalidate cached order data so the UI reflects the update
        await queryClient.invalidateQueries({ queryKey: ['order', existingProduct.order_id] });
        await queryClient.invalidateQueries({ queryKey: ['order-products', existingProduct.order_id] });
        await queryClient.invalidateQueries({ queryKey: ['processing-products', existingProduct.order_id] });
        await queryClient.invalidateQueries({ queryKey: ['orders'] });

        // Add history entry
        await supabase.from('order_history').insert({
          order_id: existingProduct.order_id,
          to_status: 'quote' as const,
          changed_by: user.id,
          notes: 'Configurație actualizată',
        });

        toast({
          title: i18next.t('toasts.quoteUpdated'),
          description: i18next.t('toasts.quoteUpdatedDesc'),
        });
        return true;
      }

      // CREATE MODE: create new quote + order
      const now = new Date();
      const refNumber = `OFR-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

      // 1. Save quote
      const { data: quoteData, error: quoteError } = await supabase.from('quotes' as any).insert({
        ref_number: refNumber,
        product_type: options.productType,
        product_label: options.productLabel,
        config_details: configDetails,
        price_breakdown: options.price,
        total_price: finalPrice,
        tva_percent: tvaPercent,
        client_name: options.clientName?.trim() || null,
        client_phone: options.clientPhone?.trim() || null,
        client_email: options.clientEmail?.trim() || null,
        markup_percent: options.markupPercent ?? 0,
        created_by: user.id,
        status: 'accepted',
        company_id: companyId,
      } as any).select().single();

      if (quoteError) throw quoteError;

      // 2. Find or create client
      let clientId: string | null = null;
      const clientName = options.clientName?.trim();
      if (clientName) {
        const { data: existingClients } = await supabase
          .from('clients')
          .select('id')
          .ilike('name', clientName)
          .limit(1);

        if (existingClients && existingClients.length > 0) {
          clientId = existingClients[0].id;
        } else {
          const { data: newClient } = await supabase
            .from('clients')
            .insert({
              name: clientName,
              phone: options.clientPhone?.trim() || null,
              email: options.clientEmail?.trim() || null,
              client_type: 'person' as const,
              created_by: user.id,
              company_id: companyId,
            } as any)
            .select('id')
            .single();
          if (newClient) clientId = newClient.id;
        }
      }

      // 3. Generate order number & create order
      const { data: orderNumber } = await supabase.rpc('generate_order_number');

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber as string,
          client_id: clientId,
          status: 'quote' as const,
          subtotal: finalPrice,
          total: finalPrice,
          tax_percent: tvaPercent,
          created_by: user.id,
          assigned_to: user.id,
          company_id: companyId,
        } as any)
        .select()
        .single();

      if (orderError) throw orderError;

      // 4. Add order product with full_config
      await supabase.from('order_products').insert({
        order_id: orderData.id,
        product_type: options.productType,
        configuration: configDetails as any,
        quantity: 1,
        unit_price: finalPrice,
        total_price: finalPrice,
        notes: options.productLabel,
        full_config: { ...(options.fullConfig ?? {}), priceBreakdown: options.price, markupPercent: options.markupPercent ?? 0, snapshotBase64 } as any,
      } as any);

      // 5. Add order history
      await supabase.from('order_history').insert({
        order_id: orderData.id,
        to_status: 'quote' as const,
        changed_by: user.id,
        notes: `Creat din oferta ${refNumber}`,
      });

      toast({
        title: i18next.t('toasts.quoteSaved'),
        description: i18next.t('toasts.quoteSavedDesc', { ref: refNumber, order: orderNumber }),
      });
      return true;
    } catch (error) {
      console.error('Error saving quote:', error);
      toast({ title: i18next.t('toasts.error'), description: i18next.t('toasts.quoteSaveError'), variant: 'destructive' });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { saveQuote, isSaving };
}
