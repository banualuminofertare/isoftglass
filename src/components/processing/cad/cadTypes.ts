export type ShapeType = 'rect' | 'stadium' | 'circle' | 'lshape' | 'slot' | 'line';
export type ToolType = 'select' | 'move' | 'measure' | 'eraser' | 'subtract' | 'trim' | 'stretch' | 'copyarea' | 'join' | 'weld' | 'rect' | 'stadium' | 'circle' | 'lshape' | 'slot' | 'line';
export type PanelLayout = 'door_only' | 'door_left' | 'door_right' | 'door_both';

/** Compute intersection point of two line segments. Returns null if they don't intersect. */
export function segmentIntersection(
  ax1: number, ay1: number, ax2: number, ay2: number,
  bx1: number, by1: number, bx2: number, by2: number
): { x: number; y: number; tA: number; tB: number } | null {
  const dAx = ax2 - ax1, dAy = ay2 - ay1;
  const dBx = bx2 - bx1, dBy = by2 - by1;
  const denom = dAx * dBy - dAy * dBx;
  if (Math.abs(denom) < 1e-10) return null; // parallel
  const tA = ((bx1 - ax1) * dBy - (by1 - ay1) * dBx) / denom;
  const tB = ((bx1 - ax1) * dAy - (by1 - ay1) * dAx) / denom;
  if (tA < 0 || tA > 1 || tB < 0 || tB > 1) return null;
  return { x: ax1 + tA * dAx, y: ay1 + tA * dAy, tA, tB };
}

/** Intersection treating line B as infinite (ray). Only tA must be in [0,1] with tolerance. */
export function lineInfiniteIntersection(
  ax1: number, ay1: number, ax2: number, ay2: number,
  bx1: number, by1: number, bx2: number, by2: number
): { x: number; y: number; tA: number; tB: number } | null {
  const dAx = ax2 - ax1, dAy = ay2 - ay1;
  const dBx = bx2 - bx1, dBy = by2 - by1;
  const denom = dAx * dBy - dAy * dBx;
  if (Math.abs(denom) < 1e-10) return null;
  const tA = ((bx1 - ax1) * dBy - (by1 - ay1) * dBx) / denom;
  const tB = ((bx1 - ax1) * dAy - (by1 - ay1) * dAx) / denom;
  const eps = 1e-6;
  if (tA < -eps || tA > 1 + eps) return null; // bounded with small tolerance
  const clampedTA = Math.max(0, Math.min(1, tA));
  return { x: ax1 + clampedTA * dAx, y: ay1 + clampedTA * dAy, tA: clampedTA, tB };
}

