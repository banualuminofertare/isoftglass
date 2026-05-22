import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PDFDownloadButtons } from './PDFDownloadButtons';
import { aggregateAccessories } from '@/lib/pdf/accessoryAggregator';
import { useCurrency } from '@/contexts/CurrencyContext';
import type { Order, OrderProduct } from '@/hooks/useOrders';

const t = (key: string, opts?: Record<string, unknown>) => i18next.t(key, opts);

// finishLabels — dynamically translated
function getFinishLabel(key: string): string {
  return i18next.t(`orderPreview.finishes.${key}`, { defaultValue: key });
}

interface AccessoryRow {
  code: string;
  description: string;
  quantity: string;
  numericQty: number;
  imageUrl: string | null;
  unitPrice: number | null;
  totalPrice: number | null;
}

type AnyObj = Record<string, unknown>;

type DeductionsMap = Map<string, Record<string, number>>;

/** Compute glass deductions from material codes when not pre-saved in config */
function computeDeductionsFromCodes(config: AnyObj, deductionsMap: DeductionsMap): { wDed: number; hDed: number } {
  // First check saved deductions
  const seals = (config.accessories as AnyObj | undefined)?.seals as AnyObj | undefined;
  const gd = config.glassDeductions as AnyObj | undefined;
  
  const savedW = Number(seals?.totalWidthDeduction) || Number(gd?.totalWidthDeduction) || 0;
  const savedH = Number(seals?.totalHeightDeduction) || Number(gd?.totalHeightDeduction) || 0;
  
  if (savedW > 0 || savedH > 0) return { wDed: savedW, hDed: savedH };
  
  // Fallback: compute from material codes in config
  if (deductionsMap.size === 0) return { wDed: 0, hDed: 0 };
  
  const codes = extractMaterialCodes(config);
  let sideA = 0, sideB = 0, top = 0, bottom = 0;
  for (const code of codes) {
    const d = deductionsMap.get(code);
    if (!d) continue;
    if (d.side_a) sideA = Math.max(sideA, d.side_a);
    if (d.side_b) sideB = Math.max(sideB, d.side_b);
    if (d.top) top = Math.max(top, d.top);
    if (d.bottom) bottom = Math.max(bottom, d.bottom);
  }
  return { wDed: sideA + sideB, hDed: top + bottom };
}
function computeTotalGlassArea(config: AnyObj, productType: string, deductionsMap: DeductionsMap = new Map()): number {
  const area = (w: number, h: number) => (w * h) / 1_000_000;
  const dims = config.dimensions as AnyObj | undefined;
  if (!dims) return 0;

  const w = Number(dims.width) || 0;
  const h = Number(dims.height) || 0;
  const qty = Number(dims.quantity) || 1;

  if (productType === 'shower') {
    const acc = config.accessories as AnyObj | undefined;
    const lat = config.lateralConfig as AnyObj | undefined;
    const cabinType = String(config.cabinType || '');
    const doorW = Number(dims.doorWidth) || w;
    const seals = acc?.seals as AnyObj | undefined;
    const { wDed, hDed } = (() => {
      const savedW = Number(seals?.totalWidthDeduction) || 0;
      const savedH = Number(seals?.totalHeightDeduction) || 0;
      if (savedW > 0 || savedH > 0) return { wDed: savedW, hDed: savedH };
      return computeDeductionsFromCodes(config, deductionsMap);
    })();
    let total = 0;

    switch (cabinType) {
      case 'corner_90': {
        total = area(doorW - wDed, h - hDed);
        const fp = acc?.fixedPanel as AnyObj | undefined;
        const fpL = fp?.left as AnyObj | undefined;
        const fpR = fp?.right as AnyObj | undefined;
        if (fpL && fpL.enabled) total += area(Number(fpL.width) || 0, (Number(fpL.height) || h) - hDed);
        if (fpR && fpR.enabled) total += area(Number(fpR.width) || 0, (Number(fpR.height) || h) - hDed);
        if (lat && lat.enabled) {
          const latDoorW = Number(dims.lateralDoorWidth) || 0;
          total += area(latDoorW - wDed, h - hDed);
          const latFp = lat.fixedPanel as AnyObj | undefined;
          const latL = latFp?.left as AnyObj | undefined;
          const latR = latFp?.right as AnyObj | undefined;
          if (latL && latL.enabled) total += area(Number(latL.width) || 0, (Number(latL.height) || h) - hDed);
          if (latR && latR.enabled) total += area(Number(latR.width) || 0, (Number(latR.height) || h) - hDed);
        } else {
          const openingSide = String((acc as AnyObj)?.openingSide || 'front');
          const depth = Number(dims.depth) || 0;
          const fullPanel = openingSide === 'front' ? depth : w;
          total += area(fullPanel - wDed, h - hDed);
        }
        break;
      }
      case 'walk_in':
      case 'bathtub':
        total = area(w - wDed, h - hDed);
        const fpWi = (acc?.fixedPanel as AnyObj);
        if (fpWi) {
          const fpWiL = fpWi.left as AnyObj | undefined;
          const fpWiR = fpWi.right as AnyObj | undefined;
          if (fpWiL && fpWiL.enabled) total += area(Number(fpWiL.width) || 0, (Number(fpWiL.height) || h) - hDed);
          if (fpWiR && fpWiR.enabled) total += area(Number(fpWiR.width) || 0, (Number(fpWiR.height) || h) - hDed);
        }
        break;
      case 'pentagon':
        total = area(w - wDed, h - hDed) * 1.5;
        break;
      default:
        total = area(doorW || w, h - hDed);
        break;
    }
    return total;
  }

  if (productType === 'balustrade') {
    const { wDed, hDed } = computeDeductionsFromCodes(config, deductionsMap);
    const length = Number(dims.length) || 0;
    const panelCount = Number(dims.panelCount) || 1;
    const stairsConfig = dims.stairsConfig as AnyObj | undefined;

    if (stairsConfig) {
      const stepCount = Number(stairsConfig.stepCount) || 0;
      const stepH = Number(stairsConfig.stepHeight) || 170;
      const stepD = Number(stairsConfig.stepDepth) || 300;
      const panelH = (Number(stairsConfig.stairPanelHeight) || h) - hDed;
      const hasLanding = Boolean(stairsConfig.hasIntermediateLanding);
      const landingPos = Number(stairsConfig.landingPosition) || stepCount;
      const landingLen = Number(stairsConfig.landingLength) || 0;
      const finalLen = Number(stairsConfig.finalLandingLength) || 0;
      const intH = (Number(stairsConfig.intermediateLandingPanelHeight) || panelH) - hDed;
      const finH = (Number(stairsConfig.finalLandingPanelHeight) || panelH) - hDed;

      let totalArea = 0;
      const rampLength = stepCount * stepD;
      totalArea += area(rampLength - wDed, panelH);
      if (hasLanding && landingLen > 0) totalArea += area(landingLen - wDed, intH);
      if (finalLen > 0) totalArea += area(finalLen - wDed, finH);
      return totalArea;
    }

    let totalArea = 0;
    const panelWidth = length / panelCount - wDed;
    const bH = h - hDed;
    totalArea = area(panelWidth * panelCount, bH);

    // Corner extensions
    const corners = dims.corners as AnyObj | undefined;
    if (corners) {
      const addCorner = (c: AnyObj | undefined) => {
        if (!c || !c.enabled) return;
        totalArea += area((Number(c.length) || 0) - wDed, bH);
        const sub = c.subCorners as AnyObj | undefined;
        if (sub) {
          const sl = sub.left as AnyObj | undefined;
          const sr = sub.right as AnyObj | undefined;
          if (sl?.enabled) totalArea += area((Number(sl.length) || 0) - wDed, bH);
          if (sr?.enabled) totalArea += area((Number(sr.length) || 0) - wDed, bH);
        }
      };
      addCorner(corners.left as AnyObj | undefined);
      addCorner(corners.right as AnyObj | undefined);
    }
    return totalArea;
  }

  if (productType === 'panel') {
    const { wDed, hDed } = computeDeductionsFromCodes(config, deductionsMap);
    const pw = config.partitionWall as AnyObj | undefined;
    if (pw && pw.enabled) {
      let sum = 0;
      const cells = pw.cells as Array<AnyObj> | undefined;
      if (cells) {
        sum += cells.reduce((s, cell) => s + area((Number(cell.width) || 0) - wDed, (Number(cell.height) || 0) - hDed), 0);
      } else {
        sum += area((Number(pw.totalWidth) || w) - wDed, (Number(pw.totalHeight) || h) - hDed);
      }
      // Side panels
      const sidePanels = pw.sidePanels as AnyObj | undefined;
      (['left', 'right'] as const).forEach(side => {
        const sp = sidePanels?.[side] as AnyObj | undefined;
        if (!sp?.enabled) return;
        const spCells = sp.cells as Array<AnyObj> | undefined;
        if (spCells && spCells.length > 0) {
          spCells.forEach(cell => {
            if (String(cell.type) !== 'panel') return;
            sum += area((Number(cell.width) || 0) - wDed, (Number(cell.height) || 0) - hDed);
          });
        } else {
          const spH = (Number(sp.height) || Number(pw.totalHeight) || h) - hDed;
          sum += area((Number(sp.width) || 0) - wDed, spH);
        }
      });
      return sum;
    }
    return area(w - wDed, h - hDed) * qty;
  }

  // door, mirror, kitchen_front
  {
    const { wDed, hDed } = computeDeductionsFromCodes(config, deductionsMap);
    return area(w - wDed, h - hDed) * qty;
  }
}
interface GlassPanelDetail { label: string; width: number; height: number; area: number; }

