import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import i18next from 'i18next';
import type { ProductType, PriceBreakdown } from '@/types/calculators';
import type { Json } from '@/integrations/supabase/types';

export interface OrderItem {
  id: string;
  user_id: string;
  product_type: ProductType;
  configuration: Record<string, unknown>;
  unit_price: number;
  quantity: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AddOrderItemParams {
  productType: ProductType;
  configuration: Record<string, unknown>;
  price: PriceBreakdown;
  quantity?: number;
  notes?: string;
  markupPercent?: number;
  customAmount?: number;
}

export function useOrderItems() {
  const { user } = useAuth();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Fetch order items
  const fetchItems = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setItems((data || []) as OrderItem[]);
    } catch (error) {
      console.error('Error fetching order items:', error);
      toast.error(i18next.t('toasts.orderItems.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Add item
  const addItem = useCallback(async (params: AddOrderItemParams): Promise<boolean> => {
    if (!user) {
      toast.error(i18next.t('toasts.orderItems.notAuthenticated'));
      return false;
    }

    try {
      const totalWithCustom = params.price.total + (params.customAmount ?? 0);
      const markupAmount = totalWithCustom * ((params.markupPercent ?? 0) / 100);
      const finalPrice = Math.round((totalWithCustom + markupAmount) * 100) / 100;

      const { error } = await supabase.from('order_items').insert([{
        user_id: user.id,
        product_type: params.productType,
        configuration: params.configuration as Json,
        unit_price: finalPrice,
        quantity: params.quantity ?? 1,
        notes: params.notes ?? null,
      }]);

      if (error) throw error;

      toast.success(i18next.t('toasts.orderItems.added'));
      await fetchItems();
      return true;
    } catch (error) {
      console.error('Error adding order item:', error);
      toast.error(i18next.t('toasts.orderItems.addError'));
      return false;
    }
  }, [user, fetchItems]);

  // Update item quantity
  const updateQuantity = useCallback(async (id: string, quantity: number) => {
    if (quantity < 1) return;
    
    try {
      const { error } = await supabase
        .from('order_items')
        .update({ quantity })
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, quantity } : item
      ));
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error(i18next.t('toasts.orderItems.quantityError'));
    }
  }, []);

  // Remove item
  const removeItem = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('order_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== id));
      toast.success(i18next.t('toasts.orderItems.removed'));
    } catch (error) {
      console.error('Error removing order item:', error);
      toast.error(i18next.t('toasts.orderItems.removeError'));
    }
  }, []);

  // Clear all items
  const clearItems = useCallback(async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('order_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setItems([]);
      toast.success(i18next.t('toasts.orderItems.cleared'));
    } catch (error) {
      console.error('Error clearing order items:', error);
      toast.error(i18next.t('toasts.orderItems.clearError'));
    }
  }, [user]);

  // Total price
  const totalPrice = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Load items on mount
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    items,
    isLoading,
    isPanelOpen,
    setIsPanelOpen,
    addItem,
    updateQuantity,
    removeItem,
    clearItems,
    fetchItems,
    totalPrice,
    totalItems,
  };
}

// Product type labels
export const productTypeLabels: Record<ProductType, string> = {
  shower: 'Cabină duș',
  balustrade: 'Balustradă',
  mirror: 'Oglindă',
  panel: 'Panou sticlă',
  door: 'Ușă sticlă',
  kitchen_front: 'Front bucătărie',
};