/** Trim a line shape by a cutting line. Keeps the side of the line closest to clickPt. */
export function trimLineByLine(
  line: CadShape, cutLine: CadShape, clickX: number, clickY: number
): Partial<CadShape> | null {
  const lx1 = line.x, ly1 = line.y;
  const lx2 = line.x2 ?? line.x, ly2 = line.y2 ?? line.y;
  const cx1 = cutLine.x, cy1 = cutLine.y;
  const cx2 = cutLine.x2 ?? cutLine.x, cy2 = cutLine.y2 ?? cutLine.y;

  const hit = lineInfiniteIntersection(lx1, ly1, lx2, ly2, cx1, cy1, cx2, cy2);
  if (!hit) return null;

  // Determine which end is closer to click point
  const d1 = (clickX - lx1) ** 2 + (clickY - ly1) ** 2;
  const d2 = (clickX - lx2) ** 2 + (clickY - ly2) ** 2;

  if (d1 < d2) {
    // Click is closer to start → keep end side: new start = intersection
    return { x: hit.x, y: hit.y };
  } else {
    // Click is closer to end → keep start side: new end = intersection
    return { x2: hit.x, y2: hit.y };
  }
}
/** Trim a circle by a cutting line. Adds a CutRect mask to visually remove the clicked side with a flat edge. */
export function trimCircleByLine(
  circle: CadShape, cutLine: CadShape, clickX: number, clickY: number
): Partial<CadShape> | null {
  const r = circle.radius || 0;
  if (r <= 0) return null;
  const cx = circle.x, cy = circle.y;
  const lx1 = cutLine.x, ly1 = cutLine.y;
  const lx2 = cutLine.x2 ?? cutLine.x, ly2 = cutLine.y2 ?? cutLine.y;

  // Line direction vector
  const dx = lx2 - lx1, dy = ly2 - ly1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1e-10) return null;

  // Project circle center onto the infinite cut line
  const t = ((cx - lx1) * dx + (cy - ly1) * dy) / lenSq;
  const projX = lx1 + t * dx, projY = ly1 + t * dy;

  // Distance from center to the line
  const dist = Math.sqrt((cx - projX) ** 2 + (cy - projY) ** 2);
  const tolerance = 2;
  if (dist >= r + tolerance) return null;

  // Determine which side the click is on relative to the cut line (cross product)
  const crossClick = dx * (clickY - ly1) - dy * (clickX - lx1);

  // Line angle for CutRect rotation
  const lineAngle = Math.atan2(dy, dx) * (180 / Math.PI);

  // Perpendicular unit vector (pointing to the "positive cross" side)
  const len = Math.sqrt(lenSq);
  const perpX = -dy / len;  // perpendicular to line direction
  const perpY = dx / len;

  // Shift the CutRect center to the click side of the line
  // The cut rect is wide enough to cover the whole circle, and tall enough to cover one side
  const cutSize = r * 4; // generous size to fully cover
  const shiftDist = cutSize / 2; // shift center by half height to align edge with cut line

  let cutCenterX: number, cutCenterY: number;
  if (crossClick >= 0) {
    // Click is on the "positive" side of the line → place cut rect on that side
    cutCenterX = projX + perpX * shiftDist;
    cutCenterY = projY + perpY * shiftDist;
  } else {
    // Click is on the "negative" side
    cutCenterX = projX - perpX * shiftDist;
    cutCenterY = projY - perpY * shiftDist;
  }

  const newCut: CutRect = {
    id: crypto.randomUUID(),
    x: cutCenterX,
    y: cutCenterY,
    width: cutSize,
    height: cutSize,
    rotation: lineAngle,
  };

  const existingCuts = circle.cuts ? [...circle.cuts] : [];
  existingCuts.push(newCut);

  return { cuts: existingCuts };
}

/** Trim a rect-like shape by a circle. Adds a circular cut mask on the clicked side. */
export function trimRectByCircle(
  rect: CadShape, circle: CadShape, clickX: number, clickY: number
): Partial<CadShape> | null {
  const cr = circle.radius || 0;
  if (cr <= 0) return null;
  
  // Check if the circle overlaps the rect
  let hw: number, hh: number;
  if (rect.type === 'slot') {
    hw = (rect.slotLength ?? 20) / 2;
    hh = rect.radius || 3;
  } else {
    hw = rect.width / 2;
    hh = rect.height / 2;
  }
  
  const left = rect.x - hw, right = rect.x + hw;
  const top = rect.y - hh, bottom = rect.y + hh;
  
  // Check circle-rect overlap (closest point on rect to circle center)
  const closestX = Math.max(left, Math.min(circle.x, right));
  const closestY = Math.max(top, Math.min(circle.y, bottom));
  const dist = Math.sqrt((circle.x - closestX) ** 2 + (circle.y - closestY) ** 2);
  
  if (dist > cr + 5) return null; // no overlap
  
  // The click point must be inside the circle (user clicks the part to remove)
  const clickDist = Math.sqrt((clickX - circle.x) ** 2 + (clickY - circle.y) ** 2);
  if (clickDist > cr + 10) return null; // click not inside circle area
  
  const newCut: CutCircle = {
    id: crypto.randomUUID(),
    cutType: 'circle',
    x: circle.x,
    y: circle.y,
    radius: cr,
  };
  
  const existingCuts = rect.cuts ? [...rect.cuts] : [];
  existingCuts.push(newCut);
  
  return { cuts: existingCuts };
}