/** Returns individual glass panel details with label, dimensions, and area */
function getGlassPanelDetails(config: AnyObj, productType: string, deductionsMap: DeductionsMap = new Map()): GlassPanelDetail[] {
  const mkPanel = (label: string, w: number, h: number): GlassPanelDetail => ({
    label, width: Math.round(w), height: Math.round(h), area: (w * h) / 1_000_000,
  });
  const dims = config.dimensions as AnyObj | undefined;
  if (!dims) return [];
  const w = Number(dims.width) || 0;
  const h = Number(dims.height) || 0;
  const qty = Number(dims.quantity) || 1;

  if (productType === 'shower') {
    const acc = config.accessories as AnyObj | undefined;
    const lat = config.lateralConfig as AnyObj | undefined;
    const cabinType = String(config.cabinType || '');
    const doorW = Number(dims.doorWidth) || w;
    const seals = acc?.seals as AnyObj | undefined;
    const { wDed, hDed } = (() => {
      const savedW = Number(seals?.totalWidthDeduction) || 0;
      const savedH = Number(seals?.totalHeightDeduction) || 0;
      if (savedW > 0 || savedH > 0) return { wDed: savedW, hDed: savedH };
      return computeDeductionsFromCodes(config, deductionsMap);
    })();

    // Profile deductions (U perimeter) — only for fixed panels, never for doors
    const profileHDed = Number(seals?.profileHeightDeduction) || 0;
    const profileWDed = Number(seals?.profileWidthDeduction) || 0;

    // Lateral deductions
    const latSeals = (lat as AnyObj)?.seals as AnyObj | undefined;
    const lateralHDed = Number(latSeals?.totalHeightDeduction) || 0;
    const lateralWDed = Number(latSeals?.totalWidthDeduction) || 0;
    const lateralProfileHDed = Number(latSeals?.profileHeightDeduction) || profileHDed;
    const lateralProfileWDed = Number(latSeals?.profileWidthDeduction) || 0;

    const FIXED_PANEL_EXTRA_H = 5; // fixed panels are 5mm taller than door at base
    const panels: GlassPanelDetail[] = [];

    // Door panel — for fixed_panel (Paravan Fix): only profile deduction (e.g. 2000 - 19 = 1981)
    // For other types: standard hDed deduction (includes 10mm gap etc.)
    const mainPanelH = cabinType === 'fixed_panel' ? h - profileHDed : h - hDed;
    panels.push(mkPanel(cabinType === 'fixed_panel' ? t('orderPreview.fixedPanelFront') : t('orderPreview.doorFront'), doorW - wDed, mainPanelH));

    // Frontal fixed panels — apply profile deduction + 5mm extra height
    const fp = acc?.fixedPanel as AnyObj | undefined;
    const fpL = fp?.left as AnyObj | undefined;
    const fpR = fp?.right as AnyObj | undefined;
    const fixedH = h - hDed + FIXED_PANEL_EXTRA_H - profileHDed;
    if (fpL && fpL.enabled) panels.push(mkPanel(t('orderPreview.fixedPanelLeft'), Number(fpL.width) || 0, fixedH));
    if (fpR && fpR.enabled) panels.push(mkPanel(t('orderPreview.fixedPanelRight'), Number(fpR.width) || 0, fixedH));

    if (cabinType === 'corner_90') {
      if (lat && lat.enabled) {
        const latDoorW = Number(dims.lateralDoorWidth) || 0;
        // Lateral door — no profile deduction
        panels.push(mkPanel(t('orderPreview.doorLateral'), latDoorW - wDed, h - hDed));
        const latFp = (lat as AnyObj).fixedPanel as AnyObj | undefined;
        const latL = latFp?.left as AnyObj | undefined;
        const latR = latFp?.right as AnyObj | undefined;
        const latFixedH = h - (lateralHDed || hDed) + FIXED_PANEL_EXTRA_H - lateralProfileHDed;
        if (latL && latL.enabled) panels.push(mkPanel(t('orderPreview.fixedPanelLateralLeft'), Number(latL.width) || 0, latFixedH));
        if (latR && latR.enabled) panels.push(mkPanel(t('orderPreview.fixedPanelLateralRight'), Number(latR.width) || 0, latFixedH));
      } else {
        const openingSide = String((acc as AnyObj)?.openingSide || 'front');
        const depth = Number(dims.depth) || 0;
        const fullPanel = openingSide === 'front' ? depth : w;
        const sidePanelH = h - (lateralHDed || hDed) + FIXED_PANEL_EXTRA_H - lateralProfileHDed;
        const sidePanelW = fullPanel - (lateralWDed || wDed) - lateralProfileWDed;
        panels.push(mkPanel(t('orderPreview.sidePanel'), sidePanelW, sidePanelH));
      }
    } else if (cabinType === 'pentagon') {
      panels[0] = mkPanel(t('orderPreview.pentagonPanel'), w - wDed, h - hDed);
      panels.push(mkPanel(t('orderPreview.pentagonExtension'), w, Math.round(h * 0.5)));
    }
    return panels;
  }

  if (productType === 'balustrade') {
    const { wDed, hDed } = computeDeductionsFromCodes(config, deductionsMap);
    const length = Number(dims.length) || 0;
    const panelCount = Number(dims.panelCount) || 1;
    const panels: GlassPanelDetail[] = [];
    const stairsConfig = dims.stairsConfig as AnyObj | undefined;
    const bH = h - hDed;

    if (stairsConfig) {
      const stepCount = Number(stairsConfig.stepCount) || 0;
      const stepD = Number(stairsConfig.stepDepth) || 300;
      const panelH = (Number(stairsConfig.stairPanelHeight) || h) - hDed;
      const hasLanding = Boolean(stairsConfig.hasIntermediateLanding);
      const landingLen = Number(stairsConfig.landingLength) || 0;
      const finalLen = Number(stairsConfig.finalLandingLength) || 0;
      const intH = (Number(stairsConfig.intermediateLandingPanelHeight) || panelH) - hDed;
      const finH = (Number(stairsConfig.finalLandingPanelHeight) || panelH) - hDed;

      panels.push(mkPanel(t('orderPreview.stairRamp'), stepCount * stepD - wDed, panelH));
      if (hasLanding && landingLen > 0) panels.push(mkPanel(t('orderPreview.intermediateLanding'), landingLen - wDed, intH));
      if (finalLen > 0) panels.push(mkPanel(t('orderPreview.finalLanding'), finalLen - wDed, finH));
      return panels;
    }

    const panelWidth = Math.round(length / panelCount) - wDed;
    for (let i = 0; i < panelCount; i++) {
      panels.push(mkPanel(t('orderPreview.panelN', { n: i + 1 }), panelWidth, bH));
    }

    const corners = dims.corners as AnyObj | undefined;
    if (corners) {
      const addCorner = (c: AnyObj | undefined, side: string) => {
        if (!c || !c.enabled) return;
        panels.push(mkPanel(t('orderPreview.cornerSide', { side: t(`orderPreview.${side}`) }), (Number(c.length) || 0) - wDed, bH));
        const sub = c.subCorners as AnyObj | undefined;
        if (sub) {
          const sl = sub.left as AnyObj | undefined;
          const sr = sub.right as AnyObj | undefined;
          if (sl?.enabled) panels.push(mkPanel(t('orderPreview.subCornerSideDir', { side: t(`orderPreview.${side}`), dir: t('orderPreview.left') }), (Number(sl.length) || 0) - wDed, bH));
          if (sr?.enabled) panels.push(mkPanel(t('orderPreview.subCornerSideDir', { side: t(`orderPreview.${side}`), dir: t('orderPreview.right') }), (Number(sr.length) || 0) - wDed, bH));
        }
      };
      addCorner(corners.left as AnyObj | undefined, 'stânga');
      addCorner(corners.right as AnyObj | undefined, 'dreapta');
    }
    return panels;
  }

  if (productType === 'panel') {
    const { wDed, hDed } = computeDeductionsFromCodes(config, deductionsMap);
    const pw = config.partitionWall as AnyObj | undefined;
    if (pw && pw.enabled) {
      const panels: GlassPanelDetail[] = [];
      const cells = pw.cells as Array<AnyObj> | undefined;
      const doors = pw.doors as Array<AnyObj> | undefined;
      if (cells) {
        cells.forEach((cell, i) => {
          if (String(cell.type) === 'door') {
            const doorCfg = Array.isArray(doors)
              ? doors.find(d => d.cellId === cell.id)
              : undefined;
            const dw = doorCfg ? Number(doorCfg.doorWidth) : ((Number(cell.width) || 0) - 11);
            const dh = doorCfg ? Number(doorCfg.doorHeight) : ((Number(cell.height) || 0) - 18);
            panels.push(mkPanel(t('orderPreview.doorN', { n: i + 1 }), dw, dh));
          } else {
            panels.push(mkPanel(t('orderPreview.panelN', { n: i + 1 }), (Number(cell.width) || 0) - wDed, (Number(cell.height) || 0) - hDed));
          }
        });
      } else {
        panels.push(mkPanel(t('orderPreview.glassWall'), (Number(pw.totalWidth) || w) - wDed, (Number(pw.totalHeight) || h) - hDed));
      }
      // Side panels
      const sidePanels = pw.sidePanels as AnyObj | undefined;
      (['left', 'right'] as const).forEach(side => {
        const sp = sidePanels?.[side] as AnyObj | undefined;
        if (!sp?.enabled) return;
        const sideLabel = t(`orderPreview.${side}`);
        const spCells = sp.cells as Array<AnyObj> | undefined;
        if (spCells && spCells.length > 0) {
          spCells.forEach((cell, i) => {
            if (String(cell.type) !== 'panel') return;
            panels.push(mkPanel(
              t('orderPreview.lateralSideN', { side: sideLabel, n: i + 1 }),
              (Number(cell.width) || 0) - wDed, (Number(cell.height) || 0) - hDed
            ));
          });
        } else {
          const spH = (Number(sp.height) || Number(pw.totalHeight) || h) - hDed;
          panels.push(mkPanel(t('orderPreview.lateralSide', { side: sideLabel }), (Number(sp.width) || 0) - wDed, spH));
        }
      });
      return panels;
    }
    const panels: GlassPanelDetail[] = [];
    for (let i = 0; i < qty; i++) panels.push(mkPanel(qty > 1 ? t('orderPreview.panelN', { n: i + 1 }) : t('orderPreview.panel'), w - wDed, h - hDed));
    return panels;
  }

  if (productType === 'door') {
    const { wDed, hDed } = computeDeductionsFromCodes(config, deductionsMap);
    return [mkPanel(t('orderPreview.door'), w - wDed, h - hDed)];
  }

  if (productType === 'mirror') {
    const { wDed, hDed } = computeDeductionsFromCodes(config, deductionsMap);
    const panels: GlassPanelDetail[] = [];
    for (let i = 0; i < qty; i++) panels.push(mkPanel(qty > 1 ? t('orderPreview.mirrorN', { n: i + 1 }) : t('orderPreview.mirror'), w - wDed, h - hDed));
    return panels;
  }

  // kitchen_front
  {
    const { wDed, hDed } = computeDeductionsFromCodes(config, deductionsMap);
    const panels: GlassPanelDetail[] = [];
    for (let i = 0; i < qty; i++) panels.push(mkPanel(qty > 1 ? t('orderPreview.frontN', { n: i + 1 }) : t('orderPreview.front'), w - wDed, h - hDed));
    return panels;
  }
}

