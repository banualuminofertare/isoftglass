import { createContext, useContext, ReactNode } from 'react';
import { useOrderItems, OrderItem, AddOrderItemParams } from '@/hooks/useOrderItems';

interface OrderItemsContextValue {
  items: OrderItem[];
  isLoading: boolean;
  isPanelOpen: boolean;
  setIsPanelOpen: (open: boolean) => void;
  addItem: (params: AddOrderItemParams) => Promise<boolean>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearItems: () => Promise<void>;
  fetchItems: () => Promise<void>;
  totalPrice: number;
  totalItems: number;
}

const OrderItemsContext = createContext<OrderItemsContextValue | null>(null);

export function OrderItemsProvider({ children }: { children: ReactNode }) {
  const orderItems = useOrderItems();

  return (
    <OrderItemsContext.Provider value={orderItems}>
      {children}
    </OrderItemsContext.Provider>
  );
}

export function useOrderItemsContext() {
  const context = useContext(OrderItemsContext);
  if (!context) {
    throw new Error('useOrderItemsContext must be used within OrderItemsProvider');
  }
  return context;
}