/** Trim a rect-like shape (rect, stadium, slot, lshape) by a cutting line.
 *  Uses cross-product for robust side detection. */
export function trimRectByLine(
  rect: CadShape, cutLine: CadShape, clickX: number, clickY: number
): Partial<CadShape> | null {
  // Compute actual bounding box based on shape type
  let hw: number, hh: number;
  if (rect.type === 'slot') {
    hw = (rect.slotLength ?? 20) / 2;
    hh = rect.radius || 3;
  } else {
    hw = rect.width / 2;
    hh = rect.height / 2;
  }
  if (hw < 0.5 || hh < 0.5) return null;

  const left = rect.x - hw, right = rect.x + hw;
  const top = rect.y - hh, bottom = rect.y + hh;
  const cx1 = cutLine.x, cy1 = cutLine.y;
  const cx2 = cutLine.x2 ?? cutLine.x, cy2 = cutLine.y2 ?? cutLine.y;

  const cutDx = cx2 - cx1, cutDy = cy2 - cy1;
  if (cutDx * cutDx + cutDy * cutDy < 1e-10) return null;

  // Check intersection of infinite cut line with each edge segment
  const edges: { axis: 'x' | 'y'; side: string; x1: number; y1: number; x2: number; y2: number }[] = [
    { axis: 'x', side: 'left', x1: left, y1: top, x2: left, y2: bottom },
    { axis: 'x', side: 'right', x1: right, y1: top, x2: right, y2: bottom },
    { axis: 'y', side: 'top', x1: left, y1: top, x2: right, y2: top },
    { axis: 'y', side: 'bottom', x1: left, y1: bottom, x2: right, y2: bottom },
  ];

  const hits: { side: string; axis: 'x' | 'y'; x: number; y: number }[] = [];
  for (const edge of edges) {
    const hit = lineInfiniteIntersection(edge.x1, edge.y1, edge.x2, edge.y2, cx1, cy1, cx2, cy2);
    if (hit) {
      // Avoid duplicate corner hits
      const isDup = hits.some(h => Math.abs(h.x - hit.x) < 0.01 && Math.abs(h.y - hit.y) < 0.01);
      if (!isDup) hits.push({ side: edge.side, axis: edge.axis, x: hit.x, y: hit.y });
    }
  }

  if (hits.length < 2) return null; // Line must cross through the shape

  // Cross product determines which side of the cut line a point is on
  const cross = (px: number, py: number) => cutDx * (py - cy1) - cutDy * (px - cx1);
  const crossClick = cross(clickX, clickY);

  // Determine which axis to trim: check which pairs of opposite edges are hit
  const hitSides = new Set(hits.map(h => h.side));
  const hitsLR = hitSides.has('left') && hitSides.has('right');
  const hitsTB = hitSides.has('top') && hitSides.has('bottom');

  let trimAxis: 'x' | 'y';
  if (hitsLR && !hitsTB) {
    trimAxis = 'y'; // cuts left-right → horizontal-ish → trim top/bottom
  } else if (hitsTB && !hitsLR) {
    trimAxis = 'x'; // cuts top-bottom → vertical-ish → trim left/right
  } else {
    // Diagonal or corner case: pick axis with larger intersection span
    const spanX = Math.abs(hits[0].x - hits[1].x);
    const spanY = Math.abs(hits[0].y - hits[1].y);
    trimAxis = spanY >= spanX ? 'x' : 'y';
  }

  if (trimAxis === 'x') {
    // Trim left or right
    const cutX = hits.reduce((s, h) => s + h.x, 0) / hits.length;
    const crossLeft = cross(left, rect.y); // left-center point
    const clickOnLeftSide = (crossClick >= 0) === (crossLeft >= 0);

    if (clickOnLeftSide) {
      // Remove left portion
      const newLeft = cutX;
      const newW = right - newLeft;
      if (newW < 2) return null;
      const result: Partial<CadShape> = { x: newLeft + newW / 2 };
      if (rect.type === 'slot') result.slotLength = newW;
      else result.width = newW;
      return result;
    } else {
      // Remove right portion
      const newRight = cutX;
      const newW = newRight - left;
      if (newW < 2) return null;
      const result: Partial<CadShape> = { x: left + newW / 2 };
      if (rect.type === 'slot') result.slotLength = newW;
      else result.width = newW;
      return result;
    }
  } else {
    // Trim top or bottom
    const cutY = hits.reduce((s, h) => s + h.y, 0) / hits.length;
    const crossTop = cross(rect.x, top); // top-center point
    const clickOnTopSide = (crossClick >= 0) === (crossTop >= 0);

    if (clickOnTopSide) {
      // Remove top portion
      const newTop = cutY;
      const newH = bottom - newTop;
      if (newH < 2) return null;
      const result: Partial<CadShape> = { y: newTop + newH / 2 };
      if (rect.type === 'slot') result.radius = newH / 2;
      else result.height = newH;
      return result;
    } else {
      // Remove bottom portion
      const newBottom = cutY;
      const newH = newBottom - top;
      if (newH < 2) return null;
      const result: Partial<CadShape> = { y: top + newH / 2 };
      if (rect.type === 'slot') result.radius = newH / 2;
      else result.height = newH;
      return result;
    }
  }
}

