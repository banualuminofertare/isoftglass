import { useState, useRef, useCallback } from 'react';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import { useProcessingLookup } from '@/hooks/useProcessingTemplates';
import { ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Download, Package, FileText } from 'lucide-react';
import { downloadDxf, downloadSimpleGlassDxf } from '@/lib/dxf/dxfGenerator';
import { type DxfVersion } from '@/lib/dxf/dxfCore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// processingSheetPdf imported lazily at click to keep jsPDF out of the Processing route bundle
import { aggregateAccessories } from '@/lib/pdf/accessoryAggregator';
import { parseTemplateCutouts, isAbsoluteTemplate, mapCutoutToPanel } from '@/lib/processing/templateCutouts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SelectionItem {
  materialCode: string;
  name: string;
  length?: number;
  quantity?: number;
}

interface HingeInfo {
  positions: number[];
  materialCode?: string;
  quantity: number;
  finish?: string;
  selections?: SelectionItem[];
}

interface HandleInfo {
  positionY: number;
  model?: string;
  length?: number;
  finish?: string;
  selections?: SelectionItem[];
}

interface HingeMaterialInfo {
  code: string;
  name: string;
  imageUrl?: string | null;
}

interface HingeFinishInfo {
  code: string;
  name: string;
  colorHex?: string | null;
}

interface ProcessingSheetViewerProps {
  orderNumber?: string;
  clientName?: string;
  productType?: string;
  productLabel?: string;
  doorWidth: number;
  doorHeight: number;
  cabinWidth?: number;
  cabinDepth?: number;
  fixedPanel?: { enabled: boolean; width: number };
  fixedPanelLeft?: { enabled: boolean; width: number };
  fixedPanelRight?: { enabled: boolean; width: number };
  glassThickness: number;
  glassType: string;
  hinges: HingeInfo;
  handle?: HandleInfo & { materialCode?: string };
  hingeSide?: 'left' | 'right';
  hingeMaterial?: HingeMaterialInfo;
  hingeFinish?: HingeFinishInfo;
  cabinType?: string;
  profiles?: { type: string; finish: string; materialCode?: string; lengthMm?: number; selections?: SelectionItem[] };
  seals?: { magnetic: boolean; magneticCode?: string; magneticSelections?: SelectionItem[]; rubber: boolean; rubberCode?: string; rubberSelections?: SelectionItem[]; threshold: boolean; thresholdCode?: string; thresholdSelections?: SelectionItem[] };
  stabilizers?: Array<{ type: string; length: number; position: string; materialCode?: string }>;
  stabilizerSelections?: SelectionItem[];
  lock?: { enabled: boolean; type: string; materialCode?: string };
  pivot?: { type: string; materialCode?: string };
  slidingSystem?: { rail: string; rollers: string; materialCode?: string };
  extraAccessories?: Array<{ materialCode: string; name: string; quantity: number; detail?: string; colorHex?: string; unit?: string }>;
  selectedKit?: {
    name: string;
    code: string;
    price: number;
    imageUrl?: string | null;
    items?: Array<{ material_code: string; material_name: string; quantity: number }>;
  };
  materialsMap?: Record<string, { name: string; imageUrl: string | null }>;
  // Product-specific props
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
    doors?: Array<{
      col: number; row: number; hingeSide: string;
      handle?: { model: string; length: number; materialCode: string; positionY: number; finish?: string };
      hinges?: { type: string; quantity: number; materialCode: string };
    }>;
    sidePanels?: Record<string, {
      width: number;
      height: number;
      grid: { columns: number; columnWidths: number[]; columnRows: number[]; columnRowHeights: number[][] };
      profileWidth: number;
    }>;
  };
  // Trapezoid heights for frontal/lateral panels
  frontalHeightA?: number;
  frontalHeightB?: number;
  lateralHeightA?: number;
  lateralHeightB?: number;
  // Custom lateral panel height (shortened from bottom)
  lateralFullPanelHeight?: number;
  profileHeightDeduction?: number;
  lateralProfileHeightDeduction?: number;
  // Lateral config (corner_90 with door on lateral side)
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
}

// SVG drawing constants
const PADDING = 80;
const ARROW_SIZE = 8;
const DOOR_STROKE = '#000000';
const DIM_COLOR = '#1E40AF';
const DIM_FONT_SIZE = 14;
const DIM_FONT_SIZE_SM = 12;
const DIM_STROKE_W = 1.2;
const DIM_STROKE_THIN = 0.6;
const DIM_FONT_WEIGHT = 'bold';

