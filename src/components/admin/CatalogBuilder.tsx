import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CatalogBuilderProps {
  selectedPricingIds: string[];
  selectedPresetIds: string[];
  onPricingChange: (ids: string[]) => void;
  onPresetChange: (ids: string[]) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  glass: 'Sticlă',
  accessories: 'Accesorii',
  processing: 'Prelucrări',
  labor: 'Manoperă',
  finishing: 'Finisaje',
  balustrade: 'Balustrade',
};

export function CatalogBuilder({
  selectedPricingIds,
  selectedPresetIds,
  onPricingChange,
  onPresetChange,
}: CatalogBuilderProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [pricingItems, setPricingItems] = useState<any[]>([]);
  const [presetItems, setPresetItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      const [pricingRes, presetsRes] = await Promise.all([
        supabase
          .from('pricing_config')
          .select('*')
          .or(`user_id.eq.${user.id},user_id.is.null`)
          .eq('category', 'accessories')
          .order('sort_order'),
        supabase
          .from('user_accessory_presets')
          .select('*')
          .eq('user_id', user.id)
          .order('product_type')
          .order('category'),
      ]);
      setPricingItems(pricingRes.data || []);
      setPresetItems(presetsRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const filteredPricing = pricingItems.filter(
    (p) =>
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.code?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPresets = presetItems.filter(
    (p) =>
      !search ||
      p.material_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.material_code?.toLowerCase().includes(search.toLowerCase())
  );

  const pricingByCategory: Record<string, any[]> = {};
  filteredPricing.forEach((item) => {
    const cat = item.category || 'other';
    if (!pricingByCategory[cat]) pricingByCategory[cat] = [];
    pricingByCategory[cat].push(item);
  });

  const presetsByType: Record<string, any[]> = {};
  filteredPresets.forEach((item) => {
    const key = item.product_type || 'other';
    if (!presetsByType[key]) presetsByType[key] = [];
    presetsByType[key].push(item);
  });

  const togglePricing = (id: string) => {
    onPricingChange(
      selectedPricingIds.includes(id)
        ? selectedPricingIds.filter((x) => x !== id)
        : [...selectedPricingIds, id]
    );
  };

  const togglePreset = (id: string) => {
    onPresetChange(
      selectedPresetIds.includes(id)
        ? selectedPresetIds.filter((x) => x !== id)
        : [...selectedPresetIds, id]
    );
  };

  const selectAllPricingInCategory = (category: string) => {
    const ids = pricingByCategory[category]?.map((p) => p.id) || [];
    const allSelected = ids.every((id) => selectedPricingIds.includes(id));
    if (allSelected) {
      onPricingChange(selectedPricingIds.filter((id) => !ids.includes(id)));
    } else {
      onPricingChange([...new Set([...selectedPricingIds, ...ids])]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('catalog.searchProducts')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="text-sm text-muted-foreground">
        Selectate: {selectedPricingIds.length} prețuri, {selectedPresetIds.length} favorite
      </div>

      <Tabs defaultValue="pricing" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="pricing" className="flex-1">Prețuri ({filteredPricing.length})</TabsTrigger>
          <TabsTrigger value="presets" className="flex-1">Favorite ({filteredPresets.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pricing" className="max-h-[400px] overflow-y-auto space-y-4 mt-2">
          {Object.entries(pricingByCategory).map(([category, items]) => (
            <div key={category} className="space-y-2">
              <div
                className="flex items-center gap-2 cursor-pointer hover:text-foreground text-sm font-medium text-muted-foreground"
                onClick={() => selectAllPricingInCategory(category)}
              >
                <Checkbox
                  checked={items.every((i) => selectedPricingIds.includes(i.id))}
                  onCheckedChange={() => selectAllPricingInCategory(category)}
                />
                <span>{CATEGORY_LABELS[category] || category}</span>
                <Badge variant="secondary" className="text-[10px]">{items.length}</Badge>
              </div>
              <div className="ml-6 space-y-1">
                {items.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-2 py-1 px-2 rounded-md hover:bg-muted/50 cursor-pointer text-sm"
                  >
                    <Checkbox
                      checked={selectedPricingIds.includes(item.id)}
                      onCheckedChange={() => togglePricing(item.id)}
                    />
                    <span className="font-mono text-xs text-muted-foreground w-20 truncate">{item.code}</span>
                    <span className="flex-1 truncate">{item.name}</span>
                    <span className="text-xs text-muted-foreground">{item.price} {item.unit}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          {Object.keys(pricingByCategory).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">{t('ui.noProductsFound')}</p>
          )}
        </TabsContent>

        <TabsContent value="presets" className="max-h-[400px] overflow-y-auto space-y-4 mt-2">
          {Object.entries(presetsByType).map(([type, items]) => (
            <div key={type} className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <span>{type}</span>
                <Badge variant="secondary" className="text-[10px]">{items.length}</Badge>
              </div>
              <div className="ml-2 space-y-1">
                {items.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-2 py-1 px-2 rounded-md hover:bg-muted/50 cursor-pointer text-sm"
                  >
                    <Checkbox
                      checked={selectedPresetIds.includes(item.id)}
                      onCheckedChange={() => togglePreset(item.id)}
                    />
                    <span className="font-mono text-xs text-muted-foreground w-24 truncate">{item.material_code}</span>
                    <span className="flex-1 truncate">{item.material_name}</span>
                    <Badge variant="outline" className="text-[10px]">{item.category}</Badge>
                  </label>
                ))}
              </div>
            </div>
          ))}
          {Object.keys(presetsByType).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">{t('ui.noFavoritesFound')}</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
