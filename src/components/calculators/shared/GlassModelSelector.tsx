import { useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { PricingItem } from '@/hooks/usePricingConfig';
import { useTranslation } from 'react-i18next';

interface GlassModelSelectorProps {
  items: PricingItem[];
  currentThickness?: number;
  currentType?: string;
  allowedThicknesses?: number[];
  onChange: (model: { thickness: number; type: string; code: string; name: string; colorHex?: string }) => void;
  label?: string;
  productType?: string;
}

function parseGlassCode(code: string): { thickness: number; type: string } | null {
  // Standard format: glass_8_clear
  const match = code.match(/^glass_(\d+)_(.+)$/);
  if (match) {
    return { thickness: parseInt(match[1], 10), type: match[2] };
  }
  // Fallback: extract thickness from any code containing a number (e.g. "geam 6 mm")
  const numMatch = code.match(/(\d+)/);
  if (numMatch) {
    const thickness = parseInt(numMatch[1], 10);
    // Try to infer type from remaining text
    const rest = code.replace(numMatch[0], '').replace(/[^a-zA-Z]/g, ' ').trim().toLowerCase();
    return { thickness, type: rest || 'custom' };
  }
  return null;
}

const PROCESSING_LABEL_KEYS: Record<string, string> = {
  securizat: 'calc.proc_securizat',
  laminat: 'calc.proc_laminat',
  gaurire: 'calc.proc_gaurire',
  decupaj_mare: 'calc.proc_decupajMare',
  decupaj_mic: 'calc.proc_decupajMic',
};

// Keys that are metadata, not actual processing types to display
const HIDDEN_PROCESSING_KEYS = new Set(['folie_grosime']);

export function GlassModelSelector({
  items,
  currentThickness,
  currentType,
  allowedThicknesses,
  onChange,
  label,
  productType,
}: GlassModelSelectorProps) {
  const { t } = useTranslation();

  const glassModels = useMemo(() => {
    return items
      .filter((item) => item.category === 'glass' && item.is_active)
      .filter((item) => {
        if (!productType) return true;
        return item.product_types && item.product_types.includes(productType);
      })
      .map((item) => {
        const parsed = parseGlassCode(item.code);
        return { ...item, parsed };
      })
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [items, productType]);

  const currentValue = useMemo(() => {
    if (!currentThickness || !currentType) return '';
    const match = glassModels.find((m) => {
      if (m.parsed) {
        return m.parsed.thickness === currentThickness && m.parsed.type === currentType;
      }
      return false;
    });
    return match?.code || '';
  }, [currentThickness, currentType, glassModels]);

  if (glassModels.length === 0) return null;

  const selectedModel = glassModels.find((m) => m.code === currentValue);

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">
        {label || t('calc.glassModel', 'Model sticlă din setări')}
      </Label>
      <Select
        value={currentValue}
        onValueChange={(code) => {
          const model = glassModels.find((m) => m.code === code);
          if (!model) return;
          if (model.parsed) {
            onChange({
              thickness: model.parsed.thickness,
              type: model.parsed.type,
              code: model.code,
              name: model.name,
              colorHex: model.color_hex || undefined,
            });
          }
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder={t('calc.selectGlassModel')} />
        </SelectTrigger>
        <SelectContent>
          {glassModels.map((model) => (
            <SelectItem key={model.id} value={model.code}>
              <span className="flex items-center gap-2">
                {model.color_hex && (
                  <span
                    className="w-3 h-3 rounded-full border border-border flex-shrink-0"
                    style={{ backgroundColor: model.color_hex }}
                  />
                )}
                <span>{model.name}</span>
                <span className="text-muted-foreground text-xs font-mono">({model.code})</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Selected model details card */}
      {selectedModel && (
        <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-3">
          <div className="flex items-start gap-3">
            {/* Image or color swatch */}
            {selectedModel.image_url ? (
              <img
                src={selectedModel.image_url}
                alt={selectedModel.name}
                className="w-16 h-16 rounded-lg object-cover border border-border flex-shrink-0"
              />
            ) : selectedModel.color_hex ? (
              <div
                className="w-16 h-16 rounded-lg border border-border flex-shrink-0"
                style={{ backgroundColor: selectedModel.color_hex }}
              />
            ) : null}

            <div className="flex-1 min-w-0 space-y-1.5">
              {/* Name */}
              <h4 className="font-medium text-sm text-foreground leading-tight">{selectedModel.name}</h4>

              {/* Code */}
              <p className="text-xs font-mono text-muted-foreground">{selectedModel.code}</p>

              {/* Thickness + Type + Color */}
              <div className="flex flex-wrap items-center gap-1.5">
                {selectedModel.parsed && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {selectedModel.parsed.thickness} mm
                  </Badge>
                )}
                {selectedModel.parsed && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {selectedModel.parsed.type}
                  </Badge>
                )}
                {selectedModel.color_hex && (
                  <span className="flex items-center gap-1">
                    <span
                      className="w-3 h-3 rounded-full border border-border"
                      style={{ backgroundColor: selectedModel.color_hex }}
                    />
                    <span className="text-[10px] text-muted-foreground">{selectedModel.color_hex}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Processing types */}
          {selectedModel.processing_types && Object.keys(selectedModel.processing_types).length > 0 && (
            <div className="border-t border-border pt-2">
              <p className="text-[10px] text-muted-foreground mb-1 font-medium uppercase tracking-wide">{t('calc.processingIncluded')}</p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(selectedModel.processing_types)
                  .filter(([key, qty]) => qty > 0 && !HIDDEN_PROCESSING_KEYS.has(key))
                  .map(([key, qty]) => (
                  <Badge key={key} variant="secondary" className="text-[10px] px-1.5 py-0">
                    {PROCESSING_LABEL_KEYS[key] ? t(PROCESSING_LABEL_KEYS[key]) : key} {Number(qty) > 1 ? `×${qty}` : ''}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {selectedModel.description && (
            <p className="text-xs text-muted-foreground border-t border-border pt-2">{selectedModel.description}</p>
          )}
        </div>
      )}
    </div>
  );
}
