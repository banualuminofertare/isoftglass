/**
 * PDF generator for processing sheets (fișe de prelucrare).
 * Replicates the SVG viewer drawing exactly: door with cutout paths,
 * fixed panels with hinge cutouts, all dimensions, handle holes, accessories table.
 */
import jsPDF from 'jspdf';
import i18next from 'i18next';
import { loadImageAsBase64 } from './pdfGenerator';
import { aggregateAccessories } from './accessoryAggregator';
import type { TemplateCutout } from '@/lib/processing/templateCutouts';

// Strip Romanian diacritics
function s(text: string): string {
  return text
    .replace(/[ăâ]/g, 'a').replace(/[ĂÂ]/g, 'A')
    .replace(/î/g, 'i').replace(/Î/g, 'I')
    .replace(/[șş]/g, 's').replace(/[ȘŞ]/g, 'S')
    .replace(/[țţ]/g, 't').replace(/[ȚŢ]/g, 'T');
}

const FIXED_PANEL_EXTRA_H = 5;
const PANEL_GAP_MM = 24;
const DIM_COLOR: [number, number, number] = [30, 64, 175];
const DOOR_COLOR: [number, number, number] = [0, 0, 0];

interface AccessoryItem {
  label: string;
  code?: string;
  detail?: string;
  imageUrl?: string | null;
}

interface PdfProcessingData {
  orderNumber?: string;
  clientName?: string;
  doorWidth: number;
  doorHeight: number; // glass height (already deducted)
  glassThickness: number;
  glassType: string;
  hingeSide: 'left' | 'right';
  hinges: {
    positions: number[];
    quantity: number;
    cutoutW: number;
    cutoutH: number;
    cutoutOffset: number;
  };
  handle?: { positionY: number; length: number; inset?: number };
  fixedPanel?: { enabled: boolean; width: number };
  fixedPanelLeft?: { enabled: boolean; width: number };
  fixedPanelRight?: { enabled: boolean; width: number };
  sidePanel?: { width: number; height: number };
  profileHeightDeduction?: number;
  lateralProfileHeightDeduction?: number;
  cabinType?: string;
  accessories?: AccessoryItem[];
  companyLogoUrl?: string;
  companyPdfLogoSize?: 'small' | 'medium' | 'large' | 'xlarge';
  companyPdfLogoPosition?: 'left' | 'center' | 'right';
  // Template cutouts for PDF rendering
  handleTemplateCutouts?: TemplateCutout[];
  isAbsoluteHandleTemplate?: boolean;
  handleTemplateRefDims?: { width: number; height: number };
  slidingKitCutouts?: TemplateCutout[];
  slidingKitRefDims?: { width: number; height: number };
}

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 12;
const DRAW_AREA_W = PAGE_W - MARGIN * 2;

// ── Header ──
async function drawHeader(doc: jsPDF, data: PdfProcessingData) {
  let contentStartX = MARGIN;
  let contentStartY = MARGIN + 5;

  // Company logo (with size + position from settings)
  if (data.companyLogoUrl) {
    try {
      const logoData = await loadImageAsBase64(data.companyLogoUrl);
      if (logoData) {
        const sizeMap: Record<string, { w: number; h: number }> = {
          small: { w: 16, h: 7 },
          medium: { w: 22, h: 10 },
          large: { w: 32, h: 14 },
          xlarge: { w: 42, h: 18 },
        };
        const { w: logoW, h: logoH } = sizeMap[data.companyPdfLogoSize || 'medium'];
        const position = data.companyPdfLogoPosition || 'left';
        let logoX = MARGIN;
        if (position === 'center') logoX = (PAGE_W - logoW) / 2;
        else if (position === 'right') logoX = PAGE_W - MARGIN - logoW;

        doc.addImage(logoData, 'PNG', logoX, MARGIN, logoW, logoH);
        if (position === 'left') {
          contentStartX = MARGIN + logoW + 3;
        } else {
          // Push title below the centered/right-aligned logo
          contentStartY = MARGIN + logoH + 5;
        }
      }
    } catch (e) {
      console.warn('Failed to load company logo for processing sheet:', e);
    }
  }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(s(i18next.t('pdf.processingSheetTitle')), contentStartX, contentStartY);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  let x = contentStartX + 45;
  if (data.orderNumber) { doc.text(`#${data.orderNumber}`, x, contentStartY); x += 20; }
  if (data.clientName) { doc.text(s(data.clientName), x, contentStartY); }

  // Glass info
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text(`${i18next.t('pdf.glassLabel')} ${data.glassThickness}mm ${s(data.glassType)}`, contentStartX, MARGIN + 10);

  doc.setDrawColor(200);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, MARGIN + 12, PAGE_W - MARGIN, MARGIN + 12);
}