export function ProcessingSheetViewer({
  orderNumber, clientName, productType, productLabel,
  doorWidth, doorHeight, cabinWidth, cabinDepth, fixedPanel, fixedPanelLeft, fixedPanelRight,
  glassThickness, glassType,
  hinges, handle, hingeSide = 'left',
  hingeMaterial, hingeFinish,
  cabinType, profiles, seals, stabilizers, stabilizerSelections, lock, pivot, slidingSystem, extraAccessories,
  selectedKit,
  materialsMap = {},
  mirrorType, mirrorShape, ledType, placement, mountType, frontType, ralColor, mountingType,
  panelProductType, sandblasting, edgePolish, processingInfo, quantity,
  panelCount, holeSpecs, cutoutSpecs, edgeCutouts, partitionGrid,
  frontalHeightA, frontalHeightB, lateralHeightA, lateralHeightB, lateralFullPanelHeight,
  profileHeightDeduction, lateralProfileHeightDeduction,
  lateralDoorWidth, lateralFixedPanels, lateralHingeSide, lateralHingePositions,
  balustradeLayout,
}: ProcessingSheetViewerProps) {
  const { t } = useTranslation();
  const hasHinges = hinges.positions.length > 0 && (hinges.quantity ?? hinges.positions.length) > 0;
  const isSliding = !!slidingSystem;
  const hasDoorDrawing = hasHinges || isSliding;
  const { data: template } = useProcessingLookup(hinges.materialCode);
  const { data: handleTemplate } = useProcessingLookup(handle?.materialCode);
  const slidingKitCode = selectedKit?.code || slidingSystem?.materialCode;
  const { data: slidingKitTemplate } = useProcessingLookup(slidingKitCode);

  const { role, companyId } = useAuth();
  const isAdmin = role === 'admin';

  // Fetch company logo + PDF logo settings for export
  const { data: companyPdfBranding } = useQuery({
    queryKey: ['company-pdf-branding', companyId, isAdmin],
    queryFn: async () => {
      // For subscribers, try their company first
      if (!isAdmin && companyId) {
        const { data: companyData } = await supabase
          .from('companies')
          .select('logo_url, pdf_logo_size, pdf_logo_position')
          .eq('id', companyId)
          .maybeSingle();
        if (companyData?.logo_url) {
          return {
            logoUrl: companyData.logo_url as string,
            size: ((companyData as any).pdf_logo_size || 'medium') as 'small' | 'medium' | 'large' | 'xlarge',
            position: ((companyData as any).pdf_logo_position || 'left') as 'left' | 'center' | 'right',
          };
        }
      }
      // Fall back to global company_settings
      const { data } = await supabase
        .from('company_settings')
        .select('logo_url, pdf_logo_size, pdf_logo_position')
        .limit(1)
        .maybeSingle();
      return {
        logoUrl: data?.logo_url || null,
        size: (((data as any)?.pdf_logo_size) || 'medium') as 'small' | 'medium' | 'large' | 'xlarge',
        position: (((data as any)?.pdf_logo_position) || 'left') as 'left' | 'center' | 'right',
      };
    },
    staleTime: 5 * 60 * 1000,
  });
  const companyLogoUrl = companyPdfBranding?.logoUrl || null;
  const companyPdfLogoSize = companyPdfBranding?.size || 'medium';
  const companyPdfLogoPosition = companyPdfBranding?.position || 'left';
  // Zoom & pan state
  const [zoom, setZoom] = useState(1);
  const [dxfVersion, setDxfVersion] = useState<DxfVersion>('R2010');
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [handleInset, setHandleInset] = useState(0);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const resetView = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    setZoom(prev => {
      const newZoom = Math.min(Math.max(prev * factor, 0.5), 8);
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const ratio = newZoom / prev;
        setPan(p => ({
          x: mouseX - ratio * (mouseX - p.x),
          y: mouseY - ratio * (mouseY - p.y),
        }));
      }
      return newZoom;
    });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const s = dragStartRef.current;
    setPan({ x: s.panX + (e.clientX - s.x), y: s.panY + (e.clientY - s.y) });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => { setIsDragging(false); }, []);

  // Fixed panel calculations - support old single fixedPanel + new left/right
  const hasFixedPanel = fixedPanel?.enabled && fixedPanel.width > 0;
  const fixedW = hasFixedPanel ? fixedPanel.width : 0;
  const hasLeftPanel = fixedPanelLeft?.enabled && fixedPanelLeft.width > 0;
  const hasRightPanel = fixedPanelRight?.enabled && fixedPanelRight.width > 0;
  const leftPanelW = hasLeftPanel ? fixedPanelLeft.width : 0;
  const rightPanelW = hasRightPanel ? fixedPanelRight.width : 0;
  const hasSidePanel = cabinType === 'corner_90' && cabinDepth && cabinDepth > 0;
  const isLeft = hingeSide === 'left';
  // Door glass height: 10mm deducted for doors, but NOT for fixed_panel (Paravan Fix)
  // Fixed_panel: only profile deduction applies (e.g. 2000 - 19 = 1981)
  const doorGlassHeight = cabinType === 'fixed_panel'
    ? doorHeight - (profileHeightDeduction || 0)
    : doorHeight - 10;
  const totalDrawWidth = doorWidth + (hasFixedPanel ? fixedW : 0) + leftPanelW + rightPanelW;
  const sidePanelGlassWidth = hasSidePanel ? cabinDepth! : 0;
  // Lateral fixed panel height matches frontal fixed panels: doorGlassHeight + 5
  const sidePanelGlassHeight = hasSidePanel 
    ? (lateralFullPanelHeight ? lateralFullPanelHeight - 5 : doorGlassHeight + 5) 
    : 0;

  // Trapezoid calculations — interpolate heights at each panel edge
  const isFrontalTrapezoid = frontalHeightA !== undefined && frontalHeightB !== undefined && frontalHeightA !== frontalHeightB;
  const isLateralTrapezoid = lateralHeightA !== undefined && lateralHeightB !== undefined && lateralHeightA !== lateralHeightB;
  const frontalCabinWidth = cabinWidth || doorWidth + leftPanelW + rightPanelW;

  // Helper: interpolate frontal height at a given X position (0 = left edge, frontalCabinWidth = right edge)
  const interpFrontalH = (xPos: number) => {
    if (!isFrontalTrapezoid) return doorHeight;
    return frontalHeightA! + (frontalHeightB! - frontalHeightA!) * (xPos / frontalCabinWidth);
  };

  // Per-panel glass heights (with deductions) for trapezoid mode
  // Door: left edge at leftPanelW, right edge at leftPanelW + doorWidth
  const doorGlassHeightL = isFrontalTrapezoid ? Math.round(interpFrontalH(leftPanelW) - 10) : doorGlassHeight;
  const doorGlassHeightR = isFrontalTrapezoid ? Math.round(interpFrontalH(leftPanelW + doorWidth) - 10) : doorGlassHeight;
  // Left fixed panel: left edge at 0, right edge at leftPanelW
  // In trapezoid mode, frontalHeightA/B represent actual glass heights — no additional deduction
  const profileHDed = profileHeightDeduction || 0;
  const lateralProfileHDed = lateralProfileHeightDeduction || 0;
  const leftPanelHL = isFrontalTrapezoid ? Math.round(interpFrontalH(0)) : (doorGlassHeight + 5 - profileHDed);
  const leftPanelHR = isFrontalTrapezoid ? Math.round(interpFrontalH(leftPanelW)) : (doorGlassHeight + 5 - profileHDed);
  // Right fixed panel: left edge at leftPanelW+doorWidth, right edge at frontalCabinWidth
  const rightPanelHL = isFrontalTrapezoid ? Math.round(interpFrontalH(leftPanelW + doorWidth)) : (doorGlassHeight + 5 - profileHDed);
  const rightPanelHR = isFrontalTrapezoid ? Math.round(interpFrontalH(frontalCabinWidth)) : (doorGlassHeight + 5 - profileHDed);
  // Side panel (lateral): heightA = wall side, heightB = corner side
  const sidePanelHL = isLateralTrapezoid ? Math.round(lateralHeightA! - 5) : (sidePanelGlassHeight - lateralProfileHDed);
  const sidePanelHR = isLateralTrapezoid ? Math.round(lateralHeightB! - 5) : (sidePanelGlassHeight - lateralProfileHDed);

  // Scale to fit nicely in viewport — panels stacked vertically
  const maxSvgWidth = 900;
  const maxSvgHeight = 1200;
  const sideMargin = 140;
  const maxPanelWidth = Math.max(totalDrawWidth, sidePanelGlassWidth);
  // For trapezoid, use the maximum height across all panels for scaling
  const maxGlassH = isFrontalTrapezoid
    ? Math.max(doorGlassHeightL, doorGlassHeightR, leftPanelHL, leftPanelHR, rightPanelHL, rightPanelHR)
    : (hasFixedPanel || hasLeftPanel || hasRightPanel) ? doorGlassHeight + 5 : doorGlassHeight;
  const scale = Math.min(
    (maxSvgWidth - sideMargin * 2) / maxPanelWidth,
    (maxSvgHeight - PADDING * 3) / maxGlassH
  );

  const scaledW = doorWidth * scale;
  const scaledH = doorGlassHeight * scale;
  const fixedPanelExtraH = 5; // fixed panels are 5mm taller at bottom
  const fixedPanelH = doorGlassHeight + fixedPanelExtraH;
  const scaledFixedPanelH = fixedPanelH * scale;
  const scaledFixedW = fixedW * scale;
  const scaledLeftPanelW = leftPanelW * scale;
  const scaledRightPanelW = rightPanelW * scale;
  const scaledDepth = (cabinDepth || 0) * scale;
  const panelGapMm = 24;
  const scaledPanelGap = panelGapMm * scale;

  // Trapezoid scaled heights
  const scaledDoorHL = doorGlassHeightL * scale;
  const scaledDoorHR = doorGlassHeightR * scale;
  const scaledLeftPanelHL = leftPanelHL * scale;
  const scaledLeftPanelHR = leftPanelHR * scale;
  const scaledRightPanelHL = rightPanelHL * scale;
  const scaledRightPanelHR = rightPanelHR * scale;
  const scaledSidePanelHL = sidePanelHL * scale;
  const scaledSidePanelHR = sidePanelHR * scale;

  // Door shifts right if left panel exists
  const doorX = sideMargin + (hasLeftPanel ? scaledLeftPanelW + scaledPanelGap : 0);
  const doorY = PADDING + 20;

  const svgWidth = sideMargin + (hasLeftPanel ? scaledLeftPanelW + scaledPanelGap + 40 : 0) + scaledW + (hasFixedPanel ? scaledFixedW + scaledPanelGap + 40 : 0) + (hasRightPanel ? scaledRightPanelW + scaledPanelGap + 40 : 0) + sideMargin + 60;
  // Side panel goes below door with gap
  const sidePanelGap = 60;
  const sidePanelScaledW = sidePanelGlassWidth * scale;
  const sidePanelEffectiveHeight = isLateralTrapezoid ? sidePanelGlassHeight : (sidePanelGlassHeight - lateralProfileHDed);
  const sidePanelScaledH = sidePanelEffectiveHeight * scale;
  const maxPanelHeight = maxGlassH * scale;
  const maxSidePanelH = isLateralTrapezoid ? Math.max(scaledSidePanelHL, scaledSidePanelHR) : sidePanelScaledH;
  const svgHeight = doorY + maxPanelHeight + PADDING + (hasSidePanel ? sidePanelGap + maxSidePanelH + PADDING : 0) + 80;

  const cutoutW = template?.dimensions ? (template.dimensions as any).width || 44.5 : 44.5;
  const cutoutH = template?.dimensions ? (template.dimensions as any).height || 63 : 63;
  const cutoutOffset = template?.dimensions ? (template.dimensions as any).offset || 6 : 6;
  const cutoutInnerH = template?.dimensions ? (template.dimensions as any).inner_height || 57 : 57;
  const circleRadius = (cutoutH - cutoutInnerH) / 2;

  const scaledCutoutW = cutoutW * scale;
  const scaledCutoutH = cutoutH * scale;
  const scaledCircleR = circleRadius * scale;

  const doorPath = buildDoorPath(
    doorX, doorY, scaledW, scaledH,
    hinges.positions, scale,
    scaledCutoutW, scaledCutoutH, cutoutOffset * scale,
    isLeft, scaledCircleR,
    isFrontalTrapezoid ? scaledDoorHL : undefined,
    isFrontalTrapezoid ? scaledDoorHR : undefined
  );

  // Sort hinge positions (from top)
  const sortedHingePositions = [...hinges.positions].sort((a, b) => a - b);

  return (
    <div className="bg-white border rounded-lg overflow-auto">
      {/* Info Panel — Compact professional header */}
      <div className="px-3 py-2 border-b space-y-2">
        {(orderNumber || clientName || productLabel) && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Package className="w-3.5 h-3.5 text-primary" />
            <span>Fișă prelucrare</span>
            {productLabel && <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm text-[10px] font-medium">{productLabel}</span>}
            {orderNumber && <span className="text-primary text-[11px]">#{orderNumber}</span>}
            {clientName && <span className="text-muted-foreground font-normal text-[11px]">— {clientName}</span>}
          </div>
        )}

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-3 gap-y-1">
          <InfoCell label={productType === 'mirror' ? t('processing.infoLabels.mirrorDim') : productType === 'balustrade' ? t('processing.infoLabels.balustradeDim') : productType === 'panel' ? t('processing.infoLabels.panelDim') : productType === 'kitchen_front' ? t('processing.infoLabels.frontDim') : t('processing.infoLabels.doorDim')} value={isFrontalTrapezoid ? `${doorWidth}×${doorGlassHeightL}/${doorGlassHeightR}` : `${doorWidth}×${doorGlassHeight}`} />
          {isFrontalTrapezoid && <InfoCell label={t('processing.infoLabels.shape')} value={t('processing.infoLabels.trapezoid')} />}
          {isFrontalTrapezoid && hasLeftPanel && <InfoCell label={t('processing.infoLabels.fixedLeftH')} value={`${leftPanelHL}/${leftPanelHR}`} />}
          {isFrontalTrapezoid && hasRightPanel && <InfoCell label={t('processing.infoLabels.fixedRightH')} value={`${rightPanelHL}/${rightPanelHR}`} />}
          {isLateralTrapezoid && hasSidePanel && <InfoCell label={t('processing.infoLabels.lateralH')} value={`${sidePanelHL}/${sidePanelHR}`} />}
          <InfoCell label={t('processing.infoLabels.thickness')} value={`${glassThickness} mm`} />
          <InfoCell label={t('processing.infoLabels.glassType')} value={glassType} />
          {hinges.quantity > 0 && <InfoCell label={t('processing.infoLabels.hinges')} value={`${hinges.quantity} buc`} />}
          {quantity && quantity > 1 && <InfoCell label={t('processing.infoLabels.quantity')} value={`${quantity} buc`} />}
          {panelCount && panelCount > 1 && <InfoCell label={t('processing.infoLabels.panelCount')} value={`${panelCount}`} />}
          {cabinWidth && cabinWidth !== doorWidth && <InfoCell label={t('processing.infoLabels.cabinWidth')} value={`${cabinWidth}`} />}
          {cabinDepth && cabinDepth > 0 && <InfoCell label={t('processing.infoLabels.depth')} value={`${cabinDepth}`} />}
          {hasFixedPanel && <InfoCell label={t('processing.infoLabels.fixedPanel')} value={`${fixedW}`} />}
          {hasLeftPanel && <InfoCell label={t('processing.infoLabels.fixedLeft')} value={`${leftPanelW}`} />}
          {hasRightPanel && <InfoCell label={t('processing.infoLabels.fixedRight')} value={`${rightPanelW}`} />}
          {mirrorType && <InfoCell label={t('processing.infoLabels.mirrorType')} value={mirrorType} />}
          {mirrorShape && <InfoCell label={t('processing.infoLabels.shape')} value={mirrorShape} />}
          {ledType && <InfoCell label={t('processing.infoLabels.led')} value={ledType} />}
          {placement && <InfoCell label={t('processing.infoLabels.placement')} value={placement} />}
          {mountType && <InfoCell label={t('processing.infoLabels.mounting')} value={mountType} />}
          {frontType && <InfoCell label={t('processing.infoLabels.frontType')} value={frontType} />}
          {ralColor && <InfoCell label={t('processing.infoLabels.ral')} value={ralColor} />}
          {mountingType && <InfoCell label={t('processing.infoLabels.mountingType')} value={mountingType} />}
          {panelProductType && <InfoCell label={t('processing.infoLabels.productType')} value={panelProductType} />}
          {sandblasting && <InfoCell label={t('processing.infoLabels.sandblasting')} value={sandblasting} />}
          {edgePolish?.enabled && <InfoCell label={t('processing.infoLabels.edgePolish')} value={edgePolish.type || t('processing.yes')} />}
          {processingInfo && processingInfo.holes > 0 && <InfoCell label={t('processing.infoLabels.holes')} value={`${processingInfo.holes}`} />}
          {processingInfo && processingInfo.cutouts > 0 && <InfoCell label={t('processing.infoLabels.cutouts')} value={`${processingInfo.cutouts}`} />}
          {processingInfo?.bevel?.enabled && <InfoCell label={t('processing.infoLabels.bevel')} value={`${processingInfo.bevel.width} mm`} />}
        </div>

        <UnifiedAccessories
          hinges={hinges}
          handle={handle}
          hingeMaterial={hingeMaterial}
          hingeFinish={hingeFinish}
          profiles={profiles}
          seals={seals}
          stabilizers={stabilizers}
          stabilizerSelections={stabilizerSelections}
          lock={lock}
          pivot={pivot}
          slidingSystem={slidingSystem}
          extraAccessories={extraAccessories}
          selectedKit={selectedKit}
          materialsMap={materialsMap}
          cabinType={cabinType}
        />

        {/* Handle inset adjustment */}
        {handle && cabinType !== 'fixed_panel' && (handle.length || handleTemplate) && (
          <div className="flex items-center gap-1.5 text-xs">
            <label className="font-medium text-muted-foreground whitespace-nowrap">Adâncime mâner:</label>
            <input
              type="number"
              min={0}
              max={200}
              value={handleInset}
              onChange={(e) => setHandleInset(Math.max(0, Math.min(200, Number(e.target.value) || 0)))}
              className="w-16 px-1.5 py-0.5 border rounded text-xs font-mono"
            />
            <span className="text-muted-foreground">mm</span>
          </div>
        )}
      </div>

      {/* SVG Drawing with zoom/pan — only for door/shower products with hinges */}
      {hasDoorDrawing && (<>
      <div
        ref={containerRef}
        className="p-4 overflow-auto relative select-none"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Zoom controls */}
        <div className="absolute top-2 right-2 z-10 flex flex-col items-center gap-1 bg-background/80 backdrop-blur-sm border rounded-md p-1.5 shadow-sm">
          <div className="flex items-center gap-1">
            <button onClick={() => { const f = 1.3; const nz = Math.min(zoom * f, 8); const r = nz / zoom; setPan(p => ({ x: (containerRef.current?.clientWidth || 0) / 2 - r * ((containerRef.current?.clientWidth || 0) / 2 - p.x), y: (containerRef.current?.clientHeight || 0) / 2 - r * ((containerRef.current?.clientHeight || 0) / 2 - p.y) })); setZoom(nz); }} className="p-1.5 rounded hover:bg-muted transition-colors" title={t("ui.tooltipZoomIn")}><ZoomIn className="w-4 h-4" /></button>
            <span className="text-xs font-mono min-w-[3rem] text-center text-muted-foreground">{Math.round(zoom * 100)}%</span>
            <button onClick={() => { const f = 1 / 1.3; const nz = Math.max(zoom * f, 0.5); const r = nz / zoom; setPan(p => ({ x: (containerRef.current?.clientWidth || 0) / 2 - r * ((containerRef.current?.clientWidth || 0) / 2 - p.x), y: (containerRef.current?.clientHeight || 0) / 2 - r * ((containerRef.current?.clientHeight || 0) / 2 - p.y) })); setZoom(nz); }} className="p-1.5 rounded hover:bg-muted transition-colors" title={t("ui.tooltipZoomOut")}><ZoomOut className="w-4 h-4" /></button>
            <button onClick={resetView} className="p-1.5 rounded hover:bg-muted transition-colors" title={t("ui.tooltipReset")}><RotateCcw className="w-4 h-4" /></button>
            <button
              onClick={() => {
                const sidePanelData = hasSidePanel && cabinDepth ? { width: cabinDepth, height: doorHeight - 5 - lateralProfileHDed } : undefined;
                const handleCutouts = handleTemplate ? parseTemplateCutouts(handleTemplate) : [];
                const slidingCutouts = slidingKitTemplate ? parseTemplateCutouts(slidingKitTemplate) : [];
                const handleTmplDims = handleTemplate?.dimensions as Record<string, any> | undefined;
                const slidingTmplDims = slidingKitTemplate?.dimensions as Record<string, any> | undefined;
                downloadDxf({
                  width: doorWidth,
                  height: doorGlassHeight,
                  hingeSide: hingeSide,
                  hinges: {
                    positions: hinges.positions,
                    cutoutW,
                    cutoutH,
                    cutoutOffset,
                  },
                  handle: handle ? { positionY: handle.positionY, length: handle.length || 200 } : undefined,
                  fixedPanel: hasFixedPanel ? fixedPanel : undefined,
                  fixedPanelLeft: hasLeftPanel ? fixedPanelLeft : undefined,
                  fixedPanelRight: hasRightPanel ? fixedPanelRight : undefined,
                  sidePanel: sidePanelData,
                  handleTemplateCutouts: handleCutouts.length > 0 ? handleCutouts : undefined,
                  isAbsoluteHandleTemplate: handleTemplate ? isAbsoluteTemplate(handleTemplate) : undefined,
                  handleTemplateRefDims: handleTmplDims?.glass_width ? { width: handleTmplDims.glass_width, height: handleTmplDims.glass_height } : undefined,
                  slidingKitCutouts: slidingCutouts.length > 0 ? slidingCutouts : undefined,
                  slidingKitRefDims: slidingTmplDims?.glass_width ? { width: slidingTmplDims.glass_width, height: slidingTmplDims.glass_height } : undefined,
                }, `prelucrare_${orderNumber || 'usa'}_${doorWidth}x${doorGlassHeight}`, dxfVersion);
              }}
              className="p-1.5 rounded hover:bg-muted transition-colors"
              title={t("ui.exportDxf")}
            >
              <Download className="w-4 h-4" />
            </button>
            <Select value={dxfVersion} onValueChange={(v) => setDxfVersion(v as DxfVersion)}>
              <SelectTrigger className="h-7 w-[80px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="R12">R12</SelectItem>
                <SelectItem value="R2000">R2000</SelectItem>
                <SelectItem value="R2010">R2010</SelectItem>
              </SelectContent>
            </Select>
            <button
              onClick={async () => {
                const sidePanelData = hasSidePanel && cabinDepth ? { width: cabinDepth, height: doorHeight - 5 - lateralProfileHDed } : undefined;
                // Build accessories list for PDF
                const pdfAccessories: Array<{ label: string; code?: string; detail?: string; imageUrl?: string | null }> = [];
                // Hinges
                const pdfHingeSelections = hinges.selections || [];
                const pdfHingeQty = hinges.quantity || pdfHingeSelections.length || 0;
                if (pdfHingeSelections.length > 0) {
                  const sel = pdfHingeSelections[0];
                  const mat = sel.materialCode ? materialsMap[sel.materialCode] : undefined;
                  pdfAccessories.push({ label: mat?.name || sel.name || i18next.t('processing.lateralAccessories.hinge'), code: sel.materialCode, detail: `${pdfHingeQty} buc`, imageUrl: mat?.imageUrl });
                } else if (pdfHingeQty > 0) {
                  const mat = hinges.materialCode ? materialsMap[hinges.materialCode] : undefined;
                  pdfAccessories.push({ label: mat?.name || `Balamale × ${pdfHingeQty}`, code: hinges.materialCode, detail: `× ${pdfHingeQty}`, imageUrl: mat?.imageUrl });
                }
                // Handle (skip for fixed_panel)
                if (handle && cabinType !== 'fixed_panel') {
                  const pdfHandleSelections = handle.selections || [];
                  if (pdfHandleSelections.length > 0) {
                    pdfHandleSelections.forEach(sel => { const mat = sel.materialCode ? materialsMap[sel.materialCode] : undefined; pdfAccessories.push({ label: mat?.name || sel.name || i18next.t('processing.lateralAccessories.handle'), code: sel.materialCode, detail: [handle.length ? `${handle.length}mm` : null, `${i18next.t('processing.details.positionY')} ${handle.positionY}mm`].filter(Boolean).join(' · '), imageUrl: mat?.imageUrl }); });
                  } else {
                    const mat = handle.materialCode ? materialsMap[handle.materialCode] : undefined;
                    pdfAccessories.push({ label: mat?.name || i18next.t('processing.lateralAccessories.handle'), code: handle.materialCode, detail: [handle.model, handle.length ? `${handle.length}mm` : null, `${i18next.t('processing.details.positionY')} ${handle.positionY}mm`].filter(Boolean).join(' · '), imageUrl: mat?.imageUrl });
                  }
                }
                // Profiles
                if (profiles) {
                  const pdfProfileSelections = profiles.selections || [];
                  if (pdfProfileSelections.length > 0) {
                    pdfProfileSelections.forEach(sel => { const mat = sel.materialCode ? materialsMap[sel.materialCode] : undefined; pdfAccessories.push({ label: mat?.name || sel.name || 'Profil', code: sel.materialCode, detail: profiles.finish || '', imageUrl: mat?.imageUrl }); });
                  } else {
                    const mat = profiles.materialCode ? materialsMap[profiles.materialCode] : undefined;
                    pdfAccessories.push({ label: mat?.name || 'Profil', code: profiles.materialCode, detail: profiles.finish || '', imageUrl: mat?.imageUrl });
                  }
                }
                // Seals
                if (seals?.magnetic) {
                  const sels = seals.magneticSelections || [];
                  if (sels.length > 0) { sels.forEach(sel => { const mat = sel.materialCode ? materialsMap[sel.materialCode] : undefined; pdfAccessories.push({ label: mat?.name || sel.name || i18next.t('processing.lateralAccessories.magneticProfile'), code: sel.materialCode, detail: '1 ' + i18next.t('processing.pcs'), imageUrl: mat?.imageUrl }); }); }
                  else { const mat = seals.magneticCode ? materialsMap[seals.magneticCode] : undefined; pdfAccessories.push({ label: mat?.name || 'Etanșare magnetică', code: seals.magneticCode, imageUrl: mat?.imageUrl }); }
                }
                if (seals?.rubber) {
                  const sels = seals.rubberSelections || [];
                  if (sels.length > 0) { sels.forEach(sel => { const mat = sel.materialCode ? materialsMap[sel.materialCode] : undefined; pdfAccessories.push({ label: mat?.name || sel.name || 'Garnitură Cauciuc', code: sel.materialCode, detail: '1 ' + i18next.t('processing.pcs'), imageUrl: mat?.imageUrl }); }); }
                  else { const mat = seals.rubberCode ? materialsMap[seals.rubberCode] : undefined; pdfAccessories.push({ label: mat?.name || 'Etanșare cauciuc', code: seals.rubberCode, imageUrl: mat?.imageUrl }); }
                }
                if (seals?.threshold) {
                  const sels = seals.thresholdSelections || [];
                  if (sels.length > 0) { sels.forEach(sel => { const mat = sel.materialCode ? materialsMap[sel.materialCode] : undefined; pdfAccessories.push({ label: mat?.name || sel.name || i18next.t('processing.lateralAccessories.thresholdProfile'), code: sel.materialCode, detail: '1 ' + i18next.t('processing.pcs'), imageUrl: mat?.imageUrl }); }); }
                  else { const mat = seals.thresholdCode ? materialsMap[seals.thresholdCode] : undefined; pdfAccessories.push({ label: mat?.name || i18next.t('processing.lateralAccessories.threshold'), code: seals.thresholdCode, imageUrl: mat?.imageUrl }); }
                }
                // Stabilizers
                const pdfStabSels = stabilizerSelections || [];
                if (pdfStabSels.length > 0) {
                  pdfStabSels.forEach(sel => { const mat = sel.materialCode ? materialsMap[sel.materialCode] : undefined; pdfAccessories.push({ label: mat?.name || sel.name || 'Bară stabilizatoare', code: sel.materialCode, detail: ((sel.materialCode?.startsWith('35.') || sel.materialCode?.startsWith('72.')) && sel.length) ? `${sel.length} mm` : '1 ' + i18next.t('processing.pcs'), imageUrl: mat?.imageUrl }); });
                } else if (stabilizers) {
                  stabilizers.forEach(st => { const mat = st.materialCode ? materialsMap[st.materialCode] : undefined; pdfAccessories.push({ label: mat?.name || `Bară stabilizatoare`, code: st.materialCode, detail: `${st.length} mm`, imageUrl: mat?.imageUrl }); });
                }
                if (lock?.enabled) { const mat = lock.materialCode ? materialsMap[lock.materialCode] : undefined; pdfAccessories.push({ label: mat?.name || `Broască ${lock.type}`, code: lock.materialCode, imageUrl: mat?.imageUrl }); }
                if (pivot) { const mat = pivot.materialCode ? materialsMap[pivot.materialCode] : undefined; pdfAccessories.push({ label: mat?.name || `Pivot ${pivot.type}`, code: pivot.materialCode, imageUrl: mat?.imageUrl }); }
                if (slidingSystem) { const mat = slidingSystem.materialCode ? materialsMap[slidingSystem.materialCode] : undefined; pdfAccessories.push({ label: mat?.name || 'Sistem glisare', code: slidingSystem.materialCode, imageUrl: mat?.imageUrl }); }
                if (extraAccessories) extraAccessories.forEach(e => {
                  const mat = e.materialCode ? materialsMap[e.materialCode] : undefined;
                  pdfAccessories.push({ label: mat?.name || e.name, code: e.materialCode, detail: `${e.quantity} buc`, imageUrl: mat?.imageUrl });
                });
                // Kit
                if (selectedKit) {
                  const kitMat = selectedKit.code ? materialsMap[selectedKit.code] : undefined;
                  pdfAccessories.push({ label: kitMat?.name || selectedKit.name || 'Kit accesorii', code: selectedKit.code, detail: '1 kit', imageUrl: kitMat?.imageUrl || (selectedKit.imageUrl as string | null) || null });
                  if (selectedKit.items) selectedKit.items.forEach(ki => {
                    const kiMat = ki.material_code ? materialsMap[ki.material_code] : undefined;
                    pdfAccessories.push({ label: kiMat?.name || ki.material_name, code: ki.material_code, detail: `${ki.quantity} buc`, imageUrl: kiMat?.imageUrl });
                  });
                }

                const pdfHandleCutouts = handleTemplate ? parseTemplateCutouts(handleTemplate) : [];
                const pdfSlidingCutouts = slidingKitTemplate ? parseTemplateCutouts(slidingKitTemplate) : [];
                const pdfHandleTmplDims = handleTemplate?.dimensions as Record<string, any> | undefined;
                const pdfSlidingTmplDims = slidingKitTemplate?.dimensions as Record<string, any> | undefined;
                const { downloadProcessingSheetPdf } = await import('@/lib/pdf/processingSheetPdf');
                await downloadProcessingSheetPdf({
                  orderNumber,
                  clientName,
                  doorWidth,
                  doorHeight: doorGlassHeight,
                  glassThickness,
                  glassType,
                  hingeSide: hingeSide || 'left',
                  hinges: {
                    positions: hinges.positions,
                    quantity: hinges.quantity,
                    cutoutW,
                    cutoutH,
                    cutoutOffset,
                  },
                  handle: handle ? { positionY: handle.positionY, length: handle.length || 200, inset: handleInset } : undefined,
                  fixedPanel: hasFixedPanel ? fixedPanel : undefined,
                  fixedPanelLeft: hasLeftPanel ? fixedPanelLeft : undefined,
                   fixedPanelRight: hasRightPanel ? fixedPanelRight : undefined,
                   sidePanel: sidePanelData,
                   profileHeightDeduction: profileHDed,
                   lateralProfileHeightDeduction: lateralProfileHDed,
                   cabinType,
                   accessories: aggregateAccessories(pdfAccessories),
                   companyLogoUrl: companyLogoUrl || undefined,
                   companyPdfLogoSize: companyPdfLogoSize,
                   companyPdfLogoPosition: companyPdfLogoPosition,
                   handleTemplateCutouts: pdfHandleCutouts.length > 0 ? pdfHandleCutouts : undefined,
                   isAbsoluteHandleTemplate: handleTemplate ? isAbsoluteTemplate(handleTemplate) : undefined,
                   handleTemplateRefDims: pdfHandleTmplDims?.glass_width ? { width: pdfHandleTmplDims.glass_width, height: pdfHandleTmplDims.glass_height } : undefined,
                   slidingKitCutouts: pdfSlidingCutouts.length > 0 ? pdfSlidingCutouts : undefined,
                   slidingKitRefDims: pdfSlidingTmplDims?.glass_width ? { width: pdfSlidingTmplDims.glass_width, height: pdfSlidingTmplDims.glass_height } : undefined,
                 }, `fisa_prelucrare_${orderNumber || 'usa'}_${doorWidth}x${doorGlassHeight}`);
              }}
              className="p-1.5 rounded hover:bg-muted transition-colors"
              title={t("ui.exportPdf")}
            >
              <FileText className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-0.5 w-fit">
            <div />
            <button onClick={() => setPan(p => ({ ...p, y: p.y + 50 }))} className="p-1 rounded hover:bg-muted transition-colors" title={t("ui.tooltipUp")}><ChevronUp className="w-3.5 h-3.5" /></button>
            <div />
            <button onClick={() => setPan(p => ({ ...p, x: p.x + 50 }))} className="p-1 rounded hover:bg-muted transition-colors" title={t("ui.tooltipLeft")}><ChevronLeft className="w-3.5 h-3.5" /></button>
            <div />
            <button onClick={() => setPan(p => ({ ...p, x: p.x - 50 }))} className="p-1 rounded hover:bg-muted transition-colors" title={t("ui.tooltipRight")}><ChevronRight className="w-3.5 h-3.5" /></button>
            <div />
            <button onClick={() => setPan(p => ({ ...p, y: p.y - 50 }))} className="p-1 rounded hover:bg-muted transition-colors" title={t("ui.tooltipDown")}><ChevronDown className="w-3.5 h-3.5" /></button>
            <div />
          </div>
        </div>

        {/* Dynamic SVG door drawing */}
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="mx-auto block max-w-full"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onDoubleClick={resetView}
        >
          {/* Door outline with hinge cutouts - BLACK */}
          <path d={doorPath} fill="none" stroke={DOOR_STROKE} strokeWidth={1.2} />

          {/* Bracket marks at each hinge cutout */}
          {sortedHingePositions.map((posFromTop, i) => {
            const cy = doorY + posFromTop * scale;
            const cx = isLeft
              ? doorX + scaledCutoutW / 2 - (cutoutOffset * scale) / 2
              : doorX + scaledW - scaledCutoutW / 2 + (cutoutOffset * scale) / 2;

            return (
              <HingeCutoutDetail
                key={`hinge-${i}`}
                cx={cx} cy={cy}
                scaledCutoutW={scaledCutoutW}
                scaledCutoutH={scaledCutoutH}
                scaledCircleR={scaledCircleR}
                isLeft={isLeft}
                cutoutW={cutoutW}
                cutoutOffset={cutoutOffset}
                scale={scale}
                cutoutH={cutoutH}
                showDimLabel={i === 0}
              />
            );
          })}

          {/* Handle holes */}
          {handle && (handle.length || handleTemplate) && (
            <HandleDrawing
              doorX={doorX} doorY={doorY} doorW={scaledW} doorH={scaledH}
              positionY={handle.positionY} handleLength={handle.length}
              scale={scale} doorHeight={doorGlassHeight} isHingeLeft={isLeft}
              handleInset={handleInset}
              template={handleTemplate && !isAbsoluteTemplate(handleTemplate) ? handleTemplate : undefined}
            />
          )}

          {/* Absolute handle template cutouts rendered directly on door panel */}
          {handle && handleTemplate && isAbsoluteTemplate(handleTemplate) && (() => {
            const cutouts = parseTemplateCutouts(handleTemplate);
            if (cutouts.length === 0) return null;
            const tmplDims = handleTemplate.dimensions as Record<string, any>;
            const refW = tmplDims.glass_width || doorWidth;
            const refH = tmplDims.glass_height || doorGlassHeight;
            // Determine if template was designed for handle on right side (default assumption)
            // Mirror X when handle side differs from template's implicit right-side orientation
            const shouldMirrorX = isLeft;
            return (
              <g>
                {cutouts.map((cutout, i) => {
                  // Map absolute coordinates from reference glass to actual door (edge-relative)
                  let mappedX = cutout.x > refW / 2
                    ? doorWidth - (refW - cutout.x)
                    : cutout.x;
                  const mappedY = cutout.y > refH / 2
                    ? doorGlassHeight - (refH - cutout.y)
                    : cutout.y;
                  // Mirror X if handle is on opposite side
                  if (shouldMirrorX) {
                    mappedX = doorWidth - mappedX;
                  }
                  const cx = doorX + mappedX * scale;
                  const cy = doorY + mappedY * scale;
                  if (cutout.shape === 'circle') {
                    const r = (cutout.diameter / 2) * scale;
                    return (
                      <g key={`abs-handle-cutout-${i}`}>
                        <circle cx={cx} cy={cy} r={r} fill={DIM_COLOR} fillOpacity={0.15} stroke={DIM_COLOR} strokeWidth={1.5} />
                        <line x1={cx - r * 0.4} y1={cy} x2={cx + r * 0.4} y2={cy} stroke={DIM_COLOR} strokeWidth={0.8} />
                        <line x1={cx} y1={cy - r * 0.4} x2={cx} y2={cy + r * 0.4} stroke={DIM_COLOR} strokeWidth={0.8} />
                      </g>
                    );
                  }
                  if (cutout.shape === 'stadium') {
                    const sw = cutout.width * scale;
                    const sh = cutout.height * scale;
                    const rx = Math.min(sh / 2, sw / 2);
                    return <rect key={`abs-handle-cutout-${i}`} x={cx - sw / 2} y={cy - sh / 2} width={sw} height={sh} rx={rx} fill={DIM_COLOR} fillOpacity={0.15} stroke={DIM_COLOR} strokeWidth={1.5} />;
                  }
                  if (cutout.shape === 'rect') {
                    const sw = cutout.width * scale;
                    const sh = cutout.height * scale;
                    return <rect key={`abs-handle-cutout-${i}`} x={cx - sw / 2} y={cy - sh / 2} width={sw} height={sh} fill={DIM_COLOR} fillOpacity={0.15} stroke={DIM_COLOR} strokeWidth={1.5} />;
                  }
                  if (cutout.shape === 'slot') {
                    const sl = cutout.slotLength * scale;
                    const sr = cutout.radius * scale;
                    return <rect key={`abs-handle-cutout-${i}`} x={cx - sl / 2} y={cy - sr} width={sl} height={sr * 2} rx={sr} fill={DIM_COLOR} fillOpacity={0.15} stroke={DIM_COLOR} strokeWidth={1.5} />;
                  }
                  return null;
                })}
              </g>
            );
          })()}

          {/* Sliding kit template cutouts on door panel */}
          {isSliding && slidingKitTemplate && (() => {
            const allCutouts = parseTemplateCutouts(slidingKitTemplate);
            const cutouts = allCutouts.filter(c => !c.targetPanel || c.targetPanel === 'door');
            if (cutouts.length === 0) return null;
            // Get reference glass dimensions from template
            const tmplDims = slidingKitTemplate.dimensions as Record<string, any>;
            const refW = tmplDims.glass_width || doorWidth;
            const refH = tmplDims.glass_height || doorGlassHeight;
            return (
              <g>
                {cutouts.map((cutout, i) => {
                  // Map absolute coordinates from reference glass to actual door
                  // Edge-relative: if closer to right/bottom edge, preserve that distance
                  const mappedX = cutout.x > refW / 2
                    ? doorWidth - (refW - cutout.x)
                    : cutout.x;
                  const mappedY = cutout.y > refH / 2
                    ? doorGlassHeight - (refH - cutout.y)
                    : cutout.y;
                  const cx = doorX + mappedX * scale;
                  const cy = doorY + mappedY * scale;
                  if (cutout.shape === 'circle') {
                    const r = (cutout.diameter / 2) * scale;
                    return (
                      <g key={`sliding-cutout-${i}`}>
                        <circle cx={cx} cy={cy} r={r} fill={DIM_COLOR} fillOpacity={0.15} stroke={DIM_COLOR} strokeWidth={1.5} />
                        <line x1={cx - r * 0.4} y1={cy} x2={cx + r * 0.4} y2={cy} stroke={DIM_COLOR} strokeWidth={0.8} />
                        <line x1={cx} y1={cy - r * 0.4} x2={cx} y2={cy + r * 0.4} stroke={DIM_COLOR} strokeWidth={0.8} />
                      </g>
                    );
                  }
                  if (cutout.shape === 'stadium') {
                    const sw = cutout.width * scale;
                    const sh = cutout.height * scale;
                    const rx = Math.min(sh / 2, sw / 2);
                    return <rect key={`sliding-cutout-${i}`} x={cx - sw / 2} y={cy - sh / 2} width={sw} height={sh} rx={rx} fill={DIM_COLOR} fillOpacity={0.15} stroke={DIM_COLOR} strokeWidth={1.5} />;
                  }
                  if (cutout.shape === 'rect') {
                    const sw = cutout.width * scale;
                    const sh = cutout.height * scale;
                    return <rect key={`sliding-cutout-${i}`} x={cx - sw / 2} y={cy - sh / 2} width={sw} height={sh} fill={DIM_COLOR} fillOpacity={0.15} stroke={DIM_COLOR} strokeWidth={1.5} />;
                  }
                  if (cutout.shape === 'slot') {
                    const sl = cutout.slotLength * scale;
                    const sr = cutout.radius * scale;
                    return <rect key={`sliding-cutout-${i}`} x={cx - sl / 2} y={cy - sr} width={sl} height={sr * 2} rx={sr} fill={DIM_COLOR} fillOpacity={0.15} stroke={DIM_COLOR} strokeWidth={1.5} />;
                  }
                  return null;
                })}
              </g>
            );
          })()}

          {/* Edge cutouts from door configurator step 5 */}
          {edgeCutouts && edgeCutouts.length > 0 && edgeCutouts.map((ec, i) => {
            const EDGE_CUTOUT_COLOR = '#DC2626';
            let rx: number, ry: number, rw: number, rh: number;
            const depthScaled = ec.depth * scale;
            const lengthScaled = ec.length * scale;

            if (ec.side === 'center') {
              // Center cutout positioned by positionX (from left) and position (from bottom)
              const px = (ec.positionX || 0) * scale;
              const py = (ec.position || 0) * scale;
              rx = doorX + px - depthScaled / 2;
              ry = doorY + scaledH - py - lengthScaled / 2;
              rw = depthScaled;
              rh = lengthScaled;
            } else {
              // Left or right side
              const isLeftSide = ec.side === 'left';
              rx = isLeftSide ? doorX : doorX + scaledW - depthScaled;
              rw = depthScaled;
              rh = lengthScaled;

              // Vertical position: top or bottom
              if (ec.verticalPosition === 'top') {
                ry = doorY + (ec.position ? ec.position * scale : 0);
              } else {
                // bottom (default)
                ry = doorY + scaledH - lengthScaled - (ec.position ? ec.position * scale : 0);
              }
            }

            return (
              <g key={`edge-cutout-${ec.id || i}`}>
                <rect
                  x={rx} y={ry}
                  width={rw} height={rh}
                  fill="white" fillOpacity={0.85}
                  stroke={EDGE_CUTOUT_COLOR} strokeWidth={1.2}
                  strokeDasharray="4,2"
                />
                {/* Dimension label */}
                <text
                  x={rx + rw / 2} y={ry + rh / 2 - 4}
                  textAnchor="middle" dominantBaseline="auto"
                  fill={EDGE_CUTOUT_COLOR} fontSize={8} fontWeight="bold" fontFamily="monospace"
                >
                  {ec.depth}×{ec.length}
                </text>
                {/* Side + position label */}
                <text
                  x={rx + rw / 2} y={ry + rh / 2 + 8}
                  textAnchor="middle" dominantBaseline="auto"
                  fill={EDGE_CUTOUT_COLOR} fontSize={6} fontFamily="sans-serif"
                >
                  {ec.side === 'center' ? 'Central' : ec.side === 'left' ? 'St.' : 'Dr.'}{ec.verticalPosition === 'top' ? ' Sus' : ec.verticalPosition === 'bottom' ? ' Jos' : ''}
                </text>
                {ec.position && ec.side !== 'center' && (
                  <text
                    x={rx + rw / 2} y={ry + rh / 2 + 18}
                    textAnchor="middle" dominantBaseline="auto"
                    fill={EDGE_CUTOUT_COLOR} fontSize={6} fontFamily="monospace"
                  >
                    @{ec.position}mm
                  </text>
                )}
              </g>
            );
          })}

          {/* Left fixed panel */}
          {hasLeftPanel && (() => {
            const panelX = doorX - scaledPanelGap - scaledLeftPanelW;
            const isHingeSide = isLeft;
            const lpHL = scaledLeftPanelHL;
            const lpHR = scaledLeftPanelHR;
            const lpMaxH = isFrontalTrapezoid ? Math.max(lpHL, lpHR) : scaledFixedPanelH;
            const lpBottomY = doorY + lpMaxH;
            const lpTopLeftY = isFrontalTrapezoid ? lpBottomY - lpHL : doorY;
            const lpTopRightY = isFrontalTrapezoid ? lpBottomY - lpHR : doorY;
            
            return (
              <g>
                {isHingeSide ? (
                  <path
                    d={buildFixedPanelPath(
                      panelX, doorY, scaledLeftPanelW, scaledFixedPanelH,
                      hinges.positions, scale,
                      scaledCutoutW, scaledCutoutH, cutoutOffset * scale,
                      'right', scaledCircleR,
                      isFrontalTrapezoid ? lpHL : undefined,
                      isFrontalTrapezoid ? lpHR : undefined
                    )}
                    fill="none" stroke={DOOR_STROKE} strokeWidth={1.2}
                  />
                ) : isFrontalTrapezoid ? (
                  <polygon
                    points={`${panelX},${lpTopLeftY} ${panelX + scaledLeftPanelW},${lpTopRightY} ${panelX + scaledLeftPanelW},${lpBottomY} ${panelX},${lpBottomY}`}
                    fill="none" stroke={DOOR_STROKE} strokeWidth={1.2}
                  />
                ) : (
                  <rect
                    x={panelX} y={doorY}
                    width={scaledLeftPanelW} height={scaledFixedPanelH}
                    fill="none" stroke={DOOR_STROKE} strokeWidth={1.2}
                  />
                )}
                {/* Hinge cutout details on fixed panel */}
                {isHingeSide && sortedHingePositions.map((posFromTop, i) => {
                  const hingeRefY = isFrontalTrapezoid ? lpTopRightY : doorY;
                  const cy = hingeRefY + posFromTop * scale;
                  const cx = panelX + scaledLeftPanelW - scaledCutoutW / 2 + (cutoutOffset * scale) / 2;
                  return (
                    <HingeCutoutDetail
                      key={`left-panel-hinge-${i}`}
                      cx={cx} cy={cy}
                      scaledCutoutW={scaledCutoutW}
                      scaledCutoutH={scaledCutoutH}
                      scaledCircleR={scaledCircleR}
                      isLeft={false}
                      cutoutW={cutoutW}
                      cutoutOffset={cutoutOffset}
                      scale={scale}
                    />
                  );
                })}
                {/* Sliding kit cutouts on left fixed panel */}
                {isSliding && slidingKitTemplate && (() => {
                  const allCutouts = parseTemplateCutouts(slidingKitTemplate);
                  const fixedLeftCutouts = allCutouts.filter(c => c.targetPanel === 'fixed_left');
                  if (fixedLeftCutouts.length === 0) return null;
                  const tmplDims = slidingKitTemplate.dimensions as Record<string, any>;
                  const refW = tmplDims.glass_width || leftPanelW;
                  const refH = tmplDims.glass_height || fixedPanelH;
                  return (
                    <g>
                      {fixedLeftCutouts.map((cutout, i) => {
                        const mappedX = cutout.x > refW / 2 ? leftPanelW - (refW - cutout.x) : cutout.x;
                        const mappedY = cutout.y > refH / 2 ? fixedPanelH - (refH - cutout.y) : cutout.y;
                        const cx = panelX + mappedX * scale;
                        const cy = doorY + mappedY * scale;
                        if (cutout.shape === 'circle') {
                          const r = (cutout.diameter / 2) * scale;
                          return (
                            <g key={`left-fix-cutout-${i}`}>
                              <circle cx={cx} cy={cy} r={r} fill={DIM_COLOR} fillOpacity={0.15} stroke={DIM_COLOR} strokeWidth={1.5} />
                              <line x1={cx - r * 0.4} y1={cy} x2={cx + r * 0.4} y2={cy} stroke={DIM_COLOR} strokeWidth={0.8} />
                              <line x1={cx} y1={cy - r * 0.4} x2={cx} y2={cy + r * 0.4} stroke={DIM_COLOR} strokeWidth={0.8} />
                            </g>
                          );
                        }
                        if (cutout.shape === 'stadium') {
                          const sw = cutout.width * scale; const sh = cutout.height * scale;
                          return <rect key={`left-fix-cutout-${i}`} x={cx - sw / 2} y={cy - sh / 2} width={sw} height={sh} rx={Math.min(sh / 2, sw / 2)} fill={DIM_COLOR} fillOpacity={0.15} stroke={DIM_COLOR} strokeWidth={1.5} />;
                        }
                        if (cutout.shape === 'rect') {
                          const sw = cutout.width * scale; const sh = cutout.height * scale;
                          return <rect key={`left-fix-cutout-${i}`} x={cx - sw / 2} y={cy - sh / 2} width={sw} height={sh} fill={DIM_COLOR} fillOpacity={0.15} stroke={DIM_COLOR} strokeWidth={1.5} />;
                        }
                        if (cutout.shape === 'slot') {
                          const sl = cutout.slotLength * scale; const sr = cutout.radius * scale;
                          return <rect key={`left-fix-cutout-${i}`} x={cx - sl / 2} y={cy - sr} width={sl} height={sr * 2} rx={sr} fill={DIM_COLOR} fillOpacity={0.15} stroke={DIM_COLOR} strokeWidth={1.5} />;
                        }
                        return null;
                      })}
                    </g>
                  );
                })()}
                <text
                  x={panelX + scaledLeftPanelW / 2}
                  y={doorY + lpMaxH / 2}
                  textAnchor="middle" dominantBaseline="middle"
                  fill="#64748B" fontSize={10} fontFamily="sans-serif"
                >
                  FIX S
                </text>
                <DimensionLine
                  x1={panelX} y1={doorY - 12} x2={panelX + scaledLeftPanelW} y2={doorY - 12}
                  label={`${leftPanelW}`} extensionY1={doorY}
                />
                {isFrontalTrapezoid && leftPanelHL !== leftPanelHR ? (
                  <>
                    <DimensionLineVertical
                      x={panelX - 25}
                      y1={lpTopLeftY} y2={lpBottomY}
                      label={`${leftPanelHL}`}
                      extensionX={panelX}
                    />
                    <DimensionLineVertical
                      x={panelX + scaledLeftPanelW + 20}
                      y1={lpTopRightY} y2={lpBottomY}
                      label={`${leftPanelHR}`}
                      extensionX={panelX + scaledLeftPanelW}
                    />
                  </>
                ) : (
                  <DimensionLineVertical
                    x={panelX - 25}
                    y1={doorY} y2={doorY + scaledFixedPanelH}
                    label={`${fixedPanelH}`}
                    extensionX={panelX}
                  />
                )}
              </g>
            );
          })()}

          {/* Fixed panel (right of door) - legacy single fixedPanel */}
          {hasFixedPanel && (() => {
            const panelX = doorX + scaledW + scaledPanelGap;
            const isHingeSide = !isLeft;
            
            return (
              <g>
                {isHingeSide ? (
                  <path
                    d={buildFixedPanelPath(
                      panelX, doorY, scaledFixedW, scaledFixedPanelH,
                      hinges.positions, scale,
                      scaledCutoutW, scaledCutoutH, cutoutOffset * scale,
                      'left', scaledCircleR
                    )}
                    fill="none" stroke={DOOR_STROKE} strokeWidth={1.2}
                  />
                ) : (
                  <rect
                    x={panelX} y={doorY}
                    width={scaledFixedW} height={scaledFixedPanelH}
                    fill="none" stroke={DOOR_STROKE} strokeWidth={1.2}
                  />
                )}
                {isHingeSide && sortedHingePositions.map((posFromTop, i) => {
                  const cy = doorY + posFromTop * scale;
                  const cx = panelX + scaledCutoutW / 2 - (cutoutOffset * scale) / 2;
                  return (
                    <HingeCutoutDetail
                      key={`fixed-panel-hinge-${i}`}
                      cx={cx} cy={cy}
                      scaledCutoutW={scaledCutoutW}
                      scaledCutoutH={scaledCutoutH}
                      scaledCircleR={scaledCircleR}
                      isLeft={true}
                      cutoutW={cutoutW}
                      cutoutOffset={cutoutOffset}
                      scale={scale}
                    />
                  );
                })}
                {/* Sliding kit cutouts on legacy fixed panel (treated as fixed_right) */}
                {isSliding && slidingKitTemplate && (() => {
                  const allCutouts = parseTemplateCutouts(slidingKitTemplate);
                  const fixedCutouts = allCutouts.filter(c => c.targetPanel === 'fixed_right');
                  if (fixedCutouts.length === 0) return null;
                  const tmplDims = slidingKitTemplate.dimensions as Record<string, any>;
                  const refW = tmplDims.glass_width || fixedW;
                  const refH = tmplDims.glass_height || fixedPanelH;
                  return (
                    <g>
                      {fixedCutouts.map((cutout, i) => {
                        const mappedX = cutout.x > refW / 2 ? fixedW - (refW - cutout.x) : cutout.x;
                        const mappedY = cutout.y > refH / 2 ? fixedPanelH - (refH - cutout.y) : cutout.y;
                        const cx = panelX + mappedX * scale;
                        const cy = doorY + mappedY * scale;
                        if (cutout.shape === 'circle') {
                          const r = (cutout.diameter / 2) * scale;
                          return (
                            <g key={`fix-cutout-${i}`}>
                              <circle cx={cx} cy={cy} r={r} fill={DIM_COLOR} fillOpacity={0.15} stroke={DIM_COLOR} strokeWidth={1.5} />
                              <line x1={cx - r * 0.4} y1={cy} x2={cx + r * 0.4} y2={cy} stroke={DIM_COLOR} strokeWidth={0.8} />
                              <line x1={cx} y1={cy - r * 0.4} x2={cx} y2={cy + r * 0.4} stroke={DIM_COLOR} strokeWidth={0.8} />
                            </g>
                          );
                        }
                        if (cutout.shape === 'stadium') {
                          const sw = cutout.width * scale; const sh = cutout.height * scale;
                          return <rect key={`fix-cutout-${i}`} x={cx - sw / 2} y={cy - sh / 2} width={sw} height={sh} rx={Math.min(sh / 2, sw / 2)} fill={DIM_COLOR} fillOpacity={0.15} stroke={DIM_COLOR} strokeWidth={1.5} />;
                        }
                        if (cutout.shape === 'rect') {
                          const sw = cutout.width * scale; const sh = cutout.height * scale;
                          return <rect key={`fix-cutout-${i}`} x={cx - sw / 2} y={cy - sh / 2} width={sw} height={sh} fill={DIM_COLOR} fillOpacity={0.15} stroke={DIM_COLOR} strokeWidth={1.5} />;
                        }
                        if (cutout.shape === 'slot') {
                          const sl = cutout.slotLength * scale; const sr = cutout.radius * scale;
                          return <rect key={`fix-cutout-${i}`} x={cx - sl / 2} y={cy - sr} width={sl} height={sr * 2} rx={sr} fill={DIM_COLOR} fillOpacity={0.15} stroke={DIM_COLOR} strokeWidth={1.5} />;
                        }
                        return null;
                      })}
                    </g>
                  );
                })()}
                <text
                  x={panelX + scaledFixedW / 2}
                  y={doorY + scaledFixedPanelH / 2}
                  textAnchor="middle" dominantBaseline="middle"
                  fill="#64748B" fontSize={10} fontFamily="sans-serif"
                >
                  FIX
                </text>
                <DimensionLine
                  x1={panelX} y1={doorY - 12} x2={panelX + scaledFixedW} y2={doorY - 12}
                  label={`${fixedW}`} extensionY1={doorY}
                />
                <DimensionLineVertical
                  x={panelX + scaledFixedW + 25}
                  y1={doorY} y2={doorY + scaledFixedPanelH}
                  label={`${fixedPanelH}`}
                  extensionX={panelX + scaledFixedW}
                />
              </g>
            );
          })()}

          {/* Right fixed panel */}
          {hasRightPanel && (() => {
            const panelX = doorX + scaledW + (hasFixedPanel ? scaledFixedW + scaledPanelGap : 0) + scaledPanelGap;
            const isHingeSide = !isLeft;
            const rpHL = scaledRightPanelHL;
            const rpHR = scaledRightPanelHR;
            const rpMaxH = isFrontalTrapezoid ? Math.max(rpHL, rpHR) : scaledFixedPanelH;
            const rpBottomY = doorY + rpMaxH;
            const rpTopLeftY = isFrontalTrapezoid ? rpBottomY - rpHL : doorY;
            const rpTopRightY = isFrontalTrapezoid ? rpBottomY - rpHR : doorY;

            return (
              <g>
                {isHingeSide ? (
                  <path
                    d={buildFixedPanelPath(
                      panelX, doorY, scaledRightPanelW, scaledFixedPanelH,
                      hinges.positions, scale,
                      scaledCutoutW, scaledCutoutH, cutoutOffset * scale,
                      'left', scaledCircleR,
                      isFrontalTrapezoid ? rpHL : undefined,
                      isFrontalTrapezoid ? rpHR : undefined
                    )}
                    fill="none" stroke={DOOR_STROKE} strokeWidth={1.2}
                  />
                ) : isFrontalTrapezoid ? (
                  <polygon
                    points={`${panelX},${rpTopLeftY} ${panelX + scaledRightPanelW},${rpTopRightY} ${panelX + scaledRightPanelW},${rpBottomY} ${panelX},${rpBottomY}`}
                    fill="none" stroke={DOOR_STROKE} strokeWidth={1.2}
                  />
                ) : (
                  <rect
                    x={panelX} y={doorY}
                    width={scaledRightPanelW} height={scaledFixedPanelH}
                    fill="none" stroke={DOOR_STROKE} strokeWidth={1.2}
                  />
                )}
                {isHingeSide && sortedHingePositions.map((posFromTop, i) => {
                  const hingeRefY = isFrontalTrapezoid ? rpTopLeftY : doorY;
                  const cy = hingeRefY + posFromTop * scale;
                  const cx = panelX + scaledCutoutW / 2 - (cutoutOffset * scale) / 2;
                  return (
                    <HingeCutoutDetail
                      key={`right-panel-hinge-${i}`}
                      cx={cx} cy={cy}
                      scaledCutoutW={scaledCutoutW}
                      scaledCutoutH={scaledCutoutH}
                      scaledCircleR={scaledCircleR}
                      isLeft={true}
                      cutoutW={cutoutW}
                      cutoutOffset={cutoutOffset}
                      scale={scale}
                    />
                  );
                })}
                {/* Sliding kit cutouts on right fixed panel */}
                {isSliding && slidingKitTemplate && (() => {
                  const allCutouts = parseTemplateCutouts(slidingKitTemplate);
                  const fixedRightCutouts = allCutouts.filter(c => c.targetPanel === 'fixed_right');
                  if (fixedRightCutouts.length === 0) return null;
                  const tmplDims = slidingKitTemplate.dimensions as Record<string, any>;
                  const refW = tmplDims.glass_width || rightPanelW;
                  const refH = tmplDims.glass_height || fixedPanelH;
                  return (
                    <g>
                      {fixedRightCutouts.map((cutout, i) => {
                        const mappedX = cutout.x > refW / 2 ? rightPanelW - (refW - cutout.x) : cutout.x;
                        const mappedY = cutout.y > refH / 2 ? fixedPanelH - (refH - cutout.y) : cutout.y;
                        const cx = panelX + mappedX * scale;
                        const cy = doorY + mappedY * scale;
                        if (cutout.shape === 'circle') {
                          const r = (cutout.diameter / 2) * scale;
                          return (
                            <g key={`right-fix-cutout-${i}`}>
                              <circle cx={cx} cy={cy} r={r} fill={DIM_COLOR} fillOpacity={0.15} stroke={DIM_COLOR} strokeWidth={1.5} />
                              <line x1={cx - r * 0.4} y1={cy} x2={cx + r * 0.4} y2={cy} stroke={DIM_COLOR} strokeWidth={0.8} />
                              <line x1={cx} y1={cy - r * 0.4} x2={cx} y2={cy + r * 0.4} stroke={DIM_COLOR} strokeWidth={0.8} />
                            </g>
                          );
                        }
                        if (cutout.shape === 'stadium') {
                          const sw = cutout.width * scale; const sh = cutout.height * scale;
                          return <rect key={`right-fix-cutout-${i}`} x={cx - sw / 2} y={cy - sh / 2} width={sw} height={sh} rx={Math.min(sh / 2, sw / 2)} fill={DIM_COLOR} fillOpacity={0.15} stroke={DIM_COLOR} strokeWidth={1.5} />;
                        }
                        if (cutout.shape === 'rect') {
                          const sw = cutout.width * scale; const sh = cutout.height * scale;
                          return <rect key={`right-fix-cutout-${i}`} x={cx - sw / 2} y={cy - sh / 2} width={sw} height={sh} fill={DIM_COLOR} fillOpacity={0.15} stroke={DIM_COLOR} strokeWidth={1.5} />;
                        }
                        if (cutout.shape === 'slot') {
                          const sl = cutout.slotLength * scale; const sr = cutout.radius * scale;
                          return <rect key={`right-fix-cutout-${i}`} x={cx - sl / 2} y={cy - sr} width={sl} height={sr * 2} rx={sr} fill={DIM_COLOR} fillOpacity={0.15} stroke={DIM_COLOR} strokeWidth={1.5} />;
                        }
                        return null;
                      })}
                    </g>
                  );
                })()}
                <text
                  x={panelX + scaledRightPanelW / 2}
                  y={doorY + rpMaxH / 2}
                  textAnchor="middle" dominantBaseline="middle"
                  fill="#64748B" fontSize={10} fontFamily="sans-serif"
                >
                  FIX D
                </text>
                <DimensionLine
                  x1={panelX} y1={doorY - 12} x2={panelX + scaledRightPanelW} y2={doorY - 12}
                  label={`${rightPanelW}`} extensionY1={doorY}
                />
                {isFrontalTrapezoid && rightPanelHL !== rightPanelHR ? (
                  <>
                    <DimensionLineVertical
                      x={panelX - 20}
                      y1={rpTopLeftY} y2={rpBottomY}
                      label={`${rightPanelHL}`}
                      extensionX={panelX}
                    />
                    <DimensionLineVertical
                      x={panelX + scaledRightPanelW + 25}
                      y1={rpTopRightY} y2={rpBottomY}
                      label={`${rightPanelHR}`}
                      extensionX={panelX + scaledRightPanelW}
                    />
                  </>
                ) : (
                  <DimensionLineVertical
                    x={panelX + scaledRightPanelW + 25}
                    y1={doorY} y2={doorY + scaledFixedPanelH}
                    label={`${fixedPanelH}`}
                    extensionX={panelX + scaledRightPanelW}
                  />
                )}
              </g>
            );
          })()}

          {/* Side panel for corner_90 - on hinge side, no hatching */}
          {hasSidePanel && cabinDepth && (() => {
            const spW = sidePanelGlassWidth;
            const spScW = sidePanelScaledW;
            const sidePanelX = doorX;
            const sidePanelBaseY = doorY + maxPanelHeight + sidePanelGap;
            const spMaxH = isLateralTrapezoid ? Math.max(scaledSidePanelHL, scaledSidePanelHR) : sidePanelScaledH;
            const spBottomY = sidePanelBaseY + spMaxH;
            const spTopLeftY = isLateralTrapezoid ? spBottomY - scaledSidePanelHL : sidePanelBaseY;
            const spTopRightY = isLateralTrapezoid ? spBottomY - scaledSidePanelHR : sidePanelBaseY;

            // When lateralConfig is enabled, draw separate door + fixed panels
            const hasLateralDoor = !!lateralDoorWidth && lateralDoorWidth > 0;
            const latDoorW = lateralDoorWidth || 0;
            const latFixLeft = lateralFixedPanels?.left;
            const latFixRight = lateralFixedPanels?.right;
            const hasLatFixLeft = latFixLeft?.enabled && latFixLeft.width > 0;
            const hasLatFixRight = latFixRight?.enabled && latFixRight.width > 0;
            const latFixLeftW = hasLatFixLeft ? latFixLeft!.width : 0;
            const latFixRightW = hasLatFixRight ? latFixRight!.width : 0;
            const latHSide = lateralHingeSide || 'left';
            const latHPositions = lateralHingePositions || [];
            const sortedLatHPositions = [...latHPositions].sort((a, b) => a - b);

            if (hasLateralDoor) {
              // Draw lateral as: [fix left] + [door] + [fix right]
              const latDoorScW = latDoorW * scale;
              const latFixLeftScW = latFixLeftW * scale;
              const latFixRightScW = latFixRightW * scale;
              const latDoorGlassH = doorGlassHeight; // lateral door = frontal door height exactly
              const latDoorScH = latDoorGlassH * scale;
              const latFixH = doorGlassHeight + 5 - lateralProfileHDed; // fixed panels 5mm taller, minus profile deduction
              const latFixScH = latFixH * scale;
              const latIsLeft = latHSide === 'left';

              // Calculate x positions
              let latCurX = sidePanelX;
              // Shared X for all lateral height dimensions (set in door IIFE)
              const latHingeOffset = !latIsLeft ? (sortedLatHPositions.length + 1) * 28 : 0;
              const doorPanXCalc = sidePanelX + (hasLatFixLeft ? latFixLeftScW + scaledPanelGap : 0);
              const lateralRightEdge = doorPanXCalc + latDoorScW 
                + (hasLatFixRight ? scaledPanelGap + latFixRightScW : 0);
              const lateralHeightDimX = lateralRightEdge + 45 + latHingeOffset;
              const lateralHeightDimXFix = lateralHeightDimX + 30;

              return (
                <g>
                  {/* Lateral fixed panel LEFT */}
                  {hasLatFixLeft && (() => {
                    const panX = latCurX;
                    latCurX += latFixLeftScW + scaledPanelGap;
                    return (
                      <g>
                        <rect x={panX} y={sidePanelBaseY} width={latFixLeftScW} height={latFixScH} fill="none" stroke={DOOR_STROKE} strokeWidth={1.2} />
                        <text x={panX + latFixLeftScW / 2} y={sidePanelBaseY + latFixScH / 2} textAnchor="middle" dominantBaseline="middle" fill="#64748B" fontSize={9} fontFamily="sans-serif">
                          LAT. FIX S
                        </text>
                        <DimensionLine x1={panX} y1={sidePanelBaseY - 12} x2={panX + latFixLeftScW} y2={sidePanelBaseY - 12} label={`${latFixLeftW}`} extensionY1={sidePanelBaseY} />
                        <DimensionLineVertical x={lateralHeightDimXFix} y1={sidePanelBaseY} y2={sidePanelBaseY + latFixScH} label={`${latFixH}`} extensionX={panX + latFixLeftScW} />
                      </g>
                    );
                  })()}

                  {/* Lateral door */}
                  {(() => {
                    const doorPanX = latCurX;
                    latCurX += latDoorScW + scaledPanelGap;
                    // Draw door with hinge cutouts using buildDoorPath
                    const latDoorPath = buildDoorPath(
                      doorPanX, sidePanelBaseY, latDoorScW, latDoorScH,
                      latHPositions, scale,
                      scaledCutoutW, scaledCutoutH, cutoutOffset * scale,
                      latIsLeft, scaledCircleR
                    );
                    return (
                      <g>
                        <path d={latDoorPath} fill="none" stroke={DOOR_STROKE} strokeWidth={1.2} />
                        {/* Hinge cutout details */}
                        {sortedLatHPositions.map((posFromTop, i) => {
                          const cy = sidePanelBaseY + posFromTop * scale;
                          const cx = latIsLeft
                            ? doorPanX + scaledCutoutW / 2 - (cutoutOffset * scale) / 2
                            : doorPanX + latDoorScW - scaledCutoutW / 2 + (cutoutOffset * scale) / 2;
                          return (
                            <HingeCutoutDetail
                              key={`lat-door-hinge-${i}`}
                              cx={cx} cy={cy}
                              scaledCutoutW={scaledCutoutW}
                              scaledCutoutH={scaledCutoutH}
                              scaledCircleR={scaledCircleR}
                              isLeft={latIsLeft}
                              cutoutW={cutoutW}
                              cutoutOffset={cutoutOffset}
                              scale={scale}
                            />
                          );
                        })}
                        {/* Label */}
                        <text x={doorPanX + latDoorScW / 2} y={sidePanelBaseY + latDoorScH / 2 - 6} textAnchor="middle" dominantBaseline="middle" fill="#64748B" fontSize={10} fontFamily="sans-serif">
                          UȘĂ LATERALĂ
                        </text>
                        {/* Width dim */}
                        <DimensionLine x1={doorPanX} y1={sidePanelBaseY - 12} x2={doorPanX + latDoorScW} y2={sidePanelBaseY - 12} label={`${latDoorW}`} extensionY1={sidePanelBaseY} />
                        {/* Height dim - placed on the opposite side of hinges to avoid overlap */}
                        <DimensionLineVertical x={lateralHeightDimX} y1={sidePanelBaseY} y2={sidePanelBaseY + latDoorScH} label={`${latDoorGlassH}`} extensionX={doorPanX + latDoorScW} />
                        {/* Hinge position dims */}
                        {sortedLatHPositions.map((posFromTop, i) => {
                          const cy = sidePanelBaseY + posFromTop * scale;
                          const sideEdgeX = latIsLeft ? doorPanX : doorPanX + latDoorScW;
                          const xOff = latIsLeft ? sideEdgeX - 25 - i * 28 : sideEdgeX + 25 + i * 28;
                          return (
                            <g key={`lat-hinge-dim-${i}`}>
                              <line x1={sideEdgeX} y1={sidePanelBaseY} x2={xOff} y2={sidePanelBaseY} stroke={DIM_COLOR} strokeWidth={DIM_STROKE_THIN} strokeDasharray="3,2" />
                              <line x1={sideEdgeX} y1={cy} x2={xOff} y2={cy} stroke={DIM_COLOR} strokeWidth={DIM_STROKE_THIN} strokeDasharray="3,2" />
                              <line x1={xOff} y1={sidePanelBaseY} x2={xOff} y2={cy} stroke={DIM_COLOR} strokeWidth={DIM_STROKE_W} />
                              <polygon points={`${xOff},${sidePanelBaseY} ${xOff - ARROW_SIZE / 2},${sidePanelBaseY + ARROW_SIZE} ${xOff + ARROW_SIZE / 2},${sidePanelBaseY + ARROW_SIZE}`} fill={DIM_COLOR} />
                              <polygon points={`${xOff},${cy} ${xOff - ARROW_SIZE / 2},${cy - ARROW_SIZE} ${xOff + ARROW_SIZE / 2},${cy - ARROW_SIZE}`} fill={DIM_COLOR} />
                              <text x={latIsLeft ? xOff - 6 : xOff + 6} y={(sidePanelBaseY + cy) / 2} textAnchor={latIsLeft ? 'end' : 'start'} dominantBaseline="middle" fill={DIM_COLOR} fontSize={DIM_FONT_SIZE_SM} fontWeight={DIM_FONT_WEIGHT} fontFamily="monospace">
                                {Math.round(posFromTop)}
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    );
                  })()}

                  {/* Lateral fixed panel RIGHT */}
                  {hasLatFixRight && (() => {
                    const panX = latCurX;
                    return (
                      <g>
                        <rect x={panX} y={sidePanelBaseY} width={latFixRightScW} height={latFixScH} fill="none" stroke={DOOR_STROKE} strokeWidth={1.2} />
                        <text x={panX + latFixRightScW / 2} y={sidePanelBaseY + latFixScH / 2} textAnchor="middle" dominantBaseline="middle" fill="#64748B" fontSize={9} fontFamily="sans-serif">
                          LAT. FIX D
                        </text>
                        <DimensionLine x1={panX} y1={sidePanelBaseY - 12} x2={panX + latFixRightScW} y2={sidePanelBaseY - 12} label={`${latFixRightW}`} extensionY1={sidePanelBaseY} />
                        <DimensionLineVertical x={lateralHeightDimXFix} y1={sidePanelBaseY} y2={sidePanelBaseY + latFixScH} label={`${latFixH}`} extensionX={panX + latFixRightScW} />
                      </g>
                    );
                  })()}

                  {/* Total width dimension */}
                  {(hasLatFixLeft || hasLatFixRight) && (() => {
                    const totalLateralW = latFixLeftW + latDoorW + latFixRightW;
                    const endX = sidePanelX + (hasLatFixLeft ? latFixLeftScW + scaledPanelGap : 0) + latDoorScW + (hasLatFixRight ? scaledPanelGap + latFixRightScW : 0);
                    return (
                      <DimensionLine
                        x1={sidePanelX} y1={sidePanelBaseY - 30} x2={endX} y2={sidePanelBaseY - 30}
                        label={`${totalLateralW}`} extensionY1={sidePanelBaseY}
                      />
                    );
                  })()}
                </g>
              );
            }

            // Fallback: original single-piece lateral panel drawing
            const sideCutoutSide: 'left' | 'right' = isLeft ? 'left' : 'right';

            return (
              <g>
                {/* Side panel glass - simple rectangle (no hinge cutouts for corner_90) */}
                {isLateralTrapezoid ? (
                  <path
                    d={`M ${sidePanelX} ${spTopLeftY} L ${sidePanelX + spScW} ${spTopRightY} L ${sidePanelX + spScW} ${spTopRightY + scaledSidePanelHR} L ${sidePanelX} ${spTopLeftY + scaledSidePanelHL} Z`}
                    fill="none" stroke={DOOR_STROKE} strokeWidth={1.2}
                  />
                ) : (
                  <rect
                    x={sidePanelX} y={sidePanelBaseY}
                    width={spScW} height={sidePanelScaledH}
                    fill="none" stroke={DOOR_STROKE} strokeWidth={1.2}
                  />
                )}
                {/* Absolute handle template cutouts on lateral panel (mirrored) */}
                {handle && handleTemplate && isAbsoluteTemplate(handleTemplate) && (() => {
                  const cutouts = parseTemplateCutouts(handleTemplate);
                  if (cutouts.length === 0) return null;
                  const tmplDims = handleTemplate.dimensions as Record<string, any>;
                  const refW = tmplDims.glass_width || sidePanelGlassWidth;
                  const refH = tmplDims.glass_height || sidePanelGlassHeight;
                  return (
                    <g>
                      {cutouts.map((cutout, i) => {
                        const mapped = mapCutoutToPanel(cutout, refW, refH, sidePanelGlassWidth, sidePanelGlassHeight, true);
                        const cx = sidePanelX + mapped.x * scale;
                        const cy = sidePanelBaseY + mapped.y * scale;
                        if (cutout.shape === 'circle') {
                          const r = (cutout.diameter / 2) * scale;
                          return (
                            <g key={`side-abs-handle-${i}`}>
                              <circle cx={cx} cy={cy} r={r} fill={DIM_COLOR} fillOpacity={0.15} stroke={DIM_COLOR} strokeWidth={1.5} />
                              <line x1={cx - r * 0.4} y1={cy} x2={cx + r * 0.4} y2={cy} stroke={DIM_COLOR} strokeWidth={0.8} />
                              <line x1={cx} y1={cy - r * 0.4} x2={cx} y2={cy + r * 0.4} stroke={DIM_COLOR} strokeWidth={0.8} />
                            </g>
                          );
                        }
                        if (cutout.shape === 'stadium') {
                          const sw = cutout.width * scale; const sh = cutout.height * scale;
                          return <rect key={`side-abs-handle-${i}`} x={cx - sw / 2} y={cy - sh / 2} width={sw} height={sh} rx={Math.min(sh / 2, sw / 2)} fill={DIM_COLOR} fillOpacity={0.15} stroke={DIM_COLOR} strokeWidth={1.5} />;
                        }
                        if (cutout.shape === 'rect') {
                          const sw = cutout.width * scale; const sh = cutout.height * scale;
                          return <rect key={`side-abs-handle-${i}`} x={cx - sw / 2} y={cy - sh / 2} width={sw} height={sh} fill={DIM_COLOR} fillOpacity={0.15} stroke={DIM_COLOR} strokeWidth={1.5} />;
                        }
                        if (cutout.shape === 'slot') {
                          const sl = cutout.slotLength * scale; const sr = cutout.radius * scale;
                          return <rect key={`side-abs-handle-${i}`} x={cx - sl / 2} y={cy - sr} width={sl} height={sr * 2} rx={sr} fill={DIM_COLOR} fillOpacity={0.15} stroke={DIM_COLOR} strokeWidth={1.5} />;
                        }
                        return null;
                      })}
                    </g>
                  );
                })()}
                {/* Sliding kit template cutouts on lateral panel */}
                {isSliding && slidingKitTemplate && (() => {
                  const allCutouts = parseTemplateCutouts(slidingKitTemplate);
                  // Lateral panel acts as fixed_left or fixed_right depending on hinge side
                  const targetPanel = isLeft ? 'fixed_left' : 'fixed_right';
                  const cutouts = allCutouts.filter(c => c.targetPanel === targetPanel);
                  if (cutouts.length === 0) return null;
                  const tmplDims = slidingKitTemplate.dimensions as Record<string, any>;
                  const refW = tmplDims.glass_width || sidePanelGlassWidth;
                  const refH = tmplDims.glass_height || sidePanelGlassHeight;
                  return (
                    <g>
                      {cutouts.map((cutout, i) => {
                        const mapped = mapCutoutToPanel(cutout, refW, refH, sidePanelGlassWidth, sidePanelGlassHeight);
                        const cx = sidePanelX + mapped.x * scale;
                        const cy = sidePanelBaseY + mapped.y * scale;
                        if (cutout.shape === 'circle') {
                          const r = (cutout.diameter / 2) * scale;
                          return (
                            <g key={`side-sliding-${i}`}>
                              <circle cx={cx} cy={cy} r={r} fill={DIM_COLOR} fillOpacity={0.15} stroke={DIM_COLOR} strokeWidth={1.5} />
                              <line x1={cx - r * 0.4} y1={cy} x2={cx + r * 0.4} y2={cy} stroke={DIM_COLOR} strokeWidth={0.8} />
                              <line x1={cx} y1={cy - r * 0.4} x2={cx} y2={cy + r * 0.4} stroke={DIM_COLOR} strokeWidth={0.8} />
                            </g>
                          );
                        }
                        if (cutout.shape === 'stadium') {
                          const sw = cutout.width * scale; const sh = cutout.height * scale;
                          return <rect key={`side-sliding-${i}`} x={cx - sw / 2} y={cy - sh / 2} width={sw} height={sh} rx={Math.min(sh / 2, sw / 2)} fill={DIM_COLOR} fillOpacity={0.15} stroke={DIM_COLOR} strokeWidth={1.5} />;
                        }
                        if (cutout.shape === 'rect') {
                          const sw = cutout.width * scale; const sh = cutout.height * scale;
                          return <rect key={`side-sliding-${i}`} x={cx - sw / 2} y={cy - sh / 2} width={sw} height={sh} fill={DIM_COLOR} fillOpacity={0.15} stroke={DIM_COLOR} strokeWidth={1.5} />;
                        }
                        if (cutout.shape === 'slot') {
                          const sl = cutout.slotLength * scale; const sr = cutout.radius * scale;
                          return <rect key={`side-sliding-${i}`} x={cx - sl / 2} y={cy - sr} width={sl} height={sr * 2} rx={sr} fill={DIM_COLOR} fillOpacity={0.15} stroke={DIM_COLOR} strokeWidth={1.5} />;
                        }
                        return null;
                      })}
                    </g>
                  );
                })()}
                {/* Label */}
                <text
                  x={sidePanelX + spScW / 2}
                  y={sidePanelBaseY + spMaxH / 2 - 8}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#64748B"
                  fontSize={10}
                  fontFamily="sans-serif"
                >
                  PANOU LATERAL
                </text>
                <text
                  x={sidePanelX + spScW / 2}
                  y={sidePanelBaseY + spMaxH / 2 + 6}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#64748B"
                  fontSize={9}
                  fontFamily="sans-serif"
                >
                  (FIX)
                </text>
                {/* Width dimension - above */}
                <DimensionLine
                  x1={sidePanelX} y1={sidePanelBaseY - 20} x2={sidePanelX + spScW} y2={sidePanelBaseY - 20}
                  label={`${spW}`} extensionY1={sidePanelBaseY}
                />
                {/* Height dimensions */}
                {isLateralTrapezoid && sidePanelHL !== sidePanelHR ? (
                  <>
                    <DimensionLineVertical
                      x={sidePanelX - 25}
                      y1={spTopLeftY} y2={spBottomY}
                      label={`${sidePanelHL}`}
                      extensionX={sidePanelX}
                    />
                    <DimensionLineVertical
                      x={sidePanelX + spScW + 25}
                      y1={spTopRightY} y2={spBottomY}
                      label={`${sidePanelHR}`}
                      extensionX={sidePanelX + spScW}
                    />
                  </>
                ) : (
                  <DimensionLineVertical
                    x={sidePanelX + spScW + 25 + (sideCutoutSide === 'right' ? (sortedHingePositions.length + 1) * 28 : 0)}
                    y1={sidePanelBaseY} y2={sidePanelBaseY + sidePanelScaledH}
                    label={`${sidePanelEffectiveHeight}`}
                    extensionX={sidePanelX + spScW}
                  />
                )}
                {/* Hinge position dimensions on side panel - from TOP, staggered */}
                {sortedHingePositions.map((posFromTop, i) => {
                  const refY = isLateralTrapezoid
                    ? (sideCutoutSide === 'left' ? spTopLeftY : spTopRightY)
                    : sidePanelBaseY;
                  const cy = refY + posFromTop * scale;
                  const sideEdgeX = sideCutoutSide === 'left' ? sidePanelX : sidePanelX + spScW;
                  const xOff = sideCutoutSide === 'left'
                    ? sideEdgeX - 25 - i * 28
                    : sideEdgeX + 25 + i * 28;
                  return (
                    <g key={`side-hinge-dim-${i}`}>
                      <line x1={sideEdgeX} y1={refY} x2={xOff} y2={refY} stroke={DIM_COLOR} strokeWidth={DIM_STROKE_THIN} strokeDasharray="3,2" />
                      <line x1={sideEdgeX} y1={cy} x2={xOff} y2={cy} stroke={DIM_COLOR} strokeWidth={DIM_STROKE_THIN} strokeDasharray="3,2" />
                      <line x1={xOff} y1={refY} x2={xOff} y2={cy} stroke={DIM_COLOR} strokeWidth={DIM_STROKE_W} />
                      <polygon points={`${xOff},${refY} ${xOff - ARROW_SIZE / 2},${refY + ARROW_SIZE} ${xOff + ARROW_SIZE / 2},${refY + ARROW_SIZE}`} fill={DIM_COLOR} />
                      <polygon points={`${xOff},${cy} ${xOff - ARROW_SIZE / 2},${cy - ARROW_SIZE} ${xOff + ARROW_SIZE / 2},${cy - ARROW_SIZE}`} fill={DIM_COLOR} />
                      <text
                        x={sideCutoutSide === 'left' ? xOff - 6 : xOff + 6}
                        y={(refY + cy) / 2}
                        textAnchor={sideCutoutSide === 'left' ? 'end' : 'start'}
                        dominantBaseline="middle"
                        fill={DIM_COLOR} fontSize={DIM_FONT_SIZE_SM} fontWeight={DIM_FONT_WEIGHT} fontFamily="monospace"
                      >
                        {Math.round(posFromTop)}
                      </text>
                    </g>
                  );
                })}
                {/* Distance from last hinge to bottom edge on side panel */}
                {sortedHingePositions.length > 0 && (() => {
                  const spH = isLateralTrapezoid
                    ? (sideCutoutSide === 'left' ? sidePanelHL : sidePanelHR)
                    : sidePanelGlassHeight;
                  const lastHingePos = sortedHingePositions[sortedHingePositions.length - 1];
                  const distFromBottom = Math.round(spH - lastHingePos);
                  if (distFromBottom <= 0) return null;
                  const refY = isLateralTrapezoid
                    ? (sideCutoutSide === 'left' ? spTopLeftY : spTopRightY)
                    : sidePanelBaseY;
                  const lastCy = refY + lastHingePos * scale;
                  const sideEdgeX = sideCutoutSide === 'left' ? sidePanelX : sidePanelX + spScW;
                  const xOff = sideCutoutSide === 'left'
                    ? sideEdgeX - 25 - sortedHingePositions.length * 28
                    : sideEdgeX + 25 + sortedHingePositions.length * 28;
                  return (
                    <g>
                      <line x1={sideEdgeX} y1={lastCy} x2={xOff} y2={lastCy} stroke={DIM_COLOR} strokeWidth={DIM_STROKE_THIN} strokeDasharray="3,2" />
                      <line x1={sideEdgeX} y1={spBottomY} x2={xOff} y2={spBottomY} stroke={DIM_COLOR} strokeWidth={DIM_STROKE_THIN} strokeDasharray="3,2" />
                      <line x1={xOff} y1={lastCy} x2={xOff} y2={spBottomY} stroke="#DC2626" strokeWidth={DIM_STROKE_W} />
                      <polygon points={`${xOff},${lastCy} ${xOff - ARROW_SIZE / 2},${lastCy + ARROW_SIZE} ${xOff + ARROW_SIZE / 2},${lastCy + ARROW_SIZE}`} fill="#DC2626" />
                      <polygon points={`${xOff},${spBottomY} ${xOff - ARROW_SIZE / 2},${spBottomY - ARROW_SIZE} ${xOff + ARROW_SIZE / 2},${spBottomY - ARROW_SIZE}`} fill="#DC2626" />
                      <text
                        x={sideCutoutSide === 'left' ? xOff - 6 : xOff + 6}
                        y={(lastCy + spBottomY) / 2}
                        textAnchor={sideCutoutSide === 'left' ? 'end' : 'start'}
                        dominantBaseline="middle"
                        fill="#DC2626" fontSize={DIM_FONT_SIZE_SM} fontWeight={DIM_FONT_WEIGHT} fontFamily="monospace"
                      >
                        {distFromBottom}
                      </text>
                    </g>
                  );
                })()}
              </g>
            );
          })()}

          {/* Width dimension - horizontal above door, BLUE */}
          <DimensionLine
            x1={doorX} y1={doorY - 30} x2={doorX + scaledW} y2={doorY - 30}
            label={`${doorWidth}`} extensionY1={doorY}
          />

          {/* Total width if any panels exist */}
          {(hasFixedPanel || hasLeftPanel || hasRightPanel) && (() => {
            const totalW = leftPanelW + doorWidth + fixedW + rightPanelW;
            const startX = hasLeftPanel ? doorX - scaledPanelGap - scaledLeftPanelW : doorX;
            const endX = doorX + scaledW + (hasFixedPanel ? scaledFixedW + scaledPanelGap : 0) + (hasRightPanel ? scaledRightPanelW + scaledPanelGap : 0);
            return (
              <DimensionLine
                x1={startX} y1={doorY - 48} x2={endX} y2={doorY - 48}
                label={`${totalW}`} extensionY1={doorY}
              />
            );
          })()}

          {/* Height dimension - vertical on handle side, after handle dims, BLUE */}
          {(() => {
            const rightEdge = doorX + scaledW + (hasFixedPanel ? scaledFixedW + scaledPanelGap : 0) + (hasRightPanel ? scaledRightPanelW + scaledPanelGap : 0);
            const leftEdge = hasLeftPanel ? doorX - scaledPanelGap - scaledLeftPanelW : doorX;
            if (isFrontalTrapezoid && doorGlassHeightL !== doorGlassHeightR) {
              // Show both heights for trapezoid door
              const doorMaxH = Math.max(scaledDoorHL, scaledDoorHR);
              const doorBottomY = doorY + doorMaxH;
              const doorTopLY = doorBottomY - scaledDoorHL;
              const doorTopRY = doorBottomY - scaledDoorHR;
              return (
                <>
                  <DimensionLineVertical
                    x={leftEdge - 45}
                    y1={doorTopLY} y2={doorBottomY}
                    label={`${doorGlassHeightL}`}
                    extensionX={doorX}
                  />
                  <DimensionLineVertical
                    x={leftEdge - 70}
                    y1={doorTopRY} y2={doorBottomY}
                    label={`${doorGlassHeightR}`}
                    extensionX={doorX}
                  />
                </>
              );
            }
            return (
              <DimensionLineVertical
                x={leftEdge - 45}
                y1={doorY} y2={doorY + scaledH}
                label={`${doorGlassHeight}`}
                extensionX={leftEdge}
              />
            );
          })()}

          {/* Hinge position dimensions - from TOP, staggered on hinge side, BLUE */}
          {sortedHingePositions.map((posFromTop, i) => {
            const cy = doorY + posFromTop * scale;
            return (
              <PositionDimension
                key={`hinge-dim-${i}`}
                doorX={doorX} doorY={doorY} doorW={scaledW} doorH={scaledH}
                cy={cy} posFromTop={Math.round(posFromTop)}
                isLeft={isLeft} index={i}
              />
            );
          })}

          {/* Distance from last hinge to bottom edge */}
          {sortedHingePositions.length > 0 && (() => {
            const lastHingePos = sortedHingePositions[sortedHingePositions.length - 1];
            const distFromBottom = Math.round(doorGlassHeight - lastHingePos);
            if (distFromBottom <= 0) return null;
            const lastCy = doorY + lastHingePos * scale;
            const bottomEdge = doorY + scaledH;
            const xOff = isLeft ? doorX - 25 - sortedHingePositions.length * 28 : doorX + scaledW + 25 + sortedHingePositions.length * 28;
            return (
              <g>
                <line x1={isLeft ? doorX : doorX + scaledW} y1={lastCy} x2={xOff} y2={lastCy} stroke={DIM_COLOR} strokeWidth={DIM_STROKE_THIN} strokeDasharray="3,2" />
                <line x1={isLeft ? doorX : doorX + scaledW} y1={bottomEdge} x2={xOff} y2={bottomEdge} stroke={DIM_COLOR} strokeWidth={DIM_STROKE_THIN} strokeDasharray="3,2" />
                <line x1={xOff} y1={lastCy} x2={xOff} y2={bottomEdge} stroke="#DC2626" strokeWidth={DIM_STROKE_W} />
                <polygon points={`${xOff},${lastCy} ${xOff - ARROW_SIZE / 2},${lastCy + ARROW_SIZE} ${xOff + ARROW_SIZE / 2},${lastCy + ARROW_SIZE}`} fill="#DC2626" />
                <polygon points={`${xOff},${bottomEdge} ${xOff - ARROW_SIZE / 2},${bottomEdge - ARROW_SIZE} ${xOff + ARROW_SIZE / 2},${bottomEdge - ARROW_SIZE}`} fill="#DC2626" />
                <text x={xOff - 6} y={(lastCy + bottomEdge) / 2} textAnchor="end" dominantBaseline="middle" fill="#DC2626" fontSize={DIM_FONT_SIZE_SM} fontWeight={DIM_FONT_WEIGHT} fontFamily="monospace">
                  {distFromBottom}
                </text>
              </g>
            );
          })()}

          {/* Edge offset dimension on first hinge */}
          {sortedHingePositions.length > 0 && (() => {
            const firstHingeY = doorY + sortedHingePositions[0] * scale;
            const edgeX = isLeft ? doorX : doorX + scaledW;
            const cutoutEdgeX = isLeft ? doorX + scaledCutoutW : doorX + scaledW - scaledCutoutW;
            const labelY = firstHingeY - scaledCutoutH / 2 - 8;
            return (
              <g>
                <line x1={edgeX} y1={labelY} x2={cutoutEdgeX} y2={labelY} stroke="#94A3B8" strokeWidth={0.8} />
                <text x={(edgeX + cutoutEdgeX) / 2} y={labelY - 4} textAnchor="middle" fill="#94A3B8" fontSize={8} fontFamily="monospace">
                  {cutoutW}
                </text>
              </g>
            );
          })()}

          {/* Glass type and thickness label */}
          <text
            x={doorX + scaledW / 2}
            y={doorY + scaledH + 20}
            textAnchor="middle"
            fill="#64748B"
            fontSize={11}
            fontFamily="sans-serif"
            fontWeight="bold"
          >
            {glassType.toUpperCase()} {glassThickness}mm
          </text>
        </svg>
      </div>
      </>)}

      {/* Balustrade layout drawing with zoom/pan/export controls */}
      {!hasDoorDrawing && balustradeLayout && (<>
      <div
        ref={containerRef}
        className="p-4 overflow-auto relative select-none"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Zoom controls */}
        <div className="absolute top-2 right-2 z-10 flex flex-col items-center gap-1 bg-background/80 backdrop-blur-sm border rounded-md p-1.5 shadow-sm">
          <div className="flex items-center gap-1">
            <button onClick={() => { const f = 1.3; const nz = Math.min(zoom * f, 8); const r = nz / zoom; setPan(p => ({ x: (containerRef.current?.clientWidth || 0) / 2 - r * ((containerRef.current?.clientWidth || 0) / 2 - p.x), y: (containerRef.current?.clientHeight || 0) / 2 - r * ((containerRef.current?.clientHeight || 0) / 2 - p.y) })); setZoom(nz); }} className="p-1.5 rounded hover:bg-muted transition-colors" title={t("ui.tooltipZoomIn")}><ZoomIn className="w-4 h-4" /></button>
            <span className="text-xs font-mono min-w-[3rem] text-center text-muted-foreground">{Math.round(zoom * 100)}%</span>
            <button onClick={() => { const f = 1 / 1.3; const nz = Math.max(zoom * f, 0.5); const r = nz / zoom; setPan(p => ({ x: (containerRef.current?.clientWidth || 0) / 2 - r * ((containerRef.current?.clientWidth || 0) / 2 - p.x), y: (containerRef.current?.clientHeight || 0) / 2 - r * ((containerRef.current?.clientHeight || 0) / 2 - p.y) })); setZoom(nz); }} className="p-1.5 rounded hover:bg-muted transition-colors" title={t("ui.tooltipZoomOut")}><ZoomOut className="w-4 h-4" /></button>
            <button onClick={resetView} className="p-1.5 rounded hover:bg-muted transition-colors" title={t("ui.tooltipReset")}><RotateCcw className="w-4 h-4" /></button>
            <button
              onClick={() => {
                import('@/lib/dxf/dxfGenerator').then(({ downloadBalustradeDxf }) => {
                  downloadBalustradeDxf(balustradeLayout, `prelucrare_${orderNumber || 'balustrada'}`, dxfVersion);
                });
              }}
              className="p-1.5 rounded hover:bg-muted transition-colors"
              title={t("ui.exportDxf")}
            >
              <Download className="w-4 h-4" />
            </button>
            <Select value={dxfVersion} onValueChange={(v) => setDxfVersion(v as DxfVersion)}>
              <SelectTrigger className="h-7 w-[80px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="R12">R12</SelectItem>
                <SelectItem value="R2000">R2000</SelectItem>
                <SelectItem value="R2010">R2010</SelectItem>
              </SelectContent>
            </Select>
            <button
              onClick={async () => {
                const pdfAccessories: Array<{ label: string; code?: string; detail?: string; imageUrl?: string | null }> = [];
                if (extraAccessories) extraAccessories.forEach(e => {
                  const mat = e.materialCode ? materialsMap[e.materialCode] : undefined;
                  pdfAccessories.push({ label: mat?.name || e.name, code: e.materialCode, detail: `${e.quantity} buc`, imageUrl: mat?.imageUrl });
                });
                const { downloadProcessingSheetPdf } = await import('@/lib/pdf/processingSheetPdf');
                await downloadProcessingSheetPdf({
                  orderNumber,
                  clientName,
                  doorWidth: balustradeLayout.length,
                  doorHeight: balustradeLayout.height,
                  glassThickness: balustradeLayout.thickness,
                  glassType: balustradeLayout.glassType,
                  hingeSide: 'left',
                   hinges: { positions: [], quantity: 0, cutoutW: 0, cutoutH: 0, cutoutOffset: 0 },
                   accessories: pdfAccessories,
                   companyLogoUrl: companyLogoUrl || undefined,
                   companyPdfLogoSize: companyPdfLogoSize,
                   companyPdfLogoPosition: companyPdfLogoPosition,
                 }, `fisa_prelucrare_${orderNumber || 'balustrada'}`);

              }}
              className="p-1.5 rounded hover:bg-muted transition-colors"
              title={t("ui.exportPdf")}
            >
              <FileText className="w-4 h-4" />
            </button>
          </div>
          {/* Pan arrows */}
          <div className="grid grid-cols-3 gap-0.5 mt-1">
            <div />
            <button onClick={() => setPan(p => ({ ...p, y: p.y + 40 }))} className="p-1 rounded hover:bg-muted transition-colors"><ChevronUp className="w-3 h-3" /></button>
            <div />
            <button onClick={() => setPan(p => ({ ...p, x: p.x + 40 }))} className="p-1 rounded hover:bg-muted transition-colors"><ChevronLeft className="w-3 h-3" /></button>
            <div className="w-5 h-5" />
            <button onClick={() => setPan(p => ({ ...p, x: p.x - 40 }))} className="p-1 rounded hover:bg-muted transition-colors"><ChevronRight className="w-3 h-3" /></button>
            <div />
            <button onClick={() => setPan(p => ({ ...p, y: p.y - 40 }))} className="p-1 rounded hover:bg-muted transition-colors"><ChevronDown className="w-3 h-3" /></button>
            <div />
          </div>
        </div>

        <div
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0', cursor: isDragging ? 'grabbing' : 'grab' }}
          onMouseDown={(e) => { setIsDragging(true); dragStartRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y }; }}
          onWheel={handleWheel}
        >
          <BalustradeLayoutDrawing layout={balustradeLayout} />
        </div>
      </div>
      </>)}

      {/* Simple glass shape drawing for products WITHOUT hinge cutouts */}
      {!hasDoorDrawing && !balustradeLayout && (
        <div className="p-4 overflow-auto">
          <div className="flex items-center gap-1 mb-2 justify-end">
            <button
              onClick={() => {
                downloadSimpleGlassDxf({
                  width: doorWidth,
                  height: doorHeight,
                  shape: mirrorShape,
                  holeSpecs: holeSpecs,
                  cutoutSpecs: cutoutSpecs,
                  bevel: processingInfo?.bevel,
                  edgeCutouts: edgeCutouts,
                }, `prelucrare_${orderNumber || productType || 'sticla'}_${doorWidth}x${doorHeight}`, dxfVersion);
              }}
              className="p-1.5 rounded hover:bg-muted transition-colors"
              title={t("ui.exportDxf")}
            >
              <Download className="w-4 h-4" />
            </button>
            <Select value={dxfVersion} onValueChange={(v) => setDxfVersion(v as DxfVersion)}>
              <SelectTrigger className="h-7 w-[80px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="R12">R12</SelectItem>
                <SelectItem value="R2000">R2000</SelectItem>
                <SelectItem value="R2010">R2010</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <SimpleGlassDrawing
            width={doorWidth}
            height={doorHeight}
            thickness={glassThickness}
            glassType={glassType}
            shape={mirrorShape}
            productType={productType}
            edgePolish={edgePolish}
            processingInfo={processingInfo}
            quantity={quantity}
            panelCount={panelCount}
            holeSpecs={holeSpecs}
            cutoutSpecs={cutoutSpecs}
            partitionGrid={partitionGrid}
          />
        </div>
      )}
    </div>
  );
}

/* ── Unified Accessories Panel ── */

interface AccessoryCardProps {
  label: string;
  code?: string;
  detail?: string;
  imageUrl?: string | null;
  colorHex?: string | null;
}

function AccessoryCard({ label, code, detail, imageUrl, colorHex }: AccessoryCardProps) {
  return (
    <div className="flex items-center gap-3 p-2.5 bg-muted/50 rounded-md">
      <div className="w-12 h-12 flex items-center justify-center bg-background border rounded flex-shrink-0 overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={label} className="w-full h-full object-contain" />
        ) : (
          <Package className="w-5 h-5 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0 space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{label}</span>
          {colorHex && (
            <span className="inline-block w-3.5 h-3.5 rounded-full border" style={{ backgroundColor: colorHex }} />
          )}
        </div>
        {code && <div className="font-mono text-xs text-muted-foreground">{code}</div>}
        {detail && <div className="text-xs text-muted-foreground">{detail}</div>}
      </div>
    </div>
  );
}

const STABILIZER_POSITION_LABELS: Record<string, string> = {};
function getStabilizerPositionLabel(key: string): string {
  return i18next.t(`orderPreview.stabilizerPositions.${key}`, { defaultValue: key });
}

function UnifiedAccessories({
  hinges, handle, hingeMaterial, hingeFinish,
  profiles, seals, stabilizers, stabilizerSelections, lock, pivot, slidingSystem, extraAccessories,
  selectedKit,
  materialsMap,
  cabinType,
}: {
  hinges: ProcessingSheetViewerProps['hinges'];
  handle: ProcessingSheetViewerProps['handle'];
  hingeMaterial?: ProcessingSheetViewerProps['hingeMaterial'];
  hingeFinish?: ProcessingSheetViewerProps['hingeFinish'];
  profiles?: ProcessingSheetViewerProps['profiles'];
  seals?: ProcessingSheetViewerProps['seals'];
  stabilizers?: ProcessingSheetViewerProps['stabilizers'];
  stabilizerSelections?: ProcessingSheetViewerProps['stabilizerSelections'];
  lock?: ProcessingSheetViewerProps['lock'];
  pivot?: ProcessingSheetViewerProps['pivot'];
  slidingSystem?: ProcessingSheetViewerProps['slidingSystem'];
  extraAccessories?: ProcessingSheetViewerProps['extraAccessories'];
  selectedKit?: ProcessingSheetViewerProps['selectedKit'];
  materialsMap: Record<string, { name: string; imageUrl: string | null }>;
  cabinType?: string;
}) {
  const items: AccessoryCardProps[] = [];

  // Hinges — prefer selections array, use quantity as authoritative count
  const hingeSelections = hinges.selections || [];
  const authHingeQty = hinges.quantity || hingeSelections.length || 0;
  if (hingeSelections.length > 0) {
    const sel = hingeSelections[0];
    const mat = sel.materialCode ? materialsMap[sel.materialCode] : undefined;
    items.push({
      label: mat?.name || sel.name || i18next.t('processing.lateralAccessories.hinge'),
      code: sel.materialCode,
      detail: `${authHingeQty} buc`,
      imageUrl: mat?.imageUrl,
      colorHex: hingeFinish?.colorHex,
    });
  } else if (authHingeQty > 0) {
    const mat = hinges.materialCode ? materialsMap[hinges.materialCode] : undefined;
    items.push({
      label: `Balamale × ${authHingeQty}`,
      code: hinges.materialCode,
      detail: [hingeMaterial?.name, hingeFinish?.name].filter(Boolean).join(' — ') || undefined,
      imageUrl: hingeMaterial?.imageUrl || mat?.imageUrl,
      colorHex: hingeFinish?.colorHex,
    });
  }

  // Handle — prefer selections array (skip for fixed_panel)
  if (handle && cabinType !== 'fixed_panel') {
    const handleSelections = handle.selections || [];
    if (handleSelections.length > 0) {
      handleSelections.forEach(sel => {
        const mat = sel.materialCode ? materialsMap[sel.materialCode] : undefined;
        items.push({
          label: mat?.name || sel.name || i18next.t('processing.lateralAccessories.handle'),
          code: sel.materialCode,
          detail: [handle.length ? `${handle.length}mm` : null, `${i18next.t('processing.details.positionY')} ${handle.positionY}mm`].filter(Boolean).join(' · '),
          imageUrl: mat?.imageUrl,
        });
      });
    } else {
      const mat = handle.materialCode ? materialsMap[handle.materialCode] : undefined;
      const details = [handle.model, handle.length ? `${handle.length}mm` : null, handle.finish ? `Finisaj: ${handle.finish}` : null, `${i18next.t('processing.details.positionY')} ${handle.positionY}mm`].filter(Boolean).join(' · ');
      items.push({ label: mat?.name || i18next.t('processing.lateralAccessories.handle'), code: handle.materialCode, detail: details, imageUrl: mat?.imageUrl });
    }
  }

  // Profiles — prefer selections array
  if (profiles) {
    const profileSelections = profiles.selections || [];
    if (profileSelections.length > 0) {
      profileSelections.forEach(sel => {
        const mat = sel.materialCode ? materialsMap[sel.materialCode] : undefined;
        items.push({ label: mat?.name || sel.name || 'Profil', code: sel.materialCode, detail: profiles.finish || '', imageUrl: mat?.imageUrl });
      });
    } else {
      const mat = profiles.materialCode ? materialsMap[profiles.materialCode] : undefined;
      items.push({ label: mat?.name || (profiles.type === 'compensation' ? 'Profil compensare' : 'Profil U'), code: profiles.materialCode, detail: profiles.finish || '', imageUrl: mat?.imageUrl });
    }
  }

  // Partition wall perimeter profile (from partitionWall.profileSelections, when profiles not already populated)
  if (!profiles && extraAccessories) {
    // Already merged into extraAccessories by OrderProcessingSheet — no extra action needed here
  }

  // Seals — prefer selections arrays
  if (seals) {
    if (seals.magnetic) {
      const sels = seals.magneticSelections || [];
      if (sels.length > 0) {
        sels.forEach(sel => { const mat = sel.materialCode ? materialsMap[sel.materialCode] : undefined; items.push({ label: mat?.name || sel.name || i18next.t('processing.lateralAccessories.magneticProfile'), code: sel.materialCode, detail: '1 ' + i18next.t('processing.pcs'), imageUrl: mat?.imageUrl }); });
      } else {
        const mat = seals.magneticCode ? materialsMap[seals.magneticCode] : undefined; items.push({ label: mat?.name || 'Etanșare magnetică', code: seals.magneticCode, imageUrl: mat?.imageUrl });
      }
    }
    if (seals.rubber) {
      const sels = seals.rubberSelections || [];
      if (sels.length > 0) {
        sels.forEach(sel => { const mat = sel.materialCode ? materialsMap[sel.materialCode] : undefined; items.push({ label: mat?.name || sel.name || 'Garnitură Cauciuc', code: sel.materialCode, detail: '1 ' + i18next.t('processing.pcs'), imageUrl: mat?.imageUrl }); });
      } else {
        const mat = seals.rubberCode ? materialsMap[seals.rubberCode] : undefined; items.push({ label: mat?.name || 'Etanșare cauciuc', code: seals.rubberCode, imageUrl: mat?.imageUrl });
      }
    }
    if (seals.threshold) {
      const sels = seals.thresholdSelections || [];
      if (sels.length > 0) {
        sels.forEach(sel => { const mat = sel.materialCode ? materialsMap[sel.materialCode] : undefined; items.push({ label: mat?.name || sel.name || i18next.t('processing.lateralAccessories.thresholdProfile'), code: sel.materialCode, detail: '1 ' + i18next.t('processing.pcs'), imageUrl: mat?.imageUrl }); });
      } else {
        const mat = seals.thresholdCode ? materialsMap[seals.thresholdCode] : undefined; items.push({ label: mat?.name || i18next.t('processing.lateralAccessories.threshold'), code: seals.thresholdCode, imageUrl: mat?.imageUrl });
      }
    }
  }

  // Stabilizers — prefer stabilizerSelections (with catalog data + exact lengths)
  const stabSels = stabilizerSelections || [];
  if (stabSels.length > 0) {
    stabSels.forEach(sel => {
      const mat = sel.materialCode ? materialsMap[sel.materialCode] : undefined;
      items.push({
        label: mat?.name || sel.name || 'Bară stabilizatoare',
        code: sel.materialCode,
        detail: ((sel.materialCode?.startsWith('35.') || sel.materialCode?.startsWith('72.')) && sel.length) ? `${sel.length} mm` : '1 ' + i18next.t('processing.pcs'),
        imageUrl: mat?.imageUrl,
      });
    });
  } else if (stabilizers && stabilizers.length > 0) {
    stabilizers.forEach(s => {
      const mat = s.materialCode ? materialsMap[s.materialCode] : undefined;
      const posLabel = getStabilizerPositionLabel(s.type);
      items.push({ label: mat?.name || `${i18next.t('orderPreview.stabilizerBar')} ${posLabel}`, code: s.materialCode, detail: `${s.length} mm`, imageUrl: mat?.imageUrl });
    });
  }

  if (lock?.enabled) { const mat = lock.materialCode ? materialsMap[lock.materialCode] : undefined; items.push({ label: mat?.name || `Broască ${lock.type}`, code: lock.materialCode, imageUrl: mat?.imageUrl }); }
  if (pivot) { const mat = pivot.materialCode ? materialsMap[pivot.materialCode] : undefined; items.push({ label: mat?.name || `Pivot ${pivot.type}`, code: pivot.materialCode, imageUrl: mat?.imageUrl }); }
  if (slidingSystem) { const mat = slidingSystem.materialCode ? materialsMap[slidingSystem.materialCode] : undefined; items.push({ label: mat?.name || 'Sistem glisare', code: slidingSystem.materialCode, detail: `Șină: ${slidingSystem.rail} · Role: ${slidingSystem.rollers}`, imageUrl: mat?.imageUrl }); }

  if (extraAccessories && extraAccessories.length > 0) {
    extraAccessories.forEach(e => {
      const mat = e.materialCode ? materialsMap[e.materialCode] : undefined;
      items.push({
        label: mat?.name || e.name || e.materialCode,
        code: e.materialCode,
        detail: e.detail || `${e.quantity} ${{ pcs: 'buc', lm: 'ml', sqm: 'm²', kg: 'kg', l: 'l' }[(e.unit as string) || 'pcs'] || 'buc'}`,
        imageUrl: mat?.imageUrl,
        colorHex: e.colorHex,
      });
    });
  }

  // Kit accesorii
  if (selectedKit) {
    const kitMat = selectedKit.code ? materialsMap[selectedKit.code] : undefined;
    items.push({
      label: kitMat?.name || selectedKit.name || 'Kit accesorii',
      code: selectedKit.code,
      detail: '1 kit',
      imageUrl: kitMat?.imageUrl || (selectedKit.imageUrl as string | null) || null,
    });
    if (selectedKit.items && selectedKit.items.length > 0) {
      selectedKit.items.forEach(ki => {
        const kiMat = ki.material_code ? materialsMap[ki.material_code] : undefined;
        items.push({
          label: kiMat?.name || ki.material_name,
          code: ki.material_code,
          detail: `${ki.quantity} buc`,
          imageUrl: kiMat?.imageUrl,
        });
      });
    }
  }

  const aggregatedItems = aggregateAccessories(items);
  if (aggregatedItems.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Accesorii</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {aggregatedItems.map((item, i) => <AccessoryCard key={i} {...item} />)}
      </div>
    </div>
  );
}

/* ── Info cell ── */
function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-muted-foreground text-[10px] leading-tight truncate">{label}</div>
      <div className="font-semibold text-xs leading-snug truncate">{value}</div>
    </div>
  );
}

