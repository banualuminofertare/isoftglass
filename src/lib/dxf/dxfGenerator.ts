/**
 * Generates DXF files for door/shower processing sheets.
 * Uses dxfCore for R2010-compliant output with LWPOLYLINE.
 */

import {
  createDxfDocument,
  downloadDxfFile,
  DxfDocument,
  DxfVertex,
  DXF_COLORS,
  DxfVersion,
  bulge90,
} from './dxfCore';
import type { TemplateCutout } from '@/lib/processing/templateCutouts';

interface DxfHingeInfo {
  positions: number[]; // mm from top
  cutoutW: number;
  cutoutH: number;
  cutoutOffset: number;
}

interface DxfHandleInfo {
  positionY: number; // mm from top
  length: number;
}

interface DxfPanelInfo {
  width: number;
  height: number;
  label: string;
}

interface DxfDoorData {
  width: number;
  height: number;
  hingeSide: 'left' | 'right';
  hinges: DxfHingeInfo;
  handle?: DxfHandleInfo;
  fixedPanel?: { enabled: boolean; width: number };
  fixedPanelLeft?: { enabled: boolean; width: number };
  fixedPanelRight?: { enabled: boolean; width: number };
  sidePanel?: { width: number; height: number };
  // Template cutouts
  handleTemplateCutouts?: TemplateCutout[];
  isAbsoluteHandleTemplate?: boolean;
  handleTemplateRefDims?: { width: number; height: number };
  slidingKitCutouts?: TemplateCutout[];
  slidingKitRefDims?: { width: number; height: number };
}

const FIXED_PANEL_EXTRA_H = 5;
const PANEL_GAP = 24;

// ── Standard layers ──

function addStandardLayers(doc: DxfDocument) {
  doc.addLayer({ name: 'DOOR', color: DXF_COLORS.WHITE, lineWeight: 35 });
  doc.addLayer({ name: 'CUTOUT', color: DXF_COLORS.RED, lineWeight: 25 });
  doc.addLayer({ name: 'HANDLE', color: DXF_COLORS.GRAY, lineWeight: 25 });
  doc.addLayer({ name: 'FIXED', color: DXF_COLORS.GREEN, lineWeight: 35 });
  doc.addLayer({ name: 'SIDE', color: DXF_COLORS.BLUE, lineWeight: 35 });
  doc.addLayer({ name: 'DIMS', color: DXF_COLORS.CYAN, lineWeight: 15 });
  doc.addLayer({ name: 'TEMPLATE', color: DXF_COLORS.MAGENTA, lineWeight: 25 });
}

// ── Template cutout drawing helpers ──

function mapCutoutCoord(
  cutout: TemplateCutout,
  refW: number, refH: number,
  actualW: number, actualH: number,
  mirrorX?: boolean
): { x: number; y: number } {
  let mappedX = cutout.x > refW / 2 ? actualW - (refW - cutout.x) : cutout.x;
  const mappedY = cutout.y > refH / 2 ? actualH - (refH - cutout.y) : cutout.y;
  if (mirrorX) mappedX = actualW - mappedX;
  return { x: mappedX, y: mappedY };
}

function drawDxfTemplateCutout(doc: DxfDocument, cutout: TemplateCutout, cx: number, cy: number) {
  if (cutout.shape === 'circle') {
    const r = cutout.diameter / 2;
    doc.addCircle(cx, cy, r, 'TEMPLATE');
    // Cross marks
    const cr = r * 0.4;
    doc.addLine(cx - cr, cy, cx + cr, cy, 'TEMPLATE');
    doc.addLine(cx, cy - cr, cx, cy + cr, 'TEMPLATE');
  } else if (cutout.shape === 'stadium') {
    const w = cutout.width;
    const h = cutout.height;
    const rx = Math.min(h / 2, w / 2);
    // Approximate stadium as rect (DXF doesn't have rounded rect)
    doc.addRect(cx - w / 2, cy - h / 2, w, h, 'TEMPLATE');
  } else if (cutout.shape === 'rect') {
    doc.addRect(cx - cutout.width / 2, cy - cutout.height / 2, cutout.width, cutout.height, 'TEMPLATE');
  } else if (cutout.shape === 'slot') {
    const sl = cutout.slotLength;
    const sr = cutout.radius;
    doc.addRect(cx - sl / 2, cy - sr, sl, sr * 2, 'TEMPLATE');
  }
}