export interface CutRect {
  id: string;
  cutType?: 'rect';
  x: number;  // center X in mm (absolute, same coord system as shapes)
  y: number;  // center Y in mm
  width: number;
  height: number;
  rotation?: number; // degrees, for trim cuts at arbitrary angles
}

export interface CutCircle {
  id: string;
  cutType: 'circle';
  x: number;  // center X in mm
  y: number;  // center Y in mm
  radius: number;
}

export type CutShape = CutRect | CutCircle;

export interface CadShape {
  id: string;
  type: ShapeType;
  x: number;  // mm from glass left edge (center for rect/stadium/circle, start for line)
  y: number;  // mm from glass top edge
  width: number;   // mm (rect/stadium/lshape/slot)
  height: number;  // mm (rect/stadium/lshape)
  radius: number;  // mm (circle diameter/2, slot end radius)
  rotation: number; // degrees
  label?: string;
  cuts?: CutShape[];  // boolean subtract cuts (rect or circle)
  // L-shape specific
  lCutWidth?: number;   // mm - width of L cut
  lCutHeight?: number;  // mm - height of L cut
  lCorner?: 'tl' | 'tr' | 'bl' | 'br'; // which corner is cut
  // Line specific
  x2?: number;
  y2?: number;
  // Slot specific
  slotLength?: number; // mm
  // Fillet & Chamfer
  cornerRadius?: number;  // mm - fillet radius for rect corners
  chamferSize?: number;   // mm - chamfer size for rect corners
  // Open edges (rect only) — remove individual sides
  openEdges?: { top?: boolean; right?: boolean; bottom?: boolean; left?: boolean };
  // Target panel for sliding systems (which panel this shape belongs to)
  targetPanel?: 'door' | 'fixed_left' | 'fixed_right';
}

export interface Measurement {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  distance: number;
}

export const PANEL_GAP_MM = 10; // visual gap between panels in mm

/** Determine which panel a point (in canvas mm coords) falls on */
export function detectTargetPanel(
  x: number, glassWidth: number, panelLayout: PanelLayout,
  fixedLeftWidth: number, fixedRightWidth: number
): 'door' | 'fixed_left' | 'fixed_right' {
  const hasLeft = panelLayout === 'door_left' || panelLayout === 'door_both';
  const hasRight = panelLayout === 'door_right' || panelLayout === 'door_both';
  if (hasLeft) {
    const leftEnd = fixedLeftWidth;
    if (x < leftEnd) return 'fixed_left';
    // Door starts at leftEnd + GAP
    const doorStart = leftEnd + PANEL_GAP_MM;
    const doorEnd = doorStart + glassWidth;
    if (hasRight && x > doorEnd + PANEL_GAP_MM) return 'fixed_right';
    return 'door';
  }
  if (hasRight) {
    if (x > glassWidth + PANEL_GAP_MM) return 'fixed_right';
    return 'door';
  }
  return 'door';
}

