/**
 * Convert parsed DXF entities into CadShape objects compatible with the CAD editor.
 * 
 * Coordinates are translated so that the bounding box origin maps to
 * a position relative to the glass panel (offset from top-left corner).
 */

import type { DxfEntity, DxfLwPolyline } from './dxfParser';
import { getEntitiesBounds } from './dxfParser';

export interface CadShapeLike {
  id: string;
  type: 'rect' | 'stadium' | 'circle' | 'lshape' | 'slot' | 'line';
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  rotation: number;
  label?: string;
  x2?: number;
  y2?: number;
  slotLength?: number;
  openEdges?: { top?: boolean; right?: boolean; bottom?: boolean; left?: boolean };
}

interface ConvertOptions {
  /** If provided, offset all coordinates so the bounding box starts at this point */
  offsetX?: number;
  offsetY?: number;
  /** If true, Y offset is measured from bottom of glass (panelHeight required) */
  anchorBottom?: boolean;
  /** Glass panel height in mm — required when anchorBottom is true */
  panelHeight?: number;
  /** Auto-filter: remove outline rect that matches overall bounding box */
  filterOutline?: boolean;
}

const EPS = 0.5; // tolerance in mm for detecting rectangles

function uid(): string {
  return crypto.randomUUID();
}

/** Check if 4-vertex closed polyline is a rectangle */
function isRectangle(poly: DxfLwPolyline): boolean {
  if (poly.vertices.length !== 4 || !poly.closed) return false;
  // No bulges
  if (poly.vertices.some(v => Math.abs(v.bulge) > EPS / 100)) return false;

  const vs = poly.vertices;
  // Check all angles are 90° by checking dot products
  for (let i = 0; i < 4; i++) {
    const a = vs[i];
    const b = vs[(i + 1) % 4];
    const c = vs[(i + 2) % 4];
    const dx1 = b.x - a.x, dy1 = b.y - a.y;
    const dx2 = c.x - b.x, dy2 = c.y - b.y;
    const dot = dx1 * dx2 + dy1 * dy2;
    if (Math.abs(dot) > EPS) return false;
  }
  return true;
}

/** Check if polyline has bulge arcs (potential stadium/slot) */
function hasBulge(poly: DxfLwPolyline): boolean {
  return poly.vertices.some(v => Math.abs(v.bulge) > 0.001);
}