function drawTemplateCutoutsOnDxfPanel(
  doc: DxfDocument, cutouts: TemplateCutout[],
  panelX: number, panelY: number,
  panelW: number, panelH: number,
  refW: number, refH: number,
  mirrorX?: boolean
) {
  for (const cutout of cutouts) {
    const mapped = mapCutoutCoord(cutout, refW, refH, panelW, panelH, mirrorX);
    // DXF Y is from bottom; template Y is from top, so invert
    const cx = panelX + mapped.x;
    const cy = panelY + panelH - mapped.y;
    drawDxfTemplateCutout(doc, cutout, cx, cy);
  }
}

// ── Hinge slot helpers ──

interface HingeSlot {
  centerY: number;
  top: number;
  bottom: number;
}

function computeHingeSlots(hinges: DxfHingeInfo, panelHeight: number): HingeSlot[] {
  return [...hinges.positions]
    .sort((a, b) => a - b)
    .map(posFromTop => {
      const centerY = panelHeight - posFromTop;
      return { centerY, top: centerY + hinges.cutoutH / 2, bottom: centerY - hinges.cutoutH / 2 };
    })
    .sort((a, b) => a.centerY - b.centerY);
}

/**
 * Build a stadium-shaped cutout as LWPOLYLINE vertices with bulge.
 * The cutout is a rectangle with rounded ends (radius = r).
 */
function stadiumVertices(
  notchX: number, slotTop: number, slotBottom: number, r: number, side: 'left' | 'right', edgeX: number
): DxfVertex[] {
  const b = bulge90();
  if (side === 'left') {
    // Cutout extends from edgeX rightward to notchX+r
    return [
      { x: edgeX, y: slotTop },
      { x: notchX, y: slotTop, bulge: b },
      { x: notchX + r, y: slotTop - r },
      { x: notchX + r, y: slotBottom + r },
      { x: notchX, y: slotBottom + r - r, bulge: b }, // end of arc
      // Fix: proper stadium
      { x: edgeX, y: slotBottom },
    ];
  } else {
    return [
      { x: edgeX, y: slotBottom },
      { x: notchX, y: slotBottom, bulge: -b },
      { x: notchX - r, y: slotBottom + r },
      { x: notchX - r, y: slotTop - r },
      { x: notchX, y: slotTop, bulge: -b },
      { x: edgeX, y: slotTop },
    ];
  }
}

/** Draw a panel outline with hinge cutouts as separate LWPOLYLINE contours */
function drawPanelWithCutouts(
  doc: DxfDocument, x: number, y: number, w: number, h: number,
  hinges: DxfHingeInfo, cutoutSide: 'left' | 'right', panelLayer: string
) {
  const { cutoutW, cutoutH, cutoutOffset } = hinges;
  const r = cutoutOffset * 1.5;
  const slots = computeHingeSlots(hinges, h);
  const b = bulge90();

  // Build the full outline as a single LWPOLYLINE with cutout indentations
  const verts: DxfVertex[] = [];

  if (cutoutSide === 'left') {
    // Start bottom-left, go clockwise: bottom → right → top → left (with cutouts)
    verts.push({ x, y: y }); // bottom-left
    verts.push({ x: x + w, y: y }); // bottom-right
    verts.push({ x: x + w, y: y + h }); // top-right
    verts.push({ x, y: y + h }); // top-left

    // We need a more complex path for cutouts on the left edge
    // Use separate contours: main rect + cutout polylines
    doc.addRect(x, y, w, h, panelLayer);

    const slotsDesc = [...slots].sort((a, b) => b.centerY - a.centerY);
    const notchX = x + cutoutW - cutoutOffset;
    for (const slot of slotsDesc) {
      const adjTop = y + slot.top;
      const adjBottom = y + slot.bottom;
      doc.addLwPolyline([
        { x, y: adjTop },
        { x: notchX, y: adjTop, bulge: b },
        { x: notchX + r, y: adjTop - r },
        { x: notchX + r, y: adjBottom + r, bulge: b },
        { x: notchX, y: adjBottom },
        { x, y: adjBottom },
      ], false, 'CUTOUT');
    }
    return;
  }

  // cutoutSide === 'right'
  doc.addRect(x, y, w, h, panelLayer);

  const notchX = x + w - cutoutW + cutoutOffset;
  for (const slot of slots) {
    const adjTop = y + slot.top;
    const adjBottom = y + slot.bottom;
    doc.addLwPolyline([
      { x: x + w, y: adjBottom },
      { x: notchX, y: adjBottom, bulge: -b },
      { x: notchX - r, y: adjBottom + r },
      { x: notchX - r, y: adjTop - r, bulge: -b },
      { x: notchX, y: adjTop },
      { x: x + w, y: adjTop },
    ], false, 'CUTOUT');
  }
}