/* ── Dimension line helpers (all BLUE) ── */

function DimensionLine({ x1, y1, x2, y2, label, extensionY1 }: {
  x1: number; y1: number; x2: number; y2: number; label: string; extensionY1: number;
}) {
  return (
    <g>
      <line x1={x1} y1={extensionY1} x2={x1} y2={y1 - 4} stroke={DIM_COLOR} strokeWidth={DIM_STROKE_THIN} />
      <line x1={x2} y1={extensionY1} x2={x2} y2={y2 - 4} stroke={DIM_COLOR} strokeWidth={DIM_STROKE_THIN} />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={DIM_COLOR} strokeWidth={DIM_STROKE_W} />
      <polygon points={`${x1},${y1} ${x1 + ARROW_SIZE},${y1 - ARROW_SIZE / 2} ${x1 + ARROW_SIZE},${y1 + ARROW_SIZE / 2}`} fill={DIM_COLOR} />
      <polygon points={`${x2},${y2} ${x2 - ARROW_SIZE},${y2 - ARROW_SIZE / 2} ${x2 - ARROW_SIZE},${y2 + ARROW_SIZE / 2}`} fill={DIM_COLOR} />
      <text x={(x1 + x2) / 2} y={y1 - 8} textAnchor="middle" fill={DIM_COLOR} fontSize={DIM_FONT_SIZE} fontWeight={DIM_FONT_WEIGHT} fontFamily="monospace">
        {label}
      </text>
    </g>
  );
}