export function dxfToCadShapes(
  entities: DxfEntity[],
  options: ConvertOptions = {}
): CadShapeLike[] {
  const bounds = getEntitiesBounds(entities);
  const offX = options.offsetX ?? 0;
  const offY = options.offsetY ?? 0;

  // Auto-filter: remove outline rectangle matching overall bounding box (>95%)
  let filtered = entities;
  if (options.filterOutline !== false) {
    const OUTLINE_TOL = 1; // mm
    filtered = entities.filter(e => {
      if (e.type !== 'LWPOLYLINE' || !isRectangle(e)) return true;
      const xs = e.vertices.map(v => v.x);
      const ys = e.vertices.map(v => v.y);
      const eMinX = Math.min(...xs), eMaxX = Math.max(...xs);
      const eMinY = Math.min(...ys), eMaxY = Math.max(...ys);
      const matchesX = Math.abs(eMinX - bounds.minX) < OUTLINE_TOL && Math.abs(eMaxX - bounds.maxX) < OUTLINE_TOL;
      const matchesY = Math.abs(eMinY - bounds.minY) < OUTLINE_TOL && Math.abs(eMaxY - bounds.maxY) < OUTLINE_TOL;
      if (matchesX && matchesY && entities.length > 1) return false; // skip outline
      return true;
    });
    // Recalculate bounds after filtering
    if (filtered.length > 0 && filtered.length < entities.length) {
      const newBounds = getEntitiesBounds(filtered);
      bounds.minX = newBounds.minX; bounds.minY = newBounds.minY;
      bounds.maxX = newBounds.maxX; bounds.maxY = newBounds.maxY;
      bounds.width = newBounds.width; bounds.height = newBounds.height;
    }
  }

  // Translate DXF coords: subtract minX/minY (normalize to 0,0) then add offset
  const tx = (x: number) => x - bounds.minX + offX;
  // DXF Y is typically bottom-up, CAD is top-down, so flip Y
  let ty: (y: number) => number;
  if (options.anchorBottom && options.panelHeight) {
    // Y offset from bottom: place geometry so its bottom edge is at offY from glass bottom
    ty = (y: number) => options.panelHeight! - (y - bounds.minY) - offY;
  } else {
    ty = (y: number) => (bounds.maxY - y) + offY;
  }

  const shapes: CadShapeLike[] = [];

  for (const e of filtered) {
    switch (e.type) {
      case 'CIRCLE':
        shapes.push({
          id: uid(),
          type: 'circle',
          x: tx(e.x),
          y: ty(e.y),
          width: 0,
          height: 0,
          radius: e.radius,
          rotation: 0,
        });
        break;

      case 'LINE':
        shapes.push({
          id: uid(),
          type: 'line',
          x: tx(e.x1),
          y: ty(e.y1),
          x2: tx(e.x2),
          y2: ty(e.y2),
          width: 0,
          height: 0,
          radius: 0,
          rotation: 0,
        });
        break;

      case 'LWPOLYLINE':
        if (isRectangle(e)) {
          const xs = e.vertices.map(v => v.x);
          const ys = e.vertices.map(v => v.y);
          const minPx = Math.min(...xs);
          const maxPx = Math.max(...xs);
          const minPy = Math.min(...ys);
          const maxPy = Math.max(...ys);
          const w = maxPx - minPx;
          const h = maxPy - minPy;
          // CadShape rect: x,y is center
          shapes.push({
            id: uid(),
            type: 'rect',
            x: tx(minPx + w / 2),
            y: ty(maxPy - h / 2), // center in flipped coords
            width: w,
            height: h,
            radius: 0,
            rotation: 0,
          });
        } else if (hasBulge(e) && e.vertices.length === 4 && e.closed) {
          // Possible stadium shape
          const xs = e.vertices.map(v => v.x);
          const ys = e.vertices.map(v => v.y);
          const minPx = Math.min(...xs);
          const maxPx = Math.max(...xs);
          const minPy = Math.min(...ys);
          const maxPy = Math.max(...ys);
          const w = maxPx - minPx;
          const h = maxPy - minPy;
          shapes.push({
            id: uid(),
            type: 'stadium',
            x: tx(minPx + w / 2),
            y: ty(maxPy - h / 2),
            width: w,
            height: h,
            radius: 0,
            rotation: 0,
          });
        } else if (e.vertices.length === 2 && hasBulge(e) && e.closed) {
          // Slot shape
          const v0 = e.vertices[0], v1 = e.vertices[1];
          const cx = (v0.x + v1.x) / 2;
          const cy = (v0.y + v1.y) / 2;
          const len = Math.sqrt((v1.x - v0.x) ** 2 + (v1.y - v0.y) ** 2);
          shapes.push({
            id: uid(),
            type: 'slot',
            x: tx(cx),
            y: ty(cy),
            width: 0,
            height: 0,
            radius: Math.abs(len * e.vertices[0].bulge),
            rotation: 0,
            slotLength: len,
          });
        } else {
          // Fallback: convert each segment to a line
          for (let j = 0; j < e.vertices.length; j++) {
            const v0 = e.vertices[j];
            const v1 = e.vertices[(j + 1) % e.vertices.length];
            if (j === e.vertices.length - 1 && !e.closed) break;
            shapes.push({
              id: uid(),
              type: 'line',
              x: tx(v0.x),
              y: ty(v0.y),
              x2: tx(v1.x),
              y2: ty(v1.y),
              width: 0,
              height: 0,
              radius: 0,
              rotation: 0,
            });
          }
        }
        break;

      case 'ARC':
        // Approximate arc as a circle (limited support)
        shapes.push({
          id: uid(),
          type: 'circle',
          x: tx(e.x),
          y: ty(e.y),
          width: 0,
          height: 0,
          radius: e.radius,
          rotation: 0,
          label: `Arc ${Math.round(e.startAngle)}°-${Math.round(e.endAngle)}°`,
        });
        break;
    }
  }

  return shapes;
}