// ── Main generator ──

export function generateDxf(data: DxfDoorData, version: DxfVersion = 'R2010'): string {
  const doc = createDxfDocument(version);
  addStandardLayers(doc);

  const { width, height, hingeSide, hinges, handle, fixedPanel, fixedPanelLeft, fixedPanelRight, sidePanel } = data;
  const isLeft = hingeSide === 'left';
  const fixedPanelH = height + FIXED_PANEL_EXTRA_H;
  const { cutoutW, cutoutH, cutoutOffset } = hinges;
  const r = cutoutOffset * 1.5;
  const b = bulge90();

  const hasLeftPanel = fixedPanelLeft?.enabled && fixedPanelLeft.width > 0;
  const hasFixedPanel = fixedPanel?.enabled && fixedPanel.width > 0;
  const hasRightPanel = fixedPanelRight?.enabled && fixedPanelRight.width > 0;

  let offsetX = 0;

  // ── LEFT FIXED PANEL ──
  if (hasLeftPanel) {
    const pw = fixedPanelLeft!.width;
    if (isLeft) {
      drawPanelWithCutouts(doc, offsetX, 0, pw, fixedPanelH, hinges, 'right', 'FIXED');
    } else {
      doc.addRect(offsetX, 0, pw, fixedPanelH, 'FIXED');
    }
    doc.addText(offsetX + pw / 2 - 20, -15, 8, `FIX S ${pw}x${fixedPanelH}`, 'DIMS');
    // Sliding kit cutouts on left fixed panel
    if (data.slidingKitCutouts && data.slidingKitCutouts.length > 0) {
      const leftCutouts = data.slidingKitCutouts.filter(c => c.targetPanel === 'fixed_left');
      if (leftCutouts.length > 0) {
        const refW = data.slidingKitRefDims?.width || pw;
        const refH = data.slidingKitRefDims?.height || fixedPanelH;
        drawTemplateCutoutsOnDxfPanel(doc, leftCutouts, offsetX, 0, pw, fixedPanelH, refW, refH);
      }
    }
    offsetX += pw + PANEL_GAP;
  }

  // ── DOOR PANEL ──
  const doorStartX = offsetX;
  const slots = computeHingeSlots(hinges, height);

  if (isLeft) {
    doc.addRect(doorStartX, 0, width, height, 'DOOR');
    const slotsDesc = [...slots].sort((a, b) => b.centerY - a.centerY);
    const notchX = doorStartX + cutoutW - cutoutOffset;
    for (const slot of slotsDesc) {
      doc.addLwPolyline([
        { x: doorStartX, y: slot.top },
        { x: notchX, y: slot.top, bulge: b },
        { x: notchX + r, y: slot.top - r },
        { x: notchX + r, y: slot.bottom + r, bulge: b },
        { x: notchX, y: slot.bottom },
        { x: doorStartX, y: slot.bottom },
      ], false, 'CUTOUT');
    }
  } else {
    doc.addRect(doorStartX, 0, width, height, 'DOOR');
    const notchX = doorStartX + width - cutoutW + cutoutOffset;
    for (const slot of slots) {
      doc.addLwPolyline([
        { x: doorStartX + width, y: slot.bottom },
        { x: notchX, y: slot.bottom, bulge: -b },
        { x: notchX - r, y: slot.bottom + r },
        { x: notchX - r, y: slot.top - r, bulge: -b },
        { x: notchX, y: slot.top },
        { x: doorStartX + width, y: slot.top },
      ], false, 'CUTOUT');
    }
  }

  // Handle
  if (handle) {
    const handleCenterY = height - handle.positionY;
    const halfLen = handle.length / 2;
    const handleX = isLeft ? doorStartX + width : doorStartX;
    doc.addLine(handleX, handleCenterY - halfLen, handleX, handleCenterY + halfLen, 'HANDLE');
    doc.addCircle(handleX, handleCenterY, 3, 'HANDLE');
  }

  // Template cutouts on door panel
  const { handleTemplateCutouts, isAbsoluteHandleTemplate, handleTemplateRefDims, slidingKitCutouts, slidingKitRefDims } = data;
  
  // Absolute handle template cutouts
  if (handleTemplateCutouts && handleTemplateCutouts.length > 0 && isAbsoluteHandleTemplate) {
    const refW = handleTemplateRefDims?.width || width;
    const refH = handleTemplateRefDims?.height || height;
    drawTemplateCutoutsOnDxfPanel(doc, handleTemplateCutouts, doorStartX, 0, width, height, refW, refH, isLeft);
  }
  // Relative handle template cutouts (around handle center)
  if (handleTemplateCutouts && handleTemplateCutouts.length > 0 && !isAbsoluteHandleTemplate && handle) {
    const handleCenterY = height - handle.positionY;
    const handleX = isLeft ? doorStartX + width : doorStartX;
    for (const cutout of handleTemplateCutouts) {
      const cx = handleX + cutout.x * (isLeft ? -1 : 1);
      const cy = handleCenterY - cutout.y; // DXF Y is inverted from template Y
      drawDxfTemplateCutout(doc, cutout, cx, cy);
    }
  }
  // Sliding kit cutouts on door
  if (slidingKitCutouts && slidingKitCutouts.length > 0) {
    const doorCutouts = slidingKitCutouts.filter(c => !c.targetPanel || c.targetPanel === 'door');
    if (doorCutouts.length > 0) {
      const refW = slidingKitRefDims?.width || width;
      const refH = slidingKitRefDims?.height || height;
      drawTemplateCutoutsOnDxfPanel(doc, doorCutouts, doorStartX, 0, width, height, refW, refH);
    }
  }

  doc.addText(doorStartX + width / 2 - 30, -15, 8, `USA ${width}x${height}`, 'DIMS');
  offsetX = doorStartX + width + PANEL_GAP;

  // ── FIXED PANEL (legacy, right of door) ──
  if (hasFixedPanel) {
    const pw = fixedPanel!.width;
    if (!isLeft) {
      drawPanelWithCutouts(doc, offsetX, 0, pw, fixedPanelH, hinges, 'left', 'FIXED');
    } else {
      doc.addRect(offsetX, 0, pw, fixedPanelH, 'FIXED');
    }
    doc.addText(offsetX + pw / 2 - 20, -15, 8, `FIX ${pw}x${fixedPanelH}`, 'DIMS');
    // Sliding kit cutouts on legacy fixed panel (treated as fixed_right)
    if (slidingKitCutouts && slidingKitCutouts.length > 0) {
      const fixedCutouts = slidingKitCutouts.filter(c => c.targetPanel === 'fixed_right');
      if (fixedCutouts.length > 0) {
        const refW = slidingKitRefDims?.width || pw;
        const refH = slidingKitRefDims?.height || fixedPanelH;
        drawTemplateCutoutsOnDxfPanel(doc, fixedCutouts, offsetX, 0, pw, fixedPanelH, refW, refH);
      }
    }
    offsetX += pw + PANEL_GAP;
  }

  // ── RIGHT FIXED PANEL ──
  if (hasRightPanel) {
    const pw = fixedPanelRight!.width;
    if (!isLeft) {
      drawPanelWithCutouts(doc, offsetX, 0, pw, fixedPanelH, hinges, 'left', 'FIXED');
    } else {
      doc.addRect(offsetX, 0, pw, fixedPanelH, 'FIXED');
    }
    doc.addText(offsetX + pw / 2 - 20, -15, 8, `FIX D ${pw}x${fixedPanelH}`, 'DIMS');
    // Sliding kit cutouts on right fixed panel
    if (slidingKitCutouts && slidingKitCutouts.length > 0) {
      const rightCutouts = slidingKitCutouts.filter(c => c.targetPanel === 'fixed_right');
      if (rightCutouts.length > 0) {
        const refW = slidingKitRefDims?.width || pw;
        const refH = slidingKitRefDims?.height || fixedPanelH;
        drawTemplateCutoutsOnDxfPanel(doc, rightCutouts, offsetX, 0, pw, fixedPanelH, refW, refH);
      }
    }
    offsetX += pw + PANEL_GAP;
  }

  // ── SIDE PANEL ──
  if (sidePanel && sidePanel.width > 0 && sidePanel.height > 0) {
    doc.addRect(offsetX, 0, sidePanel.width, sidePanel.height, 'SIDE');
    doc.addText(offsetX + sidePanel.width / 2 - 30, -15, 8, `LATERAL ${sidePanel.width}x${sidePanel.height}`, 'DIMS');
  }

  return doc.toString();
}