function DimensionLineVertical({ x, y1, y2, label, extensionX }: {
  x: number; y1: number; y2: number; label: string; extensionX: number;
}) {
  return (
    <g>
      <line x1={extensionX} y1={y1} x2={x + 4} y2={y1} stroke={DIM_COLOR} strokeWidth={DIM_STROKE_THIN} />
      <line x1={extensionX} y1={y2} x2={x + 4} y2={y2} stroke={DIM_COLOR} strokeWidth={DIM_STROKE_THIN} />
      <line x1={x} y1={y1} x2={x} y2={y2} stroke={DIM_COLOR} strokeWidth={DIM_STROKE_W} />
      <polygon points={`${x},${y1} ${x - ARROW_SIZE / 2},${y1 + ARROW_SIZE} ${x + ARROW_SIZE / 2},${y1 + ARROW_SIZE}`} fill={DIM_COLOR} />
      <polygon points={`${x},${y2} ${x - ARROW_SIZE / 2},${y2 - ARROW_SIZE} ${x + ARROW_SIZE / 2},${y2 - ARROW_SIZE}`} fill={DIM_COLOR} />
      <text x={x + 16} y={(y1 + y2) / 2} textAnchor="middle" dominantBaseline="middle" fill={DIM_COLOR} fontSize={DIM_FONT_SIZE} fontWeight={DIM_FONT_WEIGHT} fontFamily="monospace" transform={`rotate(90, ${x + 16}, ${(y1 + y2) / 2})`}>
        {label}
      </text>
    </g>
  );
}