// ── Dimension helpers (blue) ──
function dimH(doc: jsPDF, x1: number, y: number, x2: number, label: string, extensionY?: number) {
  doc.setDrawColor(...DIM_COLOR);
  doc.setLineWidth(0.15);
  if (extensionY !== undefined) {
    doc.line(x1, extensionY, x1, y - 1);
    doc.line(x2, extensionY, x2, y - 1);
  }
  doc.setLineWidth(0.25);
  doc.line(x1, y, x2, y);
  // Arrows
  doc.line(x1, y, x1 + 1.5, y - 0.8); doc.line(x1, y, x1 + 1.5, y + 0.8);
  doc.line(x2, y, x2 - 1.5, y - 0.8); doc.line(x2, y, x2 - 1.5, y + 0.8);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DIM_COLOR);
  doc.text(label, (x1 + x2) / 2, y - 1.2, { align: 'center' });
}

function dimV(doc: jsPDF, x: number, y1: number, y2: number, label: string, extensionX?: number) {
  doc.setDrawColor(...DIM_COLOR);
  doc.setLineWidth(0.15);
  if (extensionX !== undefined) {
    doc.line(extensionX, y1, x + 1, y1);
    doc.line(extensionX, y2, x + 1, y2);
  }
  doc.setLineWidth(0.25);
  doc.line(x, y1, x, y2);
  doc.line(x, y1, x - 0.8, y1 + 1.5); doc.line(x, y1, x + 0.8, y1 + 1.5);
  doc.line(x, y2, x - 0.8, y2 - 1.5); doc.line(x, y2, x + 0.8, y2 - 1.5);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DIM_COLOR);
  // Rotated text approximation: write next to line
  doc.text(label, x + 1.5, (y1 + y2) / 2 + 0.5);
}

// ── Draw hinge cutout shapes (white/transparent) ──
function drawCutoutOnEdge(
  doc: jsPDF, panelX: number, panelY: number, panelW: number,
  posFromTop: number, scale: number,
  cutoutW: number, cutoutH: number,
  side: 'left' | 'right'
) {
  const cy = panelY + posFromTop * scale;
  const scW = cutoutW * scale;
  const scH = cutoutH * scale;
  const cutY = cy - scH / 2;

  if (side === 'left') {
    const cx = panelX;
    // White fill to "cut" into the panel
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...DOOR_COLOR);
    doc.setLineWidth(0.3);
    doc.rect(cx, cutY, scW, scH, 'FD');
  } else {
    const cx = panelX + panelW - scW;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...DOOR_COLOR);
    doc.setLineWidth(0.3);
    doc.rect(cx, cutY, scW, scH, 'FD');
  }

  // Bracket marks (blue)
  const markLen = Math.max(1.5 * scale, 1);
  const topY = cutY;
  const botY = cutY + scH;
  doc.setDrawColor(...DIM_COLOR);
  doc.setLineWidth(0.2);

  if (side === 'left') {
    const innerX = panelX + scW;
    doc.line(innerX + markLen, topY, innerX, topY);
    doc.line(innerX, topY, innerX, topY + markLen);
    doc.line(innerX, botY - markLen, innerX, botY);
    doc.line(innerX, botY, innerX + markLen, botY);
  } else {
    const innerX = panelX + panelW - scW;
    doc.line(innerX - markLen, topY, innerX, topY);
    doc.line(innerX, topY, innerX, topY + markLen);
    doc.line(innerX, botY - markLen, innerX, botY);
    doc.line(innerX, botY, innerX - markLen, botY);
  }
}

