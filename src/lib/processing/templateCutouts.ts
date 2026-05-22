/**
 * Shared utilities for parsing processing template cutouts.
 * Used by SVG viewer, PDF export, and DXF export.
 */
import type { ProcessingTemplate } from '@/hooks/useProcessingTemplates';

export interface TemplateCutout {
  shape: 'circle' | 'rect' | 'stadium' | 'slot';
  x: number;
  y: number;
  diameter: number;
  width: number;
  height: number;
  slotLength: number;
  radius: number;
  targetPanel?: 'door' | 'fixed_left' | 'fixed_right';
}

/** Check if a template uses absolute glass coordinates (vs relative to handle center) */
export function isAbsoluteTemplate(template: ProcessingTemplate): boolean {
  if (!template?.dimensions) return false;
  const dims = template.dimensions as Record<string, any>;
  return !!(dims.glass_width && dims.glass_height);
}

/** Parse cutouts from a processing template's dimensions JSONB */
export function parseTemplateCutouts(template?: ProcessingTemplate): TemplateCutout[] {
  if (!template?.dimensions) return [];
  const dims = template.dimensions as Record<string, any>;

  // Format 0: _cad_shapes array (from CAD editor — most precise)
  if (Array.isArray(dims._cad_shapes) && dims._cad_shapes.length > 0) {
    return dims._cad_shapes.map((s: any) => ({
      shape: (s.type || 'circle') as TemplateCutout['shape'],
      x: s.x || 0,
      y: s.y || 0,
      diameter: s.type === 'circle' ? (s.radius || 6) * 2 : (s.diameter || 12),
      width: s.width || 0,
      height: s.height || 0,
      slotLength: s.slotLength || 20,
      radius: s.radius || 3,
      targetPanel: s.targetPanel || 'door',
    }));
  }

  // Format 1: cutouts array in dimensions
  if (Array.isArray(dims.cutouts) && dims.cutouts.length > 0) {
    return dims.cutouts.map((c: any) => ({
      shape: c.type || c.shape || 'circle',
      x: c.x || 0,
      y: c.y || 0,
      diameter: c.diameter || c.radius * 2 || 12,
      width: c.width || 0,
      height: c.height || 0,
      slotLength: c.slotLength || c.slot_length || 20,
      radius: c.radius || c.slot_radius || 3,
    }));
  }

  // Format 2: shape keys from CAD editor (shapesToDimensions)
  const results: TemplateCutout[] = [];

  const singleType = Object.keys(dims).find(k => k.startsWith('type_'));
  if (singleType) {
    const shapeType = singleType.replace('type_', '') as TemplateCutout['shape'];
    results.push({
      shape: shapeType,
      x: dims.x || 0,
      y: dims.y || 0,
      diameter: dims.diameter || 12,
      width: dims.width || 0,
      height: dims.height || 0,
      slotLength: dims.slot_length || 20,
      radius: dims.slot_radius || dims.radius || 3,
    });
    return results;
  }

  const shapeKeys = Object.keys(dims).filter(k => /^shape\d+_type_/.test(k));
  for (const key of shapeKeys) {
    const prefix = key.replace(/type_.*$/, '');
    const shapeType = key.replace(prefix + 'type_', '') as TemplateCutout['shape'];
    results.push({
      shape: shapeType,
      x: dims[`${prefix}x`] || 0,
      y: dims[`${prefix}y`] || 0,
      diameter: dims[`${prefix}diameter`] || 12,
      width: dims[`${prefix}width`] || 0,
      height: dims[`${prefix}height`] || 0,
      slotLength: dims[`${prefix}slot_length`] || 20,
      radius: dims[`${prefix}slot_radius`] || dims[`${prefix}radius`] || 3,
    });
  }

  return results;
}

/** Map template cutout coordinates to actual panel coordinates (edge-relative mapping) */
export function mapCutoutToPanel(
  cutout: TemplateCutout,
  refW: number, refH: number,
  actualW: number, actualH: number,
  mirrorX?: boolean
): { x: number; y: number } {
  let mappedX = cutout.x > refW / 2
    ? actualW - (refW - cutout.x)
    : cutout.x;
  const mappedY = cutout.y > refH / 2
    ? actualH - (refH - cutout.y)
    : cutout.y;
  if (mirrorX) {
    mappedX = actualW - mappedX;
  }
  return { x: mappedX, y: mappedY };
}