/* ── Hinge position dimension (from TOP, staggered on hinge side) ── */

/* ── Simple Glass Shape Drawing (for products without hinge cutouts) ── */

function SimpleGlassDrawing({
  width, height, thickness, glassType, shape, productType,
  edgePolish, processingInfo, quantity,
  panelCount, holeSpecs, cutoutSpecs, partitionGrid,
}: {
  width: number;
  height: number;
  thickness: number;
  glassType: string;
  shape?: string;
  productType?: string;
  edgePolish?: { enabled: boolean; type: string };
  processingInfo?: { holes: number; cutouts: number; bevel?: { enabled: boolean; width: number } };
  quantity?: number;
  panelCount?: number;
  holeSpecs?: Array<{ diameter: number; x: number; y: number }>;
  cutoutSpecs?: Array<{ width: number; height: number; x: number; y: number }>;
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
}) {
  // If partition wall grid exists, render the grid layout
  if (partitionGrid && partitionGrid.columns > 0) {
    return <PartitionGridDrawing grid={partitionGrid} thickness={thickness} glassType={glassType} />;
  }

  const padding = 80;
  const sideMargin = 100;
  const maxDrawW = 600;
  const maxDrawH = 500;

  const scale = Math.min(
    (maxDrawW - sideMargin * 2) / width,
    (maxDrawH - padding * 2) / height,
    0.6
  );

  const scaledW = width * scale;
  const scaledH = height * scale;
  const svgW = scaledW + sideMargin * 2 + 60;
  const svgH = scaledH + padding * 2 + 40;
  const x0 = sideMargin;
  const y0 = padding;

  const isCircle = shape === 'circle';
  const isOval = shape === 'oval';
  const isArch = shape === 'arch';
  const isRounded = shape === 'rounded';

  const fillColors: Record<string, string> = {
    clear: '#E0F2FE', frosted: '#F1F5F9', patterned: '#E2E8F0',
    bronze: '#D4A574', grey: '#94A3B8', timeless: '#A7D8C4',
    silver: '#C0C0C0', bronze_mirror: '#B87333', grey_mirror: '#808080',
  };
  const fill = fillColors[glassType] || '#E0F2FE';

  const hasBevel = processingInfo?.bevel?.enabled;
  const bevelW = hasBevel ? (processingInfo!.bevel!.width * scale) : 0;

  // Info text lines
  const infoLines: string[] = [];
  infoLines.push(`${glassType.toUpperCase()} · ${thickness}mm`);
  if (quantity && quantity > 1) infoLines.push(`× ${quantity} buc`);
  if (panelCount && panelCount > 1) infoLines.push(`${panelCount} panouri`);

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="mx-auto block max-w-full" style={{ maxHeight: 500 }}>
      {/* Glass shape */}
      {isCircle ? (
        <ellipse
          cx={x0 + scaledW / 2} cy={y0 + scaledH / 2}
          rx={Math.min(scaledW, scaledH) / 2} ry={Math.min(scaledW, scaledH) / 2}
          fill={fill} fillOpacity={0.3} stroke={DOOR_STROKE} strokeWidth={1.5}
        />
      ) : isOval ? (
        <ellipse
          cx={x0 + scaledW / 2} cy={y0 + scaledH / 2}
          rx={scaledW / 2} ry={scaledH / 2}
          fill={fill} fillOpacity={0.3} stroke={DOOR_STROKE} strokeWidth={1.5}
        />
      ) : isArch ? (
        <path
          d={`M ${x0} ${y0 + scaledH} L ${x0} ${y0 + scaledW / 2} A ${scaledW / 2} ${scaledW / 2} 0 0 1 ${x0 + scaledW} ${y0 + scaledW / 2} L ${x0 + scaledW} ${y0 + scaledH} Z`}
          fill={fill} fillOpacity={0.3} stroke={DOOR_STROKE} strokeWidth={1.5}
        />
      ) : (
        <rect
          x={x0} y={y0} width={scaledW} height={scaledH}
          rx={isRounded ? 12 * scale : 0} ry={isRounded ? 12 * scale : 0}
          fill={fill} fillOpacity={0.3} stroke={DOOR_STROKE} strokeWidth={1.5}
        />
      )}

      {/* Bevel indicator */}
      {hasBevel && !isCircle && !isOval && (
        <rect
          x={x0 + bevelW} y={y0 + bevelW}
          width={scaledW - 2 * bevelW} height={scaledH - 2 * bevelW}
          fill="none" stroke="#94A3B8" strokeWidth={0.8} strokeDasharray="4,3"
        />
      )}

      {/* Actual holes at real positions */}
      {holeSpecs && holeSpecs.map((h, i) => {
        const cx = x0 + h.x * scale;
        const cy = y0 + h.y * scale;
        const r = (h.diameter / 2) * scale;
        return (
          <g key={`hole-spec-${i}`}>
            <circle cx={cx} cy={cy} r={Math.max(r, 3)} fill="white" stroke={DOOR_STROKE} strokeWidth={1} />
            <line x1={cx - Math.max(r, 3) * 0.7} y1={cy} x2={cx + Math.max(r, 3) * 0.7} y2={cy} stroke={DOOR_STROKE} strokeWidth={0.5} />
            <line x1={cx} y1={cy - Math.max(r, 3) * 0.7} x2={cx} y2={cy + Math.max(r, 3) * 0.7} stroke={DOOR_STROKE} strokeWidth={0.5} />
            {/* Position label */}
            <text x={cx} y={cy + Math.max(r, 3) + 10} textAnchor="middle" fill={DIM_COLOR} fontSize={8} fontFamily="monospace">
              Ø{h.diameter}
            </text>
          </g>
        );
      })}

      {/* Fallback: if no holeSpecs but processingInfo has holes, show generic markers */}
      {!holeSpecs && processingInfo && processingInfo.holes > 0 && (() => {
        const count = processingInfo.holes;
        const inset = 30 * scale;
        const positions: Array<{ cx: number; cy: number }> = [];
        if (count >= 1) positions.push({ cx: x0 + inset, cy: y0 + inset });
        if (count >= 2) positions.push({ cx: x0 + scaledW - inset, cy: y0 + inset });
        if (count >= 3) positions.push({ cx: x0 + inset, cy: y0 + scaledH - inset });
        if (count >= 4) positions.push({ cx: x0 + scaledW - inset, cy: y0 + scaledH - inset });
        return positions.map((h, i) => (
          <g key={`hole-generic-${i}`}>
            <circle cx={h.cx} cy={h.cy} r={5 * scale} fill="none" stroke={DOOR_STROKE} strokeWidth={1} />
            <line x1={h.cx - 3 * scale} y1={h.cy} x2={h.cx + 3 * scale} y2={h.cy} stroke={DOOR_STROKE} strokeWidth={0.5} />
            <line x1={h.cx} y1={h.cy - 3 * scale} x2={h.cx} y2={h.cy + 3 * scale} stroke={DOOR_STROKE} strokeWidth={0.5} />
          </g>
        ));
      })()}

      {/* Actual cutouts at real positions */}
      {cutoutSpecs && cutoutSpecs.map((c, i) => {
        const cx = x0 + c.x * scale;
        const cy = y0 + c.y * scale;
        const cw = c.width * scale;
        const ch = c.height * scale;
        return (
          <g key={`cutout-spec-${i}`}>
            <rect
              x={cx - cw / 2} y={cy - ch / 2}
              width={cw} height={ch}
              fill="white" fillOpacity={0.8}
              stroke={DOOR_STROKE} strokeWidth={1}
            />
            {/* Dimension labels inside cutout */}
            <text x={cx} y={cy - 2} textAnchor="middle" dominantBaseline="auto" fill={DIM_COLOR} fontSize={7} fontFamily="monospace">
              {c.width}×{c.height}
            </text>
          </g>
        );
      })}

      {/* Edge polish indicator */}
      {edgePolish?.enabled && !isCircle && !isOval && (
        <rect
          x={x0 - 2} y={y0 - 2}
          width={scaledW + 4} height={scaledH + 4}
          fill="none" stroke="#2563EB" strokeWidth={2} strokeDasharray="8,4"
          rx={isRounded ? 14 * scale : 0}
        />
      )}

      {/* Info text centered */}
      {infoLines.map((line, i) => (
        <text
          key={`info-${i}`}
          x={x0 + scaledW / 2}
          y={y0 + scaledH / 2 - ((infoLines.length - 1) * 8) + i * 16}
          textAnchor="middle" dominantBaseline="middle"
          fill="#64748B" fontSize={i === 0 ? 11 : 10} fontFamily="sans-serif"
        >
          {line}
        </text>
      ))}

      {/* Width dimension */}
      <DimensionLine
        x1={x0} y1={y0 - 25} x2={x0 + scaledW} y2={y0 - 25}
        label={`${width}`} extensionY1={y0}
      />
      {/* Height dimension */}
      <DimensionLineVertical
        x={x0 + scaledW + 30}
        y1={y0} y2={y0 + scaledH}
        label={`${height}`}
        extensionX={x0 + scaledW}
      />
    </svg>
  );
}

