import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProcessingSheetViewer } from './ProcessingSheetViewer';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductEditDialog } from './ProductEditDialog';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';

interface OrderOption {
  id: string;
  order_number: string;
  clientName: string;
}

interface SelectionItem {
  materialCode: string;
  name: string;
  length?: number;
  quantity?: number;
}

interface ProductOption {
  id: string;
  product_type: string;
  label: string;
  productLabel?: string;
  doorWidth: number;
  doorHeight: number;
  cabinWidth?: number;
  cabinDepth?: number;
  profileWidthDeduction?: number;
  lateralProfileWidthDeduction?: number;
  profileHeightDeduction?: number;
  lateralProfileHeightDeduction?: number;
  fixedPanel?: { enabled: boolean; width: number };
  fixedPanelLeft?: { enabled: boolean; width: number };
  fixedPanelRight?: { enabled: boolean; width: number };
  glassThickness: number;
  glassType: string;
  hinges: {
    positions: number[];
    materialCode?: string;
    quantity: number;
    finish?: string;
    selections?: SelectionItem[];
  };
  handle?: {
    positionY: number;
    model?: string;
    length?: number;
    finish?: string;
    materialCode?: string;
    selections?: SelectionItem[];
  };
  hingeSide?: 'left' | 'right';
  cabinType?: string;
  profiles?: {
    type: string;
    finish: string;
    materialCode?: string;
    lengthMm?: number;
    selections?: SelectionItem[];
  };
  seals?: {
    magnetic: boolean;
    magneticCode?: string;
    magneticSelections?: SelectionItem[];
    rubber: boolean;
    rubberCode?: string;
    rubberSelections?: SelectionItem[];
    threshold: boolean;
    thresholdCode?: string;
    thresholdSelections?: SelectionItem[];
  };
  stabilizers?: Array<{
    type: string;
    length: number;
    position: string;
    materialCode?: string;
  }>;
  stabilizerSelections?: SelectionItem[];
  lock?: {
    enabled: boolean;
    type: string;
    materialCode?: string;
  };
  pivot?: {
    type: string;
    materialCode?: string;
  };
  slidingSystem?: {
    rail: string;
    rollers: string;
    materialCode?: string;
  };
  extraAccessories?: Array<{
    materialCode: string;
    name: string;
    quantity: number;
    detail?: string;
    colorHex?: string;
    unit?: string;
  }>;
  rawConfig?: any;
  // Product-specific fields
  mirrorType?: string;
  mirrorShape?: string;
  ledType?: string;
  placement?: string;
  mountType?: string;
  frontType?: string;
  ralColor?: string;
  mountingType?: string;
  panelProductType?: string;
  sandblasting?: string;
  edgePolish?: { enabled: boolean; type: string };
  processingInfo?: { holes: number; cutouts: number; bevel?: { enabled: boolean; width: number } };
  quantity?: number;
  panelCount?: number;
  holeSpecs?: Array<{ diameter: number; x: number; y: number }>;
  cutoutSpecs?: Array<{ width: number; height: number; x: number; y: number }>;
  edgeCutouts?: Array<{ id: string; side: 'left' | 'right' | 'center'; verticalPosition?: 'top' | 'bottom'; depth: number; length: number; position?: number; positionX?: number }>;
  partitionGrid?: {
    columns: number;
    columnWidths: number[];
    columnRows: number[];
    columnRowHeights: number[][];
    totalWidth: number;
    totalHeight: number;
    doors?: Array<{ col: number; row: number; hingeSide: string }>;
    sidePanels?: Record<string, {
      width: number;
      height: number;
      grid: { columns: number; columnWidths: number[]; columnRows: number[]; columnRowHeights: number[][] };
      profileWidth: number;
    }>;
  };
  // Trapezoid heights (frontal/lateral)
  frontalHeightA?: number;
  frontalHeightB?: number;
  lateralHeightA?: number;
  lateralHeightB?: number;
  lateralFullPanelHeight?: number;
  lateralDoorWidth?: number;
  lateralFixedPanels?: {
    left?: { enabled: boolean; width: number };
    right?: { enabled: boolean; width: number };
  };
  lateralHingeSide?: 'left' | 'right';
  lateralHingePositions?: number[];
  balustradeLayout?: {
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
  };
  selectedKit?: {
    name: string;
    code: string;
    price: number;
    imageUrl?: string | null;
    items?: Array<{ material_code: string; material_name: string; quantity: number }>;
  };
}

/** Calculate U-profile length based on cabin type and dimensions (same as pricing.ts) */
function calcUProfileLength(cabinType: string, dims: any): number {
  const w = dims.width || dims.doorWidth || 900;
  const h = dims.height || 2000;
  const d = dims.depth || 0;
  const dw = dims.doorWidth || w;

  switch (cabinType) {
    case 'corner_90':
      return w + d + h;
    case 'walk_in':
      return w + h * 2;
    case 'pentagon':
      return w * 2 + d * 2 + h;
    case 'bathtub':
      return w + h;
    default:
      // single door or unknown
      return dw + h * 2;
  }
}

