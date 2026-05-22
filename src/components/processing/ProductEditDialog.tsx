import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ProductEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  orderId: string;
  currentConfig: any;
  productType: string;
}

export function ProductEditDialog({ open, onOpenChange, productId, orderId, currentConfig, productType }: ProductEditDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const dims = currentConfig?.dimensions || {};
  const glass = currentConfig?.glass || {};
  const acc = currentConfig?.accessories || {};

  const [doorWidth, setDoorWidth] = useState(dims.doorWidth || dims.width || 900);
  const [doorHeight, setDoorHeight] = useState(dims.height || 2000);
  const [cabinWidth, setCabinWidth] = useState(dims.width || dims.doorWidth || 900);
  const [cabinDepth, setCabinDepth] = useState(dims.depth || 0);
  const [glassThickness, setGlassThickness] = useState(glass.thickness || dims.thickness || 8);
  const [glassType, setGlassType] = useState(glass.type || 'Transparent');
  const [hingeSide, setHingeSide] = useState<'left' | 'right'>(acc.door?.hingeSide || 'left');
  const [hingePositions, setHingePositions] = useState<number[]>(acc.hinges?.positions || []);
  const [handlePositionY, setHandlePositionY] = useState(acc.handle?.positionY || Math.round((dims.height || 2000) / 2));
  const [handleLength, setHandleLength] = useState(acc.handle?.length || 200);
  const [fixedPanelEnabled, setFixedPanelEnabled] = useState(!!dims.fixedPanel?.enabled);
  const [fixedPanelWidth, setFixedPanelWidth] = useState(dims.fixedPanel?.width || 400);

  const isShower = productType === 'shower';
  const cabinType = currentConfig?.cabinType || '';
  const hasCabinDims = isShower && ['corner_90', 'walk_in', 'pentagon'].includes(cabinType);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedConfig = JSON.parse(JSON.stringify(currentConfig));
      if (!updatedConfig.dimensions) updatedConfig.dimensions = {};
      updatedConfig.dimensions.doorWidth = doorWidth;
      updatedConfig.dimensions.height = doorHeight;
      if (hasCabinDims) {
        updatedConfig.dimensions.width = cabinWidth;
        updatedConfig.dimensions.depth = cabinDepth;
      }
      updatedConfig.dimensions.thickness = glassThickness;
      if (!updatedConfig.dimensions.fixedPanel) updatedConfig.dimensions.fixedPanel = {};
      updatedConfig.dimensions.fixedPanel.enabled = fixedPanelEnabled;
      updatedConfig.dimensions.fixedPanel.width = fixedPanelWidth;
      if (!updatedConfig.glass) updatedConfig.glass = {};
      updatedConfig.glass.thickness = glassThickness;
      updatedConfig.glass.type = glassType;
      if (!updatedConfig.accessories) updatedConfig.accessories = {};
      if (!updatedConfig.accessories.door) updatedConfig.accessories.door = {};
      updatedConfig.accessories.door.hingeSide = hingeSide;
      if (!updatedConfig.accessories.hinges) updatedConfig.accessories.hinges = {};
      updatedConfig.accessories.hinges.positions = hingePositions;
      updatedConfig.accessories.hinges.quantity = hingePositions.length;
      if (updatedConfig.accessories.handle) {
        updatedConfig.accessories.handle.positionY = handlePositionY;
        updatedConfig.accessories.handle.length = handleLength;
      }

      const { error } = await supabase
        .from('order_products')
        .update({ configuration: updatedConfig })
        .eq('id', productId);
      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['processing-products', orderId] });
      toast.success(t('processing.productEdit.saveSuccess'));
      onOpenChange(false);
    } catch (err: any) {
      toast.error(t('processing.productEdit.saveError') + ' ' + (err.message || t('processing.productEdit.saveErrorUnknown')));
    } finally {
      setSaving(false);
    }
  };

  const updateHingePosition = (index: number, value: number) => {
    const newPositions = [...hingePositions];
    newPositions[index] = value;
    setHingePositions(newPositions);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('processing.productEdit.title')}</DialogTitle>
          <DialogDescription className="sr-only">{t('processing.productEdit.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('processing.productEdit.doorDimensions')}</legend>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{t('processing.productEdit.width')}</Label>
                <Input type="number" min={300} max={2000} value={doorWidth} onChange={e => setDoorWidth(Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t('processing.productEdit.height')}</Label>
                <Input type="number" min={500} max={3000} value={doorHeight} onChange={e => setDoorHeight(Number(e.target.value))} />
              </div>
            </div>
          </fieldset>

          {hasCabinDims && (
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('processing.productEdit.cabinDimensions')}</legend>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">{t('processing.productEdit.cabinWidth')}</Label>
                  <Input type="number" min={300} max={3000} value={cabinWidth} onChange={e => setCabinWidth(Number(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t('processing.productEdit.cabinDepth')}</Label>
                  <Input type="number" min={0} max={3000} value={cabinDepth} onChange={e => setCabinDepth(Number(e.target.value))} />
                </div>
              </div>
            </fieldset>
          )}

          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('processing.productEdit.glass')}</legend>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{t('processing.productEdit.thicknessMm')}</Label>
                <Select value={String(glassThickness)} onValueChange={v => setGlassThickness(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[6, 8, 10, 12].map(t => <SelectItem key={t} value={String(t)}>{t} mm</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t('processing.productEdit.type')}</Label>
                <Select value={glassType} onValueChange={setGlassType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Transparent', 'Satinat', 'Bronze', 'Gri', 'Extra-clear'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('processing.productEdit.hingesSection')}</legend>
            <div className="space-y-1">
              <Label className="text-xs">{t('processing.productEdit.hingeSide')}</Label>
              <Select value={hingeSide} onValueChange={v => setHingeSide(v as 'left' | 'right')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">{t('processing.productEdit.hingeLeft')}</SelectItem>
                  <SelectItem value="right">{t('processing.productEdit.hingeRight')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {hingePositions.map((pos, i) => (
              <div key={i} className="flex items-center gap-2">
                <Label className="text-xs w-24">{t('processing.productEdit.hingeN', { n: i + 1 })}</Label>
                <Input
                  type="number" min={50} max={doorHeight - 50}
                  value={pos}
                  onChange={e => updateHingePosition(i, Number(e.target.value))}
                  className="flex-1"
                />
              </div>
            ))}
          </fieldset>

          {acc.handle && (
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('processing.productEdit.handleSection')}</legend>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">{t('processing.productEdit.positionY')}</Label>
                  <Input type="number" min={100} max={doorHeight - 100} value={handlePositionY} onChange={e => setHandlePositionY(Number(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t('processing.productEdit.length')}</Label>
                  <Input type="number" min={50} max={1000} value={handleLength} onChange={e => setHandleLength(Number(e.target.value))} />
                </div>
              </div>
            </fieldset>
          )}

          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('processing.productEdit.fixedPanelSection')}</legend>
            <div className="flex items-center gap-3">
              <Label className="text-xs">{t('processing.productEdit.enabled')}</Label>
              <input type="checkbox" checked={fixedPanelEnabled} onChange={e => setFixedPanelEnabled(e.target.checked)} className="accent-primary" />
            </div>
            {fixedPanelEnabled && (
              <div className="space-y-1">
                <Label className="text-xs">{t('processing.productEdit.fixedPanelWidth')}</Label>
                <Input type="number" min={100} max={2000} value={fixedPanelWidth} onChange={e => setFixedPanelWidth(Number(e.target.value))} />
              </div>
            )}
          </fieldset>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>{t('processing.productEdit.cancel')}</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t('processing.productEdit.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