export function downloadDxf(data: DxfDoorData, filename: string, version: DxfVersion = 'R2010') {
  downloadDxfFile(generateDxf(data, version), filename);
}

/* ── Balustrade DXF ── */

interface BalustradePanelDxf {
  label: string;
  widthMm: number;
  heightMm: number;
  isParallelogram: boolean;
  angle: number;
}

interface BalustradeLayoutDxf {
  placement: string;
  panelCount: number;
  length: number;
  height: number;
  glassType: string;
  thickness: number;
  stairsConfig?: {
    angle: number;
    stepHeight: number;
    stepDepth: number;
    hasIntermediateLanding: boolean;
    landingLength: number;
    landingPosition: number;
    ramp1PanelCount: number;
    ramp2PanelCount: number;
    stairPanelHeight: number;
    intermediateLandingPanelHeight: number;
    finalLandingPanelHeight: number;
    finalLandingLength: number;
  };
  corners?: {
    left?: { enabled: boolean; length: number; panelCount: number };
    right?: { enabled: boolean; length: number; panelCount: number };
  };
}

function buildBalustradePanels(layout: BalustradeLayoutDxf): BalustradePanelDxf[] {
  const panels: BalustradePanelDxf[] = [];
  const isStairs = layout.placement === 'stairs' && layout.stairsConfig;
  const sc = layout.stairsConfig;

  if (isStairs && sc) {
    const ramp1Count = sc.hasIntermediateLanding ? (sc.ramp1PanelCount || layout.panelCount) : layout.panelCount;
    const ramp1TotalSteps = sc.hasIntermediateLanding ? sc.landingPosition : (layout.length / sc.stepDepth);
    const ramp1PanelW = ramp1Count > 0 ? Math.round((ramp1TotalSteps * sc.stepDepth) / ramp1Count) : ramp1TotalSteps * sc.stepDepth;
    for (let i = 0; i < ramp1Count; i++) {
      panels.push({ label: `R1-P${i + 1}`, widthMm: ramp1PanelW, heightMm: sc.stairPanelHeight, isParallelogram: true, angle: sc.angle });
    }
    if (sc.hasIntermediateLanding && sc.landingLength > 0) {
      panels.push({ label: 'Podest', widthMm: sc.landingLength, heightMm: sc.intermediateLandingPanelHeight, isParallelogram: false, angle: 0 });
    }
    if (sc.hasIntermediateLanding && sc.ramp2PanelCount > 0) {
      const totalSteps = Math.round(layout.length / sc.stepDepth);
      const ramp2Steps = totalSteps - (sc.landingPosition || 0);
      const ramp2PanelW = sc.ramp2PanelCount > 0 ? Math.round((ramp2Steps * sc.stepDepth) / sc.ramp2PanelCount) : ramp2Steps * sc.stepDepth;
      for (let i = 0; i < sc.ramp2PanelCount; i++) {
        panels.push({ label: `R2-P${i + 1}`, widthMm: ramp2PanelW, heightMm: sc.stairPanelHeight, isParallelogram: true, angle: sc.angle });
      }
    }
    if (sc.finalLandingLength > 0) {
      panels.push({ label: 'Podest final', widthMm: sc.finalLandingLength, heightMm: sc.finalLandingPanelHeight, isParallelogram: false, angle: 0 });
    }
  } else {
    const corners = layout.corners;
    if (corners?.left?.enabled) {
      const cnt = corners.left.panelCount || 1;
      const pw = Math.round(corners.left.length / cnt);
      for (let i = 0; i < cnt; i++) panels.push({ label: `CS-P${i + 1}`, widthMm: pw, heightMm: layout.height, isParallelogram: false, angle: 0 });
    }
    const frontW = Math.round(layout.length / Math.max(layout.panelCount, 1));
    for (let i = 0; i < layout.panelCount; i++) {
      panels.push({ label: `P${i + 1}`, widthMm: frontW, heightMm: layout.height, isParallelogram: false, angle: 0 });
    }
    if (corners?.right?.enabled) {
      const cnt = corners.right.panelCount || 1;
      const pw = Math.round(corners.right.length / cnt);
      for (let i = 0; i < cnt; i++) panels.push({ label: `CD-P${i + 1}`, widthMm: pw, heightMm: layout.height, isParallelogram: false, angle: 0 });
    }
  }
  return panels;
}