function parseProduct(item: any): ProductOption | null {
  const config = item.configuration as any;
  if (!config || typeof config !== 'object' || Array.isArray(config)) return null;

  const dims = config.dimensions;
  const acc = config.accessories;
  if (!dims) return null;

  // acc may be undefined for non-door/shower products — handle gracefully
  const safeAcc = acc || {};

  const rawDoorWidth = dims.doorWidth || dims.width || dims.length || 900;
  const rawDoorHeight = dims.height || 2000;
  const cabinWidth = dims.width || rawDoorWidth;
  const rawCabinDepth = dims.depth || 0;

  // Extract aggregated glass deductions from saved config
  // These are pre-computed by calculators from all selected accessories' per-side deductions
  const gd = config.glassDeductions as Record<string, number> | undefined;
  const sealsObj = safeAcc.seals || {};
  const totalWidthDed = Number(sealsObj.totalWidthDeduction) || Number(gd?.totalWidthDeduction) || 0;
  const totalHeightDed = Number(sealsObj.totalHeightDeduction) || Number(gd?.totalHeightDeduction) || 0;

  const doorWidth = rawDoorWidth - totalWidthDed;
  const doorHeight = rawDoorHeight - totalHeightDed;
  // Lateral panel uses its own deductions (from lateralConfig.seals)
  const lateralSeals = (safeAcc as any).lateralConfig?.seals || (config as any).lateralConfig?.seals || {};
  const lateralWidthDed = Number(lateralSeals.totalWidthDeduction) || 0;
  // Profile deductions — only apply to fixed panels, never to doors
  const profileWidthDed = Number(sealsObj.profileWidthDeduction) || 0;
  const profileHeightDed = Number(sealsObj.profileHeightDeduction) || 0;
  const lateralProfileWidthDed = Number(lateralSeals.profileWidthDeduction) || 0;
  // Fallback: if lateral profileHeightDeduction is missing (old orders), inherit from frontal
  const lateralProfileHeightDed = Number(lateralSeals.profileHeightDeduction) || (rawCabinDepth > 0 ? profileHeightDed : 0);
  const cabinDepth = rawCabinDepth > 0 ? rawCabinDepth - lateralWidthDed - lateralProfileWidthDed : 0;
  const fixedPanel = dims.fixedPanel ? { enabled: !!dims.fixedPanel.enabled, width: (dims.fixedPanel.width || 400) - profileWidthDed } : undefined;
  const fixedPanelLeft = safeAcc.fixedPanel?.left ? { enabled: !!safeAcc.fixedPanel.left.enabled, width: Math.max(0, (safeAcc.fixedPanel.left.width || 0) - profileWidthDed) } : undefined;
  const fixedPanelRight = safeAcc.fixedPanel?.right ? { enabled: !!safeAcc.fixedPanel.right.enabled, width: Math.max(0, (safeAcc.fixedPanel.right.width || 0) - profileWidthDed) } : undefined;
  const glass = config.glass || {};
  const cabinType = config.cabinType || '';

  const doorType = config.doorType || '';
  // Sliding doors have no hinges — force empty
  const hingePositions = doorType === 'sliding' ? [] : (safeAcc.hinges?.positions || []);
  // For sliding doors, handle goes on opposite side of sliding direction
  const hingeSide = doorType === 'sliding'
    ? ((safeAcc.door?.slidingDirection || 'left') === 'right' ? 'right' : 'left')
    : (safeAcc.door?.hingeSide || 'left');

  // Profiles
  let profiles: ProductOption['profiles'] = undefined;
  if (safeAcc.profiles) {
    const profileLengthMm = calcUProfileLength(cabinType, dims);
    profiles = {
      type: safeAcc.profiles.type || 'u_profile',
      finish: safeAcc.profiles.finish || '',
      materialCode: safeAcc.profiles.materialCode,
      lengthMm: profileLengthMm,
      selections: safeAcc.profiles.selections || [],
    };
  }

  // Seals
  let seals: ProductOption['seals'] = undefined;
  if (safeAcc.seals) {
    seals = {
      magnetic: !!safeAcc.seals.magnetic,
      magneticCode: safeAcc.seals.magneticMaterialCode,
      magneticSelections: safeAcc.seals.magneticSelections || [],
      rubber: !!safeAcc.seals.rubber,
      rubberCode: safeAcc.seals.rubberMaterialCode,
      rubberSelections: safeAcc.seals.rubberSelections || [],
      threshold: !!safeAcc.seals.threshold,
      thresholdCode: safeAcc.seals.thresholdMaterialCode,
      thresholdSelections: safeAcc.seals.thresholdSelections || [],
    };
  }

  // Stabilizer selections (new pattern with catalog codes + lengths)
  const stabilizerSelections: SelectionItem[] = (safeAcc.stabilizerSelections || []).map((s: any) => ({
    materialCode: s.materialCode || '',
    name: s.name || '',
    length: s.length ?? undefined,
  }));

  // Stabilizers
  let stabilizers: ProductOption['stabilizers'] = undefined;
  if (safeAcc.stabilizers && Array.isArray(safeAcc.stabilizers) && safeAcc.stabilizers.length > 0) {
    stabilizers = safeAcc.stabilizers.map((s: any) => ({
      type: s.type || '',
      length: s.length || 0,
      position: s.position || '',
      materialCode: s.materialCode,
    }));
  }

  // Lock
  let lock: ProductOption['lock'] = undefined;
  if (safeAcc.lock && safeAcc.lock.enabled) {
    lock = {
      enabled: true,
      type: safeAcc.lock.type || '',
      materialCode: safeAcc.lock.materialCode,
    };
  }

  // Pivot
  let pivot: ProductOption['pivot'] = undefined;
  if (safeAcc.pivot && safeAcc.pivot.type) {
    pivot = {
      type: safeAcc.pivot.type,
      materialCode: safeAcc.pivot.materialCode,
    };
  }

  // Sliding system
  let slidingSystem: ProductOption['slidingSystem'] = undefined;
  if (safeAcc.slidingSystem) {
    slidingSystem = {
      rail: safeAcc.slidingSystem.rail || '',
      rollers: safeAcc.slidingSystem.rollers || '',
      materialCode: safeAcc.slidingSystem.materialCode,
    };
  }
  // Fallback for shower sliding: no slidingSystem in accessories, but doorType is sliding
  if (!slidingSystem && doorType === 'sliding') {
    slidingSystem = {
      rail: config.slidingMechanismCode || config.selectedKit?.code || '',
      rollers: '',
      materialCode: config.slidingMechanismCode,
    };
  }

  // Extra accessories — from accessories level
  let extraAccessories: ProductOption['extraAccessories'] = undefined;
  if (safeAcc.extraAccessories && Array.isArray(safeAcc.extraAccessories) && safeAcc.extraAccessories.length > 0) {
    extraAccessories = safeAcc.extraAccessories.map((e: any) => ({
      materialCode: e.materialCode || '',
      name: e.name || '',
      quantity: e.quantity || 1,
      detail: e.detail,
      colorHex: e.colorHex,
      unit: e.unit,
    }));
  }

  // ── Extract lateral config accessories (corner_90 cabins) ──
  const lateralConfig = config.lateralConfig;
  if (lateralConfig?.enabled) {
    const lateralExtras: Array<{ materialCode: string; name: string; quantity: number }> = [];
    // Lateral hinges
    const latHinges = lateralConfig.hinges;
    if (latHinges) {
      const latHingeQty = latHinges.quantity || (latHinges.positions?.length) || 0;
      const latHingeSels = latHinges.selections || [];
      if (latHingeSels.length > 0) {
        lateralExtras.push({
          materialCode: latHingeSels[0].materialCode || '',
          name: `Lateral: ${latHingeSels[0].name || 'Balamală'}`,
          quantity: latHingeQty,
        });
      } else if (latHinges.materialCode) {
        lateralExtras.push({
          materialCode: latHinges.materialCode,
          name: `Lateral: ${i18next.t('processing.lateralAccessories.hinge')}`,
          quantity: latHingeQty,
        });
      }
    }
    // Lateral handle
    const latHandle = lateralConfig.handle;
    if (latHandle) {
      const latHandleSels = latHandle.selections || [];
      if (latHandleSels.length > 0) {
        latHandleSels.forEach((sel: any) => {
          lateralExtras.push({
            materialCode: sel.materialCode || '',
            name: `Lateral: ${sel.name || 'Mâner'}`,
            quantity: 1,
          });
        });
      } else if (latHandle.materialCode) {
        lateralExtras.push({
          materialCode: latHandle.materialCode,
          name: `Lateral: ${i18next.t('processing.lateralAccessories.handle')}`,
          quantity: 1,
        });
      }
    }
    // Lateral seals
    const latSeals = lateralConfig.seals;
    if (latSeals) {
      if (latSeals.magnetic) {
        const sels = latSeals.magneticSelections || [];
        if (sels.length > 0) {
          sels.forEach((sel: any) => lateralExtras.push({ materialCode: sel.materialCode || '', name: `Lateral: ${sel.name || 'Profil Magnetic'}`, quantity: 1 }));
        } else if (latSeals.magneticMaterialCode) {
          lateralExtras.push({ materialCode: latSeals.magneticMaterialCode, name: `Lateral: ${i18next.t('processing.lateralAccessories.magneticSeal')}`, quantity: 1 });
        }
      }
      if (latSeals.rubber) {
        const sels = latSeals.rubberSelections || [];
        if (sels.length > 0) {
          sels.forEach((sel: any) => lateralExtras.push({ materialCode: sel.materialCode || '', name: `Lateral: ${sel.name || 'Garnitură Cauciuc'}`, quantity: 1 }));
        } else if (latSeals.rubberMaterialCode) {
          lateralExtras.push({ materialCode: latSeals.rubberMaterialCode, name: `Lateral: ${i18next.t('processing.lateralAccessories.rubberSeal')}`, quantity: 1 });
        }
      }
      if (latSeals.threshold) {
        const sels = latSeals.thresholdSelections || [];
        if (sels.length > 0) {
          sels.forEach((sel: any) => lateralExtras.push({ materialCode: sel.materialCode || '', name: `Lateral: ${sel.name || 'Profil Prag'}`, quantity: 1 }));
        } else if (latSeals.thresholdMaterialCode) {
          lateralExtras.push({ materialCode: latSeals.thresholdMaterialCode, name: `Lateral: ${i18next.t('processing.lateralAccessories.threshold')}`, quantity: 1 });
        }
      }
    }
    if (lateralExtras.length > 0) {
      extraAccessories = [...(extraAccessories || []), ...lateralExtras];
    }
  }

  // Product label mapping
  const productLabels: Record<string, string> = {
    door: i18next.t('processing.productLabels.door'),
    shower: i18next.t('processing.productLabels.shower'),
    balustrade: i18next.t('processing.productLabels.balustrade'),
    mirror: i18next.t('processing.productLabels.mirror'),
    panel: i18next.t('processing.productLabels.panel'),
    kitchen_front: i18next.t('processing.productLabels.kitchen_front'),
  };
  const productLabel = productLabels[item.product_type] || item.product_type;

  // Product-specific fields
  let mirrorType: string | undefined;
  let mirrorShape: string | undefined;
  let ledType: string | undefined;
  let placementField: string | undefined;
  let mountTypeField: string | undefined;
  let frontTypeField: string | undefined;
  let ralColorField: string | undefined;
  let mountingTypeField: string | undefined;
  let panelProductType: string | undefined;
  let sandblastingField: string | undefined;
  let edgePolishField: ProductOption['edgePolish'] = undefined;
  let processingInfoField: ProductOption['processingInfo'] = undefined;
  let quantityField: number | undefined;
  let panelCountField: number | undefined;
  let holeSpecs: ProductOption['holeSpecs'] = undefined;
  let cutoutSpecs: ProductOption['cutoutSpecs'] = undefined;
  let partitionGrid: ProductOption['partitionGrid'] = undefined;
  let balustradeLayout: ProductOption['balustradeLayout'] = undefined;

  if (item.product_type === 'mirror') {
    mirrorType = glass.mirrorType || config.mirrorType;
    mirrorShape = config.shape || dims.shape;
    ledType = config.led?.type;
  } else if (item.product_type === 'balustrade') {
    placementField = config.placement;
    mountTypeField = safeAcc?.mountType || config.mountType;
    panelCountField = dims.panelCount;
    // Build balustradeLayout for drawing
    const sc = dims.stairsConfig;
    balustradeLayout = {
      placement: config.placement || 'interior',
      panelCount: dims.panelCount || 1,
      length: dims.length || dims.width || 1000,
      height: dims.height || 1000,
      glassType: glass.type || 'clear',
      thickness: glass.thickness || 10,
      stairsConfig: sc ? {
        angle: sc.angle || 0,
        stepHeight: sc.stepHeight || 170,
        stepDepth: sc.stepDepth || 300,
        hasIntermediateLanding: !!sc.hasIntermediateLanding,
        landingLength: sc.landingLength || 0,
        landingPosition: sc.landingPosition || 0,
        ramp1PanelCount: sc.ramp1PanelCount || dims.panelCount || 1,
        ramp2PanelCount: sc.ramp2PanelCount || 0,
        stairPanelHeight: sc.stairPanelHeight || dims.height || 1000,
        intermediateLandingPanelHeight: sc.intermediateLandingPanelHeight || dims.height || 1000,
        finalLandingPanelHeight: sc.finalLandingPanelHeight || dims.height || 1000,
        finalLandingLength: sc.finalLandingLength || 0,
      } : undefined,
      corners: dims.corners ? {
        left: dims.corners.left?.enabled ? { enabled: true, length: dims.corners.left.length || 500, panelCount: dims.corners.left.panelCount || 1 } : undefined,
        right: dims.corners.right?.enabled ? { enabled: true, length: dims.corners.right.length || 500, panelCount: dims.corners.right.panelCount || 1 } : undefined,
      } : undefined,
    };
  } else if (item.product_type === 'kitchen_front') {

    frontTypeField = config.frontType;
    ralColorField = config.finish?.ralColor || config.ralColor;
    mountingTypeField = config.mounting?.type || config.mounting;
  } else if (item.product_type === 'panel') {
    panelProductType = config.productType;
    sandblastingField = config.processing?.sandblasting || config.sandblasting;
    // Partition wall grid
    if (config.partitionWall?.enabled && config.partitionWall.grid) {
      const pw = config.partitionWall;
      const doors = (pw.doors || []).map((d: any) => {
        // Find which cell this door belongs to
        const cell = (pw.cells || []).find((c: any) => c.id === d.cellId);
        return {
          col: cell?.col ?? 0,
          row: cell?.row ?? 0,
          hingeSide: d.hingeSide || 'left',
          handle: d.accessories?.handle ? {
            model: d.accessories.handle.model,
            length: d.accessories.handle.length || 0,
            materialCode: d.accessories.handle.materialCode,
            positionY: d.accessories.handle.positionY || Math.round((d.doorHeight || pw.totalHeight) / 2),
            finish: d.accessories.handle.finish,
          } : undefined,
          hinges: d.accessories?.hinges ? {
            type: d.accessories.hinges.type,
            quantity: d.accessories.hinges.quantity,
            materialCode: d.accessories.hinges.materialCode,
          } : undefined,
        };
      });
      partitionGrid = {
        columns: pw.grid.columns,
        columnWidths: pw.grid.columnWidths,
        columnRows: pw.grid.columnRows,
        columnRowHeights: pw.grid.columnRowHeights,
        totalWidth: pw.totalWidth,
        totalHeight: pw.totalHeight,
        doors,
        sidePanels: (() => {
          const sp: any = {};
          (['left', 'right'] as const).forEach(side => {
            const sidePanel = pw.sidePanels?.[side];
            if (!sidePanel?.enabled || !sidePanel.grid) return;
            sp[side] = {
              width: sidePanel.width,
              height: sidePanel.height ?? pw.totalHeight,
              grid: {
                columns: sidePanel.grid.columns,
                columnWidths: sidePanel.grid.columnWidths,
                columnRows: sidePanel.grid.columnRows,
                columnRowHeights: sidePanel.grid.columnRowHeights,
              },
              profileWidth: sidePanel.profileWidth ?? pw.profileWidth ?? 12,
            };
          });
          return Object.keys(sp).length > 0 ? sp : undefined;
        })(),
      };
    }

    // Extract partition wall perimeter profile selections as profiles
    if (config.partitionWall?.profileSelections?.length > 0 || config.partitionWall?.profileMaterialCode) {
      const pwProf = config.partitionWall;
      profiles = {
        type: 'u_profile',
        finish: '',
        materialCode: pwProf.profileMaterialCode,
        selections: pwProf.profileSelections || [],
      };
    }

    // Extract partition wall door accessories (hinges, handle, lock) as extra accessories
    if (config.partitionWall?.doors?.length > 0) {
      const pwDoorExtras: Array<{ materialCode: string; name: string; quantity: number; detail?: string; colorHex?: string }> = [];
      const pwDoors = config.partitionWall.doors as any[];
      pwDoors.forEach((d: any, di: number) => {
        const dAcc = d.accessories;
        if (!dAcc) return;
        const doorLabel = pwDoors.length > 1 ? ` ușă ${di + 1}` : '';
        // Hinges (fallback to finish when materialCode is missing)
        const hingeCode = dAcc.hinges?.materialCode || dAcc.hinges?.finish || '';
        if (hingeCode) {
          const hQty = dAcc.hinges.quantity || 1;
          const hType = dAcc.hinges.type === 'wall_glass' ? i18next.t('orderPreview.wallGlass') : dAcc.hinges.type === 'glass_glass' ? i18next.t('orderPreview.glassGlass') : dAcc.hinges.type || '';
          const hFinish = dAcc.hinges.finish || '';
          pwDoorExtras.push({
            materialCode: hingeCode,
            name: `Balama${doorLabel} ${hType}`.trim(),
            quantity: hQty,
            detail: `${hQty} buc · ${hType}${hFinish ? ' · ' + hFinish : ''}`,
          });
        }
        // Handle (fallback to finish when materialCode is missing)
        const handleCode = dAcc.handle?.materialCode || dAcc.handle?.finish || '';
        if (handleCode) {
          const hModel = dAcc.handle.model || '';
          const hLen = dAcc.handle.length ? `${dAcc.handle.length}mm` : '';
          const hPosY = dAcc.handle.positionY ? `Poziție Y: ${dAcc.handle.positionY}mm` : '';
          const hFinish = dAcc.handle.finish || '';
          pwDoorExtras.push({
            materialCode: handleCode,
            name: `Mâner${doorLabel} ${hModel} ${hLen}`.trim(),
            quantity: 1,
            detail: [hModel, hLen, hPosY, hFinish ? `Finisaj: ${hFinish}` : ''].filter(Boolean).join(' · '),
          });
        }
        // Lock
        if (dAcc.lock?.enabled && dAcc.lock?.materialCode) {
          const lockType = dAcc.lock.type || '';
          pwDoorExtras.push({
            materialCode: dAcc.lock.materialCode,
            name: `Broască${doorLabel}`,
            quantity: 1,
            detail: lockType ? `1 buc · ${lockType}` : '1 buc',
          });
        }
        // Per-door extra accessories
        if (Array.isArray(dAcc.extraAccessories)) {
          dAcc.extraAccessories.forEach((e: any) => {
            if (e.materialCode) {
              pwDoorExtras.push({
                materialCode: e.materialCode,
                name: e.name || `Accesoriu${doorLabel}`,
                quantity: e.quantity || 1,
              });
            }
          });
        }
      });
      if (pwDoorExtras.length > 0) {
        extraAccessories = [...(extraAccessories || []), ...pwDoorExtras];
      }
    }
  }

  // Extract actual hole/cutout specs with positions
  if (config.processing) {
    const proc = config.processing;
    if (Array.isArray(proc.holes) && proc.holes.length > 0) {
      holeSpecs = proc.holes.map((h: any) => ({ diameter: h.diameter || 10, x: h.x || 0, y: h.y || 0 }));
    }
    if (Array.isArray(proc.cutouts) && proc.cutouts.length > 0) {
      cutoutSpecs = proc.cutouts.map((c: any) => ({ width: c.width || 50, height: c.height || 50, x: c.x || 0, y: c.y || 0 }));
    }
  }

  // Edge cutouts (door configurator step 5)
  let edgeCutouts: ProductOption['edgeCutouts'] = undefined;
  if (Array.isArray(config.cutouts) && config.cutouts.length > 0) {
    edgeCutouts = config.cutouts.map((c: any) => ({
      id: c.id || crypto.randomUUID(),
      side: c.side || 'left',
      verticalPosition: c.verticalPosition,
      depth: c.depth || 50,
      length: c.length || 100,
      position: c.position,
      positionX: c.positionX,
    }));
  }

  // Edge polishing (common across types)
  if (config.edgePolish) {
    edgePolishField = { enabled: !!config.edgePolish.enabled, type: config.edgePolish.type || '' };
  }

  // Processing info
  if (config.processing) {
    const proc = config.processing;
    const holesCount = Array.isArray(proc.holes) ? proc.holes.length : (proc.holes || 0);
    const cutoutsCount = Array.isArray(proc.cutouts) ? proc.cutouts.length : (proc.cutouts || 0);
    processingInfoField = {
      holes: holesCount,
      cutouts: cutoutsCount,
      bevel: proc.bevel ? { enabled: !!proc.bevel.enabled, width: proc.bevel.width || 0 } : undefined,
    };
  }

  // Quantity
  quantityField = config.quantity || dims.quantity;

  // Extra accessories from config root (some products store them at root level)
  let rootExtraAccessories = extraAccessories;
  if (!rootExtraAccessories && config.extraAccessories && Array.isArray(config.extraAccessories) && config.extraAccessories.length > 0) {
    rootExtraAccessories = config.extraAccessories.map((e: any) => ({
      materialCode: e.materialCode || '',
      name: e.name || '',
      quantity: e.quantity || 1,
      detail: e.detail,
      colorHex: e.colorHex,
      unit: e.unit,
    }));
  }
  // Merge: if both acc-level and root-level exist, combine them
  if (rootExtraAccessories && extraAccessories && rootExtraAccessories !== extraAccessories) {
    rootExtraAccessories = [...extraAccessories, ...rootExtraAccessories];
  }

  // Balustrade-specific: extract mountPoints, handrail, uProfile, cornerConnector as extra accessories
  // Supports materialCodes[] arrays (multiple catalog selections) in addition to single materialCode
  if (item.product_type === 'balustrade') {
    const balustradeExtras: Array<{ materialCode: string; name: string; quantity: number; detail?: string; colorHex?: string }> = [];
    if (safeAcc.mountPoints && safeAcc.mountPoints.quantity > 0) {
      const mpQty = safeAcc.mountPoints.quantity;
      const mpModel = safeAcc.mountPoints.model || 'standard';
      const mpFinish = safeAcc.mountPoints.finish || '';
      const mpSpacing = safeAcc.mountPoints.spacing ? `Distanță: ${safeAcc.mountPoints.spacing}mm` : '';
      const mpDetail = [
        `${mpQty} buc`,
        mpModel,
        mpFinish ? `Finisaj: ${mpFinish}` : '',
        mpSpacing,
      ].filter(Boolean).join(' · ');
      const codes: string[] = safeAcc.mountPoints.materialCodes?.length
        ? safeAcc.mountPoints.materialCodes
        : safeAcc.mountPoints.materialCode ? [safeAcc.mountPoints.materialCode] : [];
      codes.forEach((code: string) => {
        balustradeExtras.push({
          materialCode: code,
          name: `Puncte montaj (${mpModel})`,
          quantity: mpQty,
          detail: mpDetail,
        });
      });
      if (codes.length === 0) {
        balustradeExtras.push({
          materialCode: '',
          name: `Puncte montaj (${mpModel})`,
          quantity: mpQty,
          detail: mpDetail,
        });
      }
    }
    if (safeAcc.uProfile) {
      const upSize = safeAcc.uProfile.size || '';
      const upFinish = safeAcc.uProfile.finish || '';
      const upDetail = [upSize, upFinish ? `Finisaj: ${upFinish}` : ''].filter(Boolean).join(' · ') || '1 buc';
      const codes: string[] = safeAcc.uProfile.materialCodes?.length
        ? safeAcc.uProfile.materialCodes
        : safeAcc.uProfile.materialCode ? [safeAcc.uProfile.materialCode] : [];
      codes.forEach((code: string) => {
        balustradeExtras.push({
          materialCode: code,
          name: `Profil U ${upSize}`,
          quantity: 1,
          detail: upDetail,
        });
      });
      if (codes.length === 0) {
        balustradeExtras.push({
          materialCode: '',
          name: `Profil U ${upSize}`,
          quantity: 1,
          detail: upDetail,
        });
      }
    }
    if (safeAcc.handrail) {
      const hrDiam = safeAcc.handrail.diameter || 50;
      const hrType = safeAcc.handrail.type || 'round';
      const hrFinish = safeAcc.handrail.finish || '';
      const hrLength = safeAcc.handrail.length ? `${safeAcc.handrail.length}mm` : '';
      const hrDetail = [
        `Ø${hrDiam}mm`,
        hrType === 'square' ? i18next.t('processing.details.square') : i18next.t('processing.details.round'),
        hrLength,
        hrFinish ? `Finisaj: ${hrFinish}` : '',
      ].filter(Boolean).join(' · ');
      const codes: string[] = safeAcc.handrail.materialCodes?.length
        ? safeAcc.handrail.materialCodes
        : safeAcc.handrail.materialCode ? [safeAcc.handrail.materialCode] : [];
      codes.forEach((code: string) => {
        balustradeExtras.push({
          materialCode: code,
          name: `Mână curentă Ø${hrDiam}mm`,
          quantity: 1,
          detail: hrDetail,
        });
      });
      if (codes.length === 0) {
        balustradeExtras.push({
          materialCode: '',
          name: `Mână curentă Ø${hrDiam}mm`,
          quantity: 1,
          detail: hrDetail,
        });
      }
    }
    // Corner connector
    if (dims.cornerConnector) {
      const ccQty = dims.cornerConnector.quantity || 1;
      const codes: string[] = dims.cornerConnector.materialCodes?.length
        ? dims.cornerConnector.materialCodes
        : dims.cornerConnector.materialCode ? [dims.cornerConnector.materialCode] : [];
      codes.forEach((code: string) => {
        balustradeExtras.push({
          materialCode: code,
          name: `Conector colț 90°`,
          quantity: ccQty,
          detail: `${ccQty} buc`,
        });
      });
    }
    if (balustradeExtras.length > 0) {
      rootExtraAccessories = [...(rootExtraAccessories || []), ...balustradeExtras];
    }
  }

  // Build hinges data — sliding doors have no hinges
  const hingeQuantity = doorType === 'sliding' ? 0 : (safeAcc.hinges?.quantity || hingePositions.length);
  const hingesData = hingePositions.length > 0 || hingeQuantity > 0
    ? {
        positions: hingePositions,
        materialCode: safeAcc.hinges?.materialCode,
        quantity: hingeQuantity,
        finish: safeAcc.hinges?.finish,
        selections: safeAcc.hinges?.selections || [],
      }
    : { positions: [] as number[], quantity: 0, selections: [] as SelectionItem[] };

  // Build handle data
  const handleData = safeAcc.handle ? {
    positionY: safeAcc.handle.positionY || Math.round(rawDoorHeight / 2),
    model: safeAcc.handle.model,
    length: safeAcc.handle.length,
    finish: safeAcc.handle.finish,
    materialCode: safeAcc.handle.materialCode,
    selections: safeAcc.handle.selections || [],
  } : undefined;

  return {
    id: item.id,
    product_type: item.product_type,
    productLabel,
    label: `${productLabel} — ${doorWidth}×${doorHeight}mm`,
    doorWidth,
    doorHeight,
    cabinWidth: cabinWidth !== doorWidth ? cabinWidth : undefined,
    cabinDepth: (cabinType === 'corner_90' || cabinType === 'pentagon') && cabinDepth > 0 ? cabinDepth : undefined,
    profileWidthDeduction: profileWidthDed || undefined,
    lateralProfileWidthDeduction: lateralProfileWidthDed || undefined,
    profileHeightDeduction: profileHeightDed || undefined,
    lateralProfileHeightDeduction: lateralProfileHeightDed || undefined,
    fixedPanel,
    fixedPanelLeft,
    fixedPanelRight,
    glassThickness: glass.thickness || dims.thickness || 8,
    glassType: glass.type || glass.mirrorType || 'Transparent',
    hinges: hingesData,
    handle: handleData,
    hingeSide,
    cabinType: cabinType || undefined,
    profiles,
    seals,
    stabilizers,
    stabilizerSelections,
    lock,
    pivot,
    slidingSystem,
    extraAccessories: rootExtraAccessories,
    rawConfig: config,
    // Product-specific
    mirrorType,
    mirrorShape,
    ledType,
    placement: placementField,
    mountType: mountTypeField,
    frontType: frontTypeField,
    ralColor: ralColorField,
    mountingType: mountingTypeField,
    panelProductType,
    sandblasting: sandblastingField,
    edgePolish: edgePolishField,
    processingInfo: processingInfoField,
    quantity: quantityField,
    panelCount: panelCountField,
    holeSpecs,
    cutoutSpecs,
    edgeCutouts,
    partitionGrid,
    frontalHeightA: dims.frontalHeightA,
    frontalHeightB: dims.frontalHeightB,
    lateralHeightA: dims.lateralHeightA,
    lateralHeightB: dims.lateralHeightB,
    lateralFullPanelHeight: dims.lateralFullPanelHeight,
    lateralDoorWidth: lateralConfig?.enabled ? (dims.lateralDoorWidth || dims.doorWidth || 730) : undefined,
    lateralFixedPanels: lateralConfig?.enabled ? {
      left: lateralConfig.fixedPanel?.left ? { enabled: !!lateralConfig.fixedPanel.left.enabled, width: lateralConfig.fixedPanel.left.width || 0 } : undefined,
      right: lateralConfig.fixedPanel?.right ? { enabled: !!lateralConfig.fixedPanel.right.enabled, width: lateralConfig.fixedPanel.right.width || 0 } : undefined,
    } : undefined,
    lateralHingeSide: lateralConfig?.enabled ? (lateralConfig.door?.hingeSide || 'left') : undefined,
    lateralHingePositions: lateralConfig?.enabled ? (lateralConfig.hinges?.positions || []) : undefined,
    balustradeLayout,
    selectedKit: config.selectedKit ? {
      name: config.selectedKit.name || '',
      code: config.selectedKit.code || '',
      price: config.selectedKit.price || 0,
      imageUrl: config.selectedKit.imageUrl || config.selectedKit.image_url || null,
      items: Array.isArray(config.selectedKit.items) ? config.selectedKit.items : [],
    } : undefined,
  };
}

