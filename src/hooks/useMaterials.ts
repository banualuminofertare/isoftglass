import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import i18next from 'i18next';

export type MaterialType = 'glass' | 'hardware' | 'consumable';
export type UnitType = 'sqm' | 'lm' | 'pcs' | 'kg' | 'l';

export interface Material {
  id: string;
  code: string;
  name: string;
  description?: string;
  material_type: MaterialType;
  unit: UnitType;
  unit_price?: number;
  stock_quantity?: number;
  min_stock_level?: number;
  location?: string;
  supplier?: string;
  is_active?: boolean;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserStock {
  id: string;
  user_id: string;
  material_id: string;
  stock_quantity: number;
  min_stock_level: number;
  location?: string;
}

export interface MaterialWithUserStock extends Material {
  user_stock_quantity: number;
  user_min_stock_level: number;
  user_location?: string;
  user_stock_id?: string;
}

export interface StockMovement {
  id: string;
  material_id: string;
  movement_type: 'in' | 'out' | 'adjustment' | 'reserved';
  quantity: number;
  reference_type?: string;
  reference_id?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  materials?: {
    name: string;
    code: string;
  };
}

export function useMaterials(typeFilter?: MaterialType) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch shared materials catalog
  const { data: materials = [], isLoading: materialsLoading, error } = useQuery({
    queryKey: ['materials', typeFilter],
    queryFn: async () => {
      let query = supabase
        .from('materials')
        .select('*')
        .order('code');
      
      if (typeFilter) {
        query = query.eq('material_type', typeFilter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Material[];
    },
  });

  // Fetch user's own stock data
  const { data: userStockMap = {}, isLoading: stockLoading } = useQuery({
    queryKey: ['user-stock', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_stock')
        .select('*')
        .eq('user_id', user!.id);
      
      if (error) throw error;
      
      const map: Record<string, UserStock> = {};
      (data || []).forEach((s: any) => {
        map[s.material_id] = s as UserStock;
      });
      return map;
    },
  });

  const isLoading = materialsLoading || stockLoading;

  // Merge materials with user stock
  const materialsWithStock: MaterialWithUserStock[] = materials.map(m => {
    const us = userStockMap[m.id];
    return {
      ...m,
      user_stock_quantity: us?.stock_quantity ?? 0,
      user_min_stock_level: us?.min_stock_level ?? 0,
      user_location: us?.location,
      user_stock_id: us?.id,
      // Override legacy fields for backward compat in UI
      stock_quantity: us?.stock_quantity ?? 0,
      min_stock_level: us?.min_stock_level ?? 0,
      location: us?.location ?? m.location,
    };
  });

  const lowStockMaterials = materialsWithStock.filter(
    m => m.user_min_stock_level > 0 && m.user_stock_quantity <= m.user_min_stock_level
  );

  const createMaterial = useMutation({
    mutationFn: async (material: Omit<Material, 'id' | 'created_at' | 'updated_at'> & { stock_quantity?: number; min_stock_level?: number; location?: string }) => {
      const { stock_quantity, min_stock_level, location, ...catalogData } = material;

      // Resolve current company_id so the row is scoped to this subscriber
      // (admins still default to their own company; they can publish to the global
      // catalog via the Admin module which sets company_id=null explicitly).
      let companyId: string | null = null;
      if (user?.id) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('user_id', user.id)
          .maybeSingle();
        companyId = (prof as any)?.company_id ?? null;
      }

      const { data, error } = await supabase
        .from('materials')
        .insert({ ...catalogData, company_id: companyId } as any)
        .select()
        .single();
      
      if (error) throw error;

      // Create user stock entry if user is logged in
      if (user?.id && (stock_quantity || min_stock_level || location)) {
        await supabase.from('user_stock').insert({
          user_id: user.id,
          material_id: data.id,
          stock_quantity: stock_quantity || 0,
          min_stock_level: min_stock_level || 0,
          location: location || null,
        });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      queryClient.invalidateQueries({ queryKey: ['user-stock'] });
      toast({ title: i18next.t('toasts.materialCreated') });
    },
    onError: (error) => {
      toast({ title: i18next.t('toasts.materialCreateError'), description: error.message, variant: 'destructive' });
    },
  });

  const updateMaterial = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Material> & { id: string }) => {
      const { data, error } = await supabase
        .from('materials')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast({ title: i18next.t('toasts.materialUpdated') });
    },
    onError: (error) => {
      toast({ title: i18next.t('toasts.error'), description: error.message, variant: 'destructive' });
    },
  });

  const adjustStock = useMutation({
    mutationFn: async ({ 
      materialId, 
      quantity, 
      type, 
      notes 
    }: { 
      materialId: string; 
      quantity: number; 
      type: 'in' | 'out' | 'adjustment'; 
      notes?: string;
    }) => {
      if (!user?.id) throw new Error('Nu ești autentificat');

      // Get current user stock
      const existingStock = userStockMap[materialId];
      const currentStock = existingStock?.stock_quantity || 0;
      let newStock = currentStock;

      if (type === 'in') newStock = currentStock + quantity;
      else if (type === 'out') newStock = currentStock - quantity;
      else newStock = quantity; // adjustment = set to exact value

      // Upsert user_stock
      const { error: stockError } = await supabase
        .from('user_stock')
        .upsert({
          user_id: user.id,
          material_id: materialId,
          stock_quantity: newStock,
          min_stock_level: existingStock?.min_stock_level || 0,
          location: existingStock?.location || null,
        }, { onConflict: 'user_id,material_id' });

      if (stockError) throw stockError;

      // Record movement
      const { data, error } = await supabase
        .from('stock_movements')
        .insert({
          material_id: materialId,
          movement_type: type,
          quantity: type === 'adjustment' ? quantity - currentStock : quantity,
          reference_type: 'manual',
          notes,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      queryClient.invalidateQueries({ queryKey: ['user-stock'] });
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      toast({ title: i18next.t('toasts.stockUpdated') });
    },
    onError: (error) => {
      toast({ title: i18next.t('toasts.error'), description: error.message, variant: 'destructive' });
    },
  });

  const deleteMaterial = useMutation({
    mutationFn: async (id: string) => {
      // Delete variants first
      await supabase.from('material_variants').delete().eq('material_id', id);
      // Delete stock movements
      await supabase.from('stock_movements').delete().eq('material_id', id);
      // Delete user_stock entries (cascade should handle but be explicit)
      await supabase.from('user_stock').delete().eq('material_id', id);
      // Delete the material
      const { error } = await supabase.from('materials').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      queryClient.invalidateQueries({ queryKey: ['user-stock'] });
      toast({ title: i18next.t('toasts.materialDeleted') });
    },
    onError: (error) => {
      toast({ title: i18next.t('toasts.materialDeleteError'), description: error.message, variant: 'destructive' });
    },
  });

  return {
    materials: materialsWithStock,
    lowStockMaterials,
    isLoading,
    error,
    createMaterial,
    updateMaterial,
    adjustStock,
    deleteMaterial,
  };
}

export function useStockMovements(materialId?: string) {
  const { data: movements = [], isLoading } = useQuery({
    queryKey: ['stock-movements', materialId],
    queryFn: async () => {
      let query = supabase
        .from('stock_movements')
        .select(`
          *,
          materials (name, code)
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (materialId) {
        query = query.eq('material_id', materialId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as StockMovement[];
    },
  });

  return { movements, isLoading };
}