/* ── Partition Wall Grid Drawing ── */

function PartitionGridDrawing({ grid, thickness, glassType }: {
  grid: NonNullable<ProcessingSheetViewerProps['partitionGrid']>;
  thickness: number;
  glassType: string;
}) {
  const padding = 80;
  const sideMargin = 100;
  const maxDrawW = 800;
  const maxDrawH = 500;
  const profileGap = 4; // gap between cells (profile width visual)

  const totalW = grid.totalWidth;
  const totalH = grid.totalHeight;

  const scale = Math.min(
    (maxDrawW - sideMargin * 2) / totalW,
    (maxDrawH - padding * 2) / totalH,
    0.5
  );

  const scaledTotalW = totalW * scale;
  const scaledTotalH = totalH * scale;
  const svgW = scaledTotalW + sideMargin * 2 + 80;
  const svgH = scaledTotalH + padding * 2 + 40;
  const x0 = sideMargin;
  const y0 = padding;

  const fillColors: Record<string, string> = {
    clear: '#E0F2FE', frosted: '#F1F5F9', patterned: '#E2E8F0',
    bronze: '#D4A574', grey: '#94A3B8', timeless: '#A7D8C4',
  };
  const fill = fillColors[glassType] || '#E0F2FE';

  // Build cells
  const cells: Array<{ x: number; y: number; w: number; h: number; col: number; row: number; isDoor: boolean; hingeSide?: string; handle?: typeof grid.doors extends Array<infer D> ? D extends { handle?: infer H } ? H : undefined : undefined }> = [];
  let colX = 0;
  for (let col = 0; col < grid.columns; col++) {
    const colW = grid.columnWidths[col] || 500;
    const rowCount = grid.columnRows[col] || 1;
    const rowHeights = grid.columnRowHeights[col] || [totalH];
    let rowY = 0;
    for (let row = 0; row < rowCount; row++) {
      const rowH = rowHeights[row] || totalH / rowCount;
      const door = grid.doors?.find(d => d.col === col && d.row === row);
      cells.push({
        x: colX, y: rowY, w: colW, h: rowH,
        col, row,
        isDoor: !!door,
        hingeSide: door?.hingeSide,
        handle: door?.handle,
      });
      rowY += rowH;
    }
    colX += colW;
  }

  return (
    <>
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="mx-auto block max-w-full" style={{ maxHeight: 500 }}>
      {/* Outer frame */}
      <rect
        x={x0} y={y0} width={scaledTotalW} height={scaledTotalH}
        fill="none" stroke={DOOR_STROKE} strokeWidth={1.5}
      />

      {/* Individual cells */}
      {cells.map((cell, i) => {
        const cx = x0 + cell.x * scale + profileGap / 2;
        const cy = y0 + cell.y * scale + profileGap / 2;
        const cw = cell.w * scale - profileGap;
        const ch = cell.h * scale - profileGap;
        return (
          <g key={`cell-${i}`}>
            <rect
              x={cx} y={cy} width={cw} height={ch}
              fill={fill} fillOpacity={0.3}
              stroke={DOOR_STROKE} strokeWidth={1}
            />
            {/* Door indicator */}
            {cell.isDoor && (
              <>
                {/* Door arc */}
                <path
                  d={cell.hingeSide === 'right'
                    ? `M ${cx + cw} ${cy + ch} A ${cw * 0.4} ${cw * 0.4} 0 0 1 ${cx + cw - cw * 0.4} ${cy + ch}`
                    : `M ${cx} ${cy + ch} A ${cw * 0.4} ${cw * 0.4} 0 0 0 ${cx + cw * 0.4} ${cy + ch}`
                  }
                  fill="none" stroke="#64748B" strokeWidth={0.8} strokeDasharray="4,2"
                />
                <text
                  x={cx + cw / 2} y={cy + ch / 2}
                  textAnchor="middle" dominantBaseline="middle"
                  fill="#1E40AF" fontSize={9} fontWeight="bold" fontFamily="sans-serif"
                >
                  UȘĂ
                </text>
              </>
            )}
            {/* Handle cutouts on door cells */}
            {cell.isDoor && cell.handle && (
              <PartitionDoorHandleCutouts
                cellX={cx} cellY={cy} cellW={cw} cellH={ch}
                cellRealW={cell.w} cellRealH={cell.h}
                handle={cell.handle}
                isHingeLeft={cell.hingeSide !== 'right'}
                scale={scale}
              />
            )}
            {/* Cell dimensions */}
            <text
              x={cx + cw / 2} y={cy + ch / 2 + (cell.isDoor ? 12 : 0)}
              textAnchor="middle" dominantBaseline="middle"
              fill="#64748B" fontSize={8} fontFamily="monospace"
            >
              {Math.round(cell.w)}×{Math.round(cell.h)}
            </text>
          </g>
        );
      })}

      {/* Glass info */}
      <text
        x={x0 + scaledTotalW / 2} y={y0 + scaledTotalH + 25}
        textAnchor="middle" fill="#64748B" fontSize={10} fontFamily="sans-serif"
      >
        {glassType.toUpperCase()} · {thickness}mm · {cells.length} panouri
      </text>

      {/* Total width dimension */}
      <DimensionLine
        x1={x0} y1={y0 - 25} x2={x0 + scaledTotalW} y2={y0 - 25}
        label={`${totalW}`} extensionY1={y0}
      />
      {/* Total height dimension */}
      <DimensionLineVertical
        x={x0 + scaledTotalW + 30}
        y1={y0} y2={y0 + scaledTotalH}
        label={`${totalH}`}
        extensionX={x0 + scaledTotalW}
      />

      {/* Individual column widths */}
      {grid.columns > 1 && (() => {
        let cx = 0;
        return grid.columnWidths.map((w, i) => {
          const sx = x0 + cx * scale;
          const sw = w * scale;
          cx += w;
          return (
            <DimensionLine
              key={`col-dim-${i}`}
              x1={sx} y1={y0 - 8} x2={sx + sw} y2={y0 - 8}
              label={`${w}`} extensionY1={y0}
            />
          );
        });
      })()}
    </svg>
    {/* Side panel grids rendered below main grid */}
    {grid.sidePanels && Object.entries(grid.sidePanels).map(([side, sp]) => {
      if (!sp || !sp.grid) return null;
      const sideLabel = side === 'left' ? 'Panou lateral stânga' : 'Panou lateral dreapta';
      const spGrid = sp.grid;
      const spTotalW = sp.width;
      const spTotalH = sp.height;
      const spScale = Math.min(
        (maxDrawW - sideMargin * 2) / spTotalW,
        (maxDrawH - padding * 2) / spTotalH,
        0.5
      );
      const spScaledW = spTotalW * spScale;
      const spScaledH = spTotalH * spScale;
      const spSvgW = spScaledW + sideMargin * 2 + 80;
      const spSvgH = spScaledH + padding * 2 + 60;
      const spX0 = sideMargin;
      const spY0 = padding + 20;

      // Build side panel cells
      const spCells: Array<{ x: number; y: number; w: number; h: number }> = [];
      let spColX = 0;
      for (let col = 0; col < spGrid.columns; col++) {
        const colW = spGrid.columnWidths[col] || sp.width;
        const rowCount = spGrid.columnRows[col] || 1;
        const rowHeights = spGrid.columnRowHeights[col] || [spTotalH];
        let rowY = 0;
        for (let row = 0; row < rowCount; row++) {
          const rowH = rowHeights[row] || spTotalH / rowCount;
          spCells.push({ x: spColX, y: rowY, w: colW, h: rowH });
          rowY += rowH;
        }
        spColX += colW;
      }

      return (
        <svg key={`sp-${side}`} viewBox={`0 0 ${spSvgW} ${spSvgH}`} className="mx-auto block max-w-full mt-4" style={{ maxHeight: 400 }}>
          {/* Label */}
          <text x={spX0} y={16} fill="#475569" fontSize={11} fontWeight="bold" fontFamily="sans-serif">
            {sideLabel}
          </text>
          {/* Outer frame */}
          <rect x={spX0} y={spY0} width={spScaledW} height={spScaledH} fill="none" stroke={DOOR_STROKE} strokeWidth={1.5} />
          {/* Cells */}
          {spCells.map((cell, i) => {
            const cx = spX0 + cell.x * spScale + profileGap / 2;
            const cy = spY0 + cell.y * spScale + profileGap / 2;
            const cw = cell.w * spScale - profileGap;
            const ch = cell.h * spScale - profileGap;
            return (
              <g key={`sp-cell-${i}`}>
                <rect x={cx} y={cy} width={cw} height={ch} fill={fill} fillOpacity={0.3} stroke={DOOR_STROKE} strokeWidth={1} />
                <text x={cx + cw / 2} y={cy + ch / 2} textAnchor="middle" dominantBaseline="middle" fill="#64748B" fontSize={8} fontFamily="monospace">
                  {Math.round(cell.w)}×{Math.round(cell.h)}
                </text>
              </g>
            );
          })}
          {/* Total width */}
          <DimensionLine x1={spX0} y1={spY0 - 25} x2={spX0 + spScaledW} y2={spY0 - 25} label={`${spTotalW}`} extensionY1={spY0} />
          {/* Total height */}
          <DimensionLineVertical x={spX0 + spScaledW + 30} y1={spY0} y2={spY0 + spScaledH} label={`${spTotalH}`} extensionX={spX0 + spScaledW} />
        </svg>
      );
    })}
    </>
  );
}