/** Convert canvas X to local panel X */
export function canvasXToLocalX(
  canvasX: number, targetPanel: 'door' | 'fixed_left' | 'fixed_right',
  panelLayout: PanelLayout, fixedLeftWidth: number
): number {
  const hasLeft = panelLayout === 'door_left' || panelLayout === 'door_both';
  if (targetPanel === 'fixed_left') return canvasX;
  if (targetPanel === 'door' && hasLeft) return canvasX - fixedLeftWidth - PANEL_GAP_MM;
  return canvasX; // door without left panel, or fixed_right uses own offset calculated in canvas
}

/** Get the canvas X offset for a panel */
export function getPanelCanvasOffset(
  targetPanel: 'door' | 'fixed_left' | 'fixed_right',
  panelLayout: PanelLayout, glassWidth: number, fixedLeftWidth: number
): number {
  const hasLeft = panelLayout === 'door_left' || panelLayout === 'door_both';
  if (targetPanel === 'fixed_left') return 0;
  if (targetPanel === 'door') return hasLeft ? fixedLeftWidth + PANEL_GAP_MM : 0;
  // fixed_right
  const doorOffset = hasLeft ? fixedLeftWidth + PANEL_GAP_MM : 0;
  return doorOffset + glassWidth + PANEL_GAP_MM;
}

/** Get total canvas width including all panels */
export function getTotalCanvasWidth(
  glassWidth: number, panelLayout: PanelLayout,
  fixedLeftWidth: number, fixedRightWidth: number
): number {
  let total = glassWidth;
  if (panelLayout === 'door_left' || panelLayout === 'door_both') total += fixedLeftWidth + PANEL_GAP_MM;
  if (panelLayout === 'door_right' || panelLayout === 'door_both') total += fixedRightWidth + PANEL_GAP_MM;
  return total;
}

export const GRID_OPTIONS = [1, 2, 5, 10, 20, 50] as const;

export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

/** Extract snap points (key geometric points) from a shape */
export function getShapeSnapPoints(s: CadShape): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  if (s.type === 'circle') {
    pts.push({ x: s.x, y: s.y }); // center
    pts.push({ x: s.x, y: s.y - s.radius }); // N
    pts.push({ x: s.x + s.radius, y: s.y }); // E
    pts.push({ x: s.x, y: s.y + s.radius }); // S
    pts.push({ x: s.x - s.radius, y: s.y }); // W
  } else if (s.type === 'line') {
    pts.push({ x: s.x, y: s.y });
    pts.push({ x: s.x2 ?? s.x, y: s.y2 ?? s.y });
    // midpoint
    pts.push({ x: (s.x + (s.x2 ?? s.x)) / 2, y: (s.y + (s.y2 ?? s.y)) / 2 });
  } else if (s.type === 'slot') {
    const hw = (s.slotLength ?? 20) / 2;
    pts.push({ x: s.x, y: s.y }); // center
    pts.push({ x: s.x - hw, y: s.y }); // left
    pts.push({ x: s.x + hw, y: s.y }); // right
  } else {
    // rect, stadium, lshape
    const hw = s.width / 2;
    const hh = s.height / 2;
    pts.push({ x: s.x, y: s.y }); // center
    pts.push({ x: s.x - hw, y: s.y - hh }); // TL
    pts.push({ x: s.x + hw, y: s.y - hh }); // TR
    pts.push({ x: s.x + hw, y: s.y + hh }); // BR
    pts.push({ x: s.x - hw, y: s.y + hh }); // BL
    // edge midpoints
    pts.push({ x: s.x, y: s.y - hh }); // top mid
    pts.push({ x: s.x + hw, y: s.y }); // right mid
    pts.push({ x: s.x, y: s.y + hh }); // bottom mid
    pts.push({ x: s.x - hw, y: s.y }); // left mid
  }
  return pts;
}

