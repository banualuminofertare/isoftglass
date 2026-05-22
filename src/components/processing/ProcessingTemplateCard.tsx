import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { Pencil, Trash2, Globe, ChevronDown, ChevronUp } from 'lucide-react';
import type { ProcessingTemplate } from '@/hooks/useProcessingTemplates';

interface Props {
  template: ProcessingTemplate;
  canEdit: boolean;
  onEdit?: (t: ProcessingTemplate) => void;
  onDelete?: (id: string) => void;
}

const DIMENSION_LABEL_KEYS: Record<string, string> = {
  height: 'processing.dimLabels.height',
  width: 'processing.dimLabels.width',
  edge_offset: 'processing.dimLabels.edgeOffset',
  inner_height: 'processing.dimLabels.innerHeight',
  diameter: 'processing.dimLabels.diameter',
  depth: 'processing.dimLabels.depth',
};

const TYPE_LABEL_KEYS: Record<string, string> = {
  hinge_cutout: 'processing.templateTypes.hingeCutout',
  handle_hole: 'processing.templateTypes.handleHole',
  lock_cutout: 'processing.templateTypes.lockCutout',
  socket_cutout: 'processing.templateTypes.socketCutout',
  ventilation_hole: 'processing.templateTypes.ventilationHole',
  shelf_support_hole: 'processing.templateTypes.shelfSupport',
  custom: 'processing.templateTypes.custom',
  other: 'processing.templateTypes.other',
};

/* ── SVG Sketches per template type ── */

function CutoutSketch({ dims }: { dims: Record<string, any> }) {
  const w = dims.width || 44.5;
  const h = dims.height || 63;
  const innerH = dims.inner_height || 57;
  const circleR = (h - innerH) / 2;

  const padding = 12;
  const scale = Math.min((140 - padding * 2) / w, (100 - padding * 2) / h);
  const sw = w * scale;
  const sh = h * scale;
  const sr = circleR * scale;

  const svgW = sw + padding * 2 + 40;
  const svgH = sh + padding * 2 + 20;
  const ox = padding + 20;
  const oy = padding + 10;

  const channelW = sr * 0.6;
  const circleTopY = oy + sr;
  const circleBotY = oy + sh - sr;
  const cx = ox + sw / 2;

  return (
    <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="mx-auto block">
      <path
        d={`M ${ox},${oy} L ${ox + sw},${oy} L ${ox + sw},${oy + sh} L ${ox},${oy + sh}`}
        fill="none" stroke="#1E40AF" strokeWidth={1.5}
      />
      <line x1={ox} y1={oy} x2={ox} y2={oy + sh} stroke="#1E40AF" strokeWidth={1.5} strokeDasharray="4,3" />
      <circle cx={cx} cy={circleTopY} r={sr} fill="#DC2626" fillOpacity={0.12} stroke="#DC2626" strokeWidth={0.8} />
      <circle cx={cx} cy={circleBotY} r={sr} fill="#DC2626" fillOpacity={0.12} stroke="#DC2626" strokeWidth={0.8} />
      <rect x={cx - channelW / 2} y={circleTopY} width={channelW} height={circleBotY - circleTopY} fill="#DC2626" fillOpacity={0.12} stroke="#DC2626" strokeWidth={0.6} />
      <line x1={ox} y1={oy + sh + 8} x2={ox + sw} y2={oy + sh + 8} stroke="#374151" strokeWidth={0.6} />
      <text x={ox + sw / 2} y={oy + sh + 17} textAnchor="middle" fill="#374151" fontSize={8} fontFamily="monospace">{w}</text>
      <line x1={ox + sw + 6} y1={oy} x2={ox + sw + 6} y2={oy + sh} stroke="#374151" strokeWidth={0.6} />
      <text x={ox + sw + 12} y={oy + sh / 2} textAnchor="start" dominantBaseline="middle" fill="#374151" fontSize={8} fontFamily="monospace">{h}</text>
    </svg>
  );
}