function collectCodesFromSelections(selections: unknown): string[] {
  if (!Array.isArray(selections)) return [];
  return selections
    .map((s: AnyObj) => (typeof s?.materialCode === 'string' ? s.materialCode : ''))
    .filter(Boolean);
}

function extractMaterialCodes(config: AnyObj): string[] {
  const codes: string[] = [];
  const acc = config.accessories as AnyObj | undefined;
  if (acc) {
    const pushCode = (obj: AnyObj | undefined) => {
      if (obj?.materialCode && typeof obj.materialCode === 'string') codes.push(obj.materialCode);
      // Also collect from selections array
      codes.push(...collectCodesFromSelections(obj?.selections));
    };
    pushCode(acc.hinges as AnyObj | undefined);
    pushCode(acc.handle as AnyObj | undefined);
    pushCode(acc.profiles as AnyObj | undefined);

    // stabilizerSelections at accessories level
    codes.push(...collectCodesFromSelections(acc.stabilizerSelections));

    // ── Door-specific: lock, pivot, sliding system ──
    const lock = acc.lock as AnyObj | undefined;
    if (lock?.enabled && typeof lock.materialCode === 'string') codes.push(lock.materialCode);

    const pivot = acc.pivot as AnyObj | undefined;
    if (pivot && typeof pivot.materialCode === 'string') codes.push(pivot.materialCode);

    const slidingSystem = acc.slidingSystem as AnyObj | undefined;
    if (slidingSystem && typeof slidingSystem.materialCode === 'string') codes.push(slidingSystem.materialCode);

    // ── Balustrade-specific: mountPoints, handrail, uProfile ──
    const mountPoints = acc.mountPoints as AnyObj | undefined;
    if (mountPoints) {
      const mpCodes = mountPoints.materialCodes as string[] | undefined;
      if (Array.isArray(mpCodes)) mpCodes.forEach(c => { if (c) codes.push(c); });
      else if (typeof mountPoints.materialCode === 'string') codes.push(mountPoints.materialCode);
    }

    const handrail = acc.handrail as AnyObj | undefined;
    if (handrail) {
      const hrCodes = handrail.materialCodes as string[] | undefined;
      if (Array.isArray(hrCodes)) hrCodes.forEach(c => { if (c) codes.push(c); });
      else if (typeof handrail.materialCode === 'string') codes.push(handrail.materialCode);
    }

    const uProfile = acc.uProfile as AnyObj | undefined;
    if (uProfile) {
      const upCodes = uProfile.materialCodes as string[] | undefined;
      if (Array.isArray(upCodes)) upCodes.forEach(c => { if (c) codes.push(c); });
      else if (typeof uProfile.materialCode === 'string') codes.push(uProfile.materialCode);
    }

    const seals = acc.seals as AnyObj | undefined;
    if (seals) {
      if (typeof seals.magneticMaterialCode === 'string') codes.push(seals.magneticMaterialCode);
      if (typeof seals.rubberMaterialCode === 'string') codes.push(seals.rubberMaterialCode);
      if (typeof seals.thresholdMaterialCode === 'string') codes.push(seals.thresholdMaterialCode);
      codes.push(...collectCodesFromSelections(seals.magneticSelections));
      codes.push(...collectCodesFromSelections(seals.rubberSelections));
      codes.push(...collectCodesFromSelections(seals.thresholdSelections));
      // Door seal selections
      codes.push(...collectCodesFromSelections(seals.lateralSelections));
    }

    const extras = acc.extraAccessories as AnyObj[] | undefined;
    if (Array.isArray(extras)) extras.forEach(e => { if (typeof e.materialCode === 'string') codes.push(e.materialCode); });
  }

  // ── Balustrade cornerConnector (lives under dimensions) ──
  const dims = config.dimensions as AnyObj | undefined;
  if (dims) {
    const cc = dims.cornerConnector as AnyObj | undefined;
    if (cc) {
      const ccCodes = cc.materialCodes as string[] | undefined;
      if (Array.isArray(ccCodes)) ccCodes.forEach(c => { if (c) codes.push(c); });
      else if (typeof cc.materialCode === 'string') codes.push(cc.materialCode);
    }
  }

  // Top-level extraAccessories
  const topExtras = config.extraAccessories as AnyObj[] | undefined;
  if (Array.isArray(topExtras)) topExtras.forEach(e => { if (typeof e.materialCode === 'string') codes.push(e.materialCode); });

  // selectedKit code + items
  const kit = config.selectedKit as AnyObj | undefined;
  if (kit) {
    if (typeof kit.code === 'string') codes.push(kit.code);
    const kitItems = kit.items as AnyObj[] | undefined;
    if (Array.isArray(kitItems)) kitItems.forEach(item => { if (typeof item.material_code === 'string') codes.push(item.material_code); });
  }

  // partitionWall.doors[].accessories (hinges, handle, lock, extraAccessories)
  const pw = config.partitionWall as AnyObj | undefined;
  if (pw) {
    const doors = pw.doors as AnyObj[] | undefined;
    if (Array.isArray(doors)) {
      doors.forEach(d => {
        const dAcc = d.accessories as AnyObj | undefined;
        if (!dAcc) return;
        // Hinges (fallback to finish when materialCode is missing)
        const dHinges = dAcc.hinges as AnyObj | undefined;
        if (dHinges) {
          const hCode = (typeof dHinges.materialCode === 'string' && dHinges.materialCode) || (typeof dHinges.finish === 'string' && dHinges.finish) || '';
          if (hCode) codes.push(hCode);
          codes.push(...collectCodesFromSelections(dHinges.selections));
        }
        // Handle (fallback to finish when materialCode is missing)
        const dHandle = dAcc.handle as AnyObj | undefined;
        if (dHandle) {
          const hCode = (typeof dHandle.materialCode === 'string' && dHandle.materialCode) || (typeof dHandle.finish === 'string' && dHandle.finish) || '';
          if (hCode) codes.push(hCode);
          codes.push(...collectCodesFromSelections(dHandle.selections));
        }
        // Lock
        const dLock = dAcc.lock as AnyObj | undefined;
        if (dLock?.enabled && typeof dLock.materialCode === 'string') codes.push(dLock.materialCode);
        // Extra accessories
        const dExtras = dAcc.extraAccessories as AnyObj[] | undefined;
        if (Array.isArray(dExtras)) dExtras.forEach(e => { if (typeof e.materialCode === 'string') codes.push(e.materialCode); });
      });
    }
    // Perimeter profile selections
    const pwProfileSels = pw.profileSelections as AnyObj[] | undefined;
    if (Array.isArray(pwProfileSels)) {
      pwProfileSels.forEach(sel => { if (typeof sel.materialCode === 'string') codes.push(sel.materialCode); });
    } else if (typeof pw.profileMaterialCode === 'string') {
      codes.push(pw.profileMaterialCode);
    }
  }

  return codes.filter(Boolean);
}

type MatInfo = { name: string; image_url: string | null; unit_price: number | null; unit?: string };

function calcUProfileLength(config: AnyObj): number {
  const cabinType = (config.cabinType as string) || '';
  const dims = (config.dimensions as AnyObj) || {};
  const acc = (config.accessories as AnyObj) || {};
  const lateralConfig = (config.lateralConfig as AnyObj) || {};

  const w = (dims.width as number) || (dims.doorWidth as number) || 900;
  const h = (dims.height as number) || 2000;
  const d = (dims.depth as number) || 0;

  const fpLeft = (acc.fixedPanel as AnyObj)?.left as AnyObj | undefined;
  const fpRight = (acc.fixedPanel as AnyObj)?.right as AnyObj | undefined;

  let length = 0;
  const dw = (dims.doorWidth as number) || 0;

  switch (cabinType) {
    case 'corner_90':
      // Vertical: 2 walls (back-left + back-right)
      length = h + h;
      // Base frontal: only fixed panel widths (NOT door)
      if (fpLeft?.enabled) length += ((fpLeft.width as number) || 0);
      if (fpRight?.enabled) length += ((fpRight.width as number) || 0);
      // Base lateral
      if (lateralConfig.enabled) {
        const latFp = (lateralConfig.fixedPanel as AnyObj) || {};
        const latLeft = (latFp.left as AnyObj) || {};
        const latRight = (latFp.right as AnyObj) || {};
        if (latLeft.enabled) length += ((latLeft.width as number) || 0);
        if (latRight.enabled) length += ((latRight.width as number) || 0);
      } else {
        const openingSide = (acc.openingSide as string) || 'front';
        if (openingSide === 'front') {
          // Lateral is fully fixed → base = depth
          length += d;
        } else {
          // Frontal is fully fixed → base = width
          length += w;
        }
      }
      break;
    case 'walk_in':
      // 2 walls vertical + base only under fixed panels
      length = h * 2;
      if (fpLeft?.enabled) length += ((fpLeft.width as number) || 0);
      if (fpRight?.enabled) length += ((fpRight.width as number) || 0);
      if (!fpLeft?.enabled && !fpRight?.enabled) length += w;
      break;
    case 'pentagon':
      // Vertical wall + base minus door width
      length = h + (w * 2 + d * 2) - dw;
      break;
    case 'bathtub':
      // 1 wall vertical + base only under fixed panels
      length = h;
      if (fpLeft?.enabled) length += ((fpLeft.width as number) || 0);
      if (fpRight?.enabled) length += ((fpRight.width as number) || 0);
      if (!fpLeft?.enabled && !fpRight?.enabled) length += w;
      break;
    default:
      length = h * 2;
      break;
  }
  return length;
}

