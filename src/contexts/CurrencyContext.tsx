import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useQuoteSettings } from '@/hooks/useTVA';

type CurrencyCode = 'RON' | 'EUR';

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  euroRate: number;
  /** Convert a RON value to the active currency */
  convert: (ronValue: number) => number;
  /** Format a RON value in the active currency */
  formatPrice: (ronValue: number) => string;
  /** The active currency label, e.g. "RON" or "EUR" */
  currencyLabel: string;
  /** Replace "RON" in a unit string with current currency, e.g. "RON/buc" → "EUR/buc" */
  displayUnit: (unit: string) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { euroRate, preferredCurrency, saveSettings, tvaPercent } = useQuoteSettings();
  const [currency, setCurrencyState] = useState<CurrencyCode>(
    (preferredCurrency as CurrencyCode) || 'RON'
  );

  // Sync from DB on load
  useEffect(() => {
    if (preferredCurrency) {
      setCurrencyState(preferredCurrency as CurrencyCode);
    }
  }, [preferredCurrency]);

  const setCurrency = useCallback(async (c: CurrencyCode) => {
    setCurrencyState(c);
    try {
      await saveSettings({ tvaPercent, euroRate, preferredCurrency: c });
    } catch {
      // silent – local state is already updated
    }
  }, [saveSettings, tvaPercent, euroRate]);

  const convert = useCallback((ronValue: number) => {
    if (currency === 'EUR' && euroRate > 0) return ronValue / euroRate;
    return ronValue;
  }, [currency, euroRate]);

  const formatPrice = useCallback((ronValue: number) => {
    const converted = convert(ronValue);
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency,
      minimumFractionDigits: currency === 'EUR' ? 2 : 0,
      maximumFractionDigits: currency === 'EUR' ? 2 : 0,
    }).format(converted);
  }, [currency, convert]);

  const displayUnit = useCallback((unit: string) => {
    if (currency === 'EUR') return unit.replace(/RON/g, 'EUR');
    return unit;
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      euroRate,
      convert,
      formatPrice,
      currencyLabel: currency,
      displayUnit,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