export function createShape(type: ShapeType, x: number, y: number): CadShape {
  const base: CadShape = {
    id: crypto.randomUUID(),
    type,
    x,
    y,
    width: 0,
    height: 0,
    radius: 0,
    rotation: 0,
  };

  switch (type) {
    case 'rect':
      return { ...base, width: 20, height: 10 };
    case 'stadium':
      return { ...base, width: 30, height: 12 };
    case 'circle':
      return { ...base, radius: 5 };
    case 'lshape':
      return { ...base, width: 30, height: 30, lCutWidth: 15, lCutHeight: 15, lCorner: 'tr' };
    case 'slot':
      return { ...base, radius: 3, slotLength: 20 };
    case 'line':
      return { ...base, x2: x + 50, y2: y };
    default:
      return base;
  }
}

export function duplicateShape(shape: CadShape, offsetX = 10, offsetY = 10): CadShape {
  return {
    ...shape,
    id: crypto.randomUUID(),
    x: shape.x + offsetX,
    y: shape.y + offsetY,
    x2: shape.x2 != null ? shape.x2 + offsetX : undefined,
    y2: shape.y2 != null ? shape.y2 + offsetY : undefined,
    label: shape.label ? `${shape.label} (copie)` : undefined,
  };
}

export function mirrorShapeX(shape: CadShape, glassWidth: number): CadShape {
  const mirrored = { ...shape, id: crypto.randomUUID(), x: glassWidth - shape.x };
  if (mirrored.x2 != null) mirrored.x2 = glassWidth - mirrored.x2;
  if (mirrored.lCorner) {
    const map: Record<string, 'tl' | 'tr' | 'bl' | 'br'> = { tl: 'tr', tr: 'tl', bl: 'br', br: 'bl' };
    mirrored.lCorner = map[mirrored.lCorner];
  }
  return mirrored;
}

export function mirrorShapeY(shape: CadShape, glassHeight: number): CadShape {
  const mirrored = { ...shape, id: crypto.randomUUID(), y: glassHeight - shape.y };
  if (mirrored.y2 != null) mirrored.y2 = glassHeight - mirrored.y2;
  if (mirrored.lCorner) {
    const map: Record<string, 'tl' | 'tr' | 'bl' | 'br'> = { tl: 'bl', tr: 'br', bl: 'tl', br: 'tr' };
    mirrored.lCorner = map[mirrored.lCorner];
  }
  return mirrored;
}

export function rotateShape90(shape: CadShape): CadShape {
  const rotated = { ...shape, rotation: (shape.rotation + 90) % 360 };
  if (shape.type !== 'circle' && shape.type !== 'line') {
    rotated.width = shape.height;
    rotated.height = shape.width;
  }
  return rotated;
}

export function duplicateAllShapes(shapes: CadShape[], dx: number, dy: number): CadShape[] {
  return shapes.map(s => duplicateShape(s, dx, dy));
}

export function mirrorAllShapesX(shapes: CadShape[], glassWidth: number): CadShape[] {
  return shapes.map(s => mirrorShapeX(s, glassWidth));
}

export function mirrorAllShapesY(shapes: CadShape[], glassHeight: number): CadShape[] {
  return shapes.map(s => mirrorShapeY(s, glassHeight));
}

export function createLinearArray(shape: CadShape, count: number, dx: number, dy: number): CadShape[] {
  const result: CadShape[] = [];
  for (let i = 1; i <= count; i++) {
    result.push({
      ...shape,
      id: crypto.randomUUID(),
      x: shape.x + dx * i,
      y: shape.y + dy * i,
      x2: shape.x2 != null ? shape.x2 + dx * i : undefined,
      y2: shape.y2 != null ? shape.y2 + dy * i : undefined,
    });
  }
  return result;
}