function makeRow(code: string, description: string, qty: number, qtyLabel: string, imageUrl: string | null, unitPrice: number | null, totalOverride?: number | null): AccessoryRow {
  return {
    code: code || '-',
    description,
    quantity: qtyLabel,
    numericQty: qty,
    imageUrl,
    unitPrice,
    totalPrice: totalOverride !== undefined ? totalOverride : (unitPrice != null ? unitPrice * qty : null),
  };
}

function rowsFromSelections(selections: unknown, matMap: Map<string, MatInfo>, fallbackDesc: string, overrideQty?: number): AccessoryRow[] {
  if (!Array.isArray(selections) || selections.length === 0) return [];

  // Group identical materialCodes to consolidate duplicates
  const grouped = new Map<string, { s: AnyObj; count: number }>();
  selections.forEach((s: AnyObj) => {
    const code = (s.materialCode as string) || '';
    const key = code || JSON.stringify(s);
    const existing = grouped.get(key);
    if (existing) {
      existing.count += (s.quantity as number) || 1;
    } else {
      grouped.set(key, { s, count: (s.quantity as number) || 1 });
    }
  });

  // If overrideQty provided and there's exactly one unique product, use overrideQty
  if (overrideQty && overrideQty > 0 && grouped.size === 1) {
    const entry = Array.from(grouped.values())[0];
    const code = (entry.s.materialCode as string) || '';
    const mat = code ? matMap.get(code) : undefined;
    const price = mat?.unit_price ?? (entry.s.unitPrice as number) ?? null;
    const isLinear = overrideQty % 1 !== 0 || overrideQty > 50;
    const label = isLinear ? `${overrideQty.toFixed(2)} ml` : `${overrideQty} buc`;
    const total = price != null ? price * overrideQty : null;
    return [makeRow(code, mat?.name || (entry.s.name as string) || fallbackDesc, overrideQty, label, mat?.image_url || null, price, total)];
  }

  return Array.from(grouped.values()).map(({ s, count }) => {
    const code = (s.materialCode as string) || '';
    const mat = code ? matMap.get(code) : undefined;
    const price = mat?.unit_price ?? (s.unitPrice as number) ?? null;
    return makeRow(code, mat?.name || (s.name as string) || fallbackDesc, count, `${count} buc`, mat?.image_url || null, price);
  });
}