export function OrderProcessingSheet() {
  const { t } = useTranslation();
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  // Load orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['processing-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, clients(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((o: any) => ({
        id: o.id,
        order_number: o.order_number,
        clientName: o.clients?.name || 'Fără client',
      })) as OrderOption[];
    },
  });

  // Load products for selected order
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['processing-products', selectedOrderId],
    enabled: !!selectedOrderId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_products')
        .select('id, product_type, configuration, full_config')
        .eq('order_id', selectedOrderId);
      if (error) throw error;

      const results: ProductOption[] = [];
      for (const item of data || []) {
        // Prefer full_config (structured) over configuration (label/value array)
        const configSource = item.full_config && typeof item.full_config === 'object' && !Array.isArray(item.full_config)
          ? { ...item, configuration: item.full_config }
          : item;
        const parsed = parseProduct(configSource);
        if (parsed) results.push(parsed);
      }
      return results;
    },
  });

  // Auto-select single product
  useEffect(() => {
    if (products.length === 1) {
      setSelectedProductId(products[0].id);
    }
  }, [products]);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Collect ALL material codes from all accessories (including selections)
  const allMaterialCodes: string[] = [];
  if (selectedProduct) {
    const sp = selectedProduct;
    if (sp.hinges.materialCode) allMaterialCodes.push(sp.hinges.materialCode);
    if (sp.hinges.selections) sp.hinges.selections.forEach(s => { if (s.materialCode) allMaterialCodes.push(s.materialCode); });
    if (sp.handle?.materialCode) allMaterialCodes.push(sp.handle.materialCode);
    if (sp.handle?.selections) sp.handle.selections.forEach(s => { if (s.materialCode) allMaterialCodes.push(s.materialCode); });
    if (sp.profiles?.materialCode) allMaterialCodes.push(sp.profiles.materialCode);
    if (sp.profiles?.selections) sp.profiles.selections.forEach(s => { if (s.materialCode) allMaterialCodes.push(s.materialCode); });
    if (sp.seals?.magneticCode) allMaterialCodes.push(sp.seals.magneticCode);
    if (sp.seals?.magneticSelections) sp.seals.magneticSelections.forEach(s => { if (s.materialCode) allMaterialCodes.push(s.materialCode); });
    if (sp.seals?.rubberCode) allMaterialCodes.push(sp.seals.rubberCode);
    if (sp.seals?.rubberSelections) sp.seals.rubberSelections.forEach(s => { if (s.materialCode) allMaterialCodes.push(s.materialCode); });
    if (sp.seals?.thresholdCode) allMaterialCodes.push(sp.seals.thresholdCode);
    if (sp.seals?.thresholdSelections) sp.seals.thresholdSelections.forEach(s => { if (s.materialCode) allMaterialCodes.push(s.materialCode); });
    if (sp.stabilizers) sp.stabilizers.forEach(s => { if (s.materialCode) allMaterialCodes.push(s.materialCode); });
    if (sp.stabilizerSelections) sp.stabilizerSelections.forEach(s => { if (s.materialCode) allMaterialCodes.push(s.materialCode); });
    if (sp.lock?.materialCode) allMaterialCodes.push(sp.lock.materialCode);
    if (sp.pivot?.materialCode) allMaterialCodes.push(sp.pivot.materialCode);
    if (sp.slidingSystem?.materialCode) allMaterialCodes.push(sp.slidingSystem.materialCode);
    if (sp.extraAccessories) sp.extraAccessories.forEach(e => { if (e.materialCode) allMaterialCodes.push(e.materialCode); });
    if (sp.selectedKit) {
      if (sp.selectedKit.code) allMaterialCodes.push(sp.selectedKit.code);
      if (sp.selectedKit.items) sp.selectedKit.items.forEach(item => { if (item.material_code) allMaterialCodes.push(item.material_code); });
    }
    // Lateral config material codes (from rawConfig)
    const latCfg = sp.rawConfig?.lateralConfig;
    if (latCfg?.enabled) {
      if (latCfg.hinges?.materialCode) allMaterialCodes.push(latCfg.hinges.materialCode);
      if (latCfg.hinges?.selections) latCfg.hinges.selections.forEach((s: any) => { if (s.materialCode) allMaterialCodes.push(s.materialCode); });
      if (latCfg.handle?.materialCode) allMaterialCodes.push(latCfg.handle.materialCode);
      if (latCfg.handle?.selections) latCfg.handle.selections.forEach((s: any) => { if (s.materialCode) allMaterialCodes.push(s.materialCode); });
      if (latCfg.seals?.magneticMaterialCode) allMaterialCodes.push(latCfg.seals.magneticMaterialCode);
      if (latCfg.seals?.magneticSelections) latCfg.seals.magneticSelections.forEach((s: any) => { if (s.materialCode) allMaterialCodes.push(s.materialCode); });
      if (latCfg.seals?.rubberMaterialCode) allMaterialCodes.push(latCfg.seals.rubberMaterialCode);
      if (latCfg.seals?.rubberSelections) latCfg.seals.rubberSelections.forEach((s: any) => { if (s.materialCode) allMaterialCodes.push(s.materialCode); });
      if (latCfg.seals?.thresholdMaterialCode) allMaterialCodes.push(latCfg.seals.thresholdMaterialCode);
      if (latCfg.seals?.thresholdSelections) latCfg.seals.thresholdSelections.forEach((s: any) => { if (s.materialCode) allMaterialCodes.push(s.materialCode); });
    }
  }
  const uniqueCodes = [...new Set(allMaterialCodes.filter(Boolean))];

  // Batch fetch all materials by code
  const { data: materialsMap = {} } = useQuery({
    queryKey: ['processing-materials-map', uniqueCodes.join(',')],
    enabled: uniqueCodes.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from('materials')
        .select('code, name, image_url')
        .in('code', uniqueCodes);
      const map: Record<string, { name: string; imageUrl: string | null }> = {};
      (data || []).forEach(m => {
        map[m.code] = { name: m.name, imageUrl: m.image_url };
      });
      // Fill gaps from pricing_config
      const missingCodes = uniqueCodes.filter(c => !map[c]);
      if (missingCodes.length > 0) {
        const { data: pricingData } = await supabase
          .from('pricing_config')
          .select('code, name, image_url')
          .in('code', missingCodes);
        pricingData?.forEach(p => {
          if (!map[p.code]) map[p.code] = { name: p.name || p.code, imageUrl: p.image_url || null };
        });
      }

      const codesNeedingImages = uniqueCodes.filter(code => !map[code]?.imageUrl);
      const parentCodes = [...new Set(codesNeedingImages.flatMap((code) => {
        const parents: string[] = [];
        let parent = code;
        while (parent.includes('.')) {
          parent = parent.replace(/\.[^.]+$/, '');
          parents.push(parent);
        }
        return parents;
      }))];

      if (parentCodes.length > 0) {
        const [{ data: parentMaterials }, { data: parentPricing }] = await Promise.all([
          supabase
            .from('materials')
            .select('code, name, image_url')
            .in('code', parentCodes),
          supabase
            .from('pricing_config')
            .select('code, name, image_url')
            .in('code', parentCodes),
        ]);

        const parentMap: Record<string, { name: string; imageUrl: string | null }> = {};
        parentMaterials?.forEach(m => {
          parentMap[m.code] = { name: m.name, imageUrl: m.image_url };
        });
        parentPricing?.forEach(p => {
          if (!parentMap[p.code]) {
            parentMap[p.code] = { name: p.name || p.code, imageUrl: p.image_url || null };
          }
        });

        codesNeedingImages.forEach((code) => {
          const current = map[code];
          let parent = code;
          while (parent.includes('.')) {
            parent = parent.replace(/\.[^.]+$/, '');
            const parentEntry = parentMap[parent];
            if (parentEntry?.imageUrl) {
              map[code] = {
                name: current?.name || parentEntry.name,
                imageUrl: parentEntry.imageUrl,
              };
              break;
            }
          }
        });
      }

      return map;
    },
  });

  // Fetch finish variant for hinge
  const hingeMaterialCode = selectedProduct?.hinges.materialCode;
  const hingeFinishCode = selectedProduct?.hinges.finish;

  const { data: hingeMaterial } = useQuery({
    queryKey: ['hinge-material-id', hingeMaterialCode],
    enabled: !!hingeMaterialCode,
    queryFn: async () => {
      const { data } = await supabase
        .from('materials')
        .select('id, code, name, image_url')
        .eq('code', hingeMaterialCode!)
        .maybeSingle();
      if (data?.image_url) return data;
      // Caută recursiv pe coduri părinte pentru imagine
      let parent = hingeMaterialCode!;
      while (parent.includes('.')) {
        parent = parent.replace(/\.[^.]+$/, '');
        const { data: parentData } = await supabase
          .from('materials')
          .select('id, code, name, image_url')
          .eq('code', parent)
          .maybeSingle();
        if (parentData?.image_url) {
          return {
            id: data?.id || parentData.id,
            code: data?.code || parentData.code,
            name: data?.name || parentData.name,
            image_url: parentData.image_url,
          };
        }
      }
      return data;
    },
  });

  const { data: finishVariant } = useQuery({
    queryKey: ['hinge-finish-variant', hingeMaterial?.id, hingeFinishCode],
    enabled: !!hingeMaterial?.id && !!hingeFinishCode,
    queryFn: async () => {
      const { data } = await supabase
        .from('material_variants')
        .select('variant_code, variant_name, color_hex')
        .eq('material_id', hingeMaterial!.id)
        .eq('variant_code', hingeFinishCode!)
        .maybeSingle();
      return data;
    },
  });

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {/* Order selector */}
        <div className="w-[280px]">
          <label className="text-sm font-medium text-muted-foreground mb-1 block">{i18next.t('processing.sheet.orderLabel')}</label>
          {ordersLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              value={selectedOrderId}
              onValueChange={(v) => {
                setSelectedOrderId(v);
                setSelectedProductId('');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={i18next.t('processing.sheet.orderPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {orders.map(o => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.order_number} — {o.clientName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Product selector */}
        {selectedOrderId && products.length > 1 && (
          <div className="w-[300px]">
            <label className="text-sm font-medium text-muted-foreground mb-1 block">{i18next.t('processing.sheet.productLabel')}</label>
            {productsLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger>
                  <SelectValue placeholder={i18next.t('processing.sheet.productPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {products.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {/* Edit button */}
        {selectedProduct && (
          <div className="flex items-end">
            <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)} className="gap-1.5">
              <Pencil className="w-3.5 h-3.5" />
              Editare
            </Button>
          </div>
        )}
      </div>

      {selectedOrderId && productsLoading && <Skeleton className="h-40 w-full" />}
      {selectedOrderId && !productsLoading && products.length === 0 && (
        <p className="text-sm text-muted-foreground py-2">{t('ui.noProductsInOrder')}</p>
      )}

      {selectedProduct && (
        <>
          <ProcessingSheetViewer
            orderNumber={selectedOrder?.order_number}
            clientName={selectedOrder?.clientName}
            productType={selectedProduct.product_type}
            productLabel={selectedProduct.productLabel}
            doorWidth={selectedProduct.doorWidth}
            doorHeight={selectedProduct.doorHeight}
            cabinWidth={selectedProduct.cabinWidth}
            cabinDepth={selectedProduct.cabinDepth}
            fixedPanel={selectedProduct.fixedPanel}
            fixedPanelLeft={selectedProduct.fixedPanelLeft}
            fixedPanelRight={selectedProduct.fixedPanelRight}
            glassThickness={selectedProduct.glassThickness}
            glassType={selectedProduct.glassType}
            hinges={selectedProduct.hinges}
            handle={selectedProduct.handle}
            hingeSide={selectedProduct.hingeSide}
            hingeMaterial={hingeMaterial ? {
              code: hingeMaterial.code,
              name: hingeMaterial.name,
              imageUrl: hingeMaterial.image_url,
            } : undefined}
            hingeFinish={finishVariant ? {
              code: finishVariant.variant_code,
              name: finishVariant.variant_name,
              colorHex: finishVariant.color_hex,
            } : undefined}
            cabinType={selectedProduct.cabinType}
            profiles={selectedProduct.profiles}
            seals={selectedProduct.seals}
            stabilizers={selectedProduct.stabilizers}
            stabilizerSelections={selectedProduct.stabilizerSelections}
            lock={selectedProduct.lock}
            pivot={selectedProduct.pivot}
            slidingSystem={selectedProduct.slidingSystem}
            extraAccessories={selectedProduct.extraAccessories}
            materialsMap={materialsMap}
            mirrorType={selectedProduct.mirrorType}
            mirrorShape={selectedProduct.mirrorShape}
            ledType={selectedProduct.ledType}
            placement={selectedProduct.placement}
            mountType={selectedProduct.mountType}
            frontType={selectedProduct.frontType}
            ralColor={selectedProduct.ralColor}
            mountingType={selectedProduct.mountingType}
            panelProductType={selectedProduct.panelProductType}
            sandblasting={selectedProduct.sandblasting}
            edgePolish={selectedProduct.edgePolish}
            processingInfo={selectedProduct.processingInfo}
            quantity={selectedProduct.quantity}
            panelCount={selectedProduct.panelCount}
            holeSpecs={selectedProduct.holeSpecs}
            cutoutSpecs={selectedProduct.cutoutSpecs}
            edgeCutouts={selectedProduct.edgeCutouts}
            partitionGrid={selectedProduct.partitionGrid}
            frontalHeightA={selectedProduct.frontalHeightA}
            frontalHeightB={selectedProduct.frontalHeightB}
            lateralHeightA={selectedProduct.lateralHeightA}
            lateralHeightB={selectedProduct.lateralHeightB}
            lateralFullPanelHeight={selectedProduct.lateralFullPanelHeight}
            profileHeightDeduction={selectedProduct.profileHeightDeduction}
            lateralProfileHeightDeduction={selectedProduct.lateralProfileHeightDeduction}
            lateralDoorWidth={selectedProduct.lateralDoorWidth}
            lateralFixedPanels={selectedProduct.lateralFixedPanels}
            lateralHingeSide={selectedProduct.lateralHingeSide}
            lateralHingePositions={selectedProduct.lateralHingePositions}
            balustradeLayout={selectedProduct.balustradeLayout}
            selectedKit={selectedProduct.selectedKit}
          />
          <ProductEditDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            productId={selectedProduct.id}
            orderId={selectedOrderId}
            currentConfig={selectedProduct.rawConfig}
            productType={selectedProduct.product_type}
          />
        </>
      )}
    </div>
  );
}