// ── Draw template cutout shape in PDF ──
function drawPdfTemplateCutout(
  doc: jsPDF, cutout: TemplateCutout,
  cx: number, cy: number, scale: number
) {
  doc.setDrawColor(...DIM_COLOR);
  doc.setLineWidth(0.3);
  doc.setFillColor(30, 64, 175);

  if (cutout.shape === 'circle') {
    const r = (cutout.diameter / 2) * scale;
    doc.circle(cx, cy, r, 'S');
    // Cross marks
    const cr = r * 0.4;
    doc.setLineWidth(0.2);
    doc.line(cx - cr, cy, cx + cr, cy);
    doc.line(cx, cy - cr, cx, cy + cr);
  } else if (cutout.shape === 'stadium') {
    const sw = cutout.width * scale;
    const sh = cutout.height * scale;
    const rx = Math.min(sh / 2, sw / 2);
    doc.roundedRect(cx - sw / 2, cy - sh / 2, sw, sh, rx, rx, 'S');
  } else if (cutout.shape === 'rect') {
    const sw = cutout.width * scale;
    const sh = cutout.height * scale;
    doc.rect(cx - sw / 2, cy - sh / 2, sw, sh, 'S');
  } else if (cutout.shape === 'slot') {
    const sl = cutout.slotLength * scale;
    const sr = cutout.radius * scale;
    doc.roundedRect(cx - sl / 2, cy - sr, sl, sr * 2, sr, sr, 'S');
  }
}