/* ── Balustrade Layout Drawing ── */

/* ── Handle cutouts on partition wall door cells ── */

function PartitionDoorHandleCutouts({ cellX, cellY, cellW, cellH, cellRealW, cellRealH, handle, isHingeLeft, scale }: {
  cellX: number; cellY: number; cellW: number; cellH: number;
  cellRealW: number; cellRealH: number;
  handle: { model: string; length: number; materialCode: string; positionY: number; finish?: string };
  isHingeLeft: boolean;
  scale: number;
}) {
  const { data: template } = useProcessingLookup(handle.materialCode);
  const cutouts = parseTemplateCutouts(template ?? undefined);

  if (cutouts.length === 0 && !handle.length) return null;

  const handleInset = 50;
  const edgeX = isHingeLeft ? cellX + cellW : cellX;
  const insetPx = handleInset * scale;
  const handleX = isHingeLeft ? edgeX - insetPx : edgeX + insetPx;
  const handleCenterY = cellY + cellH - handle.positionY * scale;
  const halfLen = (handle.length * scale) / 2;

  return (
    <g>
      {cutouts.map((cutout, i) => {
        const cx = handleX + cutout.x * scale;
        const cy = handleCenterY - cutout.y * scale;

        if (cutout.shape === 'circle') {
          const r = (cutout.diameter / 2) * scale;
          return (
            <g key={`pw-handle-${i}`}>
              <circle cx={cx} cy={cy} r={r} fill={DIM_COLOR} fillOpacity={0.15} stroke={DIM_COLOR} strokeWidth={1.5} />
              <line x1={cx - r * 0.4} y1={cy} x2={cx + r * 0.4} y2={cy} stroke={DIM_COLOR} strokeWidth={0.8} />
              <line x1={cx} y1={cy - r * 0.4} x2={cx} y2={cy + r * 0.4} stroke={DIM_COLOR} strokeWidth={0.8} />
            </g>
          );
        }
        if (cutout.shape === 'stadium') {
          const sw = cutout.width * scale;
          const sh = cutout.height * scale;
          const rx = Math.min(sh / 2, sw / 2);
          return (
            <rect key={`pw-handle-${i}`} x={cx - sw / 2} y={cy - sh / 2} width={sw} height={sh} rx={rx}
              fill={DIM_COLOR} fillOpacity={0.15} stroke={DIM_COLOR} strokeWidth={1.5} />
          );
        }
        if (cutout.shape === 'rect') {
          const sw = cutout.width * scale;
          const sh = cutout.height * scale;
          return (
            <rect key={`pw-handle-${i}`} x={cx - sw / 2} y={cy - sh / 2} width={sw} height={sh}
              fill={DIM_COLOR} fillOpacity={0.15} stroke={DIM_COLOR} strokeWidth={1.5} />
          );
        }
        if (cutout.shape === 'slot') {
          const sl = cutout.slotLength * scale;
          const sr = cutout.radius * scale;
          return (
            <rect key={`pw-handle-${i}`} x={cx - sl / 2} y={cy - sr} width={sl} height={sr * 2} rx={sr}
              fill={DIM_COLOR} fillOpacity={0.15} stroke={DIM_COLOR} strokeWidth={1.5} />
          );
        }
        return null;
      })}
    </g>
  );
}

function BalustradeLayoutDrawing({ layout }: {
  layout: NonNullable<ProcessingSheetViewerProps['balustradeLayout']>;
}) {
  const padding = 60;
  const sideMargin = 80;
  const verticalGap = 28; // gap between stacked panels
  const maxDrawW = 700;

  const isStairs = layout.placement === 'stairs' && layout.stairsConfig;
  const sc = layout.stairsConfig;

  // Build panel definitions
  interface PanelDef {
    label: string;
    widthMm: number;
    heightMm: number;
    isParallelogram: boolean;
    angle: number;
    section: string;
  }
  const panels: PanelDef[] = [];

  if (isStairs && sc) {
    const ramp1Count = sc.hasIntermediateLanding ? (sc.ramp1PanelCount || layout.panelCount) : layout.panelCount;
    const ramp1TotalSteps = sc.hasIntermediateLanding ? sc.landingPosition : (layout.length / sc.stepDepth);
    const ramp1TotalWidth = ramp1TotalSteps * sc.stepDepth;
    const ramp1PanelW = ramp1Count > 0 ? Math.round(ramp1TotalWidth / ramp1Count) : ramp1TotalWidth;

    for (let i = 0; i < ramp1Count; i++) {
      panels.push({
        label: `R1-P${i + 1}`,
        widthMm: ramp1PanelW,
        heightMm: sc.stairPanelHeight,
        isParallelogram: true,
        angle: sc.angle,
        section: 'ramp1',
      });
    }

    if (sc.hasIntermediateLanding && sc.landingLength > 0) {
      panels.push({
        label: i18next.t('processing.balustradeLabels.landing'),
        widthMm: sc.landingLength,
        heightMm: sc.intermediateLandingPanelHeight,
        isParallelogram: false,
        angle: 0,
        section: 'landing',
      });
    }

    if (sc.hasIntermediateLanding && sc.ramp2PanelCount > 0) {
      const totalSteps = Math.round(layout.length / sc.stepDepth);
      const ramp2Steps = totalSteps - (sc.landingPosition || 0);
      const ramp2TotalWidth = ramp2Steps * sc.stepDepth;
      const ramp2PanelW = sc.ramp2PanelCount > 0 ? Math.round(ramp2TotalWidth / sc.ramp2PanelCount) : ramp2TotalWidth;

      for (let i = 0; i < sc.ramp2PanelCount; i++) {
        panels.push({
          label: `R2-P${i + 1}`,
          widthMm: ramp2PanelW,
          heightMm: sc.stairPanelHeight,
          isParallelogram: true,
          angle: sc.angle,
          section: 'ramp2',
        });
      }
    }

    if (sc.finalLandingLength > 0) {
      panels.push({
        label: i18next.t('processing.balustradeLabels.finalLanding'),
        widthMm: sc.finalLandingLength,
        heightMm: sc.finalLandingPanelHeight,
        isParallelogram: false,
        angle: 0,
        section: 'final_landing',
      });
    }
  } else {
    const corners = layout.corners;

    if (corners?.left?.enabled) {
      const leftCount = corners.left.panelCount || 1;
      const leftPanelW = Math.round(corners.left.length / leftCount);
      for (let i = 0; i < leftCount; i++) {
        panels.push({
          label: `CS-P${i + 1}`,
          widthMm: leftPanelW,
          heightMm: layout.height,
          isParallelogram: false,
          angle: 0,
          section: 'corner_left',
        });
      }
    }

    const frontCount = layout.panelCount || 1;
    const frontPanelW = Math.round(layout.length / frontCount);
    for (let i = 0; i < frontCount; i++) {
      panels.push({
        label: `P${i + 1}`,
        widthMm: frontPanelW,
        heightMm: layout.height,
        isParallelogram: false,
        angle: 0,
        section: 'front',
      });
    }

    if (corners?.right?.enabled) {
      const rightCount = corners.right.panelCount || 1;
      const rightPanelW = Math.round(corners.right.length / rightCount);
      for (let i = 0; i < rightCount; i++) {
        panels.push({
          label: `CD-P${i + 1}`,
          widthMm: rightPanelW,
          heightMm: layout.height,
          isParallelogram: false,
          angle: 0,
          section: 'corner_right',
        });
      }
    }
  }

  if (panels.length === 0) return null;

  // Vertical layout: scale based on the widest panel
  const maxPanelW = Math.max(...panels.map(p => p.widthMm));
  const scale = Math.min((maxDrawW - sideMargin * 2) / maxPanelW, 0.35);

  // Calculate total SVG height: sum of all scaled panel heights + gaps + padding + section separators
  const sectionLabels: Record<string, string> = {
    corner_left: i18next.t('processing.balustradeLabels.cornerLeft'),
    front: i18next.t('processing.balustradeLabels.front'),
    corner_right: i18next.t('processing.balustradeLabels.cornerRight'),
    ramp1: i18next.t('processing.balustradeLabels.ramp1'),
    landing: i18next.t('processing.balustradeLabels.intermediateLanding'),
    ramp2: i18next.t('processing.balustradeLabels.ramp2'),
    final_landing: i18next.t('processing.balustradeLabels.finalLanding'),
  };

  const fillColors: Record<string, string> = {
    clear: '#E0F2FE', frosted: '#F1F5F9', bronze: '#D4A574', grey: '#94A3B8',
  };
  const fill = fillColors[layout.glassType] || '#E0F2FE';

  // Pre-calculate heights for each panel (including rise for parallelograms)
  const panelScaledHeights = panels.map(p => {
    const sh = p.heightMm * scale;
    if (p.isParallelogram && p.angle > 0) {
      const rise = p.widthMm * Math.tan((p.angle * Math.PI) / 180) * scale;
      return sh + rise;
    }
    return sh;
  });

  // Count section separators
  let sectionSeparatorCount = 0;
  for (let i = 1; i < panels.length; i++) {
    if (panels[i].section !== panels[i - 1].section) sectionSeparatorCount++;
  }

  const totalPanelHeight = panelScaledHeights.reduce((s, h) => s + h, 0);
  const totalGaps = (panels.length - 1) * verticalGap + sectionSeparatorCount * 20;
  const svgH = totalPanelHeight + totalGaps + padding * 2 + 40; // +40 for glass info at bottom
  const svgW = maxDrawW;
  const centerX = svgW / 2;

  let curY = padding;

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="mx-auto block max-w-full" style={{ maxHeight: 800 }}>
      {panels.map((panel, idx) => {
        const sw = panel.widthMm * scale;
        const sh = panel.heightMm * scale;

        // Section separator
        const prevSection = idx > 0 ? panels[idx - 1].section : null;
        const showSeparator = prevSection && prevSection !== panel.section;

        const elements: JSX.Element[] = [];

        if (showSeparator) {
          // Dashed horizontal separator line with section label
          elements.push(
            <g key={`sep-${idx}`}>
              <line
                x1={sideMargin} y1={curY - verticalGap / 2}
                x2={svgW - sideMargin} y2={curY - verticalGap / 2}
                stroke="#94A3B8" strokeWidth={1} strokeDasharray="4,3"
              />
              <text
                x={sideMargin - 5} y={curY - verticalGap / 2 + 4}
                textAnchor="end" fill="#64748B" fontSize={8} fontFamily="sans-serif" fontStyle="italic"
              >
                {sectionLabels[panel.section] || panel.section}
              </text>
            </g>
          );
          curY += 20; // extra space after separator
        } else if (idx === 0) {
          // First section label
          elements.push(
            <text key={`section-first`}
              x={sideMargin - 5} y={curY + 4}
              textAnchor="end" fill="#64748B" fontSize={8} fontFamily="sans-serif" fontStyle="italic"
            >
              {sectionLabels[panel.section] || panel.section}
            </text>
          );
        }

        const panelX = centerX - sw / 2;

        if (panel.isParallelogram && panel.angle > 0) {
          const rise = panel.widthMm * Math.tan((panel.angle * Math.PI) / 180) * scale;
          // Draw parallelogram: top-left, top-right (shifted up by rise), bottom-right, bottom-left (shifted down)
          const points = [
            `${panelX},${curY + rise}`,                // top-left (lower)
            `${panelX + sw},${curY}`,                  // top-right (higher)
            `${panelX + sw},${curY + sh}`,             // bottom-right
            `${panelX},${curY + sh + rise}`,           // bottom-left (lower)
          ].join(' ');

          const panelTotalH = sh + rise;

          elements.push(
            <g key={`panel-${idx}`}>
              <polygon points={points} fill={fill} fillOpacity={0.3} stroke={DOOR_STROKE} strokeWidth={1.5} />
              {/* Label centered */}
              <text
                x={centerX} y={curY + panelTotalH / 2}
                textAnchor="middle" dominantBaseline="middle"
                fill="#475569" fontSize={11} fontWeight="bold" fontFamily="sans-serif"
              >
                {panel.label}
              </text>
              {/* Dimensions text */}
              <text
                x={centerX} y={curY + panelTotalH / 2 + 14}
                textAnchor="middle" dominantBaseline="middle"
                fill="#64748B" fontSize={9} fontFamily="monospace"
              >
                {panel.widthMm} × {panel.heightMm}
              </text>
              {/* Width dimension below panel */}
              <DimensionLine
                x1={panelX} y1={curY + panelTotalH + 14}
                x2={panelX + sw} y2={curY + panelTotalH + 14}
                label={`${panel.widthMm}`}
                extensionY1={curY + panelTotalH}
              />
              {/* Height dimension on left */}
              <DimensionLineVertical
                x={panelX - 25}
                y1={curY + rise} y2={curY + sh + rise}
                label={`${panel.heightMm}`}
                extensionX={panelX}
              />
              {/* Angle indicator */}
              <text
                x={panelX + sw + 10} y={curY + panelTotalH / 2}
                fill="#64748B" fontSize={8} fontFamily="sans-serif"
                dominantBaseline="middle"
              >
                ∠ {panel.angle.toFixed(1)}°
              </text>
            </g>
          );

          curY += panelTotalH + verticalGap;
        } else {
          // Rectangle panel
          elements.push(
            <g key={`panel-${idx}`}>
              <rect
                x={panelX} y={curY} width={sw} height={sh}
                fill={fill} fillOpacity={0.3} stroke={DOOR_STROKE} strokeWidth={1.5}
              />
              {/* Label centered */}
              <text
                x={centerX} y={curY + sh / 2}
                textAnchor="middle" dominantBaseline="middle"
                fill="#475569" fontSize={11} fontWeight="bold" fontFamily="sans-serif"
              >
                {panel.label}
              </text>
              {/* Dimensions text */}
              <text
                x={centerX} y={curY + sh / 2 + 14}
                textAnchor="middle" dominantBaseline="middle"
                fill="#64748B" fontSize={9} fontFamily="monospace"
              >
                {panel.widthMm} × {panel.heightMm}
              </text>
              {/* Width dimension below */}
              <DimensionLine
                x1={panelX} y1={curY + sh + 14}
                x2={panelX + sw} y2={curY + sh + 14}
                label={`${panel.widthMm}`}
                extensionY1={curY + sh}
              />
              {/* Height dimension on left */}
              <DimensionLineVertical
                x={panelX - 25}
                y1={curY} y2={curY + sh}
                label={`${panel.heightMm}`}
                extensionX={panelX}
              />
            </g>
          );

          curY += sh + verticalGap;
        }

        return elements;
      })}

      {/* Glass info centered at bottom */}
      <text
        x={centerX} y={curY + 10}
        textAnchor="middle" fill="#64748B" fontSize={10} fontFamily="sans-serif"
      >
        {layout.glassType.toUpperCase()} · {layout.thickness}mm · {panels.length} panouri
      </text>
    </svg>
  );
}