/** Convert shapes array to a dimensions record for the template */
export function shapesToDimensions(shapes: CadShape[], panelLayout?: PanelLayout, fixedLeftWidth?: number, fixedRightWidth?: number): Record<string, number> {
  const dims: Record<string, number> = {};
  if (panelLayout && panelLayout !== 'door_only') {
    dims['_panel_layout'] = panelLayout === 'door_left' ? 1 : panelLayout === 'door_right' ? 2 : 3;
    if (fixedLeftWidth && (panelLayout === 'door_left' || panelLayout === 'door_both')) dims['_fixed_left_width'] = fixedLeftWidth;
    if (fixedRightWidth && (panelLayout === 'door_right' || panelLayout === 'door_both')) dims['_fixed_right_width'] = fixedRightWidth;
  }
  shapes.forEach((s, i) => {
    const prefix = shapes.length === 1 ? '' : `shape${i + 1}_`;
    dims[`${prefix}type_${s.type}`] = 1;
    dims[`${prefix}x`] = s.x;
    dims[`${prefix}y`] = s.y;
    if (s.rotation) dims[`${prefix}rotation`] = s.rotation;
    if (s.targetPanel && s.targetPanel !== 'door') dims[`${prefix}target_panel`] = s.targetPanel === 'fixed_left' ? 1 : 2;
    if (s.type === 'circle') {
      dims[`${prefix}diameter`] = s.radius * 2;
    } else if (s.type === 'line') {
      if (s.x2 != null) dims[`${prefix}x2`] = s.x2;
      if (s.y2 != null) dims[`${prefix}y2`] = s.y2;
    } else if (s.type === 'slot') {
      dims[`${prefix}slot_radius`] = s.radius;
      dims[`${prefix}slot_length`] = s.slotLength ?? 20;
    } else if (s.type === 'lshape') {
      dims[`${prefix}width`] = s.width;
      dims[`${prefix}height`] = s.height;
      dims[`${prefix}l_cut_width`] = s.lCutWidth ?? 0;
      dims[`${prefix}l_cut_height`] = s.lCutHeight ?? 0;
    } else {
      dims[`${prefix}width`] = s.width;
      dims[`${prefix}height`] = s.height;
      if (s.cornerRadius) dims[`${prefix}corner_radius`] = s.cornerRadius;
      if (s.chamferSize) dims[`${prefix}chamfer_size`] = s.chamferSize;
    }
  });
  return dims;
}