/** Map cutout coords to panel (edge-relative) */
function mapCutoutForPdf(
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

/** Draw all template cutouts for a panel in PDF */
function drawTemplateCutoutsOnPanel(
  doc: jsPDF, cutouts: TemplateCutout[],
  panelX: number, panelY: number,
  panelW: number, panelH: number,
  refW: number, refH: number,
  scale: number, mirrorX?: boolean
) {
  for (const cutout of cutouts) {
    const mapped = mapCutoutForPdf(cutout, refW, refH, panelW, panelH, mirrorX);
    const cx = panelX + mapped.x * scale;
    const cy = panelY + mapped.y * scale;
    drawPdfTemplateCutout(doc, cutout, cx, cy, scale);
  }
}

// ── Draw door panel with all features ──
function drawDoorPanel(
  doc: jsPDF, data: PdfProcessingData,
  ox: number, oy: number, scale: number
) {
  const { doorWidth, doorHeight, hingeSide, hinges, handle } = data;
  const w = doorWidth * scale;
  const h = doorHeight * scale;
  const isLeft = hingeSide === 'left';
  const sortedPositions = [...hinges.positions].sort((a, b) => a - b);

  // Door rectangle
  doc.setDrawColor(...DOOR_COLOR);
  doc.setLineWidth(0.4);
  doc.rect(ox, oy, w, h);

  // Hinge cutouts (white)
  const cutoutSide = isLeft ? 'left' : 'right';
  for (const pos of sortedPositions) {
    drawCutoutOnEdge(doc, ox, oy, w, pos, scale, hinges.cutoutW, hinges.cutoutH, cutoutSide);
  }

  // Handle holes
  if (handle && handle.length > 0) {
    const inset = handle.inset || 0;
    const insetPx = inset * scale;
    const edgeX = isLeft ? ox + w : ox;
    const handleX = isLeft ? edgeX - insetPx : edgeX + insetPx;
    const handleCenterY = oy + h - handle.positionY * scale;
    const halfLen = (handle.length / 2) * scale;
    const holeR = Math.max(2 * scale, 1);
    const holeTopY = handleCenterY - halfLen;
    const holeBotY = handleCenterY + halfLen;

    // Drill holes
    doc.setDrawColor(...DIM_COLOR);
    doc.setLineWidth(0.3);
    doc.setFillColor(30, 64, 175, 0.15);
    doc.circle(handleX, holeTopY, holeR, 'S');
    doc.circle(handleX, holeBotY, holeR, 'S');
    // Cross marks
    const cr = holeR * 0.4;
    doc.setLineWidth(0.2);
    doc.line(handleX - cr, holeTopY, handleX + cr, holeTopY);
    doc.line(handleX, holeTopY - cr, handleX, holeTopY + cr);
    doc.line(handleX - cr, holeBotY, handleX + cr, holeBotY);
    doc.line(handleX, holeBotY - cr, handleX, holeBotY + cr);
    // Dashed connecting line
    doc.setLineDashPattern([0.8, 0.6], 0);
    doc.line(handleX, holeTopY + holeR, handleX, holeBotY - holeR);
    doc.setLineDashPattern([], 0);

    // Handle spacing dimension
    const side = isLeft ? 1 : -1;
    const dimL1 = edgeX + side * 12;
    doc.setDrawColor(...DIM_COLOR);
    doc.setLineWidth(0.15);
    doc.setLineDashPattern([0.5, 0.5], 0);
    doc.line(handleX, holeTopY, dimL1, holeTopY);
    doc.line(handleX, holeBotY, dimL1, holeBotY);
    doc.setLineDashPattern([], 0);
    doc.setLineWidth(0.25);
    doc.line(dimL1, holeTopY, dimL1, holeBotY);
    doc.line(dimL1, holeTopY, dimL1 - 0.6, holeTopY + 1.2);
    doc.line(dimL1, holeTopY, dimL1 + 0.6, holeTopY + 1.2);
    doc.line(dimL1, holeBotY, dimL1 - 0.6, holeBotY - 1.2);
    doc.line(dimL1, holeBotY, dimL1 + 0.6, holeBotY - 1.2);
    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DIM_COLOR);
    doc.text(`${handle.length}`, dimL1 + side * 1.5, (holeTopY + holeBotY) / 2 + 0.5);

    // Handle center from bottom dimension
    const dimL2 = edgeX + side * 20;
    const bottomY = oy + h;
    doc.setDrawColor(...DIM_COLOR);
    doc.setLineWidth(0.15);
    doc.setLineDashPattern([0.5, 0.5], 0);
    doc.line(handleX, handleCenterY, dimL2, handleCenterY);
    doc.setLineDashPattern([], 0);
    doc.setLineWidth(0.25);
    doc.line(dimL2, bottomY, dimL2, handleCenterY);
    doc.line(dimL2, bottomY, dimL2 - 0.6, bottomY - 1.2);
    doc.line(dimL2, bottomY, dimL2 + 0.6, bottomY - 1.2);
    doc.line(dimL2, handleCenterY, dimL2 - 0.6, handleCenterY + 1.2);
    doc.line(dimL2, handleCenterY, dimL2 + 0.6, handleCenterY + 1.2);
    doc.text(`${handle.positionY}`, dimL2 + side * 1.5, (bottomY + handleCenterY) / 2 + 0.5);

    // Inset dimension (if > 0)
    if (inset > 0) {
      doc.setLineWidth(0.15);
      doc.line(edgeX, holeBotY + 3, handleX, holeBotY + 3);
      doc.line(edgeX, holeBotY + 1, edgeX, holeBotY + 4);
      doc.line(handleX, holeBotY + holeR + 0.5, handleX, holeBotY + 4);
      doc.text(`${inset}`, (edgeX + handleX) / 2, holeBotY + 6, { align: 'center' });
    }
  }

  // Template cutouts on door panel
  // Absolute handle template cutouts
  if (data.handleTemplateCutouts && data.handleTemplateCutouts.length > 0 && data.isAbsoluteHandleTemplate) {
    const refW = data.handleTemplateRefDims?.width || doorWidth;
    const refH = data.handleTemplateRefDims?.height || doorHeight;
    drawTemplateCutoutsOnPanel(doc, data.handleTemplateCutouts, ox, oy, doorWidth, doorHeight, refW, refH, scale, isLeft);
  }
  // Relative handle template cutouts (around handle center)
  if (data.handleTemplateCutouts && data.handleTemplateCutouts.length > 0 && !data.isAbsoluteHandleTemplate && handle) {
    const handleCenterY = oy + h - handle.positionY * scale;
    const inset = handle.inset || 0;
    const edgeX = isLeft ? ox + w : ox;
    const handleX = isLeft ? edgeX - inset * scale : edgeX + inset * scale;
    for (const cutout of data.handleTemplateCutouts) {
      const cx = handleX + cutout.x * scale * (isLeft ? -1 : 1);
      const cy = handleCenterY + cutout.y * scale;
      drawPdfTemplateCutout(doc, cutout, cx, cy, scale);
    }
  }
  // Sliding kit cutouts on door
  if (data.slidingKitCutouts && data.slidingKitCutouts.length > 0) {
    const doorCutouts = data.slidingKitCutouts.filter(c => !c.targetPanel || c.targetPanel === 'door');
    if (doorCutouts.length > 0) {
      const refW = data.slidingKitRefDims?.width || doorWidth;
      const refH = data.slidingKitRefDims?.height || doorHeight;
      drawTemplateCutoutsOnPanel(doc, doorCutouts, ox, oy, doorWidth, doorHeight, refW, refH, scale);
    }
  }

  // Width and height dimensions are drawn by the caller for proper exterior placement

  // Hinge position dimensions (staggered, from top, on hinge side)
  for (let i = 0; i < sortedPositions.length; i++) {
    const posFromTop = sortedPositions[i];
    const cy = oy + posFromTop * scale;
    const hingeEdge = isLeft ? ox : ox + w;
    const xOff = isLeft ? ox - 5 - i * 6 : ox + w + 5 + i * 6;

    doc.setDrawColor(...DIM_COLOR);
    doc.setLineWidth(0.1);
    doc.setLineDashPattern([0.5, 0.5], 0);
    doc.line(hingeEdge, cy, xOff, cy);
    doc.line(hingeEdge, oy, xOff, oy);
    doc.setLineDashPattern([], 0);
    doc.setLineWidth(0.2);
    doc.line(xOff, oy, xOff, cy);
    doc.line(xOff, oy, xOff - 0.5, oy + 1.2);
    doc.line(xOff, oy, xOff + 0.5, oy + 1.2);
    doc.line(xOff, cy, xOff - 0.5, cy - 1.2);
    doc.line(xOff, cy, xOff + 0.5, cy - 1.2);
    doc.setFontSize(5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DIM_COLOR);
    doc.text(`${Math.round(posFromTop)}`, xOff - 1.5, (oy + cy) / 2 + 0.5, { align: 'right' });
  }

  // Label below
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(s(i18next.t('pdf.movingDoor')), ox + w / 2, oy + h + 5, { align: 'center' });
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text(`${doorWidth} x ${doorHeight} mm`, ox + w / 2, oy + h + 8.5, { align: 'center' });
}

