import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { extractMaterialConsumption } from '@/lib/materialConsumption';
import i18next from 'i18next';

export type OrderStatus = 'quote' | 'confirmed' | 'in_production' | 'completed' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  order_number: string;
  client_id?: string;
  status: OrderStatus;
  subtotal: number;
  discount_percent?: number;
  discount_amount?: number;
  tax_percent?: number;
  tax_amount?: number;
  total: number;
  paid_amount?: number;
  delivery_address?: string;
  delivery_date?: string;
  notes?: string;
  internal_notes?: string;
  created_by?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
  completed_at?: string;
  delivered_at?: string;
  clients?: {
    name: string;
    company_name?: string;
    phone?: string;
    email?: string;
    city?: string;
    postal_code?: string;
    address?: string;
    cui?: string;
  };
}

export interface OrderProduct {
  id: string;
  order_id: string;
  product_type: string;
  configuration: Record<string, unknown>;
  full_config?: Record<string, unknown> | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
  created_at: string;
}

export interface OrderHistory {
  id: string;
  order_id: string;
  from_status?: OrderStatus;
  to_status: OrderStatus;
  changed_by?: string;
  notes?: string;
  created_at: string;
  profiles?: {
    full_name?: string;
  };
}

export function useOrders(statusFilter?: OrderStatus) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { companyId } = useAuth();

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['orders', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          clients (name, company_name, phone, email, city, postal_code, address, cui)
        `)
        .order('created_at', { ascending: false });
      
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Order[];
    },
  });

  const createOrder = useMutation({
    mutationFn: async (order: Partial<Order>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Generate order number
      const { data: orderNumber } = await supabase.rpc('generate_order_number');
      
      const { data, error } = await supabase
        .from('orders')
        .insert({ 
          ...order, 
          order_number: orderNumber,
          created_by: user?.id,
          assigned_to: user?.id,
          company_id: companyId,
        } as any)
        .select()
        .single();
      
      if (error) throw error;

      // Add to history
      await supabase.from('order_history').insert({
        order_id: data.id,
        to_status: 'quote',
        changed_by: user?.id,
        notes: 'Comandă creată',
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({ title: i18next.t('toasts.orderCreated') });
    },
    onError: (error) => {
      toast({ title: i18next.t('toasts.orderCreateError'), description: error.message, variant: 'destructive' });
    },
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ id, status, notes, operatorNames }: { id: string; status: OrderStatus; notes?: string; operatorNames?: Record<string, string> }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get current order
      const { data: currentOrder } = await supabase
        .from('orders')
        .select('status')
        .eq('id', id)
        .single();

      const updateData: Partial<Order> = { status };
      
      if (status === 'confirmed') updateData.confirmed_at = new Date().toISOString();
      if (status === 'completed') updateData.completed_at = new Date().toISOString();
      if (status === 'delivered') updateData.delivered_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;

      // Add to history
      await supabase.from('order_history').insert({
        order_id: id,
        from_status: currentOrder?.status,
        to_status: status,
        changed_by: user?.id,
        notes,
      });

      // Auto-create production job when moving to in_production
      if (status === 'in_production') {
        const STAGE_ORDER = ['cutting', 'processing', 'tempering', 'coating', 'assembly', 'quality_control', 'shipping'] as const;

        // Skip creation if a production job already exists for this order (recovery from prior partial failure)
        const { data: existingJob } = await supabase
          .from('production_jobs')
          .select('id')
          .eq('order_id', id)
          .maybeSingle();

        let jobData: { id: string } | null = existingJob ?? null;

        if (!existingJob) {
          // Fetch client name for the order
          const { data: orderWithClient } = await supabase
            .from('orders')
            .select('delivery_date, clients (name)')
            .eq('id', id)
            .single();

          const clientName = (orderWithClient?.clients as { name?: string } | null)?.name || null;

          // Try up to 3 times to handle rare concurrent collisions on job_number
          let lastError: any = null;
          for (let attempt = 0; attempt < 3 && !jobData; attempt++) {
            const { data: jobNumber } = await supabase.rpc('generate_job_number');

            const { data: inserted, error: jobError } = await supabase
              .from('production_jobs')
              .insert({
                order_id: id,
                job_number: jobNumber as string,
                current_stage: 'cutting',
                priority: 0,
                client_name: clientName,
                due_date: orderWithClient?.delivery_date || null,
              })
              .select()
              .single();

            if (!jobError) {
              jobData = inserted;
              break;
            }
            lastError = jobError;
            const msg = String(jobError.message || '');
            // If a concurrent request already created the fiche for this order, fetch and reuse it
            if (msg.includes('duplicate key') && (msg.includes('order_id') || msg.includes('production_jobs_order_id'))) {
              const { data: raced } = await supabase
                .from('production_jobs')
                .select('id')
                .eq('order_id', id)
                .maybeSingle();
              if (raced) {
                jobData = raced;
                break;
              }
            }
            // Retry only on job_number duplicate
            if (!msg.includes('duplicate key')) break;
          }

          if (!jobData) {
            console.error('Eroare creare fișă producție:', lastError);
            throw new Error(`Comanda a fost trecută în producție, dar fișa de producție nu a putut fi creată: ${lastError?.message ?? 'eroare necunoscută'}`);
          }
        }

        if (jobData && !existingJob) {
          const stages = STAGE_ORDER.map(stage => ({
            job_id: jobData.id,
            stage,
            status: 'pending',
          }));
          const { data: stagesData, error: stagesError } = await supabase.from('production_stages').insert(stages).select();
          if (stagesError) {
            console.error('Eroare creare etape producție:', stagesError);
          }

          // Apply pre-planned operator names if provided
          if (stagesData && operatorNames && Object.keys(operatorNames).length > 0) {
            for (const stageRow of stagesData) {
              const opName = operatorNames[stageRow.stage];
              if (opName) {
                await supabase.from('production_stages').update({ operator_name: opName }).eq('id', stageRow.id);
              }
            }
          }
        }

        // Auto-deduct materials from stock
        try {
          const { data: orderProducts } = await supabase
            .from('order_products')
            .select('configuration, full_config, quantity')
            .eq('order_id', id);

          if (orderProducts && orderProducts.length > 0) {
            const allConsumption = new Map<string, number>();
            
            for (const product of orderProducts) {
              const config = (product.full_config || product.configuration) as Record<string, unknown>;
              if (!config) continue;
              const items = extractMaterialConsumption(config);
              const productQty = product.quantity || 1;
              
              for (const item of items) {
                const current = allConsumption.get(item.code) || 0;
                allConsumption.set(item.code, current + (item.quantity * productQty));
              }
            }

            if (allConsumption.size > 0) {
              // Find materials by code
              const codes = [...allConsumption.keys()];
              const { data: matchedMaterials } = await supabase
                .from('materials')
                .select('id, code')
                .in('code', codes);

              if (matchedMaterials && matchedMaterials.length > 0) {
                const companyId = await supabase.rpc('get_user_company_id', { _user_id: user?.id });

                // Get current user_stock for these materials
                const materialIds = matchedMaterials.map(m => m.id);
                const { data: currentStocks } = await supabase
                  .from('user_stock')
                  .select('material_id, stock_quantity, min_stock_level, location')
                  .eq('user_id', user!.id)
                  .in('material_id', materialIds);

                const stockMap = new Map(
                  (currentStocks || []).map(s => [s.material_id, s])
                );

                const movements = matchedMaterials.map(mat => ({
                  material_id: mat.id,
                  movement_type: 'out',
                  quantity: allConsumption.get(mat.code) || 0,
                  reference_type: 'order',
                  reference_id: id,
                  created_by: user?.id,
                  company_id: companyId?.data || null,
                  notes: `Consum automat - Comanda ${data.order_number || id}`,
                }));

                await supabase.from('stock_movements').insert(movements);

                // Update user_stock quantities
                for (const mat of matchedMaterials) {
                  const qty = allConsumption.get(mat.code) || 0;
                  const existing = stockMap.get(mat.id);
                  const currentQty = existing?.stock_quantity || 0;
                  const newQty = Math.max(0, currentQty - qty);

                  await supabase.from('user_stock').upsert({
                    user_id: user!.id,
                    material_id: mat.id,
                    stock_quantity: newQty,
                    min_stock_level: existing?.min_stock_level || 0,
                    location: existing?.location || null,
                  }, { onConflict: 'user_id,material_id' });
                }
              }
            }
          }
        } catch (stockErr) {
          console.error('Eroare la scăderea automată din stoc:', stockErr);
          // Don't throw - stock deduction is secondary to order status change
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['production-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      queryClient.invalidateQueries({ queryKey: ['user-stock'] });
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      toast({ title: i18next.t('toasts.orderStatusUpdated') });
    },
    onError: (error) => {
      toast({ title: i18next.t('toasts.error'), description: error.message, variant: 'destructive' });
    },
  });

  const deleteOrder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({ title: i18next.t('toasts.orderDeleted') });
    },
    onError: (error) => {
      toast({ title: i18next.t('toasts.error'), description: error.message, variant: 'destructive' });
    },
  });

  return {
    orders,
    isLoading,
    error,
    createOrder,
    updateOrderStatus,
    deleteOrder,
  };
}

export function useClientOrders(clientId?: string | null) {
  const { companyId } = useAuth();
  return useQuery({
    queryKey: ['client-orders', companyId, clientId],
    enabled: !!companyId && !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, created_at, total, status, tax_percent, order_products(id, product_type, configuration, full_config, quantity, unit_price)')
        .eq('client_id', clientId!)
        .eq('company_id', companyId!)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as any[];
    },
  });
}

export function useOrderDetails(orderId?: string) {
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          clients (*)
        `)
        .eq('id', orderId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['order-products', orderId],
    queryFn: async () => {
      if (!orderId) return [];
      const { data, error } = await supabase
        .from('order_products')
        .select('*')
        .eq('order_id', orderId);
      
      if (error) throw error;
      return data as OrderProduct[];
    },
    enabled: !!orderId,
  });

  const { data: history = [] } = useQuery({
    queryKey: ['order-history', orderId],
    queryFn: async () => {
      if (!orderId) return [];
      const { data, error } = await supabase
        .from('order_history')
        .select(`
          *,
          profiles:changed_by (full_name)
        `)
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as OrderHistory[];
    },
    enabled: !!orderId,
  });

  return { order, products, history, isLoading };
}