function buildAccessoryRows(config: AnyObj, matMap: Map<string, MatInfo>): AccessoryRow[] {
  const rows: AccessoryRow[] = [];
  const acc = config.accessories as AnyObj | undefined;

  const parentCodeLookup = (code: string) => {
    const mat = matMap.get(code);
    if (mat) return mat;
    const pc = code.includes('.') ? code.replace(/\.[^.]+$/, '') : '';
    return pc ? matMap.get(pc) : undefined;
  };

  if (acc) {
  if (config.doorType !== 'sliding') {
    const hinges = acc.hinges as AnyObj | undefined;
    if (hinges) {
      const hingeQty = (hinges.quantity as number) || undefined;
      const selRows = rowsFromSelections(hinges.selections, matMap, t('orderPreview.hinge'), hingeQty);
      if (selRows.length > 0) {
        rows.push(...selRows);
      } else {
        const code = (hinges.materialCode as string) || '';
        const mat = code ? parentCodeLookup(code) : undefined;
        const type = hinges.type === 'wall_glass' ? t('orderPreview.wallGlass') : hinges.type === 'glass_glass' ? t('orderPreview.glassGlass') : String(hinges.type || '');
        const finish = hinges.finish ? getFinishLabel(String(hinges.finish)) || String(hinges.finish) : '';
        const qty = (hinges.quantity as number) || 1;
        rows.push(makeRow(code, mat?.name || `${t('orderPreview.hinge')} ${type}${finish ? ' - ' + finish : ''}`, qty, `${qty} buc`, mat?.image_url || null, mat?.unit_price ?? null));
      }
    }
  }

  const handle = acc.handle as AnyObj | undefined;
  if (handle) {
    const selRows = rowsFromSelections(handle.selections, matMap, t('orderPreview.handle'));
    if (selRows.length > 0) {
      rows.push(...selRows);
    } else {
      const code = (handle.materialCode as string) || '';
      const mat = code ? parentCodeLookup(code) : undefined;
      const model = handle.model ? String(handle.model) : '';
      const length = handle.length ? `${handle.length}mm` : '';
      const finish = handle.finish ? getFinishLabel(String(handle.finish)) || String(handle.finish) : '';
      rows.push(makeRow(code, mat?.name || `${t('orderPreview.handle')} ${model} ${length}${finish ? ' - ' + finish : ''}`, 1, `1 ${t('orderPreview.pcs')}`, mat?.image_url || null, mat?.unit_price ?? null));
    }
  }

  // ── Door lock (standalone) ──
  const lock = acc.lock as AnyObj | undefined;
  if (lock?.enabled) {
    const code = (lock.materialCode as string) || '';
    const mat = code ? parentCodeLookup(code) : undefined;
    const type = lock.type ? String(lock.type) : '';
    rows.push(makeRow(code, mat?.name || `${t('orderPreview.lock')} ${type}`, 1, `1 ${t('orderPreview.pcs')}`, mat?.image_url || null, mat?.unit_price ?? null));
  }

  // ── Door pivot ──
  const pivot = acc.pivot as AnyObj | undefined;
  if (pivot) {
    const code = (pivot.materialCode as string) || '';
    const mat = code ? parentCodeLookup(code) : undefined;
    const type = pivot.type ? String(pivot.type) : 'standard';
    const damper = pivot.withDamper ? ' ' + t('orderPreview.withDamper') : '';
    rows.push(makeRow(code, mat?.name || `${t('orderPreview.pivot')} ${type}${damper}`, 1, `1 ${t('orderPreview.pcs')}`, mat?.image_url || null, mat?.unit_price ?? null));
  }

  // ── Door sliding system ──
  const slidingSystem = acc.slidingSystem as AnyObj | undefined;
  if (slidingSystem) {
    const code = (slidingSystem.materialCode as string) || '';
    const mat = code ? parentCodeLookup(code) : undefined;
    const rail = slidingSystem.rail ? String(slidingSystem.rail) : '';
    const rollers = slidingSystem.rollers ? String(slidingSystem.rollers) : '';
    const damper = slidingSystem.damper ? ' ' + t('orderPreview.withDamper') : '';
    rows.push(makeRow(code, mat?.name || `${t('orderPreview.slidingSystem')} ${rail} ${rollers}${damper}`, 1, `1 ${t('orderPreview.set')}`, mat?.image_url || null, mat?.unit_price ?? null));
  }

  const profiles = acc.profiles as AnyObj | undefined;
  if (profiles) {
    // Calculate U profile linear meters based on full config
    const uProfileLengthMl = calcUProfileLength(config) / 1000; // mm → m

    const selRows = rowsFromSelections(profiles.selections, matMap, 'Profil', uProfileLengthMl);
    if (selRows.length > 0) {
      rows.push(...selRows);
    } else {
      const code = (profiles.materialCode as string) || '';
      const mat = code ? parentCodeLookup(code) : undefined;
      const type = profiles.type === 'u_profile' ? t('orderPreview.profileU') : profiles.type === 'compensation' ? t('orderPreview.profileCompensation') : String(profiles.type || t('orderPreview.profile'));
      const finish = profiles.finish ? getFinishLabel(String(profiles.finish)) || String(profiles.finish) : '';
      const unitPrice = mat?.unit_price ?? null;
      const totalPrice = unitPrice != null ? unitPrice * uProfileLengthMl : null;
      rows.push(makeRow(code, mat?.name || `${type}${finish ? ' - ' + finish : ''}`, uProfileLengthMl, `${uProfileLengthMl.toFixed(2)} ml`, mat?.image_url || null, unitPrice, totalPrice));
    }
  }

  // ── Balustrade: mount points ──
  const mountPoints = acc.mountPoints as AnyObj | undefined;
  if (mountPoints && (mountPoints.quantity as number) > 0) {
    const mpCodes: string[] = Array.isArray(mountPoints.materialCodes) ? mountPoints.materialCodes as string[] : (mountPoints.materialCode ? [mountPoints.materialCode as string] : []);
    const qty = (mountPoints.quantity as number) || 1;
    const model = mountPoints.model ? String(mountPoints.model) : '';
    const finish = mountPoints.finish ? getFinishLabel(String(mountPoints.finish)) || String(mountPoints.finish) : '';
    const spacing = mountPoints.spacing ? `la ${mountPoints.spacing}mm` : '';
    if (mpCodes.length > 0) {
      mpCodes.forEach(code => {
        const mat = code ? parentCodeLookup(code) : undefined;
        rows.push(makeRow(code, mat?.name || `${t('orderPreview.mountPoint')} ${model}${finish ? ' - ' + finish : ''} ${spacing}`, qty, `${qty} buc`, mat?.image_url || null, mat?.unit_price ?? null));
      });
    } else {
      rows.push(makeRow('', `${t('orderPreview.mountPoint')} ${model}${finish ? ' - ' + finish : ''} ${spacing}`, qty, `${qty} buc`, null, null));
    }
  }

  // ── Balustrade: U profile ──
  const uProfileBal = acc.uProfile as AnyObj | undefined;
  if (uProfileBal) {
    const upCodes: string[] = Array.isArray(uProfileBal.materialCodes) ? uProfileBal.materialCodes as string[] : (uProfileBal.materialCode ? [uProfileBal.materialCode as string] : []);
    const size = uProfileBal.size ? String(uProfileBal.size) : '';
    const finish = uProfileBal.finish ? getFinishLabel(String(uProfileBal.finish)) || String(uProfileBal.finish) : '';
    if (upCodes.length > 0) {
      upCodes.forEach(code => {
        const mat = code ? parentCodeLookup(code) : undefined;
        rows.push(makeRow(code, mat?.name || `${t('orderPreview.profileU')} ${size}${finish ? ' - ' + finish : ''}`, 1, `1 ${t('orderPreview.pcs')}`, mat?.image_url || null, mat?.unit_price ?? null));
      });
    } else if (size) {
      rows.push(makeRow('', `${t('orderPreview.profileU')} ${size}${finish ? ' - ' + finish : ''}`, 1, `1 ${t('orderPreview.pcs')}`, null, null));
    }
  }

  // ── Balustrade: handrail ──
  const handrailBal = acc.handrail as AnyObj | undefined;
  if (handrailBal) {
    const hrCodes: string[] = Array.isArray(handrailBal.materialCodes) ? handrailBal.materialCodes as string[] : (handrailBal.materialCode ? [handrailBal.materialCode as string] : []);
    const diameter = handrailBal.diameter ? `Ø${handrailBal.diameter}` : '';
    const type = handrailBal.type ? String(handrailBal.type) : '';
    const lengthMm = (handrailBal.length as number) || 0;
    const lengthMl = lengthMm / 1000;
    const finish = handrailBal.finish ? getFinishLabel(String(handrailBal.finish)) || String(handrailBal.finish) : '';
    if (hrCodes.length > 0) {
      hrCodes.forEach(code => {
        const mat = code ? parentCodeLookup(code) : undefined;
        const unitPrice = mat?.unit_price ?? null;
        const total = unitPrice != null && lengthMl > 0 ? unitPrice * lengthMl : null;
        rows.push(makeRow(code, mat?.name || `${t('orderPreview.handrail')} ${diameter} ${type}${finish ? ' - ' + finish : ''}`, lengthMl || 1, lengthMl > 0 ? `${lengthMl.toFixed(2)} ml` : `1 ${t('orderPreview.pcs')}`, mat?.image_url || null, unitPrice, total));
      });
    } else if (diameter) {
      rows.push(makeRow('', `${t('orderPreview.handrail')} ${diameter} ${type}${finish ? ' - ' + finish : ''}`, lengthMl || 1, lengthMl > 0 ? `${lengthMl.toFixed(2)} ml` : `1 ${t('orderPreview.pcs')}`, null, null));
    }
  }

  // ── Balustrade: corner connector (lives under dimensions) ──
  const dims = config.dimensions as AnyObj | undefined;
  const cornerConnector = dims?.cornerConnector as AnyObj | undefined;
  if (cornerConnector && (cornerConnector.quantity as number) > 0) {
    const ccCodes: string[] = Array.isArray(cornerConnector.materialCodes) ? cornerConnector.materialCodes as string[] : (cornerConnector.materialCode ? [cornerConnector.materialCode as string] : []);
    const qty = (cornerConnector.quantity as number) || 1;
    if (ccCodes.length > 0) {
      ccCodes.forEach(code => {
        const mat = code ? parentCodeLookup(code) : undefined;
        rows.push(makeRow(code, mat?.name || t('orderPreview.cornerConnector'), qty, `${qty} buc`, mat?.image_url || null, mat?.unit_price ?? null));
      });
    } else {
      rows.push(makeRow('', t('orderPreview.cornerConnector'), qty, `${qty} buc`, null, null));
    }
  }

  // Stabilizer bars — calculate in linear meters (full cabin perimeter)
  if (Array.isArray(acc.stabilizerSelections) && acc.stabilizerSelections.length > 0) {
    const cabinW = (dims?.width as number) || 0;
    const cabinD = (dims?.depth as number) || 0;
    const cabinType = (config.cabinType as string) || '';

    // Total bar length = full cabin perimeter where bars run (including door span)
    let totalBarLengthMm = 0;
    if (cabinType === 'corner_90') {
      totalBarLengthMm = cabinW + cabinD; // front + lateral walls
    } else if (cabinType === 'walk_in' || cabinType === 'bathtub') {
      totalBarLengthMm = cabinW;
    } else if (cabinType === 'pentagon') {
      totalBarLengthMm = cabinW + cabinD;
    } else {
      totalBarLengthMm = cabinW; // fallback
    }

    // Group by materialCode
    const stabGrouped = new Map<string, { s: AnyObj; count: number }>();
    (acc.stabilizerSelections as AnyObj[]).forEach((sel: AnyObj) => {
      const code = (sel.materialCode as string) || '';
      const key = code || JSON.stringify(sel);
      const existing = stabGrouped.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        stabGrouped.set(key, { s: sel, count: 1 });
      }
    });

    stabGrouped.forEach(({ s, count }) => {
      const code = (s.materialCode as string) || '';
      const mat = code ? parentCodeLookup(code) : undefined;
      const unitPrice = mat?.unit_price ?? (s.unitPrice as number) ?? null;
      const imageUrl = mat?.image_url || (s.image_url as string) || (s.imageUrl as string) || null;
      const isBar = code.startsWith('35.') || code.startsWith('72.') || (mat?.unit === 'lm');
      if (isBar) {
        const lengthMl = (totalBarLengthMm / 1000) * count;
        const total = unitPrice != null ? unitPrice * lengthMl : null;
        rows.push(makeRow(code, mat?.name || (s.name as string) || (s.label as string) || t('orderPreview.stabilizerBar'), lengthMl, `${lengthMl.toFixed(2)} ml`, imageUrl, unitPrice, total));
      } else {
        // Connectors etc — show as pieces
        rows.push(makeRow(code, mat?.name || (s.name as string) || (s.label as string) || t('orderPreview.stabilizerConnector'), count, `${count} buc`, imageUrl, unitPrice));
      }
    });
  }

  // Lateral config accessories (corner_90 showers)
  const lateralCfg = config.lateralConfig as AnyObj | undefined;
  if (lateralCfg?.enabled) {
    if (lateralCfg.doorType !== 'sliding') {
      const latHinges = lateralCfg.hinges as AnyObj | undefined;
      if (latHinges) {
        const latHingeQty = (latHinges.quantity as number) || undefined;
        const latHingeRows = rowsFromSelections(latHinges.selections, matMap, t('orderPreview.lateralHinge'), latHingeQty);
        if (latHingeRows.length > 0) {
          rows.push(...latHingeRows);
        } else {
          const code = (latHinges.materialCode as string) || '';
          const mat = code ? parentCodeLookup(code) : undefined;
          const qty = (latHinges.quantity as number) || 2;
          const type = latHinges.type === 'wall_glass' ? t('orderPreview.wallGlass') : t('orderPreview.glassGlass');
          const finish = latHinges.finish ? getFinishLabel(String(latHinges.finish)) || String(latHinges.finish) : '';
          rows.push(makeRow(code, mat?.name || `${t('orderPreview.lateralHinge')} ${type}${finish ? ' - ' + finish : ''}`, qty, `${qty} buc`, mat?.image_url || null, mat?.unit_price ?? null));
        }
      }
    }

    const latHandle = lateralCfg.handle as AnyObj | undefined;
    if (latHandle) {
      const latHandleRows = rowsFromSelections(latHandle.selections, matMap, t('orderPreview.lateralHandle'));
      if (latHandleRows.length > 0) {
        rows.push(...latHandleRows);
      } else {
        const code = (latHandle.materialCode as string) || '';
        const mat = code ? parentCodeLookup(code) : undefined;
        const model = latHandle.model ? String(latHandle.model) : '';
        const length = latHandle.length ? `${latHandle.length}mm` : '';
        const finish = latHandle.finish ? getFinishLabel(String(latHandle.finish)) || String(latHandle.finish) : '';
        rows.push(makeRow(code, mat?.name || `${t('orderPreview.handle')} lateral ${model} ${length}${finish ? ' - ' + finish : ''}`, 1, `1 ${t('orderPreview.pcs')}`, mat?.image_url || null, mat?.unit_price ?? null));
      }
    }
  }
  } // end if (acc)

  // ── Partition wall door accessories (hinges, handle, lock) ──
  const pwCfg = config.partitionWall as AnyObj | undefined;
  if (pwCfg) {
    const pwDoors = pwCfg.doors as AnyObj[] | undefined;
    if (Array.isArray(pwDoors)) {
      pwDoors.forEach((d, di) => {
        const dAcc = d.accessories as AnyObj | undefined;
        if (!dAcc) return;
        const doorLabel = pwDoors.length > 1 ? ` ${t('orderPreview.doorDoor')} ${di + 1}` : '';

        // Door hinges (fallback to finish for materialCode + parent code lookup)
        const dHinges = dAcc.hinges as AnyObj | undefined;
        if (dHinges) {
          const code = (dHinges.materialCode as string) || (dHinges.finish as string) || '';
          const mat = code ? parentCodeLookup(code) : undefined;
          const qty = (dHinges.quantity as number) || 1;
          const type = dHinges.type === 'wall_glass' ? t('orderPreview.wallGlass') : dHinges.type === 'glass_glass' ? t('orderPreview.glassGlass') : String(dHinges.type || '');
          const finish = dHinges.finish ? getFinishLabel(String(dHinges.finish)) || String(dHinges.finish) : '';
          rows.push(makeRow(code, mat?.name || `${t('orderPreview.hinge')}${doorLabel} ${type}${finish ? ' - ' + finish : ''}`, qty, `${qty} buc`, mat?.image_url || null, mat?.unit_price ?? null));
        }

        // Door handle (fallback to finish for materialCode + parent code lookup)
        const dHandle = dAcc.handle as AnyObj | undefined;
        if (dHandle) {
          const code = (dHandle.materialCode as string) || (dHandle.finish as string) || '';
          const mat = code ? parentCodeLookup(code) : undefined;
          const model = dHandle.model ? String(dHandle.model) : '';
          const length = dHandle.length ? `${dHandle.length}mm` : '';
          const finish = dHandle.finish ? getFinishLabel(String(dHandle.finish)) || String(dHandle.finish) : '';
          rows.push(makeRow(code, mat?.name || `${t('orderPreview.handle')}${doorLabel} ${model} ${length}${finish ? ' - ' + finish : ''}`, 1, `1 ${t('orderPreview.pcs')}`, mat?.image_url || null, mat?.unit_price ?? null));
        }

        // Door lock
        const dLock = dAcc.lock as AnyObj | undefined;
        if (dLock?.enabled) {
          const code = (dLock.materialCode as string) || '';
          const mat = code ? parentCodeLookup(code) : undefined;
          rows.push(makeRow(code, mat?.name || `${t('orderPreview.lock')}${doorLabel}`, 1, `1 ${t('orderPreview.pcs')}`, mat?.image_url || null, mat?.unit_price ?? null));
        }
      });
    }

    // Partition wall perimeter profiles
    const pwProfileSels = pwCfg.profileSelections as AnyObj[] | undefined;
    if (Array.isArray(pwProfileSels) && pwProfileSels.length > 0) {
      rows.push(...rowsFromSelections(pwProfileSels, matMap, t('orderPreview.perimeterProfile')));
    } else if (typeof pwCfg.profileMaterialCode === 'string' && pwCfg.profileMaterialCode) {
      const code = pwCfg.profileMaterialCode;
      const mat = matMap.get(code);
      rows.push(makeRow(code, mat?.name || t('orderPreview.perimeterProfile'), 1, `1 ${t('orderPreview.pcs')}`, mat?.image_url || null, mat?.unit_price ?? null));
    }
  }

  return rows.filter(r => r.code !== '-');
}

