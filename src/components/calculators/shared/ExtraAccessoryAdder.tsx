import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, ShoppingCart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAllCatalogAccessories } from '@/hooks/useCatalogAccessories';

const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

interface ExtraAccessoryAdderProps {
  onAdd: (item: { materialCode: string; name: string; unitPrice?: number; unit?: string }) => void;
}

export function ExtraAccessoryAdder({ onAdd }: ExtraAccessoryAdderProps) {
  const { t } = useTranslation();
  const [browsing, setBrowsing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { products, isLoading } = useAllCatalogAccessories();

  const filteredProducts = searchQuery.length >= 1
    ? products.filter(p => {
        const q = normalize(searchQuery);
        return normalize(p.name).includes(q) || normalize(p.code).includes(q);
      }).slice(0, 50)
    : [];

  if (!browsing) {
    return (
      <Button
        type="button" variant="outline"
        onClick={() => { setBrowsing(true); setSearchQuery(''); }}
        className="w-full gap-2"
      >
        <Plus className="h-4 w-4" />
        {t('calc.addExtraAccessory')}
      </Button>
    );
  }

  return (
    <div className="border rounded-lg p-3 space-y-3 bg-muted/30">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            autoFocus
            placeholder={t('calc.searchByNameOrCode')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={() => { setBrowsing(false); setSearchQuery(''); }}>
          {t('common.cancel')}
        </Button>
      </div>

      <div className="max-h-60 overflow-y-auto space-y-1">
        {isLoading && searchQuery.length >= 1 && (
          <p className="text-sm text-muted-foreground text-center py-2">{t('common.loading')}</p>
        )}
        {searchQuery.length < 1 && (
          <p className="text-sm text-muted-foreground text-center py-2">Min. 1 char</p>
        )}
        {searchQuery.length >= 1 && filteredProducts.map(product => (
          <button
            key={product.id} type="button"
            onClick={() => {
              onAdd({ materialCode: product.code, name: product.name, unitPrice: product.unit_price ?? undefined, unit: product.unit });
              setBrowsing(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors rounded-md"
          >
            {product.image_url ? (
              <img src={product.image_url} alt="" className="h-8 w-8 rounded object-cover flex-shrink-0" />
            ) : (
              <div className="h-8 w-8 rounded bg-muted flex-shrink-0" />
            )}
            <div className="flex flex-col text-left leading-tight min-w-0">
              <span className="truncate">{product.name}</span>
              <span className="text-[10px] text-muted-foreground">{product.code}</span>
            </div>
            {product.unit_price != null && product.unit_price > 0 && (
              <span className="ml-auto text-xs text-muted-foreground flex-shrink-0">{product.unit_price.toFixed(2)} €</span>
            )}
            <ShoppingCart className="h-4 w-4 text-primary flex-shrink-0" />
          </button>
        ))}
        {searchQuery.length >= 1 && !isLoading && filteredProducts.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">{t('calc.noProductFound')}</p>
        )}
      </div>
    </div>
  );
}