export function generateBalustradeDxf(layout: BalustradeLayoutDxf, version: DxfVersion = 'R2010'): string {
  const doc = createDxfDocument(version);
  doc.addLayer({ name: 'PANEL', color: DXF_COLORS.WHITE, lineWeight: 35 });
  doc.addLayer({ name: 'DIMS', color: DXF_COLORS.CYAN, lineWeight: 15 });

  const panels = buildBalustradePanels(layout);
  let offsetY = 0;

  for (const p of panels) {
    if (p.isParallelogram && p.angle > 0) {
      const rise = p.widthMm * Math.tan((p.angle * Math.PI) / 180);
      doc.addLwPolyline([
        { x: 0, y: offsetY },
        { x: p.widthMm, y: offsetY },
        { x: p.widthMm, y: offsetY + p.heightMm },
        { x: 0, y: offsetY + p.heightMm + rise },
      ], true, 'PANEL');
      doc.addText(p.widthMm / 2 - 20, offsetY - 12, 6, `${p.label} ${p.widthMm}x${p.heightMm}`, 'DIMS');
      offsetY += Math.max(p.heightMm, p.heightMm + rise) + PANEL_GAP;
    } else {
      doc.addRect(0, offsetY, p.widthMm, p.heightMm, 'PANEL');
      doc.addText(p.widthMm / 2 - 20, offsetY - 12, 6, `${p.label} ${p.widthMm}x${p.heightMm}`, 'DIMS');
      offsetY += p.heightMm + PANEL_GAP;
    }
  }

  return doc.toString();
}