function buildSealRows(config: AnyObj, matMap: Map<string, MatInfo>): AccessoryRow[] {
  const rows: AccessoryRow[] = [];
  const acc = config.accessories as AnyObj | undefined;
  const seals = (acc?.seals || {}) as AnyObj;

  const parentCodeLookup = (code: string) => {
    const mat = matMap.get(code);
    if (mat) return mat;
    const pc = code.includes('.') ? code.replace(/\.[^.]+$/, '') : '';
    return pc ? matMap.get(pc) : undefined;
  };

  // Shower-style seals (magnetic, rubber, threshold with selections)
  const magSel = rowsFromSelections(seals.magneticSelections, matMap, t('orderPreview.magneticSeal'));
  if (magSel.length > 0) {
    rows.push(...magSel);
  } else if (seals.magnetic) {
    const code = (seals.magneticMaterialCode as string) || '';
    const mat = code ? parentCodeLookup(code) : undefined;
    rows.push(makeRow(code, mat?.name || t('orderPreview.magneticSeal'), 1, `1 ${t('orderPreview.set')}`, mat?.image_url || null, mat?.unit_price ?? null));
  }

  const rubSel = rowsFromSelections(seals.rubberSelections, matMap, t('orderPreview.rubberSeal'));
  if (rubSel.length > 0) {
    rows.push(...rubSel);
  } else if (seals.rubber) {
    const code = (seals.rubberMaterialCode as string) || '';
    const mat = code ? parentCodeLookup(code) : undefined;
    rows.push(makeRow(code, mat?.name || t('orderPreview.rubberSeal'), 1, `1 ${t('orderPreview.set')}`, mat?.image_url || null, mat?.unit_price ?? null));
  }

  const thrSel = rowsFromSelections(seals.thresholdSelections, matMap, t('orderPreview.thresholdSeal'));
  if (thrSel.length > 0) {
    rows.push(...thrSel);
  } else if (seals.threshold && typeof seals.threshold !== 'boolean') {
    const code = (seals.thresholdMaterialCode as string) || '';
    const mat = code ? parentCodeLookup(code) : undefined;
    rows.push(makeRow(code, mat?.name || t('orderPreview.thresholdSeal'), 1, `1 ${t('orderPreview.pcs')}`, mat?.image_url || null, mat?.unit_price ?? null));
  }

  // ── Door-style seals (lateral: boolean, threshold: boolean) ──
  if (seals.lateral === true) {
    const latSel = rowsFromSelections(seals.lateralSelections, matMap, t('orderPreview.lateralSeal'));
    if (latSel.length > 0) {
      rows.push(...latSel);
    } else {
      const code = (seals.lateralMaterialCode as string) || '';
      const mat = code ? parentCodeLookup(code) : undefined;
      rows.push(makeRow(code, mat?.name || t('orderPreview.lateralSeal'), 1, `1 ${t('orderPreview.set')}`, mat?.image_url || null, mat?.unit_price ?? null));
    }
  }
  if (seals.threshold === true) {
    // Only add door-style threshold when no shower-style threshold was added
    const hasThrSel = thrSel.length > 0;
    if (!hasThrSel) {
      const code = (seals.thresholdMaterialCode as string) || '';
      const mat = code ? parentCodeLookup(code) : undefined;
      rows.push(makeRow(code, mat?.name || t('orderPreview.doorThreshold'), 1, `1 ${t('orderPreview.pcs')}`, mat?.image_url || null, mat?.unit_price ?? null));
    }
  }

  // Lateral config seals (corner_90 showers)
  const lateralCfg = config.lateralConfig as AnyObj | undefined;
  if (lateralCfg?.enabled) {
    const latSeals = (lateralCfg.seals || {}) as AnyObj;

    const latMag = rowsFromSelections(latSeals.magneticSelections, matMap, t('orderPreview.lateralMagneticSeal'));
    if (latMag.length > 0) {
      rows.push(...latMag);
    } else if (latSeals.magnetic) {
      const code = (latSeals.magneticMaterialCode as string) || '';
      const mat = code ? parentCodeLookup(code) : undefined;
      rows.push(makeRow(code, mat?.name || t('orderPreview.lateralMagneticSeal'), 1, `1 ${t('orderPreview.set')}`, mat?.image_url || null, mat?.unit_price ?? null));
    }

    const latRub = rowsFromSelections(latSeals.rubberSelections, matMap, t('orderPreview.lateralRubberSeal'));
    if (latRub.length > 0) {
      rows.push(...latRub);
    } else if (latSeals.rubber) {
      const code = (latSeals.rubberMaterialCode as string) || '';
      const mat = code ? parentCodeLookup(code) : undefined;
      rows.push(makeRow(code, mat?.name || t('orderPreview.lateralRubberSeal'), 1, `1 ${t('orderPreview.set')}`, mat?.image_url || null, mat?.unit_price ?? null));
    }

    const latThr = rowsFromSelections(latSeals.thresholdSelections, matMap, t('orderPreview.lateralThresholdSeal'));
    if (latThr.length > 0) {
      rows.push(...latThr);
    } else if (latSeals.threshold) {
      const code = (latSeals.thresholdMaterialCode as string) || '';
      const mat = code ? parentCodeLookup(code) : undefined;
      rows.push(makeRow(code, mat?.name || t('orderPreview.lateralThresholdSeal'), 1, `1 ${t('orderPreview.pcs')}`, mat?.image_url || null, mat?.unit_price ?? null));
    }
  }

  return rows.filter(r => r.code !== '-');
}

function buildExtraRows(config: AnyObj, matMap: Map<string, MatInfo>): AccessoryRow[] {
  const rows: AccessoryRow[] = [];
  const acc = config.accessories as AnyObj | undefined;
  const extras = (acc?.extraAccessories || config.extraAccessories) as AnyObj[] | undefined;
  if (Array.isArray(extras)) {
    extras.forEach(e => {
      const code = (e.materialCode as string) || '';
      const mat = code ? matMap.get(code) : undefined;
      const name = (e.name as string) || mat?.name || t('orderPreview.accessory');
      const qty = (e.quantity as number) || 1;
      const price = (e.unitPrice as number) ?? mat?.unit_price ?? null;
      const unitMap: Record<string, string> = { pcs: t('orderPreview.pcs'), lm: t('orderPreview.ml'), sqm: t('orderPreview.sqm'), kg: 'kg', l: 'l' };
      const unitLabel = unitMap[(e.unit as string) || 'pcs'] || 'buc';
      rows.push(makeRow(code, name, qty, `${qty} ${unitLabel}`, mat?.image_url || null, price));
    });
  }

  const pw = config.partitionWall as AnyObj | undefined;
  if (pw) {
    const doors = pw.doors as AnyObj[] | undefined;
    if (Array.isArray(doors)) {
      doors.forEach((d, di) => {
        const dAcc = d.accessories as AnyObj | undefined;
        const dExtras = dAcc?.extraAccessories as AnyObj[] | undefined;
        if (Array.isArray(dExtras)) {
          dExtras.forEach(e => {
            const code = (e.materialCode as string) || '';
            const mat = code ? matMap.get(code) : undefined;
            const name = (e.name as string) || mat?.name || t('orderPreview.doorAccessory', { n: di + 1 });
            const qty = (e.quantity as number) || 1;
            const price = (e.unitPrice as number) ?? mat?.unit_price ?? null;
            const unitMap2: Record<string, string> = { pcs: t('orderPreview.pcs'), lm: t('orderPreview.ml'), sqm: t('orderPreview.sqm'), kg: 'kg', l: 'l' };
            const unitLabel2 = unitMap2[(e.unit as string) || 'pcs'] || 'buc';
            rows.push(makeRow(code, name, qty, `${qty} ${unitLabel2}`, mat?.image_url || null, price));
          });
        }
      });
    }
  }

  return rows;
}

function buildKitRows(config: AnyObj, matMap: Map<string, MatInfo>): AccessoryRow[] {
  const rows: AccessoryRow[] = [];
  const kit = config.selectedKit as AnyObj | undefined;
  if (!kit) return rows;

  const kitCode = (kit.code as string) || '';
  const kitName = (kit.name as string) || t('orderPreview.kitAccessories');
  const kitPrice = (kit.price as number) ?? null;
  const kitMat = kitCode ? matMap.get(kitCode) : undefined;

  // Add main kit row
  rows.push(makeRow(kitCode, kitName, 1, `1 ${t('orderPreview.kit')}`, kitMat?.image_url || (kit.imageUrl as string | null) || (kit.image_url as string | null) || null, kitPrice));

  // Add individual kit items if available
  const kitItems = kit.items as AnyObj[] | undefined;
  if (Array.isArray(kitItems)) {
    kitItems.forEach(item => {
      const code = (item.material_code as string) || '';
      const name = (item.material_name as string) || '';
      const qty = (item.quantity as number) || 1;
      const mat = code ? matMap.get(code) : undefined;
      rows.push(makeRow(code, name, qty, `${qty} buc`, mat?.image_url || null, mat?.unit_price ?? null));
    });
  }

  return rows;
}

