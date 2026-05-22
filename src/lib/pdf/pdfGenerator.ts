import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ro, enUS, de, it, pl } from 'date-fns/locale';
import i18next from 'i18next';
import type { OrderProduct } from '@/hooks/useOrders';
import { supabase } from '@/integrations/supabase/client';
import { aggregateAccessories } from './accessoryAggregator';

const DATE_LOCALES = { ro, en: enUS, de, it, pl } as const;
function getDateLocale() {
  return DATE_LOCALES[i18next.language as keyof typeof DATE_LOCALES] || ro;
}

// Pivot & amortizor codes – shown only in production sheets, hidden from client quotes
const PIVOT_CODES = new Set([
  'PT10', 'PT20', 'PT40', 'BTS', 'US10', 'GK30', 'BLOC',
  'PT62', 'PT70', 'PT41', 'PT24', 'PT25', 'PT21', 'RST85', 'PT30', '01.106',
]);

// Strip Romanian diacritics for jsPDF compatibility (Helvetica doesn't support them)
function s(text: string): string {
  return text
    .replace(/[ăâ]/g, 'a').replace(/[ĂÂ]/g, 'A')
    .replace(/î/g, 'i').replace(/Î/g, 'I')
    .replace(/[șş]/g, 's').replace(/[ȘŞ]/g, 'S')
    .replace(/[țţ]/g, 't').replace(/[ȚŢ]/g, 'T');
}

// ── Rich-text HTML → jsPDF renderer ──
// Supports: <strong>, <em>, <u>, <span style="font-size:...">
// Also handles <p>, <br>, <ul>/<ol>/<li>
function parseCssColor(input: string): [number, number, number] | null {
  if (!input) return null;
  const v = input.trim();
  // #RGB or #RRGGBB
  const hex = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  // rgb()/rgba()
  const rgb = v.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgb) return [parseInt(rgb[1], 10), parseInt(rgb[2], 10), parseInt(rgb[3], 10)];
  return null;
}

function renderHtmlToPdf(
  doc: jsPDF,
  html: string,
  x: number,
  startY: number,
  maxWidth: number,
  baseSize: number = 9,
  baseColor: [number, number, number] = [51, 65, 85],
): number {
  // If no HTML tags, render as plain text
  if (!html || !/<[a-z][\s\S]*>/i.test(html)) {
    doc.setFontSize(baseSize);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...baseColor);
    const lines = doc.splitTextToSize(s(html || ''), maxWidth);
    doc.text(lines, x, startY);
    return startY + lines.length * (baseSize * 0.45) + 2;
  }

  let yPos = startY;
  const lineHeight = baseSize * 0.45;

  // Parse HTML into simple segments
  const tempDiv = typeof document !== 'undefined' ? document.createElement('div') : null;
  if (!tempDiv) {
    // SSR fallback: strip tags and render plain
    const plain = html.replace(/<[^>]+>/g, '');
    doc.setFontSize(baseSize);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...baseColor);
    const lines = doc.splitTextToSize(s(plain), maxWidth);
    doc.text(lines, x, yPos);
    return yPos + lines.length * lineHeight + 2;
  }

  tempDiv.innerHTML = html;

  const processNode = (
    node: Node,
    isBold = false,
    isItalic = false,
    isUnder = false,
    fontSize = baseSize,
    listType: string | null = null,
    listIndex = 0,
    textColor: [number, number, number] = baseColor,
    highlightColor: [number, number, number] | null = null,
    align: 'left' | 'center' | 'right' | 'justify' = 'left',
  ) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      if (!text.trim() && !text.includes(' ')) return;

      doc.setFontSize(fontSize);
      const style = isBold && isItalic ? 'bolditalic' : isBold ? 'bold' : isItalic ? 'italic' : 'normal';
      doc.setFont('helvetica', style);
      doc.setTextColor(...textColor);

      const currentLineHeight = fontSize * 0.45;
      const effectiveWidth = maxWidth - (listType ? 8 : 0);
      const lines = doc.splitTextToSize(s(text), effectiveWidth);
      const baseX = listType ? x + 8 : x;

      // Render with optional highlight + alignment
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineWidth = doc.getTextWidth(line);
        let lineX = baseX;
        if (align === 'center') lineX = baseX + (effectiveWidth - lineWidth) / 2;
        else if (align === 'right') lineX = baseX + (effectiveWidth - lineWidth);
        const lineY = yPos + i * currentLineHeight;

        if (highlightColor) {
          doc.setFillColor(...highlightColor);
          doc.rect(lineX - 0.3, lineY - currentLineHeight * 0.75, lineWidth + 0.6, currentLineHeight * 0.95, 'F');
        }

        doc.setTextColor(...textColor);
        doc.text(line, lineX, lineY);

        if (isUnder) {
          doc.setDrawColor(...textColor);
          doc.setLineWidth(0.2);
          doc.line(lineX, lineY + 0.5, lineX + lineWidth, lineY + 0.5);
        }
      }

      yPos += lines.length * currentLineHeight;
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    let newBold = isBold;
    let newItalic = isItalic;
    let newUnder = isUnder;
    let newSize = fontSize;
    let newColor = textColor;
    let newHighlight = highlightColor;
    let newAlign = align;

    if (tag === 'strong' || tag === 'b') newBold = true;
    if (tag === 'em' || tag === 'i') newItalic = true;
    if (tag === 'u') newUnder = true;
    if (tag === 'mark') {
      const bg = el.style.backgroundColor || '#FEF08A';
      const rgb = parseCssColor(bg);
      if (rgb) newHighlight = rgb;
    }
    if (tag === 'h1') { newBold = true; newSize = baseSize * 1.5; }
    if (tag === 'h2') { newBold = true; newSize = baseSize * 1.25; }
    if (tag === 'h3') { newBold = true; newSize = baseSize * 1.1; }
    if (tag === 'a') {
      newUnder = true;
      newColor = [37, 99, 235];
    }

    // Read inline style: color + text-align (paragraphs/headings)
    const styleColor = el.style?.color;
    if (styleColor) {
      const rgb = parseCssColor(styleColor);
      if (rgb) newColor = rgb;
    }
    const styleAlign = el.style?.textAlign as 'left' | 'center' | 'right' | 'justify';
    if (styleAlign && ['left', 'center', 'right', 'justify'].includes(styleAlign)) {
      newAlign = styleAlign;
    }

    if (tag === 'span') {
      const fs = el.style.fontSize;
      if (fs) {
        const px = parseFloat(fs);
        if (!isNaN(px) && px > 0) {
          // Map editor px → PDF pt. Editor default 13px corresponds to baseSize.
          // Use a proportional scale so all editor sizes (8..32) map smoothly.
          const EDITOR_DEFAULT_PX = 13;
          const scaled = (px / EDITOR_DEFAULT_PX) * baseSize;
          // Clamp to a reasonable PDF range
          newSize = Math.max(5, Math.min(28, Math.round(scaled * 10) / 10));
        }
      }
    }

    if (tag === 'br') {
      yPos += lineHeight;
      return;
    }

    if (tag === 'hr') {
      yPos += lineHeight * 0.4;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.line(x, yPos, x + maxWidth, yPos);
      yPos += lineHeight * 0.7;
      return;
    }

    if (tag === 'blockquote') {
      const startQY = yPos;
      el.childNodes.forEach((child) => {
        processNode(child, newBold, newItalic, newUnder, newSize, listType, listIndex, newColor, newHighlight, newAlign);
      });
      // Draw left border
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.6);
      doc.line(x + 1, startQY - lineHeight * 0.6, x + 1, yPos);
      yPos += lineHeight * 0.3;
      return;
    }

    if (tag === 'p') {
      if (yPos > startY) yPos += lineHeight * 0.3;
    }

    if (tag === 'ul' || tag === 'ol') {
      let idx = 0;
      el.childNodes.forEach((child) => {
        if ((child as HTMLElement).tagName?.toLowerCase() === 'li') {
          idx++;
          const bullet = tag === 'ul' ? '•  ' : `${idx}. `;
          doc.setFontSize(fontSize);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...newColor);
          doc.text(s(bullet), x, yPos);
          (child as HTMLElement).childNodes.forEach((liChild) => {
            processNode(liChild, newBold, newItalic, newUnder, newSize, tag, idx, newColor, newHighlight, newAlign);
          });
          yPos += lineHeight * 0.3;
        }
      });
      return;
    }

    el.childNodes.forEach((child) => {
      processNode(child, newBold, newItalic, newUnder, newSize, listType, listIndex, newColor, newHighlight, newAlign);
    });

    if (tag === 'p' || tag === 'h1' || tag === 'h2' || tag === 'h3') {
      yPos += lineHeight * 0.3;
    }
  };

  tempDiv.childNodes.forEach((child) => {
    processNode(child);
  });

  return yPos + 2;
}

// Product type labels for display
function getProductTypeLabels(): Record<string, string> {
  const t = i18next.t.bind(i18next);
  return {
    shower: t('pdf.productTypes.shower'),
    balustrade: t('pdf.productTypes.balustrade'),
    mirror: t('pdf.productTypes.mirror'),
    panel: t('pdf.productTypes.panel'),
    door: t('pdf.productTypes.door'),
    kitchen_front: t('pdf.productTypes.kitchen_front'),
  };
}

interface CompanyInfo {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  cui?: string;
  bankAccount?: string;
  logoUrl?: string;
  presentationText?: string;
  quoteFooterText?: string;
  pdfLogoSize?: 'small' | 'medium' | 'large' | 'xlarge';
  pdfLogoPosition?: 'left' | 'center' | 'right';
}

// Resolve logo dimensions and X position based on user preferences
export function resolveLogoLayout(
  pageWidth: number,
  pdfLogoSize?: 'small' | 'medium' | 'large' | 'xlarge',
  pdfLogoPosition?: 'left' | 'center' | 'right',
  baseSize: number = 22,
  marginX: number = 20
): { size: number; x: number; position: 'left' | 'center' | 'right' } {
  const sizeMap: Record<string, number> = {
    small: baseSize * 0.7,
    medium: baseSize,
    large: baseSize * 1.45,
    xlarge: baseSize * 1.9,
  };
  const size = sizeMap[pdfLogoSize || 'medium'] ?? baseSize;
  const position = pdfLogoPosition || 'left';
  let x = marginX;
  if (position === 'center') x = (pageWidth - size) / 2;
  else if (position === 'right') x = pageWidth - marginX - size;
  return { size, x, position };
}

// Helper to load image as base64 for jsPDF (with retry + canvas fallback)
const IMG_TIMEOUT_MS = 5000;

export async function loadImageAsBase64(url: string): Promise<string | null> {
  // Attempt 1: fetch
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), IMG_TIMEOUT_MS);
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(tid);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      if (blob.type.includes('text/html')) throw new Error('Got HTML instead of image');
      return await new Promise<string | null>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.warn(`loadImageAsBase64 attempt ${attempt + 1} failed for ${url}:`, err);
      if (attempt === 0) await new Promise(r => setTimeout(r, 500));
    }
  }
  // Fallback: Image + canvas (handles CORS differently)
  try {
    return await new Promise<string | null>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      const timeout = setTimeout(() => { resolve(null); }, IMG_TIMEOUT_MS);
      img.onload = () => {
        clearTimeout(timeout);
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) { resolve(null); return; }
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } catch { resolve(null); }
      };
      img.onerror = () => { clearTimeout(timeout); resolve(null); };
      img.src = url;
    });
  } catch {
    console.error('loadImageAsBase64: all attempts failed for', url);
    return null;
  }
}

interface ClientInfo {
  name: string;
  company_name?: string;
  address?: string;
  phone?: string;
  email?: string;
  cui?: string;
}

interface OrderInfo {
  order_number: string;
  created_at: string;
  delivery_date?: string;
  delivery_address?: string;
  notes?: string;
  subtotal: number;
  discount_percent?: number;
  discount_amount?: number;
  tax_percent?: number;
  tax_amount?: number;
  total: number;
}

// Format configuration for display
function formatConfiguration(config: Record<string, unknown>): string[] {
  const lines: string[] = [];
  
  // Dimensions
  if (config.dimensions) {
    const dims = config.dimensions as Record<string, number>;
    if (dims.width && dims.height) {
      lines.push(`${i18next.t('pdf.configLabels.dimensions')} ${dims.width} x ${dims.height} mm`);
    }
    if (dims.length && dims.height && !dims.width) {
      lines.push(`${i18next.t('pdf.configLabels.dimensions')} ${dims.length} x ${dims.height} mm`);
    }
    if (dims.quantity && dims.quantity > 1) {
      lines.push(`${i18next.t('pdf.configLabels.panelQty')} ${dims.quantity} buc`);
    }
  }
  
  // Glass
  if (config.glass) {
    const glass = config.glass as Record<string, unknown>;
    const glassParts: string[] = [];
    if (glass.thickness) glassParts.push(`${glass.thickness}mm`);
    if (glass.type) glassParts.push(getGlassTypeLabel(glass.type as string));
    if (glass.tempered) glassParts.push(i18next.t('pdf.configLabels.tempered'));
    if (glassParts.length > 0) {
      lines.push(`${i18next.t('pdf.configLabels.glass')} ${glassParts.join(', ')}`);
    }
  }
  
  // Cabin type
  if (config.cabinType) {
    lines.push(`${i18next.t('pdf.configLabels.cabinType')} ${getCabinTypeLabel(config.cabinType as string)}`);
  }
  
  // Door type
  if (config.doorType) {
    lines.push(`${i18next.t('pdf.configLabels.doorType')} ${getDoorTypeLabel(config.doorType as string)}`);
  }
  
  // Accessories
  if (config.accessories) {
    const acc = config.accessories as Record<string, unknown>;
    if (acc.hinges) {
      const hinges = acc.hinges as Record<string, unknown>;
      if (hinges.type) {
        lines.push(`${i18next.t('pdf.configLabels.hinges')} ${hinges.type}`);
      }
    }
    if (acc.handle) {
      const handle = acc.handle as Record<string, unknown>;
      if (handle.type) {
        lines.push(`${i18next.t('pdf.configLabels.handle')} ${handle.type}`);
      }
    }
  }
  
  // Edge polish
  if (config.edgePolish) {
    const edge = config.edgePolish as Record<string, unknown>;
    if (edge.enabled) {
      lines.push(`${i18next.t('pdf.configLabels.edgePolish')} ${edge.type || 'standard'}`);
    }
  }
  
  return lines.length > 0 ? lines : [i18next.t('pdf.configLabels.standardConfig')];
}

function getGlassTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    clear: i18next.t('pdf.glassTypes.clear'),
    frosted: i18next.t('pdf.glassTypes.frosted'),
    bronze: i18next.t('pdf.glassTypes.bronze'),
    grey: i18next.t('pdf.glassTypes.grey'),
    green: i18next.t('pdf.glassTypes.green'),
    low_e: 'low-e',
  };
  return labels[type] || type;
}

function getCabinTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    corner_square: i18next.t('pdf.cabinTypes.corner_square'),
    corner_rectangle: i18next.t('pdf.cabinTypes.corner_rectangle'),
    niche: i18next.t('pdf.cabinTypes.niche'),
    walkin: i18next.t('pdf.cabinTypes.walkin'),
    'u-shape': i18next.t('pdf.cabinTypes.u-shape'),
  };
  return labels[type] || type;
}

function getDoorTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    hinged: i18next.t('pdf.doorTypes.hinged'),
    sliding: i18next.t('pdf.doorTypes.sliding'),
    pivot: i18next.t('pdf.doorTypes.pivot'),
    folding: i18next.t('pdf.doorTypes.folding'),
  };
  return labels[type] || type;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat(i18next.language === 'en' ? 'en-US' : i18next.language === 'de' ? 'de-DE' : i18next.language === 'it' ? 'it-IT' : i18next.language === 'pl' ? 'pl-PL' : 'ro-RO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export async function generateQuotePDF(
  company: CompanyInfo,
  client: ClientInfo | null,
  order: OrderInfo,
  products: OrderProduct[],
  currencyOptions?: { currencyLabel?: string; convertFn?: (v: number) => number },
  preResolvedMaterialMap?: Map<string, { name: string; image_url: string | null }>,
  liveTotals?: { liveOrderSubtotal: number; liveProductLineTotals: Record<string, number> }
): Promise<jsPDF> {
  const cLabel = currencyOptions?.currencyLabel || 'RON';
  const cConvert = currencyOptions?.convertFn || ((v: number) => v);
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ── Pre-process: collect all materialCodes and fetch from DB ──
  const allCodes: string[] = [];
  products.forEach(p => {
    const codes = extractMaterialCodes((p.full_config || p.configuration) as Record<string, unknown>);
    allCodes.push(...codes);
  });

  const uniqueCodes = [...new Set(allCodes)].filter(Boolean);
  // Generate parent codes (strip last segment) for variant code fallback
  const parentCodesSet = new Set<string>();
  uniqueCodes.forEach(code => {
    const parts = code.split('.');
    if (parts.length > 2) parentCodesSet.add(parts.slice(0, -1).join('.'));
  });
  const allQueryCodes = [...new Set([...uniqueCodes, ...parentCodesSet])];
  const materialMap = new Map<string, { name: string; image_url: string | null }>();
  const imageCache = new Map<string, string | null>();

  if (preResolvedMaterialMap) {
    for (const [k, v] of preResolvedMaterialMap) materialMap.set(k, { name: v.name, image_url: v.image_url });
    // Parent code fallback for codes without images
    for (const code of allQueryCodes) {
      const entry = materialMap.get(code);
      if (entry && !entry.image_url && code.includes('.')) {
        let parent = code;
        while (parent.includes('.')) {
          parent = parent.replace(/\.[^.]+$/, '');
          const parentEntry = materialMap.get(parent);
          if (parentEntry?.image_url) { entry.image_url = parentEntry.image_url; break; }
        }
      }
    }
  } else if (allQueryCodes.length > 0) {
    const { data: materials } = await supabase
      .from('materials')
      .select('code, name, image_url')
      .in('code', allQueryCodes);

    if (materials) {
      for (const m of materials) {
        materialMap.set(m.code, { name: m.name, image_url: m.image_url });
      }
    }
    const codesNeedingData = allQueryCodes.filter(c => {
      const existing = materialMap.get(c);
      return !existing || !existing.image_url;
    });
    if (codesNeedingData.length > 0) {
      const { data: pricingData } = await supabase
        .from('pricing_config')
        .select('code, name, image_url')
        .in('code', codesNeedingData);
      if (pricingData) {
        for (const p of pricingData) {
          const existing = materialMap.get(p.code);
          if (!existing) {
            materialMap.set(p.code, { name: p.name || p.code, image_url: p.image_url || null });
          } else if (!existing.image_url && p.image_url) {
            existing.image_url = p.image_url;
          }
        }
      }
    }
  }

  if (materialMap.size > 0) {
    const imageLoadPromises: Array<Promise<void>> = [];
    for (const m of materialMap.values()) {
      if (m.image_url) {
        const url = m.image_url;
        if (!imageCache.has(url)) {
          imageLoadPromises.push(
            loadImageAsBase64(url).then(data => { imageCache.set(url, data); })
          );
        }
      }
    }
    await Promise.all(imageLoadPromises);
  }
  
  // Logo + Header with company info (professional layout)
  const logoLayout = resolveLogoLayout(pageWidth, company.pdfLogoSize, company.pdfLogoPosition, 22, 20);
  const logoSize = logoLayout.size;
  let logoLoaded = false;
  if (company.logoUrl) {
    const logoData = await loadImageAsBase64(company.logoUrl);
    if (logoData) {
      try {
        doc.addImage(logoData, 'AUTO', logoLayout.x, 12, logoSize, logoSize);
        logoLoaded = true;
      } catch { /* skip if image fails */ }
    }
  }

  // Text starts after logo only when logo is on the left; otherwise use default left margin
  const textStartX = (logoLoaded && logoLayout.position === 'left') ? 20 + logoSize + 6 : 20;
  // When logo is centered/right or no logo, push text below the logo block
  const textStartY = (logoLoaded && logoLayout.position !== 'left') ? 12 + logoSize + 8 : 20;
  
  // Company name – next to logo
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(s(company.name), textStartX, textStartY);

  // Company details – next to logo, below name
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  let headerY = textStartY + 5;
  const detailParts: string[] = [];
  if (company.cui) detailParts.push(`CUI: ${company.cui}`);
  if (company.phone) detailParts.push(`Tel: ${company.phone}`);
  if (company.email) detailParts.push(`Email: ${company.email}`);
  if (detailParts.length > 0) {
    doc.text(detailParts.join('  |  '), textStartX, headerY);
    headerY += 4;
  }
  if (company.address) {
    doc.text(s(company.address), textStartX, headerY);
    headerY += 4;
  }
  if (company.bankAccount) {
    doc.text(`IBAN: ${company.bankAccount}`, textStartX, headerY);
    headerY += 4;
  }

  // yPos after header block (below logo or text, whichever is taller)
  let yPos = Math.max(logoLoaded ? 12 + logoSize + 4 : 20, headerY + 2);

  // Presentation text
  if (company.presentationText) {
    yPos = renderHtmlToPdf(doc, company.presentationText, 20, yPos, pageWidth / 2 - 10, 7.5, [71, 85, 105]);
  }
  
  // Quote title – right-aligned at top
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text(s(i18next.t('pdf.quoteTitle')), pageWidth - 20, 16, { align: 'right' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`Nr. ${order.order_number}`, pageWidth - 20, 22, { align: 'right' });
  doc.text(`${i18next.t('pdf.date')}: ${s(format(new Date(order.created_at), 'dd MMMM yyyy', { locale: getDateLocale() }))}`, pageWidth - 20, 27, { align: 'right' });
  
  // Separator
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 5;
  
  // Client info
  yPos += 5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text(s(i18next.t('pdf.client')), 20, yPos);
  
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  if (client) {
    doc.setFont('helvetica', 'bold');
    doc.text(s(client.company_name || client.name), 20, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    if (client.company_name && client.name) {
      doc.text(`${i18next.t('pdf.representative')} ${s(client.name)}`, 20, yPos);
      yPos += 5;
    }
    if (client.address) { doc.text(s(client.address), 20, yPos); yPos += 5; }
    if (client.phone) { doc.text(`Tel: ${client.phone}`, 20, yPos); yPos += 5; }
    if (client.cui) { doc.text(`CUI: ${client.cui}`, 20, yPos); }
  } else {
    doc.text(s(i18next.t('pdf.unspecifiedClient')), 20, yPos);
  }
  
  // Delivery info on the right
  if (order.delivery_date || order.delivery_address) {
    const rightX = pageWidth / 2 + 10;
    let rightY = 65;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(s(i18next.t('pdf.delivery')), rightX, rightY);
    rightY += 7;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    if (order.delivery_date) {
      doc.text(`${i18next.t('pdf.date')}: ${s(format(new Date(order.delivery_date), 'dd MMMM yyyy', { locale: getDateLocale() }))}`, rightX, rightY);
      rightY += 5;
    }
    if (order.delivery_address) {
      const addressLines = doc.splitTextToSize(s(order.delivery_address), 70);
      doc.text(addressLines, rightX, rightY);
    }
  }
  
  // ── Products – detailed per product (no individual prices) ──
  yPos = Math.max(yPos, 95) + 15;

  const ensureSpace = (needed: number) => {
    if (yPos + needed > pageHeight - 40) {
      doc.addPage();
      yPos = 20;
    }
  };

  // Helper to draw accessory table with images for quotes
  const drawAccessoryTable = (
    rows: Array<{ code: string; description: string; quantity: string; imageUrl: string | null }>,
    title: string,
    titleColor: [number, number, number] = [59, 130, 246]
  ) => {
    if (rows.length === 0) return;
    ensureSpace(20 + rows.length * 12);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...titleColor);
    doc.text(title, 25, yPos);
    yPos += 3;

    autoTable(doc, {
      startY: yPos,
      head: [['', i18next.t('pdf.code'), i18next.t('pdf.description'), i18next.t('pdf.qty')]],
      body: rows.map(row => ['', row.code, row.description, row.quantity]),
      theme: 'grid',
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontStyle: 'bold',
        fontSize: 7,
      },
      bodyStyles: { fontSize: 7, textColor: [15, 23, 42], minCellHeight: 12 },
      columnStyles: {
        0: { cellWidth: 14, halign: 'center' },
        1: { cellWidth: 30 },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 18, halign: 'center' },
      },
      margin: { left: 25, right: 25 },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 0) {
          const rowIndex = data.row.index;
          const row = rows[rowIndex];
          if (row?.imageUrl) {
            const imgData = imageCache.get(row.imageUrl);
            if (imgData) {
              try {
                doc.addImage(imgData, 'AUTO', data.cell.x + 1, data.cell.y + 1, 10, 10);
              } catch { /* skip */ }
            }
          }
        }
      },
      didDrawPage: (data) => {
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.text(`${i18next.t('pdf.page')} ${data.pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      },
    });

    // @ts-expect-error jspdf-autotable adds this property
    yPos = doc.lastAutoTable.finalY + 5;
  };

  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    const config = (product.full_config || product.configuration) as Record<string, unknown>;

    ensureSpace(60);

    // Product header bar
    doc.setFillColor(59, 130, 246);
    doc.roundedRect(20, yPos, pageWidth - 40, 10, 2, 2, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`${index + 1}. ${s(getProductTypeLabels()[product.product_type] || product.product_type)}`, 25, yPos + 7);
    doc.text(`${i18next.t('pdf.quantity')} ${product.quantity}`, pageWidth - 35, yPos + 7, { align: 'right' });
    yPos += 15;

    // ── DIMENSIUNI ──
    const dims = config.dimensions as Record<string, number> | undefined;
    if (dims) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 130, 246);
      doc.text(s(i18next.t('pdf.dimensions')), 25, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      const parts: string[] = [];
      if (dims.width && dims.height && dims.depth) {
        parts.push(`${dims.width} x ${dims.height} x ${dims.depth} mm`);
      } else if (dims.width && dims.height) {
        parts.push(`${dims.width} x ${dims.height} mm`);
      } else if (dims.length && dims.height) {
        parts.push(`${dims.length} x ${dims.height} mm`);
      }
      if (dims.doorWidth) parts.push(`${i18next.t('pdf.configLabels.door')} ${dims.doorWidth} mm`);
      doc.text(parts.join('  |  '), 25, yPos);
      yPos += 7;
    }

    // ── STICLA ──
    const glass = config.glass as Record<string, unknown> | undefined;
    if (glass) {
      ensureSpace(15);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 130, 246);
      doc.text(s(i18next.t('pdf.glass')), 25, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      const glassParts: string[] = [];
      if (glass.thickness) glassParts.push(`${glass.thickness}mm`);
      if (glass.type) glassParts.push(getGlassTypeLabel(String(glass.type)));
      if (glass.tempered) glassParts.push(i18next.t('pdf.configLabels.tempered'));
      if (glass.laminated) glassParts.push(i18next.t('pdf.configLabels.laminated'));
      if (glass.antiCalc) glassParts.push(i18next.t('pdf.configLabels.antiCalc'));
      doc.text(glassParts.join(', '), 25, yPos);
      yPos += 7;
    }

    // ── PRELUCRARI ──
    const edgePolish = config.edgePolish as Record<string, unknown> | undefined;
    if (edgePolish?.enabled) {
      ensureSpace(15);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 130, 246);
      doc.text(s(i18next.t('pdf.processing')), 25, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(`${i18next.t('pdf.configLabels.polishing')} ${getEdgePolishLabel(String(edgePolish.type || 'standard'))}`, 25, yPos);
      yPos += 7;
    }

    // ── Cabin & Door type ──
    if (config.cabinType || config.doorType) {
      ensureSpace(12);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 130, 246);
      doc.text(s(i18next.t('pdf.configType')), 25, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      const typeParts: string[] = [];
      if (config.cabinType) typeParts.push(`${i18next.t('pdf.configLabels.cabin')} ${s(getCabinTypeLabel(String(config.cabinType)))}`);
      if (config.doorType) typeParts.push(`${i18next.t('pdf.configLabels.doorType')} ${s(getDoorTypeLabel(String(config.doorType)))}`);
      doc.text(typeParts.join('  |  '), 25, yPos);
      yPos += 7;
    }

    // ── Mirror type ──
    if (config.mirrorType) {
      ensureSpace(12);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 130, 246);
      doc.text(s(i18next.t('pdf.mirrorType')), 25, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      const mirrorLabels: Record<string, string> = { silver: i18next.t('pdf.mirrorLabels.silver'), bronze: i18next.t('pdf.mirrorLabels.bronze'), grey: i18next.t('pdf.mirrorLabels.grey') };
      doc.text(mirrorLabels[String(config.mirrorType)] || String(config.mirrorType), 25, yPos);
      yPos += 7;
    }

    // ── 3D Snapshot from saved config (after specs, before accessories) ──
    const fullConfig = product.full_config as Record<string, unknown> | undefined;
    const savedSnapshot = fullConfig?.snapshotBase64 as string | undefined;
    if (savedSnapshot) {
      const imgWidth = 80;
      const imgHeight = 53;
      ensureSpace(imgHeight + 10);
      try {
        const xCenter = (pageWidth - imgWidth) / 2;
        doc.addImage(savedSnapshot, 'PNG', xCenter, yPos, imgWidth, imgHeight);
        yPos += imgHeight + 5;
      } catch { /* skip if image fails */ }
    }

    // ── ACCESORII ──
    const accRows = aggregateAccessories(buildAccessoryRows(config, materialMap));
    drawAccessoryTable(accRows, 'ACCESORII');

    // ── GARNITURI ──
    const sealRows = buildSealsInfo(config, materialMap);
    drawAccessoryTable(sealRows, 'GARNITURI');

    // ── ACCESORII SUPLIMENTARE (exclude pivot codes from client quote) ──
    const extraRows = buildExtraAccessories(config, materialMap, true);
    drawAccessoryTable(extraRows, 'ACCESORII SUPLIMENTARE');

    // ── LED (for mirrors) ──
    const led = config.led as Record<string, unknown> | undefined;
    if (led && led.type && led.type !== 'none') {
      ensureSpace(12);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 130, 246);
      doc.text(s(i18next.t('pdf.led')), 25, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      const ledLabels: Record<string, string> = { perimeter: i18next.t('pdf.ledLabels.perimeter'), integrated: i18next.t('pdf.ledLabels.integrated'), with_defogging: i18next.t('pdf.ledLabels.with_defogging') };
      doc.text(ledLabels[String(led.type)] || String(led.type), 25, yPos);
      yPos += 7;
    }

    yPos += 5;
  }
  
  // ── Totals section (no individual prices, only final amounts) ──
  ensureSpace(80);
  
  const totalsX = pageWidth - 70;
  const effectiveSubtotal = liveTotals?.liveOrderSubtotal ?? order.subtotal;
  const effectiveDiscount = order.discount_percent
    ? effectiveSubtotal * (order.discount_percent / 100)
    : (order.discount_amount || 0);
  
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(s(i18next.t('pdf.subtotal')), totalsX, yPos);
  doc.setTextColor(15, 23, 42);
  doc.text(`${formatPrice(cConvert(effectiveSubtotal))} ${cLabel}`, pageWidth - 20, yPos, { align: 'right' });
  
  if (effectiveDiscount > 0) {
    yPos += 6;
    doc.setTextColor(34, 197, 94);
    doc.text(`${i18next.t('pdf.discount')} (${order.discount_percent}%):`, totalsX, yPos);
    doc.text(`-${formatPrice(cConvert(effectiveDiscount))} ${cLabel}`, pageWidth - 20, yPos, { align: 'right' });
  }
  
  const taxPercent = order.tax_percent || 19;
  const subtotalAfterDiscount = effectiveSubtotal - effectiveDiscount;
  const computedTax = subtotalAfterDiscount * (taxPercent / 100);
  const computedTotal = subtotalAfterDiscount + computedTax;

  yPos += 6;
  doc.setTextColor(100, 116, 139);
  doc.text(`${i18next.t('pdf.vat')} (${taxPercent}%):`, totalsX, yPos);
  doc.setTextColor(15, 23, 42);
  doc.text(`${formatPrice(cConvert(computedTax))} ${cLabel}`, pageWidth - 20, yPos, { align: 'right' });
  
  yPos += 8;
  doc.setDrawColor(226, 232, 240);
  doc.line(totalsX - 10, yPos, pageWidth - 20, yPos);
  
  yPos += 8;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text(s(i18next.t('pdf.totalWithVat')), totalsX, yPos);
  doc.text(`${formatPrice(cConvert(computedTotal))} ${cLabel}`, pageWidth - 20, yPos, { align: 'right' });
  
  // Notes
  if (order.notes) {
    yPos += 20;
    ensureSpace(50);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(s(i18next.t('pdf.notes')), 20, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    const noteLines = doc.splitTextToSize(s(order.notes), pageWidth - 40);
    doc.text(noteLines, 20, yPos);
  }
  
  // Custom quote footer text
  if (company.quoteFooterText) {
    yPos += 15;
    yPos = renderHtmlToPdf(doc, company.quoteFooterText, 20, yPos, pageWidth - 40, 9, [51, 65, 85]);
    yPos += 3;
  }

  // Footer timestamp
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text(
    `${i18next.t('pdf.generatedAt')} ${format(new Date(), 'dd.MM.yyyy HH:mm')} | ${s(company.name)}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );
  
  return doc;
}

// =============================================
// Quick Quote PDF (from calculator, no order)
// =============================================

export interface QuickQuoteInput {
  company: CompanyInfo;
  productType: string;
  configDetails: { label: string; value: string }[];
  price: {
    glass: number;
    processing: number;
    accessories: number;
    labor: number;
    total: number;
  };
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  tvaPercent?: number;
  snapshotBase64?: string;
  customAmount?: number;
  markupPercent?: number;
  currencyLabel?: string;
  convertFn?: (v: number) => number;
}

export async function generateQuickQuotePDF(input: QuickQuoteInput): Promise<jsPDF> {
  const { company, productType, configDetails, price, clientName, clientPhone, clientEmail, tvaPercent = 21, snapshotBase64, customAmount = 0, markupPercent = 0, currencyLabel: cLabel = 'RON', convertFn: cConvert = (v: number) => v } = input;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const now = new Date();
  const refNumber = `OFR-${format(now, 'yyyyMMdd')}-${format(now, 'HHmm')}`;

  // ── 1. Logo + Header (professional layout) ──
  const logoLayout = resolveLogoLayout(pageWidth, company.pdfLogoSize, company.pdfLogoPosition, 22, 20);
  const logoSize = logoLayout.size;
  let logoLoaded = false;
  if (company.logoUrl) {
    const logoData = await loadImageAsBase64(company.logoUrl);
    if (logoData) {
      try {
        doc.addImage(logoData, 'AUTO', logoLayout.x, 12, logoSize, logoSize);
        logoLoaded = true;
      } catch { /* skip */ }
    }
  }

  const textStartX = (logoLoaded && logoLayout.position === 'left') ? 20 + logoSize + 6 : 20;
  const textStartY = (logoLoaded && logoLayout.position !== 'left') ? 12 + logoSize + 8 : 20;

  // Company name – next to logo
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(s(company.name), textStartX, textStartY);

  // Company details – compact line next to logo
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  let headerY = textStartY + 5;
  const detailParts: string[] = [];
  if (company.cui) detailParts.push(`CUI: ${company.cui}`);
  if (company.phone) detailParts.push(`Tel: ${company.phone}`);
  if (company.email) detailParts.push(`Email: ${company.email}`);
  if (detailParts.length > 0) {
    doc.text(detailParts.join('  |  '), textStartX, headerY);
    headerY += 4;
  }
  if (company.address) {
    doc.text(s(company.address), textStartX, headerY);
    headerY += 4;
  }

  // yPos after header block
  let yPos = Math.max(logoLoaded ? 12 + logoSize + 4 : 20, headerY + 2);

  // ── Presentation text ──
  if (company.presentationText) {
    yPos = renderHtmlToPdf(doc, company.presentationText, 20, yPos, pageWidth - 40, 7.5, [71, 85, 105]);
  }

  // ── 3. Title – centered ──
  yPos = Math.max(yPos, 55);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, pageWidth - 20, yPos);

  yPos += 12;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text(s(i18next.t('pdf.quoteTitle')), pageWidth / 2, yPos, { align: 'center' });

  yPos += 8;
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(s(productType), pageWidth / 2, yPos, { align: 'center' });

  yPos += 7;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Ref: ${refNumber}  |  Data: ${s(format(now, 'dd MMMM yyyy', { locale: getDateLocale() }))}`, pageWidth / 2, yPos, { align: 'center' });

  yPos += 8;
  doc.setDrawColor(226, 232, 240);
  doc.line(20, yPos, pageWidth - 20, yPos);

  // ── 4. Client info (if provided) ──
  yPos += 10;
  if (clientName || clientPhone || clientEmail) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(s(i18next.t('pdf.client')), 20, yPos);
    yPos += 6;
    doc.setTextColor(15, 23, 42);
    if (clientName) {
      doc.text(s(clientName), 20, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 5;
    }
    if (clientPhone) {
      doc.setFont('helvetica', 'normal');
      doc.text(`Tel: ${clientPhone}`, 20, yPos);
      yPos += 5;
    }
    if (clientEmail) {
      doc.setFont('helvetica', 'normal');
      doc.text(`Email: ${clientEmail}`, 20, yPos);
      yPos += 5;
    }
    yPos += 5;
  }

  // ── 5. Specificații tehnice ──
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(s(i18next.t('pdf.techSpecs')), 20, yPos);

  autoTable(doc, {
    startY: yPos + 5,
    head: [[i18next.t('pdf.specification'), i18next.t('pdf.details')]],
    body: configDetails.map(d => [s(d.label), s(d.value)]),
    theme: 'striped',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: { fontSize: 9, textColor: [15, 23, 42] },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
    margin: { left: 20, right: 20 },
  });

  // ── 6. Accesorii din configDetails (extract materialCodes, fetch images) ──
  // @ts-expect-error jspdf-autotable adds this property
  yPos = doc.lastAutoTable.finalY + 10;

  // ── 3D Snapshot ──
  if (snapshotBase64) {
    const imgWidth = 90;
    const imgHeight = 60;
    const pageHeight = doc.internal.pageSize.getHeight();
    if (yPos + imgHeight + 10 > pageHeight - 40) {
      doc.addPage();
      yPos = 20;
    }
    try {
      const xCenter = (pageWidth - imgWidth) / 2;
      doc.addImage(snapshotBase64, 'PNG', xCenter, yPos, imgWidth, imgHeight);
      yPos += imgHeight + 10;
    } catch { /* skip if image fails */ }
  }

  // Extract material codes from configDetails values (format: "Code - Name" or just code)
  const quickMaterialCodes: string[] = [];
  configDetails.forEach(d => {
    // Check for material codes in value (patterns like 30.XX, 11.XX, 50.XX etc.)
    const codeMatch = d.value.match(/^(\d{2}\.\S+)/);
    if (codeMatch) quickMaterialCodes.push(codeMatch[1]);
  });

  const quickUniqueCodes = [...new Set(quickMaterialCodes)].filter(Boolean);
  const quickMaterialMap = new Map<string, { name: string; image_url: string | null }>();
  const quickImageCache = new Map<string, string | null>();

  if (quickUniqueCodes.length > 0) {
    const { data: qMaterials } = await supabase
      .from('materials')
      .select('code, name, image_url')
      .in('code', quickUniqueCodes);

    if (qMaterials) {
      for (const m of qMaterials) {
        quickMaterialMap.set(m.code, { name: m.name, image_url: m.image_url });
      }
    }

    const imgPromises: Array<Promise<void>> = [];
    for (const m of quickMaterialMap.values()) {
      if (m.image_url && !quickImageCache.has(m.image_url)) {
        imgPromises.push(
          loadImageAsBase64(m.image_url).then(data => { quickImageCache.set(m.image_url!, data); })
        );
      }
    }
    await Promise.all(imgPromises);
  }

  // Build accessory rows from configDetails that have material codes
  const quickAccRows: Array<{ code: string; description: string; quantity: string; imageUrl: string | null }> = [];
  configDetails.forEach(d => {
    const codeMatch = d.value.match(/^(\d{2}\.\S+)/);
    if (codeMatch) {
      const code = codeMatch[1];
      const mat = quickMaterialMap.get(code);
      quickAccRows.push({
        code,
        description: s(mat?.name || d.label),
        quantity: d.value.includes('buc') ? d.value.split('-').pop()?.trim() || '1 buc' : '1 buc',
        imageUrl: mat?.image_url || null,
      });
    }
  });

  if (quickAccRows.length > 0) {
    const accPageHeight = doc.internal.pageSize.getHeight();
    if (yPos + 20 + quickAccRows.length * 12 > accPageHeight - 40) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(s(i18next.t('pdf.accessories')), 20, yPos);
    yPos += 3;

    autoTable(doc, {
      startY: yPos,
      head: [['', i18next.t('pdf.code'), i18next.t('pdf.description'), i18next.t('pdf.qty')]],
      body: quickAccRows.map(row => ['', row.code, row.description, row.quantity]),
      theme: 'grid',
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontStyle: 'bold',
        fontSize: 8,
      },
      bodyStyles: { fontSize: 8, textColor: [15, 23, 42], minCellHeight: 12 },
      columnStyles: {
        0: { cellWidth: 14, halign: 'center' },
        1: { cellWidth: 30 },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 20, halign: 'center' },
      },
      margin: { left: 20, right: 20 },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 0) {
          const rowIndex = data.row.index;
          const row = quickAccRows[rowIndex];
          if (row?.imageUrl) {
            const imgData = quickImageCache.get(row.imageUrl);
            if (imgData) {
              try {
                doc.addImage(imgData, 'AUTO', data.cell.x + 1, data.cell.y + 1, 10, 10);
              } catch { /* skip */ }
            }
          }
        }
      },
    });

    // @ts-expect-error jspdf-autotable adds this property
    yPos = doc.lastAutoTable.finalY + 10;
  }

  // ── 7. Totaluri cu TVA (fara detaliere preturi pe componente) ──

  const qPageHeight = doc.internal.pageSize.getHeight();
  const spaceNeededForTotals = 70;

  if (yPos + spaceNeededForTotals > qPageHeight - 40) {
    doc.addPage();
    yPos = 20;
  }

  doc.setDrawColor(226, 232, 240);
  doc.line(pageWidth - 100, yPos, pageWidth - 20, yPos);

  const subtotalWithCustom = price.total + (customAmount || 0);
  const afterMarkup = subtotalWithCustom * (1 + (markupPercent || 0) / 100);
  const tvaAmount = afterMarkup * (tvaPercent / 100);
  const totalWithTVA = afterMarkup + tvaAmount;

  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(s(i18next.t('pdf.subtotalNoVat')), pageWidth - 100, yPos);
  doc.setTextColor(15, 23, 42);
  doc.text(`${formatPrice(cConvert(afterMarkup))} ${cLabel}`, pageWidth - 20, yPos, { align: 'right' });

  yPos += 6;
  doc.setTextColor(100, 116, 139);
  doc.text(`${i18next.t('pdf.vat')} ${tvaPercent}%:`, pageWidth - 100, yPos);
  doc.setTextColor(15, 23, 42);
  doc.text(`${formatPrice(cConvert(tvaAmount))} ${cLabel}`, pageWidth - 20, yPos, { align: 'right' });

  yPos += 8;
  doc.setDrawColor(226, 232, 240);
  doc.line(pageWidth - 100, yPos, pageWidth - 20, yPos);

  yPos += 8;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text(s(i18next.t('pdf.total')), pageWidth - 100, yPos);
  doc.text(`${formatPrice(cConvert(totalWithTVA))} ${cLabel}`, pageWidth - 20, yPos, { align: 'right' });

  // ── Quote footer text (custom) ──
  if (company.quoteFooterText) {
    yPos += 15;
    yPos = renderHtmlToPdf(doc, company.quoteFooterText, 20, yPos, pageWidth - 40, 9, [51, 65, 85]);
    yPos += 3;
  }

  // ── 8. Footer ──
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text(
    `${i18next.t('pdf.generatedAt')} ${format(now, 'dd.MM.yyyy HH:mm')} | ${s(company.name)}`,
    pageWidth / 2,
    qPageHeight - 10,
    { align: 'center' }
  );

  return doc;
}

// Helper: extract all materialCodes from a configuration object
function extractMaterialCodes(config: Record<string, unknown>): string[] {
  const codes: string[] = [];
  const acc = config.accessories as Record<string, unknown> | undefined;
  if (acc) {
    const pushCode = (obj: Record<string, unknown> | undefined) => {
      if (obj?.materialCode && typeof obj.materialCode === 'string') codes.push(obj.materialCode);
      // Also collect from selections arrays
      const sels = obj?.selections as Array<Record<string, unknown>> | undefined;
      if (Array.isArray(sels)) sels.forEach(s => { if (s.materialCode && typeof s.materialCode === 'string') codes.push(s.materialCode); });
    };

    pushCode(acc.hinges as Record<string, unknown> | undefined);
    pushCode(acc.handle as Record<string, unknown> | undefined);
    pushCode(acc.profiles as Record<string, unknown> | undefined);

    // Stabilizers array
    const stabilizers = acc.stabilizers as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(stabilizers)) {
      stabilizers.forEach(st => pushCode(st));
    }

    // Stabilizer selections
    const stabSelections = acc.stabilizerSelections as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(stabSelections)) {
      stabSelections.forEach(st => {
        if (st.materialCode && typeof st.materialCode === 'string') codes.push(st.materialCode);
      });
    }

    // ── Door-specific: lock, pivot, sliding system ──
    const lock = acc.lock as Record<string, unknown> | undefined;
    if (lock?.enabled && typeof lock.materialCode === 'string') codes.push(lock.materialCode);

    const pivot = acc.pivot as Record<string, unknown> | undefined;
    if (pivot && typeof pivot.materialCode === 'string') codes.push(pivot.materialCode);

    const slidingSystem = acc.slidingSystem as Record<string, unknown> | undefined;
    if (slidingSystem && typeof slidingSystem.materialCode === 'string') codes.push(slidingSystem.materialCode);

    // ── Balustrade-specific: mountPoints, handrail, uProfile ──
    const mountPoints = acc.mountPoints as Record<string, unknown> | undefined;
    if (mountPoints) {
      const mpCodes = mountPoints.materialCodes as string[] | undefined;
      if (Array.isArray(mpCodes)) mpCodes.forEach(c => { if (c) codes.push(c); });
      else if (typeof mountPoints.materialCode === 'string') codes.push(mountPoints.materialCode);
    }

    const handrail = acc.handrail as Record<string, unknown> | undefined;
    if (handrail) {
      const hrCodes = handrail.materialCodes as string[] | undefined;
      if (Array.isArray(hrCodes)) hrCodes.forEach(c => { if (c) codes.push(c); });
      else if (typeof handrail.materialCode === 'string') codes.push(handrail.materialCode);
    }

    const uProfile = acc.uProfile as Record<string, unknown> | undefined;
    if (uProfile) {
      const upCodes = uProfile.materialCodes as string[] | undefined;
      if (Array.isArray(upCodes)) upCodes.forEach(c => { if (c) codes.push(c); });
      else if (typeof uProfile.materialCode === 'string') codes.push(uProfile.materialCode);
    }

    // Seals
    const seals = acc.seals as Record<string, unknown> | undefined;
    if (seals) {
      if (seals.magneticMaterialCode && typeof seals.magneticMaterialCode === 'string') codes.push(seals.magneticMaterialCode);
      if (seals.rubberMaterialCode && typeof seals.rubberMaterialCode === 'string') codes.push(seals.rubberMaterialCode);
      if (seals.thresholdMaterialCode && typeof seals.thresholdMaterialCode === 'string') codes.push(seals.thresholdMaterialCode);
      if (seals.lateralMaterialCode && typeof seals.lateralMaterialCode === 'string') codes.push(seals.lateralMaterialCode);
      // Seal selections arrays
      const pushSealSels = (key: string) => {
        const sels = seals[key] as Array<Record<string, unknown>> | undefined;
        if (Array.isArray(sels)) sels.forEach(s => { if (s.materialCode && typeof s.materialCode === 'string') codes.push(s.materialCode); });
      };
      pushSealSels('magneticSelections');
      pushSealSels('rubberSelections');
      pushSealSels('thresholdSelections');
      pushSealSels('lateralSelections');
    }

    // Extra accessories (top-level under accessories)
    const extras = acc.extraAccessories as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(extras)) {
      extras.forEach(e => {
        if (e.materialCode && typeof e.materialCode === 'string') codes.push(e.materialCode);
      });
    }
  }

  // ── Balustrade cornerConnector (lives under dimensions) ──
  const dims = config.dimensions as Record<string, unknown> | undefined;
  if (dims) {
    const cc = dims.cornerConnector as Record<string, unknown> | undefined;
    if (cc) {
      const ccCodes = cc.materialCodes as string[] | undefined;
      if (Array.isArray(ccCodes)) ccCodes.forEach(c => { if (c) codes.push(c); });
      else if (typeof cc.materialCode === 'string') codes.push(cc.materialCode);
    }
  }

  // ── lateralConfig accessories ──
  const lateral = config.lateralConfig as Record<string, unknown> | undefined;
  if (lateral?.enabled) {
    const pushCode = (obj: Record<string, unknown> | undefined) => {
      if (obj?.materialCode && typeof obj.materialCode === 'string') codes.push(obj.materialCode);
      // Also extract from selections arrays
      const sels = obj?.selections as Array<Record<string, unknown>> | undefined;
      if (Array.isArray(sels)) sels.forEach(s => { if (s.materialCode && typeof s.materialCode === 'string') codes.push(s.materialCode); });
    };
    pushCode(lateral.hinges as Record<string, unknown> | undefined);
    pushCode(lateral.handle as Record<string, unknown> | undefined);
    const latSeals = lateral.seals as Record<string, unknown> | undefined;
    if (latSeals) {
      if (latSeals.magneticMaterialCode && typeof latSeals.magneticMaterialCode === 'string') codes.push(latSeals.magneticMaterialCode);
      if (latSeals.rubberMaterialCode && typeof latSeals.rubberMaterialCode === 'string') codes.push(latSeals.rubberMaterialCode);
      if (latSeals.thresholdMaterialCode && typeof latSeals.thresholdMaterialCode === 'string') codes.push(latSeals.thresholdMaterialCode);
      // Also from selections
      const pushSealSels = (key: string) => {
        const sels = latSeals[key] as Array<Record<string, unknown>> | undefined;
        if (Array.isArray(sels)) sels.forEach(s => { if (s.materialCode && typeof s.materialCode === 'string') codes.push(s.materialCode); });
      };
      pushSealSels('magneticSelections');
      pushSealSels('rubberSelections');
      pushSealSels('thresholdSelections');
    }
  }

  // Top-level extraAccessories (panel config)
  const topExtras = config.extraAccessories as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(topExtras)) {
    topExtras.forEach(e => {
      if (e.materialCode && typeof e.materialCode === 'string') codes.push(e.materialCode);
    });
  }

  // Selected kit code + kit items
  const kit = config.selectedKit as Record<string, unknown> | undefined;
  if (kit) {
    if (typeof kit.code === 'string') codes.push(kit.code);
    const kitItems = kit.items as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(kitItems)) kitItems.forEach(i => { if (typeof i.material_code === 'string') codes.push(i.material_code); });
  }

  // Partition wall door accessories (hinges, handle, lock, pivot codes + door extras)
  const pw = config.partitionWall as Record<string, unknown> | undefined;
  if (pw) {
    // Perimeter profile selections
    if (typeof pw.profileMaterialCode === 'string') codes.push(pw.profileMaterialCode);
    const pwProfileSels = pw.profileSelections as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(pwProfileSels)) {
      pwProfileSels.forEach(s => { if (typeof s.materialCode === 'string') codes.push(s.materialCode); });
    }
    const doors = pw.doors as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(doors)) {
      doors.forEach(door => {
        const doorAcc = door.accessories as Record<string, unknown> | undefined;
        if (!doorAcc) return;
        // Hinges (fallback to finish)
        const dHinges = doorAcc.hinges as Record<string, unknown> | undefined;
        if (dHinges) {
          const hCode = (typeof dHinges.materialCode === 'string' && dHinges.materialCode) || (typeof dHinges.finish === 'string' && dHinges.finish) || '';
          if (hCode) codes.push(hCode);
          const hSels = dHinges.selections as Array<Record<string, unknown>> | undefined;
          if (Array.isArray(hSels)) hSels.forEach(s => { if (typeof s.materialCode === 'string') codes.push(s.materialCode); });
        }
        // Handle (fallback to finish)
        const dHandle = doorAcc.handle as Record<string, unknown> | undefined;
        if (dHandle) {
          const hCode = (typeof dHandle.materialCode === 'string' && dHandle.materialCode) || (typeof dHandle.finish === 'string' && dHandle.finish) || '';
          if (hCode) codes.push(hCode);
          const haSels = dHandle.selections as Array<Record<string, unknown>> | undefined;
          if (Array.isArray(haSels)) haSels.forEach(s => { if (typeof s.materialCode === 'string') codes.push(s.materialCode); });
        }
        // Lock
        const dLock = doorAcc.lock as Record<string, unknown> | undefined;
        if (dLock?.enabled && typeof dLock.materialCode === 'string') codes.push(dLock.materialCode);
        // Extra accessories
        const doorExtras = doorAcc.extraAccessories as Array<Record<string, unknown>> | undefined;
        if (Array.isArray(doorExtras)) {
          doorExtras.forEach(e => {
            if (e.materialCode && typeof e.materialCode === 'string') codes.push(e.materialCode);
          });
        }
      });
    }
  }

  return codes.filter(Boolean);
}

// Helper: get finish label
function getFinishLabel(finish: string): string {
  const labels: Record<string, string> = {
    polished_stainless: i18next.t('pdf.finishLabels.polished_stainless'),
    brushed_stainless: i18next.t('pdf.finishLabels.brushed_stainless'),
    matte_black: i18next.t('pdf.finishLabels.matte_black'),
    chrome: i18next.t('pdf.finishLabels.chrome'),
    anodized_silver: i18next.t('pdf.finishLabels.anodized_silver'),
    gold: i18next.t('pdf.finishLabels.gold'),
    ral_painted: i18next.t('pdf.finishLabels.ral_painted'),
  };
  return labels[finish] || finish;
}

// Helper: get edge polish label
function getEdgePolishLabel(type: string): string {
  const labels: Record<string, string> = {
    none: 'Nu',
    matte: 'Mat',
    polished: 'Lustruit',
    beveled: 'Bizou',
  };
  return labels[type] || type;
}

// Build accessory rows from a configuration for production sheet
function buildAccessoryRows(
  config: Record<string, unknown>,
  materialMap: Map<string, { name: string; image_url: string | null }>
): Array<{ code: string; description: string; quantity: string; imageUrl: string | null }> {
  const rows: Array<{ code: string; description: string; quantity: string; imageUrl: string | null }> = [];
  const acc = config.accessories as Record<string, unknown> | undefined;

  const parentCodeLookup = (code: string) => {
    const mat = materialMap.get(code);
    if (mat?.image_url) return mat;
    let parent = code;
    while (parent.includes('.')) {
      parent = parent.replace(/\.[^.]+$/, '');
      const parentMat = materialMap.get(parent);
      if (parentMat?.image_url) {
        return { name: mat?.name || parentMat.name, image_url: parentMat.image_url };
      }
    }
    return mat || undefined;
  };

  // Helper to add hinge/handle/profile rows
  const addHingeRow = (hinges: Record<string, unknown>, prefix = '') => {
    const code = (hinges.materialCode as string) || '';
    const mat = code ? parentCodeLookup(code) : undefined;
    const typeLabel = hinges.type === 'wall_glass' ? 'perete-sticla' : hinges.type === 'glass_glass' ? 'sticla-sticla' : String(hinges.type || '');
    const finish = hinges.finish ? getFinishLabel(String(hinges.finish)) : '';
    const desc = `${prefix}Balama ${typeLabel}${finish ? ' - ' + finish : ''}`;
    rows.push({ code: code || '-', description: s(mat?.name || desc), quantity: `${hinges.quantity || 1} buc`, imageUrl: mat?.image_url || null });
  };

  const addHandleRow = (handle: Record<string, unknown>, prefix = '') => {
    const code = (handle.materialCode as string) || '';
    const mat = code ? parentCodeLookup(code) : undefined;
    const model = handle.model ? String(handle.model) : '';
    const length = handle.length ? `${handle.length}mm` : '';
    const finish = handle.finish ? getFinishLabel(String(handle.finish)) : '';
    const desc = `${prefix}Maner ${model} ${length}${finish ? ' - ' + finish : ''}`;
    rows.push({ code: code || '-', description: s(mat?.name || desc), quantity: '1 buc', imageUrl: mat?.image_url || null });
  };

  if (acc) {
  // Frontal Hinges — prefer selections
  const hinges = acc.hinges as Record<string, unknown> | undefined;
  if (hinges) {
    const hingeSels = hinges.selections as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(hingeSels) && hingeSels.length > 0) {
      const sel = hingeSels[0];
      const code = (sel.materialCode as string) || (hinges.materialCode as string) || '';
      const mat = code ? parentCodeLookup(code) : undefined;
      const qty = (hinges.quantity as number) || hingeSels.length || 1;
      rows.push({ code: code || '-', description: s(mat?.name || (sel.name as string) || 'Balama'), quantity: `${qty} buc`, imageUrl: mat?.image_url || null });
    } else {
      addHingeRow(hinges);
    }
  }

  // Frontal Handle — prefer selections
  const handle = acc.handle as Record<string, unknown> | undefined;
  if (handle) {
    const handleSels = handle.selections as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(handleSels) && handleSels.length > 0) {
      handleSels.forEach(sel => {
        const code = (sel.materialCode as string) || (handle.materialCode as string) || '';
        const mat = code ? parentCodeLookup(code) : undefined;
        rows.push({ code: code || '-', description: s(mat?.name || (sel.name as string) || 'Maner'), quantity: '1 buc', imageUrl: mat?.image_url || null });
      });
    } else {
      addHandleRow(handle);
    }
  }

  // ── Door lock (standalone) ──
  const lock = acc.lock as Record<string, unknown> | undefined;
  if (lock?.enabled) {
    const code = (lock.materialCode as string) || '';
    const mat = code ? parentCodeLookup(code) : undefined;
    const type = lock.type ? String(lock.type) : '';
    rows.push({ code: code || '-', description: s(mat?.name || `Broasca ${type}`), quantity: '1 buc', imageUrl: mat?.image_url || null });
  }

  // ── Door pivot ──
  const pivot = acc.pivot as Record<string, unknown> | undefined;
  if (pivot) {
    const code = (pivot.materialCode as string) || '';
    const mat = code ? parentCodeLookup(code) : undefined;
    const type = pivot.type ? String(pivot.type) : 'standard';
    const damper = pivot.withDamper ? ' cu amortizor' : '';
    rows.push({ code: code || '-', description: s(mat?.name || `Pivot ${type}${damper}`), quantity: '1 buc', imageUrl: mat?.image_url || null });
  }

  // ── Door sliding system ──
  const slidingSystem = acc.slidingSystem as Record<string, unknown> | undefined;
  if (slidingSystem) {
    const code = (slidingSystem.materialCode as string) || '';
    const mat = code ? parentCodeLookup(code) : undefined;
    const rail = slidingSystem.rail ? String(slidingSystem.rail) : '';
    const rollers = slidingSystem.rollers ? String(slidingSystem.rollers) : '';
    const damper = slidingSystem.damper ? ' cu amortizor' : '';
    rows.push({ code: code || '-', description: s(mat?.name || `Sistem glisant ${rail} ${rollers}${damper}`), quantity: '1 set', imageUrl: mat?.image_url || null });
  }

  // Profiles — prefer selections
  const profiles = acc.profiles as Record<string, unknown> | undefined;
  if (profiles) {
    const profSels = profiles.selections as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(profSels) && profSels.length > 0) {
      profSels.forEach(sel => {
        const code = (sel.materialCode as string) || '';
        const mat = code ? parentCodeLookup(code) : undefined;
        rows.push({ code: code || '-', description: s(mat?.name || (sel.name as string) || 'Profil'), quantity: `${(sel.quantity as number) || 1} buc`, imageUrl: mat?.image_url || null });
      });
    } else {
      const code = (profiles.materialCode as string) || '';
      const mat = code ? parentCodeLookup(code) : undefined;
      const type = profiles.type === 'u_profile' ? 'Profil U' : profiles.type === 'compensation' ? 'Profil compensare' : String(profiles.type || 'Profil');
      const finish = profiles.finish ? getFinishLabel(String(profiles.finish)) : '';
      const sides = profiles.sides as Record<string, boolean> | undefined;
      let sidesLabel = '';
      if (sides) {
        const activeSides: string[] = [];
        if (sides.top) activeSides.push('Sus');
        if (sides.bottom) activeSides.push('Jos');
        if (sides.left) activeSides.push('Stanga');
        if (sides.right) activeSides.push('Dreapta');
        if (activeSides.length > 0) sidesLabel = ` (${activeSides.join(', ')})`;
      }
      const desc = `${type}${finish ? ' - ' + finish : ''}${sidesLabel}`;
      rows.push({ code: code || '-', description: s(mat?.name || desc), quantity: '1 buc', imageUrl: mat?.image_url || null });
    }
  }

  // ── Balustrade: mount points ──
  const mountPoints = acc.mountPoints as Record<string, unknown> | undefined;
  if (mountPoints && (mountPoints.quantity as number) > 0) {
    const mpCodes: string[] = Array.isArray(mountPoints.materialCodes) ? mountPoints.materialCodes as string[] : (mountPoints.materialCode ? [mountPoints.materialCode as string] : []);
    const qty = (mountPoints.quantity as number) || 1;
    const model = mountPoints.model ? String(mountPoints.model) : '';
    const finish = mountPoints.finish ? getFinishLabel(String(mountPoints.finish)) : '';
    const spacing = mountPoints.spacing ? `la ${mountPoints.spacing}mm` : '';
    if (mpCodes.length > 0) {
      mpCodes.forEach(code => {
        const mat = code ? parentCodeLookup(code) : undefined;
        rows.push({ code: code || '-', description: s(mat?.name || `Punct montaj ${model}${finish ? ' - ' + finish : ''} ${spacing}`), quantity: `${qty} buc`, imageUrl: mat?.image_url || null });
      });
    } else {
      rows.push({ code: '-', description: s(`Punct montaj ${model}${finish ? ' - ' + finish : ''} ${spacing}`), quantity: `${qty} buc`, imageUrl: null });
    }
  }

  // ── Balustrade: U profile ──
  const uProfileBal = acc.uProfile as Record<string, unknown> | undefined;
  if (uProfileBal) {
    const upCodes: string[] = Array.isArray(uProfileBal.materialCodes) ? uProfileBal.materialCodes as string[] : (uProfileBal.materialCode ? [uProfileBal.materialCode as string] : []);
    const size = uProfileBal.size ? String(uProfileBal.size) : '';
    const finish = uProfileBal.finish ? getFinishLabel(String(uProfileBal.finish)) : '';
    if (upCodes.length > 0) {
      upCodes.forEach(code => {
        const mat = code ? parentCodeLookup(code) : undefined;
        rows.push({ code: code || '-', description: s(mat?.name || `Profil U ${size}${finish ? ' - ' + finish : ''}`), quantity: '1 buc', imageUrl: mat?.image_url || null });
      });
    } else if (size) {
      rows.push({ code: '-', description: s(`Profil U ${size}${finish ? ' - ' + finish : ''}`), quantity: '1 buc', imageUrl: null });
    }
  }

  // ── Balustrade: handrail ──
  const handrailBal = acc.handrail as Record<string, unknown> | undefined;
  if (handrailBal) {
    const hrCodes: string[] = Array.isArray(handrailBal.materialCodes) ? handrailBal.materialCodes as string[] : (handrailBal.materialCode ? [handrailBal.materialCode as string] : []);
    const diameter = handrailBal.diameter ? `Ø${handrailBal.diameter}` : '';
    const type = handrailBal.type ? String(handrailBal.type) : '';
    const lengthMm = (handrailBal.length as number) || 0;
    const lengthMl = lengthMm / 1000;
    const finish = handrailBal.finish ? getFinishLabel(String(handrailBal.finish)) : '';
    if (hrCodes.length > 0) {
      hrCodes.forEach(code => {
        const mat = code ? parentCodeLookup(code) : undefined;
        rows.push({ code: code || '-', description: s(mat?.name || `Mana curenta ${diameter} ${type}${finish ? ' - ' + finish : ''}`), quantity: lengthMl > 0 ? `${lengthMl.toFixed(2)} ml` : '1 buc', imageUrl: mat?.image_url || null });
      });
    } else if (diameter) {
      rows.push({ code: '-', description: s(`Mana curenta ${diameter} ${type}${finish ? ' - ' + finish : ''}`), quantity: lengthMl > 0 ? `${lengthMl.toFixed(2)} ml` : '1 buc', imageUrl: null });
    }
  }

  // ── Balustrade: corner connector (lives under dimensions) ──
  const dims = config.dimensions as Record<string, unknown> | undefined;
  const cornerConnector = dims?.cornerConnector as Record<string, unknown> | undefined;
  if (cornerConnector && (cornerConnector.quantity as number) > 0) {
    const ccCodes: string[] = Array.isArray(cornerConnector.materialCodes) ? cornerConnector.materialCodes as string[] : (cornerConnector.materialCode ? [cornerConnector.materialCode as string] : []);
    const qty = (cornerConnector.quantity as number) || 1;
    if (ccCodes.length > 0) {
      ccCodes.forEach(code => {
        const mat = code ? parentCodeLookup(code) : undefined;
        rows.push({ code: code || '-', description: s(mat?.name || 'Conector colt'), quantity: `${qty} buc`, imageUrl: mat?.image_url || null });
      });
    } else {
      rows.push({ code: '-', description: s('Conector colt'), quantity: `${qty} buc`, imageUrl: null });
    }
  }

  // Stabilizers — prefer stabilizerSelections if available
  const stabSelections = acc.stabilizerSelections as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(stabSelections) && stabSelections.length > 0) {
    stabSelections.forEach(st => {
      const code = (st.materialCode as string) || '';
      const mat = code ? parentCodeLookup(code) : undefined;
      const name = (st.name as string) || mat?.name || 'Bara stabilizatoare';
      const length = st.length ? `${st.length}mm` : '';
      const desc = length ? `${name} - ${length}` : name;
      rows.push({ code: code || '-', description: s(desc), quantity: '1 buc', imageUrl: mat?.image_url || null });
    });
  } else {
    const stabilizers = acc.stabilizers as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(stabilizers)) {
      stabilizers.forEach(st => {
        const code = (st.materialCode as string) || '';
        const mat = code ? parentCodeLookup(code) : undefined;
        const type = st.type === 'wall_glass' ? 'perete-sticla' : st.type === 'glass_glass' ? 'sticla-sticla' : st.type === 'ceiling' ? 'tavan' : String(st.type || '');
        const length = st.length ? `${st.length}mm` : '';
        const desc = `Bara stabilizatoare ${type} ${length}`;
        rows.push({ code: code || '-', description: s(mat?.name || desc), quantity: '1 buc', imageUrl: mat?.image_url || null });
      });
    }
  }

  // ── Lateral config accessories ──
  const lateral = config.lateralConfig as Record<string, unknown> | undefined;
  if (lateral?.enabled) {
    const latHinges = lateral.hinges as Record<string, unknown> | undefined;
    if (latHinges) {
      const latHingeSels = latHinges.selections as Array<Record<string, unknown>> | undefined;
      if (Array.isArray(latHingeSels) && latHingeSels.length > 0) {
        const sel = latHingeSels[0];
        const code = (sel.materialCode as string) || '';
        const mat = code ? parentCodeLookup(code) : undefined;
        const qty = (latHinges.quantity as number) || latHingeSels.length || 1;
        rows.push({ code: code || '-', description: s(mat?.name || (sel.name as string) || '[Lateral] Balama'), quantity: `${qty} buc`, imageUrl: mat?.image_url || null });
      } else {
        addHingeRow(latHinges, '[Lateral] ');
      }
    }
    const latHandle = lateral.handle as Record<string, unknown> | undefined;
    if (latHandle) {
      const latHandleSels = latHandle.selections as Array<Record<string, unknown>> | undefined;
      if (Array.isArray(latHandleSels) && latHandleSels.length > 0) {
        latHandleSels.forEach(sel => {
          const code = (sel.materialCode as string) || '';
          const mat = code ? parentCodeLookup(code) : undefined;
          rows.push({ code: code || '-', description: s(mat?.name || (sel.name as string) || '[Lateral] Maner'), quantity: '1 buc', imageUrl: mat?.image_url || null });
        });
      } else {
        addHandleRow(latHandle, '[Lateral] ');
      }
    }
  }
  } // end if (acc)

  // ── Partition wall door accessories (hinges, handle, lock) ──
  const pwCfg = config.partitionWall as Record<string, unknown> | undefined;
  if (pwCfg) {
    // Perimeter profile selections
    const pwProfileSels = pwCfg.profileSelections as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(pwProfileSels) && pwProfileSels.length > 0) {
      pwProfileSels.forEach(sel => {
        const code = (sel.materialCode as string) || '';
        const mat = code ? parentCodeLookup(code) : undefined;
        rows.push({ code: code || '-', description: s(mat?.name || (sel.name as string) || 'Profil perimetral'), quantity: '1 buc', imageUrl: mat?.image_url || null });
      });
    } else {
      const pwProfCode = (pwCfg.profileMaterialCode as string) || '';
      if (pwProfCode) {
        const mat = parentCodeLookup(pwProfCode);
        rows.push({ code: pwProfCode, description: s(mat?.name || 'Profil perimetral'), quantity: '1 buc', imageUrl: mat?.image_url || null });
      }
    }

    const pwDoors = pwCfg.doors as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(pwDoors)) {
      pwDoors.forEach((d, di) => {
        const dAcc = d.accessories as Record<string, unknown> | undefined;
        if (!dAcc) return;
        const doorLabel = pwDoors.length > 1 ? ` usa ${di + 1}` : '';

        // Door hinges (fallback to finish)
        const dHinges = dAcc.hinges as Record<string, unknown> | undefined;
        if (dHinges) {
          const code = (dHinges.materialCode as string) || (dHinges.finish as string) || '';
          const mat = code ? parentCodeLookup(code) : undefined;
          const qty = (dHinges.quantity as number) || 1;
          rows.push({ code: code || '-', description: s(mat?.name || `Balama${doorLabel}`), quantity: `${qty} buc`, imageUrl: mat?.image_url || null });
        }

        // Door handle (fallback to finish)
        const dHandle = dAcc.handle as Record<string, unknown> | undefined;
        if (dHandle) {
          const code = (dHandle.materialCode as string) || (dHandle.finish as string) || '';
          const mat = code ? parentCodeLookup(code) : undefined;
          rows.push({ code: code || '-', description: s(mat?.name || `Maner${doorLabel}`), quantity: '1 buc', imageUrl: mat?.image_url || null });
        }

        // Door lock
        const dLock = dAcc.lock as Record<string, unknown> | undefined;
        if (dLock?.enabled) {
          const code = (dLock.materialCode as string) || '';
          const mat = code ? parentCodeLookup(code) : undefined;
          rows.push({ code: code || '-', description: s(mat?.name || `Broasca${doorLabel}`), quantity: '1 buc', imageUrl: mat?.image_url || null });
        }
      });
    }
  }

  return rows.filter(r => r.code !== '-');
}

// Build seals info
function buildSealsInfo(config: Record<string, unknown>, materialMap: Map<string, { name: string; image_url: string | null }>): Array<{ code: string; description: string; quantity: string; imageUrl: string | null }> {
  const rows: Array<{ code: string; description: string; quantity: string; imageUrl: string | null }> = [];

  const parentCodeLookup = (code: string) => {
    const mat = materialMap.get(code);
    if (mat?.image_url) return mat;
    let parent = code;
    while (parent.includes('.')) {
      parent = parent.replace(/\.[^.]+$/, '');
      const parentMat = materialMap.get(parent);
      if (parentMat?.image_url) {
        return { name: mat?.name || parentMat.name, image_url: parentMat.image_url };
      }
    }
    return mat || undefined;
  };

  const addSealsFrom = (seals: Record<string, unknown>, prefix = '') => {
    if (seals.magnetic) {
      const sels = seals.magneticSelections as Array<Record<string, unknown>> | undefined;
      if (Array.isArray(sels) && sels.length > 0) {
        sels.forEach(sel => {
          const code = (sel.materialCode as string) || '';
          const mat = code ? parentCodeLookup(code) : undefined;
          rows.push({ code: code || '-', description: s(mat?.name || (sel.name as string) || `${prefix}Garnitura magnetica`), quantity: '1 set', imageUrl: mat?.image_url || null });
        });
      } else {
        const code = (seals.magneticMaterialCode as string) || '';
        const mat = code ? parentCodeLookup(code) : undefined;
        rows.push({ code: code || '-', description: s(mat?.name || `${prefix}Garnitura magnetica`), quantity: '1 set', imageUrl: mat?.image_url || null });
      }
    }
    if (seals.rubber) {
      const sels = seals.rubberSelections as Array<Record<string, unknown>> | undefined;
      if (Array.isArray(sels) && sels.length > 0) {
        sels.forEach(sel => {
          const code = (sel.materialCode as string) || '';
          const mat = code ? parentCodeLookup(code) : undefined;
          rows.push({ code: code || '-', description: s(mat?.name || (sel.name as string) || `${prefix}Garnitura cauciuc`), quantity: '1 set', imageUrl: mat?.image_url || null });
        });
      } else {
        const code = (seals.rubberMaterialCode as string) || '';
        const mat = code ? parentCodeLookup(code) : undefined;
        rows.push({ code: code || '-', description: s(mat?.name || `${prefix}Garnitura cauciuc`), quantity: '1 set', imageUrl: mat?.image_url || null });
      }
    }
    if (seals.threshold && typeof seals.threshold !== 'boolean') {
      const sels = seals.thresholdSelections as Array<Record<string, unknown>> | undefined;
      if (Array.isArray(sels) && sels.length > 0) {
        sels.forEach(sel => {
          const code = (sel.materialCode as string) || '';
          const mat = code ? parentCodeLookup(code) : undefined;
          rows.push({ code: code || '-', description: s(mat?.name || (sel.name as string) || `${prefix}Prag/Profil prag`), quantity: '1 buc', imageUrl: mat?.image_url || null });
        });
      } else {
        const code = (seals.thresholdMaterialCode as string) || '';
        const mat = code ? parentCodeLookup(code) : undefined;
        rows.push({ code: code || '-', description: s(mat?.name || `${prefix}Prag/Profil prag`), quantity: '1 buc', imageUrl: mat?.image_url || null });
      }
    }

    // ── Door-style seals (lateral: boolean, threshold: boolean) ──
    if (seals.lateral === true) {
      const latSels = seals.lateralSelections as Array<Record<string, unknown>> | undefined;
      if (Array.isArray(latSels) && latSels.length > 0) {
        latSels.forEach(sel => {
          const code = (sel.materialCode as string) || '';
          const mat = code ? parentCodeLookup(code) : undefined;
          rows.push({ code: code || '-', description: s(mat?.name || (sel.name as string) || `${prefix}Garnitura laterala`), quantity: '1 set', imageUrl: mat?.image_url || null });
        });
      } else {
        const code = (seals.lateralMaterialCode as string) || '';
        const mat = code ? parentCodeLookup(code) : undefined;
        rows.push({ code: code || '-', description: s(mat?.name || `${prefix}Garnitura laterala`), quantity: '1 set', imageUrl: mat?.image_url || null });
      }
    }
    if (seals.threshold === true) {
      const code = (seals.thresholdMaterialCode as string) || '';
      const mat = code ? parentCodeLookup(code) : undefined;
      rows.push({ code: code || '-', description: s(mat?.name || `${prefix}Prag usa`), quantity: '1 buc', imageUrl: mat?.image_url || null });
    }
  };

  // Frontal seals
  const acc = config.accessories as Record<string, unknown> | undefined;
  if (acc) {
    const seals = acc.seals as Record<string, unknown> | undefined;
    if (seals) addSealsFrom(seals);
  }

  // Lateral seals
  const lateral = config.lateralConfig as Record<string, unknown> | undefined;
  if (lateral?.enabled) {
    const latSeals = lateral.seals as Record<string, unknown> | undefined;
    if (latSeals) addSealsFrom(latSeals, '[Lateral] ');
  }

  // Filter out unselected accessories (no material code = not selected)
  return rows.filter(r => r.code !== '-');
}

// Build extra accessories (optionally filtering out pivot codes for client quotes)
function buildExtraAccessories(
  config: Record<string, unknown>,
  materialMap: Map<string, { name: string; image_url: string | null }>,
  excludePivotCodes = false
): Array<{ code: string; description: string; quantity: string; imageUrl: string | null }> {
  const rows: Array<{ code: string; description: string; quantity: string; imageUrl: string | null }> = [];
  const acc = config.accessories as Record<string, unknown> | undefined;
  const extras = (acc?.extraAccessories || config.extraAccessories) as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(extras)) {
    extras.forEach(e => {
      const code = (e.materialCode as string) || '';
      if (excludePivotCodes && PIVOT_CODES.has(code)) return;
      const mat = code ? materialMap.get(code) : undefined;
      const name = (e.name as string) || mat?.name || 'Accesoriu';
      const qty = (e.quantity as number) || 1;
      const unitMap: Record<string, string> = { pcs: 'buc', lm: 'ml', sqm: 'm²', kg: 'kg', l: 'l' };
      const unitLabel = unitMap[(e.unit as string) || 'pcs'] || 'buc';
      rows.push({ code: code || '-', description: s(name), quantity: `${qty} ${unitLabel}`, imageUrl: mat?.image_url || null });
    });
  }

  // Partition wall door extra accessories
  const pw = config.partitionWall as Record<string, unknown> | undefined;
  if (pw) {
    const doors = pw.doors as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(doors)) {
      doors.forEach((d, di) => {
        const dAcc = d.accessories as Record<string, unknown> | undefined;
        const dExtras = dAcc?.extraAccessories as Array<Record<string, unknown>> | undefined;
        if (Array.isArray(dExtras)) {
          dExtras.forEach(e => {
            const code = (e.materialCode as string) || '';
            if (excludePivotCodes && PIVOT_CODES.has(code)) return;
            const mat = code ? materialMap.get(code) : undefined;
            const name = (e.name as string) || mat?.name || `Accesoriu usa ${di + 1}`;
            const qty = (e.quantity as number) || 1;
            const unitMap2: Record<string, string> = { pcs: 'buc', lm: 'ml', sqm: 'm²', kg: 'kg', l: 'l' };
            const unitLabel2 = unitMap2[(e.unit as string) || 'pcs'] || 'buc';
            rows.push({ code: code || '-', description: s(name), quantity: `${qty} ${unitLabel2}`, imageUrl: mat?.image_url || null });
          });
        }
      });
    }
  }

  return rows;
}

// Build pivot/amortizor accessory rows from partition wall doors (production sheets only)
function buildPivotAccessoryRows(
  config: Record<string, unknown>,
  materialMap: Map<string, { name: string; image_url: string | null }>
): Array<{ code: string; description: string; quantity: string; imageUrl: string | null }> {
  const rows: Array<{ code: string; description: string; quantity: string; imageUrl: string | null }> = [];
  const pw = config.partitionWall as Record<string, unknown> | undefined;
  if (!pw) return rows;
  const doors = pw.doors as Array<Record<string, unknown>> | undefined;
  if (!Array.isArray(doors)) return rows;

  // Named field mappings
  const namedFields: Array<{ field: string; code: string; label: string }> = [
    { field: 'ptBottom', code: 'PT10', label: 'Pivot jos' },
    { field: 'ptTop', code: 'PT20', label: 'Pivot sus' },
    { field: 'pt40', code: 'PT40', label: 'Pivot sus automat' },
    { field: 'bts', code: 'BTS', label: 'Amortizor pardoseala' },
    { field: 'us', code: 'US10', label: 'Opritor pardoseala' },
    { field: 'gk30', code: 'GK30', label: 'Clema fixare' },
    { field: 'blockers', code: 'BLOC', label: 'Blocatori' },
  ];

  // Aggregate quantities across all doors
  const aggregated = new Map<string, { description: string; quantity: number; imageUrl: string | null }>();

  doors.forEach(door => {
    const doorAcc = door.accessories as Record<string, unknown> | undefined;
    if (!doorAcc) return;

    // Named fields
    namedFields.forEach(({ field, code, label }) => {
      const obj = doorAcc[field] as Record<string, unknown> | undefined;
      if (obj && (obj.quantity as number) > 0) {
        const mat = materialMap.get(code);
        const existing = aggregated.get(code);
        const qty = (obj.quantity as number) || 0;
        if (existing) {
          existing.quantity += qty;
        } else {
          aggregated.set(code, { description: s(mat?.name || label), quantity: qty, imageUrl: mat?.image_url || null });
        }
      }
    });

    // Extra accessories that are pivot codes
    const doorExtras = doorAcc.extraAccessories as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(doorExtras)) {
      doorExtras.forEach(e => {
        const code = (e.materialCode as string) || '';
        if (!PIVOT_CODES.has(code)) return;
        const mat = code ? materialMap.get(code) : undefined;
        const name = (e.name as string) || mat?.name || 'Accesoriu';
        const qty = (e.quantity as number) || 1;
        const existing = aggregated.get(code);
        if (existing) {
          existing.quantity += qty;
        } else {
          aggregated.set(code, { description: s(name), quantity: qty, imageUrl: mat?.image_url || null });
        }
      });
    }
  });

  aggregated.forEach((val, code) => {
    rows.push({ code, description: val.description, quantity: `${val.quantity} buc`, imageUrl: val.imageUrl });
  });

  return rows;
}

export async function generateProductionSheetPDF(
  company: CompanyInfo,
  order: OrderInfo,
  products: OrderProduct[],
  preResolvedMaterialMap?: Map<string, { name: string; image_url: string | null }>
): Promise<jsPDF> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // ── Pre-process: collect all materialCodes and fetch from DB ──
  const allCodes: string[] = [];
  products.forEach(p => {
    const codes = extractMaterialCodes((p.full_config || p.configuration) as Record<string, unknown>);
    allCodes.push(...codes);
  });

  const uniqueCodes = [...new Set(allCodes)].filter(Boolean);
  // Generate parent codes (strip last segment) for variant code fallback
  const parentCodesSet = new Set<string>();
  uniqueCodes.forEach(code => {
    const parts = code.split('.');
    if (parts.length > 2) parentCodesSet.add(parts.slice(0, -1).join('.'));
  });
  const allQueryCodes = [...new Set([...uniqueCodes, ...parentCodesSet])];
  const materialMap = new Map<string, { name: string; image_url: string | null }>();
  const imageCache = new Map<string, string | null>();

  if (preResolvedMaterialMap) {
    for (const [k, v] of preResolvedMaterialMap) materialMap.set(k, { name: v.name, image_url: v.image_url });
    for (const code of allQueryCodes) {
      const entry = materialMap.get(code);
      if (entry && !entry.image_url && code.includes('.')) {
        let parent = code;
        while (parent.includes('.')) {
          parent = parent.replace(/\.[^.]+$/, '');
          const parentEntry = materialMap.get(parent);
          if (parentEntry?.image_url) { entry.image_url = parentEntry.image_url; break; }
        }
      }
    }
  } else if (allQueryCodes.length > 0) {
    const { data: materials } = await supabase
      .from('materials')
      .select('code, name, image_url')
      .in('code', allQueryCodes);

    if (materials) {
      for (const m of materials) {
        materialMap.set(m.code, { name: m.name, image_url: m.image_url });
      }
    }
    const codesNeedingData2 = allQueryCodes.filter(c => {
      const existing = materialMap.get(c);
      return !existing || !existing.image_url;
    });
    if (codesNeedingData2.length > 0) {
      const { data: pricingData } = await supabase
        .from('pricing_config')
        .select('code, name, image_url')
        .in('code', codesNeedingData2);
      if (pricingData) {
        for (const p of pricingData) {
          const existing = materialMap.get(p.code);
          if (!existing) {
            materialMap.set(p.code, { name: p.name || p.code, image_url: p.image_url || null });
          } else if (!existing.image_url && p.image_url) {
            existing.image_url = p.image_url;
          }
        }
      }
    }
  }

  if (materialMap.size > 0) {
    const imageLoadPromises: Array<Promise<void>> = [];
    for (const m of materialMap.values()) {
      if (m.image_url) {
        const url = m.image_url;
        if (!imageCache.has(url)) {
          imageLoadPromises.push(
            loadImageAsBase64(url).then(data => { imageCache.set(url, data); })
          );
        }
      }
    }
    await Promise.all(imageLoadPromises);
  }

  // ── Logo ──
  if (company.logoUrl) {
    const logoData = await loadImageAsBase64(company.logoUrl);
    if (logoData) {
      try {
        const logoLayout = resolveLogoLayout(pageWidth, company.pdfLogoSize, company.pdfLogoPosition, 14, 20);
        doc.addImage(logoData, 'AUTO', logoLayout.x, 10, logoLayout.size, logoLayout.size);
      } catch { /* skip */ }
    }
  }

  // ── Header ──
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(249, 115, 22);
  doc.text(s(i18next.t('pdf.productionSheetTitle')), pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(`Comanda: ${order.order_number}`, pageWidth / 2, 28, { align: 'center' });
  
  // Order info box
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(20, 35, pageWidth - 40, 25, 3, 3, 'F');
  
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(s(i18next.t('pdf.orderDate')), 25, 43);
  doc.text(s(i18next.t('pdf.deliveryDeadline')), 80, 43);
  doc.text(s(i18next.t('pdf.productCount')), 140, 43);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(format(new Date(order.created_at), 'dd.MM.yyyy'), 25, 51);
  doc.text(order.delivery_date ? format(new Date(order.delivery_date), 'dd.MM.yyyy') : i18next.t('pdf.unspecified'), 80, 51);
  doc.text(products.length.toString(), 140, 51);
  
  let yPos = 70;
  const pageHeight = doc.internal.pageSize.getHeight();

  const ensureSpace = (needed: number) => {
    if (yPos + needed > pageHeight - 45) {
      doc.addPage();
      yPos = 20;
    }
  };

  // ── Each product ──
  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    const config = (product.full_config || product.configuration) as Record<string, unknown>;

    ensureSpace(80);

    // Product header bar
    doc.setFillColor(59, 130, 246);
    doc.roundedRect(20, yPos, pageWidth - 40, 10, 2, 2, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`${index + 1}. ${s(getProductTypeLabels()[product.product_type] || product.product_type)}`, 25, yPos + 7);
    doc.text(`${i18next.t('pdf.quantity')} ${product.quantity}`, pageWidth - 35, yPos + 7, { align: 'right' });
    yPos += 15;

    // ── DIMENSIUNI ──
    const dims = config.dimensions as Record<string, number> | undefined;
    if (dims) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(249, 115, 22);
      doc.text(s(i18next.t('pdf.dimensions')), 25, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      const parts: string[] = [];
      if (dims.width && dims.height && dims.depth) {
        parts.push(`${dims.width} x ${dims.height} x ${dims.depth} mm`);
      } else if (dims.width && dims.height) {
        parts.push(`${dims.width} x ${dims.height} mm`);
      } else if (dims.length && dims.height) {
        parts.push(`${dims.length} x ${dims.height} mm`);
      }
      if (dims.doorWidth) parts.push(`${i18next.t('pdf.configLabels.door')} ${dims.doorWidth} mm`);
      if (dims.quantity && dims.quantity > 1) parts.push(`${i18next.t('pdf.configLabels.quantity')} ${dims.quantity} buc`);
      if (dims.diameter) parts.push(`${i18next.t('pdf.configLabels.diameter')} ${dims.diameter} mm`);
      doc.text(parts.join('  |  '), 25, yPos);
      yPos += 7;
    }

    // ── STICLA ──
    const glass = config.glass as Record<string, unknown> | undefined;
    if (glass) {
      ensureSpace(15);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(249, 115, 22);
      doc.text(s(i18next.t('pdf.glass')), 25, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      const glassParts: string[] = [];
      if (glass.thickness) glassParts.push(`${glass.thickness}mm`);
      if (glass.type) glassParts.push(getGlassTypeLabel(String(glass.type)));
      if (glass.tempered) glassParts.push(i18next.t('pdf.configLabels.tempered'));
      if (glass.laminated) glassParts.push(i18next.t('pdf.configLabels.laminated'));
      if (glass.antiCalc) glassParts.push(i18next.t('pdf.configLabels.antiCalc'));
      doc.text(glassParts.join(', '), 25, yPos);
      yPos += 7;
    }

    // ── Mirror type ──
    if (config.mirrorType) {
      ensureSpace(12);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(249, 115, 22);
      doc.text(s(i18next.t('pdf.mirrorType')), 25, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      const mirrorLabels: Record<string, string> = { silver: i18next.t('pdf.mirrorLabels.silver'), bronze: i18next.t('pdf.mirrorLabels.bronze'), grey: i18next.t('pdf.mirrorLabels.grey') };
      doc.text(mirrorLabels[String(config.mirrorType)] || String(config.mirrorType), 25, yPos);
      yPos += 7;
    }

    // ── PRELUCRARI ──
    const edgePolish = config.edgePolish as Record<string, unknown> | undefined;
    const processing = config.processing as Record<string, unknown> | undefined;
    const hasProcessing = (edgePolish?.enabled) || processing;
    if (hasProcessing) {
      ensureSpace(15);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(249, 115, 22);
      doc.text(s(i18next.t('pdf.processing')), 25, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      const procParts: string[] = [];
      if (edgePolish?.enabled) {
        procParts.push(`${i18next.t('pdf.configLabels.polishing')} ${getEdgePolishLabel(String(edgePolish.type || 'standard'))}`);
      }
      if (processing) {
        const holes = processing.holes as Array<unknown> | undefined;
        if (Array.isArray(holes) && holes.length > 0) procParts.push(`${i18next.t('pdf.configLabels.holes')} ${holes.length}`);
        const cutouts = processing.cutouts as Array<unknown> | undefined;
        if (Array.isArray(cutouts) && cutouts.length > 0) procParts.push(`${i18next.t('pdf.configLabels.cutouts')} ${cutouts.length}`);
        const cutoutCount = processing.cutoutCount as number | undefined;
        if (cutoutCount && cutoutCount > 0) procParts.push(`${i18next.t('pdf.configLabels.cutouts')} ${cutoutCount}`);
        if (processing.sandblasting && processing.sandblasting !== 'none') {
          procParts.push(`${i18next.t('pdf.configLabels.sandblasting')} ${processing.sandblasting === 'full' ? i18next.t('pdf.configLabels.sandblastingFull') : i18next.t('pdf.configLabels.sandblastingPartial')}`);
        }
        const bevel = processing.bevel as Record<string, unknown> | undefined;
        if (bevel?.enabled) procParts.push(`${i18next.t('pdf.configLabels.bevel')} ${bevel.width || ''}mm`);
        const sandblasting = processing.sandblasting as Record<string, unknown> | undefined;
        if (typeof sandblasting === 'object' && sandblasting?.enabled) procParts.push(i18next.t('pdf.configLabels.sandblasting'));
      }
      if (procParts.length > 0) {
        doc.text(procParts.join('  |  '), 25, yPos);
        yPos += 7;
      }
    }

    // ── Cabin & Door type + details ──
    if (config.cabinType || config.doorType) {
      ensureSpace(25);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(249, 115, 22);
      doc.text(s(i18next.t('pdf.configType')), 25, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      const typeParts: string[] = [];
      if (config.cabinType) typeParts.push(`${i18next.t('pdf.configLabels.cabin')} ${s(getCabinTypeLabel(String(config.cabinType)))}`);
      if (config.doorType) typeParts.push(`${i18next.t('pdf.configLabels.doorType')} ${s(getDoorTypeLabel(String(config.doorType)))}`);
      doc.text(typeParts.join('  |  '), 25, yPos);
      yPos += 5;

      // Door details (opening side, position, hinge side, direction)
      const accForDoor = config.accessories as Record<string, unknown> | undefined;
      if (accForDoor) {
        const doorDetailParts: string[] = [];
        if (accForDoor.openingSide) {
          const openLabels: Record<string, string> = { front: i18next.t('pdf.configLabels.front'), lateral: i18next.t('pdf.configLabels.lateral') };
          doorDetailParts.push(`${i18next.t('pdf.configLabels.opening')} ${openLabels[String(accForDoor.openingSide)] || String(accForDoor.openingSide)}`);
        }
        const door = accForDoor.door as Record<string, unknown> | undefined;
        if (door) {
          if (door.position) {
            doorDetailParts.push(`${i18next.t('pdf.configLabels.doorPosition')} ${door.position === 'left' ? i18next.t('pdf.configLabels.left') : i18next.t('pdf.configLabels.right')}`);
          }
          if (door.hingeSide) {
            doorDetailParts.push(`${i18next.t('pdf.configLabels.hingesSide')} ${door.hingeSide === 'left' ? i18next.t('pdf.configLabels.left') : i18next.t('pdf.configLabels.right')}`);
          }
          if (door.openDirection) {
            doorDetailParts.push(`${i18next.t('pdf.configLabels.direction')} ${door.openDirection === 'inward' ? i18next.t('pdf.configLabels.inward') : i18next.t('pdf.configLabels.outward')}`);
          }
        }
        if (doorDetailParts.length > 0) {
          doc.text(doorDetailParts.join('  |  '), 25, yPos);
          yPos += 5;
        }
      }
      yPos += 2;
    }

    // ── Fixed panels (new structure: left/right) ──
    const accForPanels = config.accessories as Record<string, unknown> | undefined;
    const fixedPanel = accForPanels?.fixedPanel as Record<string, unknown> | undefined;
    if (fixedPanel) {
      const fpLeft = fixedPanel.left as Record<string, unknown> | undefined;
      const fpRight = fixedPanel.right as Record<string, unknown> | undefined;
      const hasLeft = fpLeft?.enabled;
      const hasRight = fpRight?.enabled;
      if (hasLeft || hasRight) {
        ensureSpace(15);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(249, 115, 22);
        doc.text(s(i18next.t('pdf.fixedPanels')), 25, yPos);
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        if (hasLeft) {
          const w = fpLeft!.width ? `${fpLeft!.width}mm` : '';
          const h = fpLeft!.height ? ` x ${fpLeft!.height}mm` : '';
          doc.text(`${i18next.t('pdf.configLabels.left')}: ${w}${h}`, 25, yPos);
          yPos += 5;
        }
        if (hasRight) {
          const w = fpRight!.width ? `${fpRight!.width}mm` : '';
          const h = fpRight!.height ? ` x ${fpRight!.height}mm` : '';
          doc.text(`${i18next.t('pdf.configLabels.right')}: ${w}${h}`, 25, yPos);
          yPos += 5;
        }
        yPos += 2;
      }
    }

    // ── Lateral config details ──
    const lateralCfg = config.lateralConfig as Record<string, unknown> | undefined;
    if (lateralCfg?.enabled) {
      ensureSpace(15);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(249, 115, 22);
      doc.text(s(i18next.t('pdf.lateralConfig')), 25, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      const latParts: string[] = [];
      if (lateralCfg.doorType) latParts.push(`${i18next.t('pdf.configLabels.doorType')} ${s(getDoorTypeLabel(String(lateralCfg.doorType)))}`);
      const latDoor = lateralCfg.door as Record<string, unknown> | undefined;
      if (latDoor) {
        if (latDoor.position) latParts.push(`${i18next.t('pdf.configLabels.doorPosition')} ${latDoor.position === 'left' ? i18next.t('pdf.configLabels.left') : i18next.t('pdf.configLabels.right')}`);
        if (latDoor.hingeSide) latParts.push(`${i18next.t('pdf.configLabels.hingesSide')} ${latDoor.hingeSide === 'left' ? i18next.t('pdf.configLabels.left') : i18next.t('pdf.configLabels.right')}`);
        if (latDoor.openDirection) latParts.push(`${i18next.t('pdf.configLabels.direction')} ${latDoor.openDirection === 'inward' ? i18next.t('pdf.configLabels.inward') : i18next.t('pdf.configLabels.outward')}`);
      }
      if (latParts.length > 0) {
        doc.text(latParts.join('  |  '), 25, yPos);
        yPos += 5;
      }
      // Lateral fixed panels
      const latFP = lateralCfg.fixedPanel as Record<string, unknown> | undefined;
      if (latFP) {
        const lLeft = latFP.left as Record<string, unknown> | undefined;
        const lRight = latFP.right as Record<string, unknown> | undefined;
        if (lLeft?.enabled) {
          doc.text(`${i18next.t('pdf.configLabels.fixedPanelLeft')} ${lLeft.width || ''}mm`, 25, yPos);
          yPos += 5;
        }
        if (lRight?.enabled) {
          doc.text(`${i18next.t('pdf.configLabels.fixedPanelRight')} ${lRight.width || ''}mm`, 25, yPos);
          yPos += 5;
        }
      }
      yPos += 2;
    }

    // ── ACCESORII (table with images) ──
    const accRows = aggregateAccessories(buildAccessoryRows(config, materialMap));
    if (accRows.length > 0) {
      ensureSpace(20 + accRows.length * 12);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(249, 115, 22);
      doc.text(s(i18next.t('pdf.accessories')), 25, yPos);
      yPos += 3;

      autoTable(doc, {
        startY: yPos,
        head: [['', i18next.t('pdf.code'), i18next.t('pdf.description'), i18next.t('pdf.qty')]],
        body: accRows.map(row => ['', row.code, row.description, row.quantity]),
        theme: 'grid',
        headStyles: {
          fillColor: [241, 245, 249], // Slate-100
          textColor: [15, 23, 42],
          fontStyle: 'bold',
          fontSize: 7,
        },
        bodyStyles: { fontSize: 7, textColor: [15, 23, 42], minCellHeight: 12 },
        columnStyles: {
          0: { cellWidth: 14, halign: 'center' },
          1: { cellWidth: 30 },
          2: { cellWidth: 'auto' },
          3: { cellWidth: 18, halign: 'center' },
        },
        margin: { left: 25, right: 25 },
        didDrawCell: (data) => {
          if (data.section === 'body' && data.column.index === 0) {
            const rowIndex = data.row.index;
            const row = accRows[rowIndex];
            if (row?.imageUrl) {
              const imgData = imageCache.get(row.imageUrl);
              if (imgData) {
                try {
                  doc.addImage(imgData, 'AUTO', data.cell.x + 1, data.cell.y + 1, 10, 10);
                } catch { /* skip */ }
              }
            }
          }
        },
      });

      // @ts-expect-error jspdf-autotable adds this property
      yPos = doc.lastAutoTable.finalY + 5;
    }

    // ── GARNITURI ──
    const sealRows = buildSealsInfo(config, materialMap);
    if (sealRows.length > 0) {
      ensureSpace(20 + sealRows.length * 12);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(249, 115, 22);
      doc.text(s(i18next.t('pdf.seals')), 25, yPos);
      yPos += 3;

      autoTable(doc, {
        startY: yPos,
        head: [['', i18next.t('pdf.code'), i18next.t('pdf.description'), i18next.t('pdf.qty')]],
        body: sealRows.map(row => ['', row.code, row.description, row.quantity]),
        theme: 'grid',
        headStyles: {
          fillColor: [241, 245, 249],
          textColor: [15, 23, 42],
          fontStyle: 'bold',
          fontSize: 7,
        },
        bodyStyles: { fontSize: 7, textColor: [15, 23, 42], minCellHeight: 12 },
        columnStyles: {
          0: { cellWidth: 14, halign: 'center' },
          1: { cellWidth: 30 },
          2: { cellWidth: 'auto' },
          3: { cellWidth: 18, halign: 'center' },
        },
        margin: { left: 25, right: 25 },
        didDrawCell: (data) => {
          if (data.section === 'body' && data.column.index === 0) {
            const rowIndex = data.row.index;
            const row = sealRows[rowIndex];
            if (row?.imageUrl) {
              const imgData = imageCache.get(row.imageUrl);
              if (imgData) {
                try {
                  doc.addImage(imgData, 'AUTO', data.cell.x + 1, data.cell.y + 1, 10, 10);
                } catch { /* skip */ }
              }
            }
          }
        },
      });

      // @ts-expect-error jspdf-autotable adds this property
      yPos = doc.lastAutoTable.finalY + 5;
    }

    // ── ACCESORII SUPLIMENTARE ──
    const extraRows = buildExtraAccessories(config, materialMap);
    if (extraRows.length > 0) {
      ensureSpace(20 + extraRows.length * 12);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(249, 115, 22);
      doc.text(s(i18next.t('pdf.extraAccessories')), 25, yPos);
      yPos += 3;

      autoTable(doc, {
        startY: yPos,
        head: [['', i18next.t('pdf.code'), i18next.t('pdf.description'), i18next.t('pdf.qty')]],
        body: extraRows.map(row => ['', row.code, row.description, row.quantity]),
        theme: 'grid',
        headStyles: {
          fillColor: [241, 245, 249],
          textColor: [15, 23, 42],
          fontStyle: 'bold',
          fontSize: 7,
        },
        bodyStyles: { fontSize: 7, textColor: [15, 23, 42], minCellHeight: 12 },
        columnStyles: {
          0: { cellWidth: 14, halign: 'center' },
          1: { cellWidth: 30 },
          2: { cellWidth: 'auto' },
          3: { cellWidth: 18, halign: 'center' },
        },
        margin: { left: 25, right: 25 },
        didDrawCell: (data) => {
          if (data.section === 'body' && data.column.index === 0) {
            const rowIndex = data.row.index;
            const row = extraRows[rowIndex];
            if (row?.imageUrl) {
              const imgData = imageCache.get(row.imageUrl);
              if (imgData) {
                try {
                  doc.addImage(imgData, 'AUTO', data.cell.x + 1, data.cell.y + 1, 10, 10);
                } catch { /* skip */ }
              }
            }
          }
        },
      });

      // @ts-expect-error jspdf-autotable adds this property
      yPos = doc.lastAutoTable.finalY + 5;
    }

    // ── PIVOȚI & AMORTIZOARE (production sheet only) ──
    const pivotRows = buildPivotAccessoryRows(config, materialMap);
    if (pivotRows.length > 0) {
      ensureSpace(20 + pivotRows.length * 12);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(249, 115, 22);
      doc.text(s('PIVOȚI & AMORTIZOARE'), 25, yPos);
      yPos += 3;

      autoTable(doc, {
        startY: yPos,
        head: [['', i18next.t('pdf.code'), i18next.t('pdf.description'), i18next.t('pdf.qty')]],
        body: pivotRows.map(row => ['', row.code, row.description, row.quantity]),
        theme: 'grid',
        headStyles: {
          fillColor: [241, 245, 249],
          textColor: [15, 23, 42],
          fontStyle: 'bold',
          fontSize: 7,
        },
        bodyStyles: { fontSize: 7, textColor: [15, 23, 42], minCellHeight: 12 },
        columnStyles: {
          0: { cellWidth: 14, halign: 'center' },
          1: { cellWidth: 30 },
          2: { cellWidth: 'auto' },
          3: { cellWidth: 18, halign: 'center' },
        },
        margin: { left: 25, right: 25 },
        didDrawCell: (data) => {
          if (data.section === 'body' && data.column.index === 0) {
            const rowIndex = data.row.index;
            const row = pivotRows[rowIndex];
            if (row?.imageUrl) {
              const imgData = imageCache.get(row.imageUrl);
              if (imgData) {
                try {
                  doc.addImage(imgData, 'AUTO', data.cell.x + 1, data.cell.y + 1, 10, 10);
                } catch { /* skip */ }
              }
            }
          }
        },
      });

      // @ts-expect-error jspdf-autotable adds this property
      yPos = doc.lastAutoTable.finalY + 5;
    }

    const led = config.led as Record<string, unknown> | undefined;
    if (led && led.type && led.type !== 'none') {
      ensureSpace(12);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(249, 115, 22);
      doc.text(s(i18next.t('pdf.led')), 25, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      const ledLabels: Record<string, string> = { perimeter: i18next.t('pdf.ledLabels.perimeter'), integrated: i18next.t('pdf.ledLabels.integrated'), with_defogging: i18next.t('pdf.ledLabels.with_defogging') };
      const parts: string[] = [ledLabels[String(led.type)] || String(led.type)];
      if (led.colorTemp) {
        const tempLabels: Record<string, string> = { warm: i18next.t('pdf.tempLabels.warm'), neutral: i18next.t('pdf.tempLabels.neutral'), cool: i18next.t('pdf.tempLabels.cool') };
        parts.push(tempLabels[String(led.colorTemp)] || String(led.colorTemp));
      }
      doc.text(parts.join(', '), 25, yPos);
      yPos += 7;
    }

    // ── Production stages checkboxes ──
    ensureSpace(25);
    yPos += 3;
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(s(i18next.t('pdf.productionStages')), 25, yPos);
    
    yPos += 7;
    const stages = [i18next.t('pdf.stageCutting'), i18next.t('pdf.stageProcessing'), i18next.t('pdf.stageHardening'), i18next.t('pdf.stageControl'), i18next.t('pdf.stagePacking')];
    const checkboxSize = 4;
    let xPos = 25;
    
    stages.forEach((stage) => {
      doc.setDrawColor(156, 163, 175);
      doc.rect(xPos, yPos - 3, checkboxSize, checkboxSize);
      doc.setTextColor(15, 23, 42);
      doc.text(stage, xPos + checkboxSize + 2, yPos);
      xPos += 35;
    });
    
    // Notes field
    yPos += 12;
    doc.setTextColor(100, 116, 139);
    doc.text(s(i18next.t('pdf.notes')), 25, yPos);
    doc.setDrawColor(226, 232, 240);
    doc.line(65, yPos, pageWidth - 25, yPos);
    
    yPos += 15;
  }
  
  // ── Signature area ──
  yPos = pageHeight - 40;
  doc.setDrawColor(226, 232, 240);
  doc.line(20, yPos, pageWidth - 20, yPos);
  
  yPos += 10;
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(s(i18next.t('pdf.operator')), 25, yPos);
  doc.line(55, yPos, 100, yPos);
  doc.text(s(i18next.t('pdf.signature')), 110, yPos);
  doc.line(140, yPos, pageWidth - 25, yPos);
  
  yPos += 10;
  doc.text(s(i18next.t('pdf.completionDate')), 25, yPos);
  doc.line(65, yPos, 100, yPos);
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text(
    `${i18next.t('pdf.generatedAt')} ${format(new Date(), 'dd.MM.yyyy HH:mm')} | ${s(company.name)}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );
  
  return doc;
}

