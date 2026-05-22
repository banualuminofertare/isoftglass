import { ReactNode } from 'react';
import { OrderItemsProvider, useOrderItemsContext } from '@/contexts/OrderItemsContext';
import { OrderItemsPanel } from './OrderItemsPanel';
import { OrderCartButton } from './OrderCartButton';

interface CalculatorWrapperProps {
  children: ReactNode;
}

function CalculatorWrapperInner({ children }: CalculatorWrapperProps) {
  const {
    items,
    isPanelOpen,
    setIsPanelOpen,
    updateQuantity,
    removeItem,
    clearItems,
    totalPrice,
    totalItems,
    isLoading,
  } = useOrderItemsContext();

  return (
    <>
      {/* Floating cart button */}
      <div className="fixed bottom-4 right-4 z-50">
        <OrderCartButton
          onClick={() => setIsPanelOpen(true)}
          itemCount={totalItems}
        />
      </div>

      {/* Order items panel */}
      <OrderItemsPanel
        open={isPanelOpen}
        onOpenChange={setIsPanelOpen}
        items={items}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onClearItems={clearItems}
        totalPrice={totalPrice}
        totalItems={totalItems}
        isLoading={isLoading}
      />

      {children}
    </>
  );
}

export function CalculatorWrapper({ children }: CalculatorWrapperProps) {
  return (
    <OrderItemsProvider>
      <CalculatorWrapperInner>{children}</CalculatorWrapperInner>
    </OrderItemsProvider>
  );
}