function sumRowTotals(rows: AccessoryRow[]): number {
  return rows.reduce((s, r) => s + (r.totalPrice || 0), 0);
}

function AccessoryTable({ rows, title, formatPrice: fp }: { rows: AccessoryRow[]; title: string; formatPrice?: (v: number) => string }) {
  const fmtPrice = fp || formatPrice;
  if (rows.length === 0) return null;
  const total = sumRowTotals(rows);
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-primary uppercase tracking-wide">{title}</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">{t('orderPreview.photo')}</TableHead>
            <TableHead className="w-24">{t('orderPreview.code')}</TableHead>
            <TableHead>{t('orderPreview.descriptionCol')}</TableHead>
            <TableHead className="w-20 text-center">{t('orderPreview.qty')}</TableHead>
            <TableHead className="w-24 text-right">{t('orderPreview.unitPrice')}</TableHead>
            <TableHead className="w-24 text-right">{t('orderPreview.totalCol')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i}>
              <TableCell className="p-1">
                {row.imageUrl ? (
                  <ImageLightbox src={row.imageUrl} alt={row.description} className="w-10 h-10 object-cover rounded" />
                ) : (
                  <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-muted-foreground text-[10px]">—</div>
                )}
              </TableCell>
              <TableCell className="font-mono text-xs">{row.code}</TableCell>
              <TableCell className="text-sm">{row.description}</TableCell>
              <TableCell className="text-center text-sm">{row.quantity}</TableCell>
              <TableCell className="text-right text-sm">
                {row.unitPrice != null ? `${fmtPrice(row.unitPrice)}` : '—'}
              </TableCell>
              <TableCell className="text-right text-sm font-medium">
                {row.totalPrice != null ? `${fmtPrice(row.totalPrice)}` : '—'}
              </TableCell>
            </TableRow>
          ))}
          {total > 0 && (
            <TableRow className="bg-muted/50">
              <TableCell colSpan={5} className="text-right text-xs font-semibold uppercase text-muted-foreground">{t('orderPreview.totalTitle', { title })}</TableCell>
              <TableCell className="text-right text-sm font-bold">{fmtPrice(total)}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function formatPrice(v: number) {
  return new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
}

interface OrderPreviewTabProps {
  order: Order;
  products: OrderProduct[];
}

export function OrderPreviewTab({ order, products }: OrderPreviewTabProps) {
  const { t } = useTranslation();
  const [materialMap, setMaterialMap] = useState<Map<string, MatInfo>>(new Map());
  const [glassDeductionsMap, setGlassDeductionsMap] = useState<DeductionsMap>(new Map());
  const [loading, setLoading] = useState(true);
  const { formatPrice: fp, currencyLabel, convert } = useCurrency();
  
  // Override local formatPrice to use global currency
  const formatPrice = (v: number) => fp(v);

  const productTypeLabels: Record<string, string> = {
    shower: t('orderPreview.productTypes.shower'), balustrade: t('orderPreview.productTypes.balustrade'),
    mirror: t('orderPreview.productTypes.mirror'), panel: t('orderPreview.productTypes.panel'),
    door: t('orderPreview.productTypes.door'), kitchen_front: t('orderPreview.productTypes.kitchen_front'),
  };
  const glassTypeLabels: Record<string, string> = {
    clear: t('orderPreview.glassTypes.clear'), frosted: t('orderPreview.glassTypes.frosted'),
    bronze: t('orderPreview.glassTypes.bronze'), grey: t('orderPreview.glassTypes.grey'),
    green: t('orderPreview.glassTypes.green'), low_e: t('orderPreview.glassTypes.low_e'),
  };
  const cabinTypeLabels: Record<string, string> = {
    corner_square: t('orderPreview.cabinTypes.corner_square'), corner_rectangle: t('orderPreview.cabinTypes.corner_rectangle'),
    niche: t('orderPreview.cabinTypes.niche'), walkin: t('orderPreview.cabinTypes.walkin'),
    'u-shape': t('orderPreview.cabinTypes.u_shape'), fixed_panel: t('orderPreview.cabinTypes.fixed_panel'),
  };
  const doorTypeLabels: Record<string, string> = {
    hinged: t('orderPreview.doorTypes.hinged'), sliding: t('orderPreview.doorTypes.sliding'),
    pivot: t('orderPreview.doorTypes.pivot'), folding: t('orderPreview.doorTypes.folding'),
  };
  const edgePolishLabels: Record<string, string> = {
    none: t('orderPreview.edgePolish.none'), matte: t('orderPreview.edgePolish.matte'),
    polished: t('orderPreview.edgePolish.polished'), beveled: t('orderPreview.edgePolish.beveled'),
  };

  useEffect(() => {
    const allCodes: string[] = [];
    products.forEach(p => {
      const cfg = (p.full_config || p.configuration) as AnyObj;
      allCodes.push(...extractMaterialCodes(cfg));
    });
    const uniqueCodes = [...new Set(allCodes)].filter(Boolean);
    if (uniqueCodes.length === 0) { setLoading(false); return; }

    // Generate parent codes (strip last segment) so variant codes like 30.SH56.090.32 match parent 30.SH56.090
    const parentCodesSet = new Set<string>();
    uniqueCodes.forEach(code => {
      const parts = code.split('.');
      if (parts.length > 2) parentCodesSet.add(parts.slice(0, -1).join('.'));
    });
    const allQueryCodes = [...new Set([...uniqueCodes, ...parentCodesSet])];

    // Fetch materials AND pricing_config in parallel; pricing_config prices take priority
    Promise.all([
      supabase.from('materials').select('code, name, image_url, unit_price, unit').in('code', allQueryCodes)
        .then(res => { if (res.error) console.error('Material fetch error:', res.error); return res; }),
      supabase.from('pricing_config').select('code, price, name, image_url, glass_deductions').eq('is_active', true).in('code', allQueryCodes)
        .then(res => { if (res.error) console.error('Pricing fetch error:', res.error); return res; }),
    ]).then(([matRes, priceRes]) => {
      const map = new Map<string, MatInfo>();
      matRes.data?.forEach(m => map.set(m.code, { name: m.name, image_url: m.image_url, unit_price: m.unit_price, unit: m.unit }));
      // Override unit_price with pricing_config price when available and > 0
      // Also build glass deductions map
      const dedMap: DeductionsMap = new Map();
      priceRes.data?.forEach(p => {
        const existing = map.get(p.code);
        if (existing) {
          if (p.price > 0) existing.unit_price = p.price;
          if (!existing.image_url && p.image_url) existing.image_url = p.image_url;
        } else {
          map.set(p.code, { name: p.name || p.code, image_url: p.image_url || null, unit_price: p.price > 0 ? p.price : undefined });
        }
        // Store glass deductions
        const gd = p.glass_deductions as Record<string, number> | null;
        if (gd && typeof gd === 'object') {
          const hasValues = Object.values(gd).some(v => v > 0);
          if (hasValues) dedMap.set(p.code, gd);
        }
      });

      // For codes not found in materials, try parent code lookup for image
      uniqueCodes.forEach(code => {
        const entry = map.get(code);
        if (entry && !entry.image_url && code.includes('.')) {
          // Try parent codes: e.g. 72.3010.200.15 -> 72.3010.200 -> 72.3010
          let parent = code;
          while (parent.includes('.')) {
            parent = parent.replace(/\.[^.]+$/, '');
            const parentEntry = map.get(parent);
            if (parentEntry?.image_url) {
              entry.image_url = parentEntry.image_url;
              if (!entry.unit) entry.unit = parentEntry.unit;
              break;
            }
          }
        }
      });

      setMaterialMap(map);
      setGlassDeductionsMap(dedMap);
      setLoading(false);
    }).catch(err => {
      console.error('Preview data fetch error:', err);
      setLoading(false);
    });
  }, [products]);

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (products.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">{t('orderPreview.noProducts')}</div>;
  }

  // Pre-compute live totals per product so the final summary card can sum them
  const productComputations = products.map(product => {
    const config = (product.full_config || product.configuration) as AnyObj;
    const pb = (config.priceBreakdown || {}) as Record<string, number>;
    const markup = config.markupPercent as number | undefined;
    const customAmount = config.customAmount ? Number(config.customAmount) : 0;

    const accRows = aggregateAccessories(buildAccessoryRows(config, materialMap));
    const sealRows = aggregateAccessories(buildSealRows(config, materialMap));
    const extraRows = aggregateAccessories(buildExtraRows(config, materialMap));
    const kitRows = aggregateAccessories(buildKitRows(config, materialMap));

    const sumRowTotals = (rows: AccessoryRow[]) => rows.reduce((s, r) => s + (r.totalPrice || 0), 0);
    const computedAccessoriesTotal = sumRowTotals(accRows) + sumRowTotals(sealRows) + sumRowTotals(extraRows) + sumRowTotals(kitRows);

    const componentsSubtotal = (pb.glass || 0) + (pb.processing || 0) + computedAccessoriesTotal + (pb.labor || 0);
    const baseForMarkup = componentsSubtotal + customAmount;
    const markupValue = markup != null && markup > 0 ? baseForMarkup * markup / 100 : 0;
    const liveProductUnitTotal = baseForMarkup + markupValue;
    const liveProductLineTotal = liveProductUnitTotal * (product.quantity || 1);

    return { product, config, pb, markup, customAmount, accRows, sealRows, extraRows, kitRows, computedAccessoriesTotal, liveProductUnitTotal, liveProductLineTotal };
  });

  const liveOrderSubtotal = productComputations.reduce((s, p) => s + p.liveProductLineTotal, 0);

  return (
    <div className="space-y-6">
      {productComputations.map(({ product, config, pb, markup, customAmount, accRows, sealRows, extraRows, kitRows, computedAccessoriesTotal, liveProductUnitTotal, liveProductLineTotal }, idx) => {
        const dims = config.dimensions as Record<string, number> | undefined;
        const glass = config.glass as AnyObj | undefined;
        const edgePolish = config.edgePolish as AnyObj | undefined;
        const customNote = config.customAmountNote as string | undefined;

        return (
          <Card key={product.id}>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-sm font-semibold">
                    {idx + 1}. {productTypeLabels[product.product_type] || product.product_type}
                  </Badge>
                  <span className="text-sm text-muted-foreground">× {product.quantity}</span>
                </div>
                <span className="font-bold text-lg">{formatPrice(liveProductLineTotal)}</span>
              </div>

              {(config.cabinType || config.doorType) && (
                <div>
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide">{t('orderPreview.configType')}</p>
                  <p className="text-sm">
                    {[
                      config.cabinType ? `${t('orderPreview.cabin')}: ${cabinTypeLabels[String(config.cabinType)] || String(config.cabinType)}` : '',
                      config.doorType ? `${t('orderPreview.door')}: ${doorTypeLabels[String(config.doorType)] || String(config.doorType)}` : '',
                    ].filter(Boolean).join(' | ')}
                  </p>
                </div>
              )}

              {/* Dimensiuni detaliate per panou + sticlă */}
              {(() => {
                const panels = getGlassPanelDetails(config, product.product_type, glassDeductionsMap);
                const totalArea = panels.reduce((s, p) => s + p.area, 0);
                const glassDesc = glass ? [
                  glass.thickness ? `${glass.thickness}mm` : '',
                  glass.type ? glassTypeLabels[String(glass.type)] || String(glass.type) : '',
                  glass.tempered ? t('orderPreview.tempered') : '',
                  glass.laminated ? t('orderPreview.laminated') : '',
                  glass.antiCalc ? t('orderPreview.antiCalc') : '',
                ].filter(Boolean).join(', ') : '';

                return (
                  <div>
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide">{t('orderPreview.dimensionsGlass')}</p>
                    {glassDesc && <p className="text-sm text-muted-foreground mb-1">{glassDesc}</p>}
                    {dims && (dims.width || dims.length) && dims.height && (dims.depth || dims.doorWidth) && (
                      <p className="text-xs text-muted-foreground mb-1">
                        {t('orderPreview.overallSize')}: {dims.width || dims.length} × {dims.height}{dims.depth ? ` × ${dims.depth}` : ''} mm
                        {dims.doorWidth ? ` | ${t('orderPreview.doorOpening')}: ${dims.doorWidth} mm` : ''}
                      </p>
                    )}
                    <div className="rounded-md border mt-1">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs py-1 px-2">{t('orderPreview.element')}</TableHead>
                            <TableHead className="text-xs py-1 px-2">{t('orderPreview.dimensionMm')}</TableHead>
                            <TableHead className="text-xs py-1 px-2 text-right">{t('orderPreview.areaSqm')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {panels.map((p, i) => (
                            <TableRow key={i}>
                              <TableCell className="text-xs py-1 px-2">{p.label}</TableCell>
                              <TableCell className="text-xs py-1 px-2">{p.width} × {p.height}</TableCell>
                              <TableCell className="text-xs py-1 px-2 text-right">{p.area.toFixed(3)}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="font-semibold bg-muted/30">
                            <TableCell className="text-xs py-1 px-2" colSpan={2}>{t('orderPreview.totalGlass')}</TableCell>
                          <TableCell className="text-xs py-1 px-2 text-right">{totalArea.toFixed(3)} m²</TableCell>
                          </TableRow>
                          {pb.glass > 0 && totalArea > 0 && (
                          <TableRow className="bg-muted/10">
                            <TableCell className="text-xs py-1 px-2 font-medium text-foreground">
                              {t('orderPreview.pricePerSqm')}:
                            </TableCell>
                            <TableCell className="text-xs py-1 px-2 text-muted-foreground text-right" colSpan={2}>
                              {convert(pb.glass / totalArea).toFixed(2)} {currencyLabel}/m² × {totalArea.toFixed(3)} m² = <span className="font-semibold text-primary">{formatPrice(pb.glass)}</span>
                            </TableCell>
                          </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    {pb.glass > 0 && (
                      <p className="text-sm font-medium mt-1">{t('orderPreview.glassValue')}: <span className="text-primary">{formatPrice(pb.glass)}</span></p>
                    )}
                  </div>
                );
              })()}

              {(edgePolish?.enabled || pb.processing > 0) && (
                <div>
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide">{t('orderPreview.processing')}</p>
                  <div className="text-sm space-y-0.5">
                    {edgePolish?.enabled && (
                      <p>{t('orderPreview.polishing')}: {edgePolishLabels[String(edgePolish.type || 'standard')] || String(edgePolish.type)}</p>
                    )}
                    {glass?.tempered && <p>{t('orderPreview.temperingIncluded')}</p>}
                    {glass?.laminated && <p>{t('orderPreview.laminationIncluded')}</p>}
                    {glass?.antiCalc && <p>{t('orderPreview.antiCalcIncluded')}</p>}
                  </div>
                  {pb.processing > 0 && (
                    <p className="text-sm font-medium mt-0.5">{t('orderPreview.processingValue')}: <span className="text-primary">{formatPrice(pb.processing)}</span></p>
                  )}
                </div>
              )}

              <AccessoryTable rows={accRows} title={t('orderPreview.accessories')} formatPrice={formatPrice} />
              <AccessoryTable rows={sealRows} title={t('orderPreview.seals')} formatPrice={formatPrice} />
              <AccessoryTable rows={extraRows} title={t('orderPreview.extraAccessories')} formatPrice={formatPrice} />
              <AccessoryTable rows={kitRows} title={t('orderPreview.kitAccessories')} formatPrice={formatPrice} />

              <Separator />
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">{t('orderPreview.detailedEstimate')}</p>
                <div className="rounded-md border">
                  <Table>
                    <TableBody>
                      {pb.glass > 0 && (
                        <TableRow>
                          <TableCell className="text-sm text-muted-foreground">{t('orderPreview.glass')}</TableCell>
                          <TableCell className="text-right text-sm">{formatPrice(pb.glass)}</TableCell>
                        </TableRow>
                      )}
                      {pb.processing > 0 && (
                        <TableRow>
                          <TableCell className="text-sm text-muted-foreground">{t('orderPreview.processing')}</TableCell>
                          <TableCell className="text-right text-sm">{formatPrice(pb.processing)}</TableCell>
                        </TableRow>
                      )}
                      {computedAccessoriesTotal > 0 && (
                        <TableRow>
                          <TableCell className="text-sm text-muted-foreground">{t('orderPreview.accessories')}</TableCell>
                          <TableCell className="text-right text-sm">{formatPrice(computedAccessoriesTotal)}</TableCell>
                        </TableRow>
                      )}
                      {pb.labor > 0 && (
                        <TableRow>
                          <TableCell className="text-sm text-muted-foreground">{t('orderPreview.labor')}</TableCell>
                          <TableCell className="text-right text-sm">{formatPrice(pb.labor)}</TableCell>
                        </TableRow>
                      )}
                      <TableRow className="bg-muted/30">
                        <TableCell className="text-sm font-semibold">{t('orderPreview.subtotalComponents')}</TableCell>
                        <TableCell className="text-right text-sm font-semibold">{formatPrice((pb.glass || 0) + (pb.processing || 0) + computedAccessoriesTotal + (pb.labor || 0))}</TableCell>
                      </TableRow>
                      {customAmount > 0 && (
                        <TableRow>
                          <TableCell className="text-sm text-muted-foreground">
                            {t('orderPreview.additionalAmount')}{customNote ? <span className="ml-1 text-xs italic text-warning">({customNote})</span> : ''}
                          </TableCell>
                          <TableCell className="text-right text-sm">{formatPrice(customAmount)}</TableCell>
                        </TableRow>
                      )}
                      {markup != null && markup > 0 && (() => {
                        const base = (pb.glass || 0) + (pb.processing || 0) + computedAccessoriesTotal + (pb.labor || 0) + customAmount;
                        const markupValue = base * markup / 100;
                        return (
                          <TableRow>
                            <TableCell className="text-sm text-muted-foreground">{t('orderPreview.markup')} ({markup}%)</TableCell>
                            <TableCell className="text-right text-sm">{formatPrice(markupValue)}</TableCell>
                          </TableRow>
                        );
                      })()}
                      <TableRow className="bg-primary/5">
                        <TableCell className="text-sm font-bold">{t('orderPreview.productTotalNoVat')}</TableCell>
                        <TableCell className="text-right text-sm font-bold text-primary">{formatPrice(liveProductUnitTotal)}</TableCell>
                      </TableRow>
                      {product.quantity > 1 && (
                        <TableRow className="bg-primary/10">
                          <TableCell className="text-sm font-bold">{t('common.total')} × {product.quantity} {t('common.pieces')}</TableCell>
                          <TableCell className="text-right text-sm font-bold text-primary">{formatPrice(liveProductLineTotal)}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {(() => {
        const discountPercent = order.discount_percent ?? 0;
        const discountAmt = discountPercent > 0 ? liveOrderSubtotal * discountPercent / 100 : (order.discount_amount ?? 0);
        const subtotalAfterDiscount = liveOrderSubtotal - discountAmt;
        const taxPercent = order.tax_percent ?? 19;
        const tvaAmount = subtotalAfterDiscount * (taxPercent / 100);
        const totalWithTVA = subtotalAfterDiscount + tvaAmount;
        const storedSubtotal = order.subtotal || 0;
        const hasDiscrepancy = Math.abs(liveOrderSubtotal - storedSubtotal) > 1;

        return (
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('orderPreview.subtotalNoVat')}</span>
                <span>{formatPrice(liveOrderSubtotal)}</span>
              </div>
              {discountAmt > 0 && (
                <div className="flex justify-between text-sm text-destructive">
                  <span>{t('common.discount')} ({order.discount_percent}%)</span>
                  <span>-{formatPrice(discountAmt)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">TVA ({taxPercent}%)</span>
                <span>{formatPrice(tvaAmount)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-xl text-primary">
                <span>{t('orderPreview.totalWithVat')}</span>
                <span>{formatPrice(totalWithTVA)}</span>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      <div className="flex justify-center">
        <PDFDownloadButtons
          order={order}
          products={products}
          variant="default"
          materialMap={materialMap}
          liveTotals={{
            liveOrderSubtotal,
            liveProductLineTotals: Object.fromEntries(productComputations.map(p => [p.product.id, p.liveProductLineTotal])),
          }}
        />
      </div>
    </div>
  );
}
