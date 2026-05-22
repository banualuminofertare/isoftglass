import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { ColorPickerPopover } from './ColorPickerPopover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Loader2, Save, Image, Upload, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PricingItem } from '@/hooks/usePricingConfig';
import { toast } from 'sonner';

type MaterialType = 'glass' | 'hardware' | 'consumable';

const TYPE_LABELS: Record<MaterialType, string> = {
  glass: 'Sticlă',
  hardware: 'Feronerie',
  consumable: 'Consumabile',
};

const UNIT_LABELS: Record<string, string> = {
  sqm: 'm²', lm: 'ml', pcs: 'buc', kg: 'kg', l: 'l',
};

interface VariantRow {
  id: string;
  variant_code: string;
  variant_name: string;
  color_hex: string | null;
  price: number | null;
  pricing_id: string | null;
}

interface MaterialForm {
  code: string;
  name: string;
  description: string;
  material_type: MaterialType;
  unit: string;
  unit_price: number;
  processing_price: number;
  supplier: string;
  location: string;
  stock_quantity: number;
  min_stock_level: number;
}

interface VariantPricingDialogProps {
  item: PricingItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function VariantPricingDialog({ item, open, onOpenChange, onSaved }: VariantPricingDialogProps) {
  const { t } = useTranslation();
  const { role } = useAuth();
  const [materialId, setMaterialId] = useState<string | null>(null);
  const [form, setForm] = useState<MaterialForm>({
    code: '', name: '', description: '', material_type: 'hardware',
    unit: 'pcs', unit_price: 0, processing_price: 0, supplier: '', location: '',
    stock_quantity: 0, min_stock_level: 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [pendingPrices, setPendingPrices] = useState<Record<string, number>>({});
  const [newVariantCode, setNewVariantCode] = useState('');
  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantColor, setNewVariantColor] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && item) {
      fetchMaterialAndVariants();
    } else {
      setMaterialId(null);
      setVariants([]);
      setPendingPrices({});
      setImageFile(null);
      setImagePreview(null);
      setNewVariantCode('');
      setNewVariantName('');
    }
  }, [open, item?.code]);

  const fetchMaterialAndVariants = async () => {
    if (!item) return;
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      // Fetch material by code
      const { data: material } = await supabase
        .from('materials')
        .select('*')
        .eq('code', item.code)
        .maybeSingle();

      if (material) {
        setMaterialId(material.id);
        setForm({
          code: material.code,
          name: material.name,
          description: material.description || '',
          material_type: material.material_type as MaterialType,
          unit: material.unit,
          unit_price: material.unit_price || 0,
          processing_price: material.processing_price || 0,
          supplier: material.supplier || '',
          location: material.location || '',
          stock_quantity: material.stock_quantity || 0,
          min_stock_level: material.min_stock_level || 0,
        });
        setImagePreview(material.image_url || null);

        // Fetch variants
        const { data: matVariants } = await supabase
          .from('material_variants')
          .select('*')
          .eq('material_id', material.id)
          .order('variant_code');

        if (matVariants && matVariants.length > 0) {
          // Fetch pricing for variants
          const variantCodes = matVariants.map(v => v.variant_code);
          const { data: pricingRows } = await supabase
            .from('pricing_config')
            .select('id, code, price, user_id')
            .in('code', variantCodes)
            .or(`user_id.is.null,user_id.eq.${userId}`);

          const pricingMap = new Map<string, { id: string; price: number }>();
          if (pricingRows) {
            for (const row of pricingRows.filter(r => r.user_id === null)) {
              pricingMap.set(row.code, { id: row.id, price: Number(row.price) });
            }
            for (const row of pricingRows.filter(r => r.user_id === userId)) {
              pricingMap.set(row.code, { id: row.id, price: Number(row.price) });
            }
          }

          setVariants(matVariants.map(v => {
            const existing = pricingMap.get(v.variant_code);
            return {
              id: v.id,
              variant_code: v.variant_code,
              variant_name: v.variant_name,
              color_hex: v.color_hex,
              price: existing ? existing.price : null,
              pricing_id: existing ? existing.id : null,
            };
          }));
        } else {
          setVariants([]);
        }
      } else {
        // No material found - use pricing item data
        setMaterialId(null);
        setForm({
          code: item.code, name: item.name, description: item.description || '',
          material_type: 'hardware', unit: 'pcs', unit_price: item.price,
          processing_price: 0, supplier: '', location: '', stock_quantity: 0, min_stock_level: 0,
        });
        setImagePreview(item.image_url || null);
        setVariants([]);
      }
    } catch (err) {
      console.error('Error fetching material:', err);
      toast.error(t('toasts.variants.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('toasts.materials.imageTooLarge'));
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (id: string): Promise<string | null> => {
    if (!imageFile) return null;
    const ext = imageFile.name.split('.').pop();
    const path = `${id}.${ext}`;
    await supabase.storage.from('material-images').remove([path]);
    const { error } = await supabase.storage.from('material-images').upload(path, imageFile, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('material-images').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleAddVariant = async () => {
    if (!materialId || !newVariantCode || !newVariantName) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data: profile } = await supabase
        .from('profiles').select('company_id').eq('user_id', user.id).maybeSingle();
      const companyId = profile?.company_id ?? null;
      const { data, error } = await supabase
        .from('material_variants')
        .insert({
          material_id: materialId,
          variant_code: newVariantCode,
          variant_name: newVariantName,
          color_hex: newVariantColor || null,
          user_id: user.id,
          company_id: companyId,
        } as any)
        .select()
        .single();
      if (error) throw error;
      setVariants(prev => [...prev, {
        id: data.id,
        variant_code: data.variant_code,
        variant_name: data.variant_name,
        color_hex: data.color_hex,
        price: null,
        pricing_id: null,
      }]);
      setNewVariantCode('');
      setNewVariantName('');
      setNewVariantColor('');
      toast.success(t('toasts.variantAdded'));
    } catch (err: any) {
      toast.error(err.message || t('toasts.variants.addError'));
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    try {
      const { error } = await supabase.from('material_variants').delete().eq('id', variantId);
      if (error) throw error;
      setVariants(prev => prev.filter(v => v.id !== variantId));
      toast.success(t('toasts.variantDeleted'));
    } catch (err: any) {
      toast.error(err.message || t('toasts.variants.deleteError'));
    }
  };

  const handleSave = async () => {
    if (!form.code || !form.name) {
      toast.error(t('toasts.materials.codeNameRequired'));
      return;
    }
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nu ești autentificat');

      const isAdmin = role === 'admin';

      // Get company_id for non-admin users
      let companyId: string | null = null;
      if (!isAdmin) {
        const { data: profileData } = await supabase
          .from('profiles').select('company_id').eq('user_id', user.id).maybeSingle();
        companyId = profileData?.company_id ?? null;
      }

      // Save material — only admin can modify global materials table
      if (isAdmin) {
        if (materialId) {
          let image_url: string | undefined;
          if (imageFile) {
            image_url = (await uploadImage(materialId)) ?? undefined;
          }
          const { error } = await supabase
            .from('materials')
            .update({
              code: form.code,
              name: form.name,
              description: form.description || null,
              material_type: form.material_type,
              unit: form.unit as any,
              unit_price: form.unit_price,
              processing_price: form.processing_price,
              supplier: form.supplier || null,
              location: form.location || null,
              stock_quantity: form.stock_quantity,
              min_stock_level: form.min_stock_level,
              ...(image_url ? { image_url } : {}),
            })
            .eq('id', materialId);
          if (error) throw error;
        } else {
          const { data: newMat, error: insertError } = await supabase
            .from('materials')
            .upsert({
              code: form.code,
              name: form.name,
              description: form.description || null,
              material_type: form.material_type,
              unit: form.unit as any,
              unit_price: form.unit_price,
              processing_price: form.processing_price,
              supplier: form.supplier || null,
              location: form.location || null,
              stock_quantity: form.stock_quantity,
              min_stock_level: form.min_stock_level,
              company_id: null,
            } as any, { onConflict: 'code,company_id' })
            .select()
            .single();
          if (insertError) throw insertError;
          if (newMat && imageFile) {
            const image_url = await uploadImage(newMat.id);
            if (image_url) {
              await supabase.from('materials').update({ image_url }).eq('id', newMat.id);
            }
          }
          if (newMat) setMaterialId(newMat.id);
        }
      }

      // Sync cumulated price to pricing_config
      const totalPrice = Number(form.unit_price) + Number(form.processing_price);

      if (isAdmin) {
        // Admin updates the global row directly
        const { data: pricingEntry } = await supabase
          .from('pricing_config')
          .select('id')
          .eq('code', form.code)
          .is('user_id', null)
          .maybeSingle();

        if (pricingEntry) {
          await supabase.from('pricing_config')
            .update({ price: totalPrice })
            .eq('id', pricingEntry.id);
        }
      } else {
        // Subscriber: find or create own override
        const { data: userOverride } = await supabase
          .from('pricing_config')
          .select('id')
          .eq('code', form.code)
          .eq('user_id', user.id)
          .maybeSingle();

        if (userOverride) {
          await supabase.from('pricing_config')
            .update({ price: totalPrice })
            .eq('id', userOverride.id);
        } else {
          // Fetch base row to copy fields
          const { data: baseRow } = await supabase
            .from('pricing_config')
            .select('*')
            .eq('code', form.code)
            .is('user_id', null)
            .maybeSingle();

          if (baseRow) {
            await supabase.from('pricing_config').insert({
              category: baseRow.category,
              code: baseRow.code,
              name: baseRow.name,
              description: baseRow.description,
              unit: baseRow.unit,
              price: totalPrice,
              is_multiplier: baseRow.is_multiplier,
              is_active: baseRow.is_active,
              sort_order: baseRow.sort_order,
              product_types: baseRow.product_types,
              image_url: baseRow.image_url,
              color_hex: baseRow.color_hex,
              catalog_source: baseRow.catalog_source,
              glass_deduction: baseRow.glass_deduction,
              glass_deductions: baseRow.glass_deductions,
              door_height_deduction: baseRow.door_height_deduction,
              fixed_panel_height_deduction: baseRow.fixed_panel_height_deduction,
              width_overlap: baseRow.width_overlap,
              processing_types: baseRow.processing_types,
              user_id: user.id,
              company_id: companyId,
            });
          }
        }
      }

      // Save variant prices
      const priceEntries = Object.entries(pendingPrices);
      for (const [variantCode, price] of priceEntries) {
        const variant = variants.find(v => v.variant_code === variantCode);
        if (!variant) continue;

        const { data: existing } = await supabase
          .from('pricing_config')
          .select('id')
          .eq('code', variantCode)
          .eq('user_id', user.id)
          .maybeSingle();

        if (existing) {
          await supabase.from('pricing_config').update({ price }).eq('id', existing.id);
        } else {
          await supabase.from('pricing_config').insert({
            category: item!.category,
            code: variantCode,
            name: `${form.name} – ${variant.variant_name}`,
            description: `Variantă culoare: ${variant.variant_name}`,
            unit: item!.unit,
            price,
            is_multiplier: false,
            is_active: true,
            sort_order: item!.sort_order,
            user_id: user.id,
            company_id: companyId,
          });
        }
      }

      toast.success(t('toasts.variants.saved'));
      setPendingPrices({});
      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      console.error('Error saving:', err);
      toast.error(err.message || t('toasts.variants.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  const getDisplayPrice = (v: VariantRow) => {
    if (pendingPrices[v.variant_code] !== undefined) return pendingPrices[v.variant_code];
    if (v.price !== null) return v.price;
    return item?.price ?? 0;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('settings.variants.editAccessory')}</DialogTitle>
          <DialogDescription>{t('settings.variants.editAccessoryDesc')}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Image upload */}
            <div className="space-y-2">
              <Label>{t('settings.materials.productPhoto')}</Label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <ImageLightbox src={imagePreview} alt="Preview" className="w-20 h-20 rounded-lg border border-border object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-lg border-2 border-dashed border-border bg-muted/20 flex items-center justify-center">
                    <Image className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                )}
                <div>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-1" /> {imagePreview ? t('settings.materials.change') : t('common.upload')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Code + Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cod *</Label>
                <Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} placeholder="MOD SS3H" />
              </div>
              <div className="space-y-2">
                <Label>Nume *</Label>
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder={t("ui.placeholderKitName")} />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Descriere</Label>
              <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} placeholder={t("ui.placeholderTechSpecs")} />
            </div>

            {/* Type + Unit + Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('common.type')}</Label>
                <Select value={form.material_type} onValueChange={v => setForm(p => ({ ...p, material_type: v as MaterialType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="glass">{t('stockCategories.glass')}</SelectItem>
                    <SelectItem value="hardware">{t('stockCategories.hardware')}</SelectItem>
                    <SelectItem value="consumable">{t('stockCategories.consumable')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('inventory.unit')}</Label>
                <Select value={form.unit} onValueChange={v => setForm(p => ({ ...p, unit: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pcs">{t('settings.materials.unitPcs')}</SelectItem>
                    <SelectItem value="sqm">m²</SelectItem>
                    <SelectItem value="lm">ml</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="l">{t('settings.materials.unitLiters')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preț unitar (RON)</Label>
                <Input type="number" min={0} step={0.01} value={form.unit_price} onChange={e => setForm(p => ({ ...p, unit_price: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Preț prelucrare (RON)</Label>
                <Input type="number" min={0} step={0.01} value={form.processing_price} onChange={e => setForm(p => ({ ...p, processing_price: Number(e.target.value) }))} />
              </div>
            </div>

            {/* Supplier + Location */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Furnizor</Label>
                <Input value={form.supplier} onChange={e => setForm(p => ({ ...p, supplier: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Locație</Label>
                <Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
              </div>
            </div>

            {/* Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('settings.materials.initialStock')}</Label>
                <Input type="number" min={0} value={form.stock_quantity} onChange={e => setForm(p => ({ ...p, stock_quantity: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>{t('settings.materials.minStock')}</Label>
                <Input type="number" min={0} value={form.min_stock_level} onChange={e => setForm(p => ({ ...p, min_stock_level: Number(e.target.value) }))} />
              </div>
            </div>

            {/* Variants section */}
            <div className="space-y-3 border-t pt-4">
              <Label className="text-base font-semibold">{t('settings.variants.colorVariants')}</Label>

              {variants.length > 0 && (
                <div className="space-y-2">
                  {variants.map((v) => (
                    <div key={v.id} className="flex items-center gap-2 text-sm bg-muted/30 rounded px-3 py-1.5">
                      <span
                        className="inline-block w-4 h-4 rounded-full border border-border shrink-0"
                        style={{ backgroundColor: v.color_hex || '#888' }}
                      />
                      <span className="font-mono text-xs">{v.variant_code}</span>
                      <span className="text-muted-foreground">—</span>
                      <span className="flex-1">{v.variant_name}</span>
                      {/* Price badge */}
                      {(v.price !== null || pendingPrices[v.variant_code] !== undefined) && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                          Custom
                        </Badge>
                      )}
                      {/* Price input */}
                      <Input
                        type="number"
                        step="1"
                        min="0"
                        value={getDisplayPrice(v)}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setPendingPrices(prev => ({ ...prev, [v.variant_code]: val }));
                        }}
                        className="w-24 h-7 text-right text-sm shrink-0"
                      />
                      <span className="text-xs text-muted-foreground w-8 shrink-0">RON</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => handleDeleteVariant(v.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {variants.length === 0 && !materialId && (
                <p className="text-sm text-muted-foreground py-2">
                  {t('settings.variants.notInCatalog')}
                </p>
              )}

              {variants.length === 0 && materialId && (
                <p className="text-sm text-muted-foreground py-2">
                  {t('settings.variants.noVariants')}
                </p>
              )}

              {/* Add variant row */}
              {materialId && (
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">{t('settings.variants.variantCode')}</Label>
                    <Input value={newVariantCode} onChange={e => setNewVariantCode(e.target.value)} placeholder="37.SS3H.810.11" className="h-8 text-sm" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">{t('settings.variants.colorName')}</Label>
                    <Input value={newVariantName} onChange={e => setNewVariantName(e.target.value)} placeholder={t('settings.variants.colorNamePlaceholder')} className="h-8 text-sm" />
                  </div>
                  <ColorPickerPopover value={newVariantColor} onChange={setNewVariantColor} />
                  <Button size="sm" variant="outline" onClick={handleAddVariant} disabled={!newVariantCode || !newVariantName}>
                    <Plus className="h-3 w-3 mr-1" /> {t('common.add')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            <Save className="h-4 w-4 mr-1" /> {t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