// =============================================
// Installation Sheet PDF (Fisa de Montaj)
// =============================================

interface InstallationClientInfo {
  name: string;
  company_name?: string;
  phone?: string;
  email?: string;
}

export async function generateInstallationSheetPDF(
  company: CompanyInfo,
  client: InstallationClientInfo | null,
  order: OrderInfo,
  products: OrderProduct[],
  preResolvedMaterialMap?: Map<string, { name: string; image_url: string | null }>
): Promise<jsPDF> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ── Pre-process: collect all materialCodes and fetch from DB ──
  const allCodes: string[] = [];
  products.forEach(p => {
    const codes = extractMaterialCodes((p.full_config || p.configuration) as Record<string, unknown>);
    allCodes.push(...codes);
  });

  const uniqueCodes = [...new Set(allCodes)].filter(Boolean);
  const parentCodesSet = new Set<string>();
  uniqueCodes.forEach(code => {
    const parts = code.split('.');
    if (parts.length > 2) parentCodesSet.add(parts.slice(0, -1).join('.'));
  });
  const allQueryCodes = [...new Set([...uniqueCodes, ...parentCodesSet])];
  const materialMap = new Map<string, { name: string; image_url: string | null }>();
  const imageCache = new Map<string, string | null>();

  if (preResolvedMaterialMap) {
    for (const [k, v] of preResolvedMaterialMap) materialMap.set(k, { name: v.name, image_url: v.image_url });
    for (const code of allQueryCodes) {
      const entry = materialMap.get(code);
      if (entry && !entry.image_url && code.includes('.')) {
        let parent = code;
        while (parent.includes('.')) {
          parent = parent.replace(/\.[^.]+$/, '');
          const parentEntry = materialMap.get(parent);
          if (parentEntry?.image_url) { entry.image_url = parentEntry.image_url; break; }
        }
      }
    }
  } else if (allQueryCodes.length > 0) {
    const { data: materials } = await supabase
      .from('materials')
      .select('code, name, image_url')
      .in('code', allQueryCodes);

    if (materials) {
      for (const m of materials) {
        materialMap.set(m.code, { name: m.name, image_url: m.image_url });
      }
    }
    const codesNeedingData = allQueryCodes.filter(c => {
      const existing = materialMap.get(c);
      return !existing || !existing.image_url;
    });
    if (codesNeedingData.length > 0) {
      const { data: pricingData } = await supabase
        .from('pricing_config')
        .select('code, name, image_url')
        .in('code', codesNeedingData);
      if (pricingData) {
        for (const p of pricingData) {
          const existing = materialMap.get(p.code);
          if (!existing) {
            materialMap.set(p.code, { name: p.name || p.code, image_url: p.image_url || null });
          } else if (!existing.image_url && p.image_url) {
            existing.image_url = p.image_url;
          }
        }
      }
    }
  }

  if (materialMap.size > 0) {
    const imageLoadPromises: Array<Promise<void>> = [];
    for (const m of materialMap.values()) {
      if (m.image_url) {
        const url = m.image_url;
        if (!imageCache.has(url)) {
          imageLoadPromises.push(
            loadImageAsBase64(url).then(data => { imageCache.set(url, data); })
          );
        }
      }
    }
    await Promise.all(imageLoadPromises);
  }

  // Accent color: green for installation sheet
  const accent: [number, number, number] = [22, 163, 74];

  // ── Logo ──
  if (company.logoUrl) {
    const logoData = await loadImageAsBase64(company.logoUrl);
    if (logoData) {
      try {
        const logoLayout = resolveLogoLayout(pageWidth, company.pdfLogoSize, company.pdfLogoPosition, 14, 20);
        doc.addImage(logoData, 'AUTO', logoLayout.x, 10, logoLayout.size, logoLayout.size);
      } catch { /* skip */ }
    }
  }

  // ── Header ──
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...accent);
  doc.text(s(i18next.t('pdf.installationSheetTitle')), pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(`Comanda: ${order.order_number}`, pageWidth / 2, 29, { align: 'center' });

  // Issue date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  const issueDate = format(new Date(), 'dd.MM.yyyy');
  doc.text(`${i18next.t('pdf.issueDate')} ${issueDate}`, pageWidth / 2, 36, { align: 'center' });

  // ── Client info box ──
  doc.setFillColor(240, 253, 244); // green-50
  doc.roundedRect(20, 42, pageWidth - 40, 36, 3, 3, 'F');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...accent);
  doc.text(s(i18next.t('pdf.client')), 25, 51);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  let clientY = 58;
  if (client) {
    doc.setFont('helvetica', 'bold');
    doc.text(s(client.company_name || client.name), 25, clientY);
    doc.setFont('helvetica', 'normal');
    if (client.phone) doc.text(`Tel: ${client.phone}`, 100, clientY);
    clientY += 6;
    if (client.email) { doc.text(`Email: ${client.email}`, 25, clientY); clientY += 6; }
  } else {
    doc.text(s(i18next.t('pdf.unspecifiedClient')), 25, clientY);
  }

  // Delivery address
  if (order.delivery_address) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...accent);
    doc.text(s(i18next.t('pdf.deliveryAddress')), 25, clientY + 2);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    const addrLines = doc.splitTextToSize(s(order.delivery_address), pageWidth - 100);
    doc.text(addrLines, 75, clientY + 2);
  }

  let yPos = 86;

  const ensureSpace = (needed: number) => {
    if (yPos + needed > pageHeight - 20) {
      doc.addPage();
      yPos = 20;
    }
  };

  // Helper to draw accessory table (green accent)
  const drawAccTable = (
    rows: Array<{ code: string; description: string; quantity: string; imageUrl: string | null }>,
    title: string
  ) => {
    if (rows.length === 0) return;
    ensureSpace(20 + rows.length * 12);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...accent);
    doc.text(title, 25, yPos);
    yPos += 4;

    autoTable(doc, {
      startY: yPos,
      head: [['', i18next.t('pdf.code'), i18next.t('pdf.description'), i18next.t('pdf.qty')]],
      body: rows.map(row => ['', row.code, row.description, row.quantity]),
      theme: 'grid',
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: { fontSize: 9, textColor: [15, 23, 42], minCellHeight: 14 },
      columnStyles: {
        0: { cellWidth: 14, halign: 'center' },
        1: { cellWidth: 30 },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 18, halign: 'center' },
      },
      margin: { left: 25, right: 25 },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 0) {
          const rowIndex = data.row.index;
          const row = rows[rowIndex];
          if (row?.imageUrl) {
            const imgData = imageCache.get(row.imageUrl);
            if (imgData) {
              try {
                doc.addImage(imgData, 'AUTO', data.cell.x + 1, data.cell.y + 1, 10, 10);
              } catch { /* skip */ }
            }
          }
        }
      },
    });

    // @ts-expect-error jspdf-autotable adds this property
    yPos = doc.lastAutoTable.finalY + 5;
  };

  // ── Each product ──
  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    const config = (product.full_config || product.configuration) as Record<string, unknown>;

    ensureSpace(80);

    // Product header bar (green)
    doc.setFillColor(...accent);
    doc.roundedRect(20, yPos, pageWidth - 40, 10, 2, 2, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`${index + 1}. ${s(getProductTypeLabels()[product.product_type] || product.product_type)}`, 25, yPos + 7);
    doc.text(`${i18next.t('pdf.quantity')} ${product.quantity}`, pageWidth - 35, yPos + 7, { align: 'right' });
    yPos += 15;

    // ── 3D Snapshot ──
    const fullConfig = product.full_config as Record<string, unknown> | undefined;
    const savedSnapshot = fullConfig?.snapshotBase64 as string | undefined;
    if (savedSnapshot) {
      const imgWidth = 100;
      const imgHeight = 66;
      ensureSpace(imgHeight + 10);
      try {
        const xCenter = (pageWidth - imgWidth) / 2;
        doc.addImage(savedSnapshot, 'PNG', xCenter, yPos, imgWidth, imgHeight);
        yPos += imgHeight + 5;
      } catch { /* skip */ }
    }

    // ── DIMENSIUNI ──
    const dims = config.dimensions as Record<string, number> | undefined;
    if (dims) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...accent);
      doc.text(s(i18next.t('pdf.dimensions')), 25, yPos);
      yPos += 6;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      const parts: string[] = [];
      if (dims.width && dims.height && dims.depth) {
        parts.push(`${dims.width} x ${dims.height} x ${dims.depth} mm`);
      } else if (dims.width && dims.height) {
        parts.push(`${dims.width} x ${dims.height} mm`);
      } else if (dims.length && dims.height) {
        parts.push(`${dims.length} x ${dims.height} mm`);
      }
      if (dims.doorWidth) parts.push(`${i18next.t('pdf.configLabels.door')} ${dims.doorWidth} mm`);
      if (dims.quantity && dims.quantity > 1) parts.push(`${i18next.t('pdf.configLabels.quantity')} ${dims.quantity} buc`);
      if (dims.diameter) parts.push(`${i18next.t('pdf.configLabels.diameter')} ${dims.diameter} mm`);
      doc.text(parts.join('  |  '), 25, yPos);
      yPos += 7;
    }

    // ── STICLA ──
    const glass = config.glass as Record<string, unknown> | undefined;
    if (glass) {
      ensureSpace(15);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...accent);
      doc.text(s(i18next.t('pdf.glass')), 25, yPos);
      yPos += 6;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      const glassParts: string[] = [];
      if (glass.thickness) glassParts.push(`${glass.thickness}mm`);
      if (glass.type) glassParts.push(getGlassTypeLabel(String(glass.type)));
      if (glass.tempered) glassParts.push(i18next.t('pdf.configLabels.tempered'));
      if (glass.laminated) glassParts.push(i18next.t('pdf.configLabels.laminated'));
      if (glass.antiCalc) glassParts.push(i18next.t('pdf.configLabels.antiCalc'));
      doc.text(glassParts.join(', '), 25, yPos);
      yPos += 7;
    }

    // ── Cabin & Door type ──
    if (config.cabinType || config.doorType) {
      ensureSpace(25);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...accent);
      doc.text(s(i18next.t('pdf.configType')), 25, yPos);
      yPos += 6;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      const typeParts: string[] = [];
      if (config.cabinType) typeParts.push(`${i18next.t('pdf.configLabels.cabin')} ${s(getCabinTypeLabel(String(config.cabinType)))}`);
      if (config.doorType) typeParts.push(`${i18next.t('pdf.configLabels.doorType')} ${s(getDoorTypeLabel(String(config.doorType)))}`);
      doc.text(typeParts.join('  |  '), 25, yPos);
      yPos += 7;
    }

    // ── Mirror type ──
    if (config.mirrorType) {
      ensureSpace(12);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...accent);
      doc.text(s(i18next.t('pdf.mirrorType')), 25, yPos);
      yPos += 6;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      const mirrorLabels: Record<string, string> = { silver: i18next.t('pdf.mirrorLabels.silver'), bronze: i18next.t('pdf.mirrorLabels.bronze'), grey: i18next.t('pdf.mirrorLabels.grey') };
      doc.text(mirrorLabels[String(config.mirrorType)] || String(config.mirrorType), 25, yPos);
      yPos += 7;
    }

    // ── ACCESORII ──
    const accRows = aggregateAccessories(buildAccessoryRows(config, materialMap));
    drawAccTable(accRows, 'ACCESORII');

    // ── GARNITURI ──
    const sealRows = buildSealsInfo(config, materialMap);
    drawAccTable(sealRows, 'GARNITURI');

    // ── ACCESORII SUPLIMENTARE ──
    const extraRows = buildExtraAccessories(config, materialMap);
    drawAccTable(extraRows, 'ACCESORII SUPLIMENTARE');

    // ── PIVOȚI & AMORTIZOARE ──
    const pivotRows = buildPivotAccessoryRows(config, materialMap);
    drawAccTable(pivotRows, s(i18next.t('pdf.pivotsAndDampers')));

    // ── LED ──
    const led = config.led as Record<string, unknown> | undefined;
    if (led && led.type && led.type !== 'none') {
      ensureSpace(12);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...accent);
      doc.text(s(i18next.t('pdf.led')), 25, yPos);
      yPos += 6;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      const ledLabels: Record<string, string> = { perimeter: i18next.t('pdf.ledLabels.perimeter'), integrated: i18next.t('pdf.ledLabels.integrated'), with_defogging: i18next.t('pdf.ledLabels.with_defogging') };
      doc.text(ledLabels[String(led.type)] || String(led.type), 25, yPos);
      yPos += 7;
    }

    // Notes for product
    if (product.notes) {
      ensureSpace(15);
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(s(`${i18next.t('pdf.notes')} ${product.notes}`), 25, yPos);
      yPos += 7;
    }

    yPos += 5;
  }

  // ── Signatures section ──
  ensureSpace(70);
  yPos += 5;
  doc.setDrawColor(226, 232, 240);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 10;

  // Beneficiary signature (left)
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(s(i18next.t('pdf.beneficiarySignature')), 25, yPos);
  doc.setDrawColor(156, 163, 175);
  doc.line(25, yPos + 15, 90, yPos + 15);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(s(i18next.t('pdf.dateLabel')), 25, yPos + 22);

  // Installation team signature (right)
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(s(i18next.t('pdf.installTeamSignature')), pageWidth / 2 + 10, yPos);
  doc.line(pageWidth / 2 + 10, yPos + 15, pageWidth - 25, yPos + 15);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(s(i18next.t('pdf.dateLabel')), pageWidth / 2 + 10, yPos + 22);

  yPos += 35;

  // ── Observations & Complaints table ──
  ensureSpace(60);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...accent);
  doc.text(s(i18next.t('pdf.observationsAndComplaints')), 25, yPos);
  yPos += 5;

  autoTable(doc, {
    startY: yPos,
    head: [[i18next.t('pdf.nr'), i18next.t('pdf.description'), i18next.t('pdf.date'), s(i18next.t('pdf.beneficiarySign'))]],
    body: [
      ['1', '', '', ''],
      ['2', '', '', ''],
      ['3', '', '', ''],
      ['4', '', '', ''],
      ['5', '', '', ''],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [22, 163, 74],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: { fontSize: 10, textColor: [15, 23, 42], minCellHeight: 16 },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 30 },
      3: { cellWidth: 40 },
    },
    margin: { left: 25, right: 25 },
  });

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(156, 163, 175);
  doc.text(
    `${i18next.t('pdf.generatedAt')} ${format(new Date(), 'dd.MM.yyyy HH:mm')} | ${s(company.name)}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  return doc;
}
