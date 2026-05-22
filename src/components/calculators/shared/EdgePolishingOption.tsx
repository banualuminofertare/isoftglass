import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { EdgePolishType } from '@/types/calculators';

export interface GlassPiece {
  name: string;
  width: number;
  height: number;
  quantity: number;
}

interface EdgePolishingOptionProps {
  enabled: boolean;
  polishType: EdgePolishType;
  onEnabledChange: (enabled: boolean) => void;
  onPolishTypeChange: (type: EdgePolishType) => void;
  glassPieces: GlassPiece[];
}

export function EdgePolishingOption({
  enabled,
  polishType,
  onEnabledChange,
  onPolishTypeChange,
  glassPieces,
}: EdgePolishingOptionProps) {
  const { t } = useTranslation();

  const piecesWithPerimeter = glassPieces.map(piece => {
    const perimeterMm = 2 * (piece.width + piece.height);
    const perimeterM = perimeterMm / 1000;
    const totalPerimeterM = perimeterM * piece.quantity;
    return { ...piece, perimeterM, totalPerimeterM };
  });

  const totalLinearMeters = piecesWithPerimeter.reduce(
    (sum, piece) => sum + piece.totalPerimeterM, 0
  );

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <Label className="text-sm font-medium">{t('calc.edgePolishing')}</Label>
        </div>
        <Switch checked={enabled} onCheckedChange={onEnabledChange} />
      </div>

      {enabled && (
        <div className="space-y-3 animate-fade-in">
          <div>
            <Label className="text-xs text-muted-foreground">{t('calc.polishType')}</Label>
            <Select value={polishType} onValueChange={(value) => onPolishTypeChange(value as EdgePolishType)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="matte">{t('calc.polishMatte')}</SelectItem>
                <SelectItem value="polished">{t('calc.polishBrillant')}</SelectItem>
                <SelectItem value="beveled">{t('calc.polishBeveled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <Label className="text-xs text-muted-foreground">{t('calc.perimeterCalc')}</Label>
            
            {piecesWithPerimeter.map((piece, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {piece.name} ({piece.width}×{piece.height}mm)
                  {piece.quantity > 1 && <span className="ml-1">×{piece.quantity}</span>}
                </span>
                <span className="font-medium">{piece.totalPerimeterM.toFixed(2)} ml</span>
              </div>
            ))}

            <div className="border-t pt-2 mt-2 flex justify-between text-sm font-medium">
              <span>{t('calc.totalPolishing')}</span>
              <span className="text-primary">{totalLinearMeters.toFixed(2)} ml</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export function calculatePerimeter(width: number, height: number, quantity: number = 1): number {
  return (2 * (width + height) / 1000) * quantity;
}