function CircleHoleSketch({ dims }: { dims: Record<string, any> }) {
  const d = dims.diameter || 20;
  const padding = 20;
  const maxR = 35;
  const scale = Math.min(maxR / (d / 2), 3);
  const sr = (d / 2) * scale;
  const svgSize = sr * 2 + padding * 2;
  const cx = svgSize / 2;
  const cy = svgSize / 2;

  return (
    <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`} className="mx-auto block">
      <circle cx={cx} cy={cy} r={sr} fill="#3B82F6" fillOpacity={0.1} stroke="#1E40AF" strokeWidth={1.5} />
      <line x1={cx - sr * 0.7} y1={cy} x2={cx + sr * 0.7} y2={cy} stroke="#1E40AF" strokeWidth={0.5} />
      <line x1={cx} y1={cy - sr * 0.7} x2={cx} y2={cy + sr * 0.7} stroke="#1E40AF" strokeWidth={0.5} />
      <text x={cx} y={cy + sr + 12} textAnchor="middle" fill="#374151" fontSize={8} fontFamily="monospace">Ø{d}</text>
    </svg>
  );
}

function RectCutoutSketch({ dims }: { dims: Record<string, any> }) {
  const w = dims.width || 60;
  const h = dims.height || 40;
  const padding = 15;
  const scale = Math.min(100 / w, 70 / h);
  const sw = w * scale;
  const sh = h * scale;
  const svgW = sw + padding * 2 + 30;
  const svgH = sh + padding * 2 + 20;
  const ox = padding + 10;
  const oy = padding + 5;

  return (
    <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="mx-auto block">
      <rect x={ox} y={oy} width={sw} height={sh} rx={2} fill="#F59E0B" fillOpacity={0.1} stroke="#D97706" strokeWidth={1.5} />
      <line x1={ox} y1={oy + sh + 8} x2={ox + sw} y2={oy + sh + 8} stroke="#374151" strokeWidth={0.6} />
      <text x={ox + sw / 2} y={oy + sh + 17} textAnchor="middle" fill="#374151" fontSize={8} fontFamily="monospace">{w}</text>
      <line x1={ox + sw + 6} y1={oy} x2={ox + sw + 6} y2={oy + sh} stroke="#374151" strokeWidth={0.6} />
      <text x={ox + sw + 12} y={oy + sh / 2} textAnchor="start" dominantBaseline="middle" fill="#374151" fontSize={8} fontFamily="monospace">{h}</text>
    </svg>
  );
}

function TemplateSketch({ template }: { template: ProcessingTemplate }) {
  const dims = template.dimensions ?? {};
  const type = template.template_type;

  if (type === 'ventilation_hole' || type === 'shelf_support_hole') {
    return <CircleHoleSketch dims={dims} />;
  }
  if (type === 'socket_cutout') {
    return <RectCutoutSketch dims={dims} />;
  }
  if (type === 'hinge_cutout') {
    return <CutoutSketch dims={dims} />;
  }
  // handle_hole, lock_cutout, custom, other — use rect sketch if dimensions exist
  if (dims.width || dims.height) {
    return <RectCutoutSketch dims={dims} />;
  }
  if (dims.diameter) {
    return <CircleHoleSketch dims={dims} />;
  }
  return null;
}

export function ProcessingTemplateCard({ template, canEdit, onEdit, onDelete }: Props) {
  const { t } = useTranslation();
  const dims = Object.fromEntries(Object.entries(template.dimensions ?? {}).filter(([k]) => !k.startsWith('_')));
  const isGlobal = !template.company_id;
  const [expanded, setExpanded] = useState(false);
  const hasDims = Object.keys(dims).length > 0;
  const hasDetails = hasDims || template.notes || template.drawing_url;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-1 pt-3 px-3">
        <div className="flex items-start justify-between gap-1.5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-sm leading-tight truncate">{template.name}</CardTitle>
              {isGlobal && (
                <Globe className="h-3 w-3 shrink-0 text-muted-foreground" />
              )}
            </div>
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0 leading-relaxed">
                {template.material_code_prefix}
              </Badge>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 leading-relaxed truncate max-w-[120px]">
                {t(TYPE_LABEL_KEYS[template.template_type] || '', template.template_type)}
              </Badge>
              {template.company_name && (
                <Badge variant="default" className="text-[10px] px-1.5 py-0 leading-relaxed truncate max-w-[140px]">
                  {template.company_name}
                </Badge>
              )}
              {!template.company_id && template.author_name && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 leading-relaxed truncate max-w-[140px]">
                  {template.author_name}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-0.5 shrink-0 -mr-1 items-center">
            {hasDetails && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={() => setExpanded(prev => !prev)}
              >
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            )}
            {canEdit && (
              <>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => onEdit?.(template)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => onDelete?.(template.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Always show the SVG sketch */}
      <CardContent className="px-3 pb-2 pt-1">
        <div className="bg-muted/30 rounded border p-1">
          <TemplateSketch template={template} />
        </div>
      </CardContent>

      {/* Collapsible details */}
      {expanded && (
        <CardContent className="px-3 pb-3 pt-0 space-y-2">
          {template.drawing_url && (
            <ImageLightbox
              src={template.drawing_url}
              alt={template.name}
              className="w-full max-h-48 object-contain rounded border bg-white"
            />
          )}
          {hasDims && (
            <div className="grid grid-cols-1 gap-y-0.5 text-xs">
              {Object.entries(dims).map(([key, val]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-muted-foreground truncate mr-2">{t(DIMENSION_LABEL_KEYS[key] || '', key)}</span>
                  <span className="font-medium shrink-0">{String(val)}</span>
                </div>
              ))}
            </div>
          )}
          {template.notes && (
            <p className="text-xs text-muted-foreground">{template.notes}</p>
          )}
        </CardContent>
      )}
    </Card>
  );
}