// ── Draw fixed panel ──
function drawFixedPanel(
  doc: jsPDF, data: PdfProcessingData,
  label: string, panelW: number, panelH: number,
  ox: number, oy: number, scale: number,
  hasHingeCutouts: boolean, cutoutSide: 'left' | 'right'
) {
  const w = panelW * scale;
  const h = panelH * scale;

  doc.setDrawColor(...DOOR_COLOR);
  doc.setLineWidth(0.4);
  doc.rect(ox, oy, w, h);

  // Sliding kit cutouts on fixed panel
  const targetPanelType = cutoutSide === 'left' ? 'fixed_right' : 'fixed_left';
  if (data.slidingKitCutouts && data.slidingKitCutouts.length > 0) {
    const fixedCutouts = data.slidingKitCutouts.filter(c => c.targetPanel === targetPanelType);
    if (fixedCutouts.length > 0) {
      const refW = data.slidingKitRefDims?.width || panelW;
      const refH = data.slidingKitRefDims?.height || panelH;
      drawTemplateCutoutsOnPanel(doc, fixedCutouts, ox, oy, panelW, panelH, refW, refH, scale);
    }
  }

  if (hasHingeCutouts) {
    const sortedPositions = [...data.hinges.positions].sort((a, b) => a - b);
    for (const pos of sortedPositions) {
      drawCutoutOnEdge(doc, ox, oy, w, pos, scale, data.hinges.cutoutW, data.hinges.cutoutH, cutoutSide);
    }
  }

  // Width and height dimensions are drawn by the caller for proper exterior placement

  // Label below panel with dimensions
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(s(label), ox + w / 2, oy + h + 5, { align: 'center' });
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`${panelW} x ${panelH} mm`, ox + w / 2, oy + h + 8.5, { align: 'center' });
}

// ── Draw simple rect panel (side panel) ──
function drawSidePanel(
  doc: jsPDF, panelW: number, panelH: number,
  ox: number, oy: number, scale: number
) {
  const w = panelW * scale;
  const h = panelH * scale;

  doc.setDrawColor(...DOOR_COLOR);
  doc.setLineWidth(0.4);
  doc.rect(ox, oy, w, h);

  dimH(doc, ox, oy - 4, ox + w, `${panelW}`, oy);
  dimV(doc, ox + w + 6, oy, oy + h, `${panelH}`, ox + w);

  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(s(i18next.t('pdf.sidePanel')), ox + w / 2, oy + h / 2 - 2, { align: 'center' });
  doc.text('(FIX)', ox + w / 2, oy + h / 2 + 2, { align: 'center' });

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(s(i18next.t('pdf.sidePanelFixed')), ox + w / 2, oy + h + 5, { align: 'center' });
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text(`${panelW} x ${panelH} mm`, ox + w / 2, oy + h + 8.5, { align: 'center' });
}