/** Generate an SVG data URL from the canvas state */
export function exportToSvgDataUrl(shapes: CadShape[], glassW: number, glassH: number): string {
  const pad = 20;
  const scale = 0.5;
  const w = (glassW + pad * 2) * scale;
  const h = (glassH + pad * 2) * scale;
  const gx = pad * scale;
  const gy = pad * scale;
  const gw = glassW * scale;
  const gh = glassH * scale;

  const glassSvg = `<rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" fill="#e8f4f8" stroke="#171d2d" stroke-width="1.5"/>`;

  const shapesSvg = shapes.map(s => {
    const sx = gx + s.x * scale;
    const sy = gy + s.y * scale;
    if (s.type === 'circle') {
      return `<circle cx="${sx}" cy="${sy}" r="${s.radius * scale}" fill="white" fill-opacity="0.7" stroke="#2563eb" stroke-width="1"/>`;
    }
    if (s.type === 'line') {
      const x2 = gx + (s.x2 ?? s.x) * scale;
      const y2 = gy + (s.y2 ?? s.y) * scale;
      return `<line x1="${sx}" y1="${sy}" x2="${x2}" y2="${y2}" stroke="#2563eb" stroke-width="1"/>`;
    }
    if (s.type === 'slot') {
      const sl = (s.slotLength ?? 20) * scale;
      const sr = s.radius * scale;
      return `<rect x="${sx - sl / 2}" y="${sy - sr}" width="${sl}" height="${sr * 2}" rx="${sr}" fill="white" fill-opacity="0.7" stroke="#2563eb" stroke-width="1"/>`;
    }
    if (s.type === 'lshape') {
      const sw = s.width * scale;
      const sh = s.height * scale;
      const cw = (s.lCutWidth ?? 0) * scale;
      const ch = (s.lCutHeight ?? 0) * scale;
      const path = buildLShapePath(sx, sy, sw, sh, cw, ch, s.lCorner ?? 'tr');
      return `<path d="${path}" fill="white" fill-opacity="0.7" stroke="#2563eb" stroke-width="1"/>`;
    }
    const sw = s.width * scale;
    const sh = s.height * scale;
    const chamfer = (s.chamferSize ?? 0) * scale;
    const fillet = (s.cornerRadius ?? 0) * scale;
    if (chamfer > 0 && s.type === 'rect') {
      const l = sx - sw / 2, t = sy - sh / 2, r = sx + sw / 2, b = sy + sh / 2;
      const c = Math.min(chamfer, sw / 2, sh / 2);
      const path = `M${l + c},${t} L${r - c},${t} L${r},${t + c} L${r},${b - c} L${r - c},${b} L${l + c},${b} L${l},${b - c} L${l},${t + c} Z`;
      return `<path d="${path}" fill="white" fill-opacity="0.7" stroke="#2563eb" stroke-width="1"/>`;
    }
    const rx = s.type === 'stadium' ? Math.min(sh / 2, sw / 2) : fillet;
    return `<rect x="${sx - sw / 2}" y="${sy - sh / 2}" width="${sw}" height="${sh}" rx="${rx}" fill="white" fill-opacity="0.7" stroke="#2563eb" stroke-width="1"/>`;
  }).join('\n  ');

  const dimY = gy - 8;
  const dimSvg = `<line x1="${gx}" y1="${dimY}" x2="${gx + gw}" y2="${dimY}" stroke="#333" stroke-width="0.5"/>
  <text x="${gx + gw / 2}" y="${dimY - 3}" text-anchor="middle" font-size="8" fill="#333">${glassW}</text>
  <line x1="${gx - 8}" y1="${gy}" x2="${gx - 8}" y2="${gy + gh}" stroke="#333" stroke-width="0.5"/>
  <text x="${gx - 12}" y="${gy + gh / 2}" text-anchor="middle" font-size="8" fill="#333" transform="rotate(-90, ${gx - 12}, ${gy + gh / 2})">${glassH}</text>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="white"/>
  ${glassSvg}
  ${shapesSvg}
  ${dimSvg}
</svg>`;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/** Build SVG path for L-shape. Origin at center of bounding box. */
export function buildLShapePath(cx: number, cy: number, w: number, h: number, cw: number, ch: number, corner: string): string {
  const l = cx - w / 2;
  const t = cy - h / 2;
  const r = l + w;
  const b = t + h;

  switch (corner) {
    case 'tr':
      return `M${l},${t} L${r - cw},${t} L${r - cw},${t + ch} L${r},${t + ch} L${r},${b} L${l},${b} Z`;
    case 'tl':
      return `M${l + cw},${t} L${r},${t} L${r},${b} L${l},${b} L${l},${t + ch} L${l + cw},${t + ch} Z`;
    case 'br':
      return `M${l},${t} L${r},${t} L${r},${b - ch} L${r - cw},${b - ch} L${r - cw},${b} L${l},${b} Z`;
    case 'bl':
      return `M${l},${t} L${r},${t} L${r},${b} L${l + cw},${b} L${l + cw},${b - ch} L${l},${b - ch} Z`;
    default:
      return `M${l},${t} L${r},${t} L${r},${b} L${l},${b} Z`;
  }
}