function PositionDimension({ doorX, doorY, doorW, doorH, cy, posFromTop, isLeft, index }: {
  doorX: number; doorY: number; doorW: number; doorH: number;
  cy: number; posFromTop: number; isLeft: boolean; index: number;
}) {
  const topY = doorY;
  // Hinge dims on the hinge side, staggered outward
  const xOffset = isLeft ? doorX - 25 - index * 28 : doorX + doorW + 25 + index * 28;

  return (
    <g>
      {/* Extension line from door edge to dimension line */}
      <line x1={isLeft ? doorX : doorX + doorW} y1={cy} x2={xOffset} y2={cy} stroke={DIM_COLOR} strokeWidth={DIM_STROKE_THIN} strokeDasharray="3,2" />
      {/* Extension line from top */}
      <line x1={isLeft ? doorX : doorX + doorW} y1={topY} x2={xOffset} y2={topY} stroke={DIM_COLOR} strokeWidth={DIM_STROKE_THIN} strokeDasharray="3,2" />
      {/* Vertical dimension line from top to hinge center */}
      <line x1={xOffset} y1={topY} x2={xOffset} y2={cy} stroke={DIM_COLOR} strokeWidth={DIM_STROKE_W} />
      {/* Arrow at top */}
      <polygon points={`${xOffset},${topY} ${xOffset - ARROW_SIZE / 2},${topY + ARROW_SIZE} ${xOffset + ARROW_SIZE / 2},${topY + ARROW_SIZE}`} fill={DIM_COLOR} />
      {/* Arrow at hinge center */}
      <polygon points={`${xOffset},${cy} ${xOffset - ARROW_SIZE / 2},${cy - ARROW_SIZE} ${xOffset + ARROW_SIZE / 2},${cy - ARROW_SIZE}`} fill={DIM_COLOR} />
      {/* Label */}
      <text x={xOffset - 6} y={(topY + cy) / 2} textAnchor="end" dominantBaseline="middle" fill={DIM_COLOR} fontSize={DIM_FONT_SIZE_SM} fontWeight={DIM_FONT_WEIGHT} fontFamily="monospace">
        {posFromTop}
      </text>
    </g>
  );
}

/* ── Door path with hinge cutouts ── */

function buildDoorPath(
  doorX: number, doorY: number, scaledW: number, scaledH: number,
  positions: number[], scale: number,
  scaledCutoutW: number, scaledCutoutH: number, scaledOffset: number,
  isLeft: boolean, scaledCircleR: number,
  scaledHL?: number, scaledHR?: number
): string {
  const cr = Math.max(3.5 * scale, 2);
  const r = scaledCircleR; // small radius for inner corners of hinge slots
  const isTrapezoid = scaledHL !== undefined && scaledHR !== undefined && Math.abs(scaledHL - scaledHR) > 0.5;
  const maxH = isTrapezoid ? Math.max(scaledHL!, scaledHR!) : scaledH;
  // Top edge Y positions: bottom-aligned at doorY + maxH
  const bottomY = doorY + maxH;
  const topLeftY = isTrapezoid ? bottomY - scaledHL! : doorY;
  const topRightY = isTrapezoid ? bottomY - scaledHR! : doorY;

  // Sort hinge positions
  const sorted = [...positions].map(p => {
    // Hinge positions are from top — in trapezoid mode, measured from the hinge-side top
    const hingeTopY = isLeft ? topLeftY : topRightY;
    const cy = hingeTopY + p * scale;
    return { top: cy - scaledCutoutH / 2, bottom: cy + scaledCutoutH / 2 };
  });

  if (isLeft) {
    // Sort descending (bottom to top) for left-side traversal
    sorted.sort((a, b) => b.top - a.top);
    const innerX = doorX + scaledCutoutW;

    // Start: top-left corner
    let d = `M ${doorX},${topLeftY}`;
    // Top edge (may be sloped for trapezoid)
    d += ` L ${doorX + scaledW},${topRightY}`;
    // Bottom-right corner
    d += ` L ${doorX + scaledW},${bottomY}`;
    // Bottom-left corner
    d += ` L ${doorX},${bottomY}`;

    // Traverse hinges bottom-to-top
    for (const h of sorted) {
      d += ` L ${doorX},${h.bottom + r}`;
      d += ` A ${r},${r} 0 0,1 ${doorX + r},${h.bottom}`;
      d += ` L ${innerX - r},${h.bottom}`;
      d += ` A ${r},${r} 0 0,0 ${innerX},${h.bottom - r}`;
      d += ` L ${innerX},${h.top + r}`;
      d += ` A ${r},${r} 0 0,0 ${innerX - r},${h.top}`;
      d += ` L ${doorX + r},${h.top}`;
      d += ` A ${r},${r} 0 0,1 ${doorX},${h.top - r}`;
    }

    d += ' Z';
    return d;
  } else {
    // Sort ascending (top to bottom) for right-side traversal
    sorted.sort((a, b) => a.top - b.top);
    const innerX = doorX + scaledW - scaledCutoutW;

    // Start: top-left corner
    let d = `M ${doorX},${topLeftY}`;
    // Top edge (may be sloped)
    d += ` L ${doorX + scaledW},${topRightY}`;

    // Traverse hinges top-to-bottom
    for (const h of sorted) {
      d += ` L ${doorX + scaledW},${h.top - r}`;
      d += ` A ${r},${r} 0 0,0 ${doorX + scaledW - r},${h.top}`;
      d += ` L ${innerX + r},${h.top}`;
      d += ` A ${r},${r} 0 0,1 ${innerX},${h.top + r}`;
      d += ` L ${innerX},${h.bottom - r}`;
      d += ` A ${r},${r} 0 0,1 ${innerX + r},${h.bottom}`;
      d += ` L ${doorX + scaledW - r},${h.bottom}`;
      d += ` A ${r},${r} 0 0,0 ${doorX + scaledW},${h.bottom + r}`;
    }

    // Bottom-right corner
    d += ` L ${doorX + scaledW},${bottomY}`;
    // Bottom-left corner
    d += ` L ${doorX},${bottomY}`;
    d += ' Z';
    return d;
  }
}

/* ── Fixed panel path with hinge cutouts ── */

function buildFixedPanelPath(
  panelX: number, panelY: number, panelW: number, panelH: number,
  positions: number[], scale: number,
  scaledCutoutW: number, scaledCutoutH: number, _scaledOffset: number,
  cutoutSide: 'left' | 'right', scaledCircleR: number,
  scaledHL?: number, scaledHR?: number
): string {
  const r = scaledCircleR;
  const isTrapezoid = scaledHL !== undefined && scaledHR !== undefined && Math.abs(scaledHL - scaledHR) > 0.5;
  const maxH = isTrapezoid ? Math.max(scaledHL!, scaledHR!) : panelH;
  const bottomY = panelY + maxH;
  const topLeftY = isTrapezoid ? bottomY - scaledHL! : panelY;
  const topRightY = isTrapezoid ? bottomY - scaledHR! : panelY;

  const sorted = [...positions].map(p => {
    const hingeTopY = cutoutSide === 'right' ? topRightY : topLeftY;
    const cy = hingeTopY + p * scale;
    return { top: cy - scaledCutoutH / 2, bottom: cy + scaledCutoutH / 2 };
  });

  if (cutoutSide === 'right') {
    // Cutouts on right edge of panel (panel is LEFT of door, hinges on left)
    const edgeX = panelX + panelW;
    const innerX = edgeX - scaledCutoutW;
    const sortedTB = [...sorted].sort((a, b) => a.top - b.top);

    let d = `M ${panelX},${topLeftY}`;
    d += ` L ${edgeX},${topRightY}`;

    // Right edge going down, with cutouts (top to bottom)
    for (const h of sortedTB) {
      d += ` L ${edgeX},${h.top - r}`;
      d += ` A ${r},${r} 0 0,0 ${edgeX - r},${h.top}`;
      d += ` L ${innerX + r},${h.top}`;
      d += ` A ${r},${r} 0 0,1 ${innerX},${h.top + r}`;
      d += ` L ${innerX},${h.bottom - r}`;
      d += ` A ${r},${r} 0 0,1 ${innerX + r},${h.bottom}`;
      d += ` L ${edgeX - r},${h.bottom}`;
      d += ` A ${r},${r} 0 0,0 ${edgeX},${h.bottom + r}`;
    }

    d += ` L ${edgeX},${bottomY}`;
    d += ` L ${panelX},${bottomY}`;
    d += ' Z';
    return d;
  } else {
    // Cutouts on left edge of panel (panel is RIGHT of door, hinges on right)
    const innerX = panelX + scaledCutoutW;
    const sortedBT = [...sorted].sort((a, b) => b.top - a.top);

    let d = `M ${panelX},${topLeftY}`;
    d += ` L ${panelX + panelW},${topRightY}`;
    d += ` L ${panelX + panelW},${bottomY}`;
    d += ` L ${panelX},${bottomY}`;

    // Traverse left edge bottom-to-top with cutouts
    for (const h of sortedBT) {
      d += ` L ${panelX},${h.bottom + r}`;
      d += ` A ${r},${r} 0 0,1 ${panelX + r},${h.bottom}`;
      d += ` L ${innerX - r},${h.bottom}`;
      d += ` A ${r},${r} 0 0,0 ${innerX},${h.bottom - r}`;
      d += ` L ${innerX},${h.top + r}`;
      d += ` A ${r},${r} 0 0,0 ${innerX - r},${h.top}`;
      d += ` L ${panelX + r},${h.top}`;
      d += ` A ${r},${r} 0 0,1 ${panelX},${h.top - r}`;
    }

    d += ' Z';
    return d;
  }
}

/* ── Hinge cutout bracket marks + dimension labels (BLUE) ── */

function HingeCutoutDetail({ cx, cy, scaledCutoutW, scaledCutoutH, scaledCircleR, isLeft, cutoutW, cutoutOffset, scale, cutoutH, showDimLabel = false }: {
  cx: number; cy: number; scaledCutoutW: number; scaledCutoutH: number; scaledCircleR: number;
  isLeft: boolean; cutoutW: number; cutoutOffset: number; scale: number;
  cutoutH?: number; showDimLabel?: boolean;
}) {
  const halfH = scaledCutoutH / 2;
  const halfW = scaledCutoutW / 2;
  const topY = cy - halfH;
  const botY = cy + halfH;

  const markLen = Math.max(3 * scale, 2.5);
  const sw = 0.8;

  const innerX = isLeft ? (cx + halfW) : (cx - halfW);
  const dir = isLeft ? 1 : -1;

  return (
    <g>
      <polyline
        points={`${innerX + dir * markLen},${topY} ${innerX},${topY} ${innerX},${topY + markLen}`}
        fill="none" stroke={DIM_COLOR} strokeWidth={sw}
      />
      <polyline
        points={`${innerX},${botY - markLen} ${innerX},${botY} ${innerX + dir * markLen},${botY}`}
        fill="none" stroke={DIM_COLOR} strokeWidth={sw}
      />
      {/* Cutout dimension label (W×H) shown on first cutout */}
      {showDimLabel && cutoutH && (
        <text
          x={innerX + dir * (markLen + 3)}
          y={cy}
          textAnchor={isLeft ? 'start' : 'end'}
          dominantBaseline="middle"
          fill="#DC2626"
          fontSize={9}
          fontFamily="monospace"
          fontWeight="bold"
        >
          {cutoutW}×{cutoutH}
        </text>
      )}
    </g>
  );
}

/* ── Handle drawing with holes and dimensions (BLUE) ── */

function HandleDrawing({ doorX, doorY, doorW, doorH, positionY, handleLength, scale, doorHeight, isHingeLeft, handleInset = 50, template }: {
  doorX: number; doorY: number; doorW: number; doorH: number;
  positionY: number; handleLength: number; scale: number; doorHeight: number; isHingeLeft: boolean;
  handleInset?: number;
  template?: import('@/hooks/useProcessingTemplates').ProcessingTemplate;
}) {
  const edgeX = isHingeLeft ? doorX + doorW : doorX;
  const insetPx = handleInset * scale;
  const handleX = isHingeLeft ? edgeX - insetPx : edgeX + insetPx;
  const handleCenterY = doorY + doorH - positionY * scale;
  const halfLen = (handleLength * scale) / 2;
  const defaultHoleRadius = Math.max((12 / 2) * scale, 3);

  const bottomY = doorY + doorH;
  const posFromBottom = positionY;

  const side = isHingeLeft ? 1 : -1;
  const dimLayer1 = edgeX + side * 55;
  const dimLayer2 = edgeX + side * 85;
  const textSide = isHingeLeft ? 'start' : 'end';
  const textOffset = side * 6;

  // Parse template cutouts from dimensions
  const templateCutouts = parseTemplateCutouts(template);

  // If template has cutouts, render them relative to handle center
  const renderCutouts = templateCutouts.length > 0;

  return (
    <g>
      {/* Render ONLY template-defined cutouts — no fallback */}
      {templateCutouts.map((cutout, i) => {
        const cx = handleX + cutout.x * scale;
        const cy = handleCenterY - cutout.y * scale;

        if (cutout.shape === 'circle') {
          const r = (cutout.diameter / 2) * scale;
          return (
            <g key={`handle-cutout-${i}`}>
              <circle cx={cx} cy={cy} r={r} fill={DIM_COLOR} fillOpacity={0.15} stroke={DIM_COLOR} strokeWidth={1.5} />
              <line x1={cx - r * 0.4} y1={cy} x2={cx + r * 0.4} y2={cy} stroke={DIM_COLOR} strokeWidth={0.8} />
              <line x1={cx} y1={cy - r * 0.4} x2={cx} y2={cy + r * 0.4} stroke={DIM_COLOR} strokeWidth={0.8} />
            </g>
          );
        }
        if (cutout.shape === 'stadium') {
          const sw = cutout.width * scale;
          const sh = cutout.height * scale;
          const rx = Math.min(sh / 2, sw / 2);
          return (
            <rect key={`handle-cutout-${i}`} x={cx - sw / 2} y={cy - sh / 2} width={sw} height={sh} rx={rx}
              fill={DIM_COLOR} fillOpacity={0.15} stroke={DIM_COLOR} strokeWidth={1.5} />
          );
        }
        if (cutout.shape === 'rect') {
          const sw = cutout.width * scale;
          const sh = cutout.height * scale;
          return (
            <rect key={`handle-cutout-${i}`} x={cx - sw / 2} y={cy - sh / 2} width={sw} height={sh}
              fill={DIM_COLOR} fillOpacity={0.15} stroke={DIM_COLOR} strokeWidth={1.5} />
          );
        }
        if (cutout.shape === 'slot') {
          const sl = cutout.slotLength * scale;
          const sr = cutout.radius * scale;
          return (
            <rect key={`handle-cutout-${i}`} x={cx - sl / 2} y={cy - sr} width={sl} height={sr * 2} rx={sr}
              fill={DIM_COLOR} fillOpacity={0.15} stroke={DIM_COLOR} strokeWidth={1.5} />
          );
        }
        return null;
      })}

      {/* Inset dimension */}
      <line x1={edgeX} y1={handleCenterY + halfLen + 14} x2={handleX} y2={handleCenterY + halfLen + 14} stroke={DIM_COLOR} strokeWidth={DIM_STROKE_W} />
      <line x1={edgeX} y1={handleCenterY + halfLen + 4} x2={edgeX} y2={handleCenterY + halfLen + 18} stroke={DIM_COLOR} strokeWidth={DIM_STROKE_THIN} />
      <line x1={handleX} y1={handleCenterY + halfLen + defaultHoleRadius + 2} x2={handleX} y2={handleCenterY + halfLen + 18} stroke={DIM_COLOR} strokeWidth={DIM_STROKE_THIN} />
      <text x={(edgeX + handleX) / 2} y={handleCenterY + halfLen + 27} textAnchor="middle" fill={DIM_COLOR} fontSize={DIM_FONT_SIZE_SM} fontWeight={DIM_FONT_WEIGHT} fontFamily="monospace">{handleInset}</text>

      {/* Hole spacing dimension — only show if we have 2+ cutouts */}
      {templateCutouts.length >= 2 && (
        <>
          <line x1={handleX} y1={handleCenterY - halfLen} x2={dimLayer1} y2={handleCenterY - halfLen} stroke={DIM_COLOR} strokeWidth={DIM_STROKE_THIN} strokeDasharray="2,2" />
          <line x1={handleX} y1={handleCenterY + halfLen} x2={dimLayer1} y2={handleCenterY + halfLen} stroke={DIM_COLOR} strokeWidth={DIM_STROKE_THIN} strokeDasharray="2,2" />
          <line x1={dimLayer1} y1={handleCenterY - halfLen} x2={dimLayer1} y2={handleCenterY + halfLen} stroke={DIM_COLOR} strokeWidth={DIM_STROKE_W} />
          <polygon points={`${dimLayer1},${handleCenterY - halfLen} ${dimLayer1 - ARROW_SIZE / 2},${handleCenterY - halfLen + ARROW_SIZE} ${dimLayer1 + ARROW_SIZE / 2},${handleCenterY - halfLen + ARROW_SIZE}`} fill={DIM_COLOR} />
          <polygon points={`${dimLayer1},${handleCenterY + halfLen} ${dimLayer1 - ARROW_SIZE / 2},${handleCenterY + halfLen - ARROW_SIZE} ${dimLayer1 + ARROW_SIZE / 2},${handleCenterY + halfLen - ARROW_SIZE}`} fill={DIM_COLOR} />
          <text x={dimLayer1 + textOffset} y={handleCenterY} textAnchor={textSide} dominantBaseline="middle" fill={DIM_COLOR} fontSize={DIM_FONT_SIZE_SM} fontWeight={DIM_FONT_WEIGHT} fontFamily="monospace">
            {handleLength}
          </text>
        </>
      )}

      {/* Handle center height from bottom */}
      <line x1={handleX} y1={handleCenterY} x2={dimLayer2} y2={handleCenterY} stroke={DIM_COLOR} strokeWidth={DIM_STROKE_THIN} strokeDasharray="2,2" />
      <line x1={dimLayer2} y1={bottomY} x2={dimLayer2} y2={handleCenterY} stroke={DIM_COLOR} strokeWidth={DIM_STROKE_W} />
      <polygon points={`${dimLayer2},${bottomY} ${dimLayer2 - ARROW_SIZE / 2},${bottomY - ARROW_SIZE} ${dimLayer2 + ARROW_SIZE / 2},${bottomY - ARROW_SIZE}`} fill={DIM_COLOR} />
      <polygon points={`${dimLayer2},${handleCenterY} ${dimLayer2 - ARROW_SIZE / 2},${handleCenterY + ARROW_SIZE} ${dimLayer2 + ARROW_SIZE / 2},${handleCenterY + ARROW_SIZE}`} fill={DIM_COLOR} />
      <text x={dimLayer2 + textOffset} y={(bottomY + handleCenterY) / 2} textAnchor={textSide} dominantBaseline="middle" fill={DIM_COLOR} fontSize={DIM_FONT_SIZE_SM} fontWeight={DIM_FONT_WEIGHT} fontFamily="monospace">
        {posFromBottom}
      </text>
    </g>
  );
}

// parseTemplateCutouts and isAbsoluteTemplate are now imported from @/lib/processing/templateCutouts
