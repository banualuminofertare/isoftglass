import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export interface EditClientInfo {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
}

export function useEditQuote() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const [editingOrderProductId, setEditingOrderProductId] = useState<string | null>(editId);
  const [savedConfig, setSavedConfig] = useState<any>(null);
  const [editClientInfo, setEditClientInfo] = useState<EditClientInfo | null>(null);
  const [isLoadingEdit, setIsLoadingEdit] = useState(!!editId);

  useEffect(() => {
    if (!editId) return;
    setIsLoadingEdit(true);
    (async () => {
      // Fetch product config and order_id
      const { data } = await supabase
        .from('order_products')
        .select('full_config, order_id')
        .eq('id', editId)
        .single();
      if (data?.full_config) {
        setSavedConfig(data.full_config);
        setEditingOrderProductId(editId);

        // Fetch client info from the order's linked client
        if (data.order_id) {
          const { data: orderData } = await supabase
            .from('orders')
            .select('clients (name, phone, email)')
            .eq('id', data.order_id)
            .single();

          const client = orderData?.clients as { name?: string; phone?: string; email?: string } | null;
          if (client) {
            setEditClientInfo({
              clientName: client.name || '',
              clientPhone: client.phone || '',
              clientEmail: client.email || '',
            });
          }
        }
      }
      setIsLoadingEdit(false);
    })();
  }, [editId]);

  return { editingOrderProductId, savedConfig, editClientInfo, isLoadingEdit };
}