export function downloadBalustradeDxf(layout: BalustradeLayoutDxf, filename: string, version: DxfVersion = 'R2010') {
  downloadDxfFile(generateBalustradeDxf(layout, version), filename);
}

/* ── Simple Glass DXF (mirrors, panels, kitchen fronts, glass walls) ── */

interface SimpleGlassDxfData {
  width: number;
  height: number;
  shape?: string;
  holeSpecs?: Array<{ diameter: number; x: number; y: number }>;
  cutoutSpecs?: Array<{ width: number; height: number; x: number; y: number }>;
  bevel?: { enabled: boolean; width: number };
  edgeCutouts?: Array<{ side: 'left' | 'right' | 'center'; verticalPosition?: 'top' | 'bottom'; depth: number; length: number; position?: number; positionX?: number }>;
}

export function generateSimpleGlassDxf(data: SimpleGlassDxfData, version: DxfVersion = 'R2010'): string {
  const doc = createDxfDocument(version);
  doc.addLayer({ name: 'GLASS', color: DXF_COLORS.WHITE, lineWeight: 35 });
  doc.addLayer({ name: 'HOLES', color: DXF_COLORS.RED, lineWeight: 25 });
  doc.addLayer({ name: 'CUTOUT', color: DXF_COLORS.YELLOW, lineWeight: 25 });
  doc.addLayer({ name: 'BEVEL', color: DXF_COLORS.CYAN, lineWeight: 15 });
  doc.addLayer({ name: 'DIMS', color: DXF_COLORS.CYAN, lineWeight: 15 });
  doc.addLayer({ name: 'EDGE_CUTOUT', color: DXF_COLORS.MAGENTA, lineWeight: 25 });

  const { width, height, shape } = data;

  // ── Glass outline ──
  if (shape === 'circle') {
    const r = Math.min(width, height) / 2;
    doc.addCircle(width / 2, height / 2, r, 'GLASS');
  } else if (shape === 'oval') {
    // Approximate oval with polyline (16 segments)
    const cx = width / 2;
    const cy = height / 2;
    const rx = width / 2;
    const ry = height / 2;
    const segments = 32;
    const verts: DxfVertex[] = [];
    for (let i = 0; i < segments; i++) {
      const angle = (2 * Math.PI * i) / segments;
      verts.push({ x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) });
    }
    doc.addLwPolyline(verts, true, 'GLASS');
  } else if (shape === 'arch') {
    // Rectangle with semicircular top
    const archR = width / 2;
    const straightH = height - archR;
    if (straightH > 0) {
      const segments = 16;
      const verts: DxfVertex[] = [];
      verts.push({ x: 0, y: 0 });
      verts.push({ x: width, y: 0 });
      verts.push({ x: width, y: straightH });
      // Arc from right to left
      for (let i = 0; i <= segments; i++) {
        const angle = (Math.PI * i) / segments;
        verts.push({ x: width / 2 + archR * Math.cos(-angle + Math.PI), y: straightH + archR * Math.sin(angle) });
      }
      verts.push({ x: 0, y: straightH });
      doc.addLwPolyline(verts, true, 'GLASS');
    } else {
      doc.addRect(0, 0, width, height, 'GLASS');
    }
  } else {
    // rectangle or rounded (DXF doesn't distinguish rounded corners for CNC)
    doc.addRect(0, 0, width, height, 'GLASS');
  }

  // ── Holes ──
  if (data.holeSpecs) {
    for (const h of data.holeSpecs) {
      const r = h.diameter / 2;
      // Template coords: x from left, y from top → DXF y from bottom
      const dxfY = height - h.y;
      doc.addCircle(h.x, dxfY, r, 'HOLES');
      // Cross marks
      const cr = r * 0.4;
      doc.addLine(h.x - cr, dxfY, h.x + cr, dxfY, 'HOLES');
      doc.addLine(h.x, dxfY - cr, h.x, dxfY + cr, 'HOLES');
    }
  }

  // ── Cutouts ──
  if (data.cutoutSpecs) {
    for (const c of data.cutoutSpecs) {
      const dxfY = height - c.y - c.height;
      doc.addRect(c.x, dxfY, c.width, c.height, 'CUTOUT');
    }
  }

  // ── Edge cutouts ──
  if (data.edgeCutouts) {
    for (const ec of data.edgeCutouts) {
      let rx = 0, ry = 0, rw = ec.depth, rh = ec.length;
      if (ec.side === 'left') {
        rx = 0;
        ry = ec.position != null ? height - ec.position - ec.length : (height - ec.length) / 2;
      } else if (ec.side === 'right') {
        rx = width - ec.depth;
        ry = ec.position != null ? height - ec.position - ec.length : (height - ec.length) / 2;
      } else {
        // center = top or bottom edge
        rw = ec.length;
        rh = ec.depth;
        const posX = ec.positionX != null ? ec.positionX : (width - ec.length) / 2;
        rx = posX;
        ry = ec.verticalPosition === 'top' ? height - ec.depth : 0;
      }
      doc.addRect(rx, ry, rw, rh, 'EDGE_CUTOUT');
    }
  }

  // ── Bevel ──
  if (data.bevel?.enabled && data.bevel.width > 0 && shape !== 'circle' && shape !== 'oval') {
    const bw = data.bevel.width;
    doc.addRect(bw, bw, width - 2 * bw, height - 2 * bw, 'BEVEL');
  }

  // ── Dimension labels ──
  doc.addText(width / 2 - 20, -15, 8, `${width}x${height}`, 'DIMS');

  return doc.toString();
}

export function downloadSimpleGlassDxf(data: SimpleGlassDxfData, filename: string, version: DxfVersion = 'R2010') {
  downloadDxfFile(generateSimpleGlassDxf(data, version), filename);
}