// ── Pre-load images for accessories ──
async function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

// ── Draw accessories table (professional layout with photos) ──
function drawAccessories(doc: jsPDF, rawAccessories: AccessoryItem[], startY: number, imageCache: Map<string, HTMLImageElement>): number {
  const accessories = aggregateAccessories(rawAccessories);
  if (!accessories || accessories.length === 0) return startY;

  const ROW_H = 14; // row height to fit thumbnail
  const IMG_SIZE = 10; // thumbnail size
  const COL_IMG_X = MARGIN + 1;
  const COL_CODE_X = MARGIN + 14;
  const COL_NAME_X = MARGIN + 50;
  const COL_DETAIL_X = MARGIN + 120;
  const TABLE_W = PAGE_W - MARGIN * 2;

  let y = startY;

  // Check if we need a new page
  const estimatedHeight = 10 + accessories.length * ROW_H;
  if (y + estimatedHeight > PAGE_H - MARGIN - 10) {
    doc.addPage();
    y = MARGIN + 5;
  }

  // Section title
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(s(i18next.t('pdf.accessories')), MARGIN, y);
  y += 4;

  // Table header
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(MARGIN, y, TABLE_W, 6, 'F');
  doc.setDrawColor(200, 210, 220);
  doc.setLineWidth(0.2);
  doc.rect(MARGIN, y, TABLE_W, 6, 'S');

  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text(s(i18next.t('pdf.photo')), COL_IMG_X + 1, y + 4);
  doc.text(s(i18next.t('pdf.productCode')), COL_CODE_X, y + 4);
  doc.text(s(i18next.t('pdf.productName')), COL_NAME_X, y + 4);
  doc.text(s(i18next.t('pdf.detailsCol')), COL_DETAIL_X, y + 4);
  y += 6;

  // Table rows
  for (let i = 0; i < accessories.length; i++) {
    const item = accessories[i];

    // Page break check
    if (y + ROW_H > PAGE_H - MARGIN - 8) {
      doc.addPage();
      y = MARGIN + 5;
    }

    // Alternate row background
    if (i % 2 === 0) {
      doc.setFillColor(249, 250, 251); // gray-50
      doc.rect(MARGIN, y, TABLE_W, ROW_H, 'F');
    }

    // Row border
    doc.setDrawColor(230, 232, 236);
    doc.setLineWidth(0.1);
    doc.line(MARGIN, y + ROW_H, MARGIN + TABLE_W, y + ROW_H);

    // Thumbnail image
    const imgY = y + (ROW_H - IMG_SIZE) / 2;
    if (item.imageUrl) {
      const cachedImg = imageCache.get(item.imageUrl);
      if (cachedImg) {
        try {
          doc.addImage(cachedImg, 'JPEG', COL_IMG_X, imgY, IMG_SIZE, IMG_SIZE);
        } catch {
          // Draw placeholder
          doc.setDrawColor(200);
          doc.setLineWidth(0.2);
          doc.rect(COL_IMG_X, imgY, IMG_SIZE, IMG_SIZE, 'S');
          doc.setFontSize(4);
          doc.setTextColor(180);
          doc.text('N/A', COL_IMG_X + IMG_SIZE / 2, imgY + IMG_SIZE / 2 + 1, { align: 'center' });
        }
      } else {
        // Placeholder
        doc.setDrawColor(200);
        doc.setLineWidth(0.2);
        doc.rect(COL_IMG_X, imgY, IMG_SIZE, IMG_SIZE, 'S');
      }
    } else {
      // Empty placeholder box
      doc.setDrawColor(220);
      doc.setFillColor(245, 245, 245);
      doc.setLineWidth(0.15);
      doc.rect(COL_IMG_X, imgY, IMG_SIZE, IMG_SIZE, 'FD');
      doc.setFontSize(4);
      doc.setTextColor(180);
      doc.text('-', COL_IMG_X + IMG_SIZE / 2, imgY + IMG_SIZE / 2 + 1, { align: 'center' });
    }

    const textY = y + ROW_H / 2 + 1;

    // Code
    if (item.code) {
      doc.setFontSize(6);
      doc.setFont('courier', 'bold');
      doc.setTextColor(30, 64, 175);
      doc.text(item.code, COL_CODE_X, textY);
    }

    // Name / label
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    const labelText = s(item.label);
    // Truncate if too long
    const maxLabelW = COL_DETAIL_X - COL_NAME_X - 3;
    const truncLabel = doc.getStringUnitWidth(labelText) * 6.5 / doc.internal.scaleFactor > maxLabelW
      ? labelText.substring(0, 35) + '...' : labelText;
    doc.text(truncLabel, COL_NAME_X, textY);

    // Detail
    if (item.detail) {
      doc.setFontSize(5.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      const detailText = s(item.detail);
      const maxDetailW = MARGIN + TABLE_W - COL_DETAIL_X - 2;
      const truncDetail = doc.getStringUnitWidth(detailText) * 5.5 / doc.internal.scaleFactor > maxDetailW
        ? detailText.substring(0, 30) + '...' : detailText;
      doc.text(truncDetail, COL_DETAIL_X, textY);
    }

    y += ROW_H;
  }

  // Bottom border
  doc.setDrawColor(200, 210, 220);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, y, MARGIN + TABLE_W, y);

  return y;
}

// ── Main PDF generator (async for image preloading) ──
export async function generateProcessingSheetPdf(data: PdfProcessingData): Promise<jsPDF> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Pre-load all accessory images
  const imageCache = new Map<string, HTMLImageElement>();
  if (data.accessories && data.accessories.length > 0) {
    const imageUrls = data.accessories
      .map(a => a.imageUrl)
      .filter((url): url is string => !!url);
    const uniqueUrls = [...new Set(imageUrls)];
    const results = await Promise.all(uniqueUrls.map(async (url) => {
      const img = await loadImage(url);
      return { url, img };
    }));
    for (const { url, img } of results) {
      if (img) imageCache.set(url, img);
    }
  }

  const isLeft = data.hingeSide === 'left';
  const fixedPanelH = data.doorHeight + FIXED_PANEL_EXTRA_H - (data.profileHeightDeduction || 0);

  const hasLeftPanel = data.fixedPanelLeft?.enabled && data.fixedPanelLeft.width > 0;
  const hasFixedPanel = data.fixedPanel?.enabled && data.fixedPanel.width > 0;
  const hasRightPanel = data.fixedPanelRight?.enabled && data.fixedPanelRight.width > 0;
  const hasSidePanel = data.sidePanel && data.sidePanel.width > 0 && data.sidePanel.height > 0;

  // Header
  await drawHeader(doc, data);

  // Calculate layout
  const drawStartY = MARGIN + 16;
  const dimMarginH = 30;
  const dimMarginR = 25;
  const labelSpace = 12;
  const panelGapPdf = 6;

  interface PanelDef {
    type: 'door' | 'fixed' | 'side';
    realW: number;
    realH: number;
    label: string;
    hasHingeCutouts?: boolean;
    cutoutSide?: 'left' | 'right';
  }
  const topPanels: PanelDef[] = [];

  if (hasLeftPanel) {
    topPanels.push({
      type: 'fixed', realW: data.fixedPanelLeft!.width, realH: fixedPanelH,
      label: 'FIX S', hasHingeCutouts: isLeft, cutoutSide: 'right',
    });
  }

  topPanels.push({ type: data.cabinType === 'fixed_panel' ? 'fixed' as const : 'door' as const, realW: data.doorWidth, realH: data.doorHeight, label: data.cabinType === 'fixed_panel' ? 'PANOU FIX' : 'USA MOBILA' });

  if (hasFixedPanel) {
    topPanels.push({
      type: 'fixed', realW: data.fixedPanel!.width, realH: fixedPanelH,
      label: 'FIX', hasHingeCutouts: !isLeft, cutoutSide: 'left',
    });
  }

  if (hasRightPanel) {
    topPanels.push({
      type: 'fixed', realW: data.fixedPanelRight!.width, realH: fixedPanelH,
      label: 'FIX D', hasHingeCutouts: !isLeft, cutoutSide: 'left',
    });
  }

  const totalRealWidth = topPanels.reduce((sum, p) => sum + p.realW, 0);
  const maxRealHeight = Math.max(...topPanels.map(p => p.realH));
  const totalGaps = (topPanels.length - 1) * panelGapPdf;
  const availW = DRAW_AREA_W - dimMarginH - dimMarginR - totalGaps;
  const availH = (hasSidePanel ? 100 : 160);

  const scaleW = availW / totalRealWidth;
  const scaleH = availH / maxRealHeight;
  const pdfScale = Math.min(scaleW, scaleH);

  // Push panels down to leave room for width dims above
  const widthDimSpace = topPanels.length > 1 ? 18 : 10;
  const panelY = drawStartY + widthDimSpace;

  // Track panel positions for exterior dimension drawing
  const panelPositions: { x: number; w: number; realW: number; realH: number; type: string }[] = [];
  let cx = MARGIN + dimMarginH;

  for (const p of topPanels) {
    const pw = p.realW * pdfScale;
    panelPositions.push({ x: cx, w: pw, realW: p.realW, realH: p.realH, type: p.type });
    if (p.type === 'door') {
      drawDoorPanel(doc, data, cx, panelY, pdfScale);
    } else if (p.type === 'fixed') {
      drawFixedPanel(doc, data, p.label, p.realW, p.realH, cx, panelY, pdfScale, p.hasHingeCutouts || false, p.cutoutSide || 'left');
    }
    cx += pw + panelGapPdf;
  }

  // ── WIDTH DIMENSIONS (above panels) ──
  for (const pp of panelPositions) {
    dimH(doc, pp.x, panelY - 5, pp.x + pp.w, `${pp.realW}`, panelY);
  }
  if (topPanels.length > 1) {
    const totalW = topPanels.reduce((s, p) => s + p.realW, 0);
    const startX = panelPositions[0].x;
    const lastP = panelPositions[panelPositions.length - 1];
    const endX = lastP.x + lastP.w;
    dimH(doc, startX, panelY - 12, endX, `${totalW}`, panelY);
  }

  // ── HEIGHT DIMENSIONS (exterior only - left and right sides) ──
  {
    const firstP = panelPositions[0];
    const h = firstP.realH * pdfScale;
    dimV(doc, firstP.x - 6, panelY, panelY + h, `${firstP.realH}`, firstP.x);
    // If first panel is fixed and door has different height, add door height dim
    if (firstP.type === 'fixed' && data.doorHeight !== firstP.realH) {
      const doorH = data.doorHeight * pdfScale;
      dimV(doc, firstP.x - 14, panelY, panelY + doorH, `${data.doorHeight}`, firstP.x);
    }
  }
  if (panelPositions.length > 1) {
    const lastP = panelPositions[panelPositions.length - 1];
    const h = lastP.realH * pdfScale;
    dimV(doc, lastP.x + lastP.w + 6, panelY, panelY + h, `${lastP.realH}`, lastP.x + lastP.w);
    // If last panel is fixed and door has different height, add door height dim
    if (lastP.type === 'fixed' && data.doorHeight !== lastP.realH) {
      const doorH = data.doorHeight * pdfScale;
      dimV(doc, lastP.x + lastP.w + 14, panelY, panelY + doorH, `${data.doorHeight}`, lastP.x + lastP.w);
    }
  }

  let currentY = panelY + maxRealHeight * pdfScale + labelSpace;

  if (hasSidePanel) {
    const sp = data.sidePanel!;
    currentY += 8;
    const spScale = Math.min(pdfScale, (DRAW_AREA_W - dimMarginH - dimMarginR) / sp.width, 50 / sp.height);
    drawSidePanel(doc, sp.width, sp.height, MARGIN + dimMarginH, currentY, spScale);
    currentY += sp.height * spScale + labelSpace;
  }

  // Accessories table
  currentY += 5;
  if (data.accessories && data.accessories.length > 0) {
    drawAccessories(doc, data.accessories, currentY, imageCache);
  }

  // Footer on each page
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(6);
    doc.setTextColor(156, 163, 175);
    doc.text(`${i18next.t('pdf.page')} ${p} / ${totalPages}`, PAGE_W / 2, PAGE_H - 6, { align: 'center' });
  }

  return doc;
}

export async function downloadProcessingSheetPdf(data: PdfProcessingData, filename: string) {
  const doc = await generateProcessingSheetPdf(data);
  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}
