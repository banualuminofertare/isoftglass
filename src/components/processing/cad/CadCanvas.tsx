import { useRef, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { CadShape as CadShapeT, ToolType, ShapeType, Measurement, PanelLayout } from './cadTypes';
import { snapToGrid, createShape, trimLineByLine, trimRectByLine, trimCircleByLine, trimRectByCircle, duplicateShape, getShapeSnapPoints, detectTargetPanel, canvasXToLocalX, getPanelCanvasOffset, getTotalCanvasWidth, PANEL_GAP_MM } from './cadTypes';
import { CadShapeRenderer, MeasurementRenderer } from './CadShape';
import { toast } from 'sonner';

interface Props {
  shapes: CadShapeT[];
  selectedId: string | null;
  tool: ToolType;
  gridSize: number;
  snapEnabled: boolean;
  glassWidth: number;
  glassHeight: number;
  zoom: number;
  pan: { x: number; y: number };
  onZoomChange: (z: number) => void;
  onPanChange: (p: { x: number; y: number }) => void;
  onSelect: (id: string | null) => void;
  onAddShape: (shape: CadShapeT) => void;
  onUpdateShape: (id: string, updates: Partial<CadShapeT>) => void;
  onDeleteShape: (id: string) => void;
  onToolChange: (t: ToolType) => void;
  measurements: Measurement[];
  onAddMeasurement: (m: Measurement) => void;
  onDeleteMeasurement: (id: string) => void;
  cursorPos: { x: number; y: number } | null;
  onCursorChange: (pos: { x: number; y: number } | null) => void;
  onPushHistory?: () => void;
  panelLayout: PanelLayout;
  fixedLeftWidth: number;
  fixedRightWidth: number;
}

const PADDING_MM = 60;

export function CadCanvas({
  shapes, selectedId, tool, gridSize, snapEnabled, glassWidth, glassHeight,
  zoom, pan, onZoomChange, onPanChange,
  onSelect, onAddShape, onUpdateShape, onDeleteShape, onToolChange,
  measurements, onAddMeasurement, onDeleteMeasurement, cursorPos, onCursorChange,
  onPushHistory, panelLayout, fixedLeftWidth, fixedRightWidth,
}: Props) {
  const { t } = useTranslation();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 800, h: 600 });
  const [dragging, setDragging] = useState<{ startX: number; startY: number; panStart: { x: number; y: number } } | null>(null);
  const [drawing, setDrawing] = useState<{ shape: CadShapeT; startMm: { x: number; y: number } } | null>(null);
  const [moving, setMoving] = useState<{ id: string; startMm: { x: number; y: number }; origShape: CadShapeT } | null>(null);
  const [measuring, setMeasuring] = useState<{ x1: number; y1: number } | null>(null);
  const [subtracting, setSubtracting] = useState<{ targetId: string; startMm: { x: number; y: number }; current: { x: number; y: number; w: number; h: number } } | null>(null);
  const [trimCutLineId, setTrimCutLineId] = useState<string | null>(null);
  const [trimDrawing, setTrimDrawing] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [trimTempLine, setTrimTempLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [trimCircleId, setTrimCircleId] = useState<string | null>(null);
  const [stretching, setStretching] = useState<{ id: string; edge: 'left' | 'right' | 'top' | 'bottom'; startMm: { x: number; y: number }; origShape: CadShapeT } | null>(null);
  const [copyAreaSel, setCopyAreaSel] = useState<{ startMm: { x: number; y: number }; current: { x: number; y: number } } | null>(null);
  const [joinFirstId, setJoinFirstId] = useState<string | null>(null);
  const [weldFirstId, setWeldFirstId] = useState<string | null>(null);
  const [snapIndicator, setSnapIndicator] = useState<{ x: number; y: number } | null>(null);

  const SNAP_TOLERANCE = 5; // mm
  // Track container size for auto-fit
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // World dimensions in mm (all panels + padding)
  const totalCanvasW = getTotalCanvasWidth(glassWidth, panelLayout, fixedLeftWidth, fixedRightWidth);
  const worldW = totalCanvasW + PADDING_MM * 2;
  const worldH = glassHeight + PADDING_MM * 2;

  const hasLeft = panelLayout === 'door_left' || panelLayout === 'door_both';
  const hasRight = panelLayout === 'door_right' || panelLayout === 'door_both';

  // Calculate scale to fit glass in container
  const fitScale = Math.min(
    (containerSize.w - 20) / worldW,
    (containerSize.h - 40) / worldH,
    5
  );
  const scale = fitScale * zoom;

  const svgW = worldW * scale;
  const svgH = worldH * scale;

  // Glass (door panel) position — shifted right when left panel present
  const doorOffsetMm = hasLeft ? fixedLeftWidth + PANEL_GAP_MM : 0;
  const glassX = (PADDING_MM + doorOffsetMm) * scale;
  const glassY = PADDING_MM * scale;
  const glassW = glassWidth * scale;
  const glassH = glassHeight * scale;

  // Center the SVG in container
  const autoOffsetX = (containerSize.w - svgW) / 2;
  const autoOffsetY = (containerSize.h - svgH - 28) / 2; // 28 for status bar

  const snap = useCallback((v: number) => snapEnabled ? snapToGrid(v, gridSize) : v, [snapEnabled, gridSize]);

  const toMmRaw = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: (clientX - rect.left - glassX) / scale,
      y: (clientY - rect.top - glassY) / scale,
    };
  }, [scale, glassX, glassY]);

  /** Try to snap to an existing shape point or glass corner/edge. Returns snapped point + indicator. */
  const snapToPoint = useCallback((rawX: number, rawY: number): { x: number; y: number; snapped: boolean } => {
    // Collect all snap points from shapes
    const allPts = shapes.flatMap(getShapeSnapPoints);
    // Add glass corners, edge midpoints, and center (door panel)
    const doorOff = hasLeft ? fixedLeftWidth + PANEL_GAP_MM : 0;
    allPts.push(
      { x: doorOff, y: 0 }, { x: doorOff + glassWidth, y: 0 },
      { x: doorOff + glassWidth, y: glassHeight }, { x: doorOff, y: glassHeight },
      { x: doorOff + glassWidth / 2, y: 0 }, { x: doorOff + glassWidth, y: glassHeight / 2 },
      { x: doorOff + glassWidth / 2, y: glassHeight }, { x: doorOff, y: glassHeight / 2 },
      { x: doorOff + glassWidth / 2, y: glassHeight / 2 },
    );
    // Add side panel snap points
    if (hasLeft) {
      allPts.push(
        { x: 0, y: 0 }, { x: fixedLeftWidth, y: 0 },
        { x: fixedLeftWidth, y: glassHeight }, { x: 0, y: glassHeight },
        { x: fixedLeftWidth / 2, y: glassHeight / 2 },
      );
    }
    if (hasRight) {
      const rOff = doorOff + glassWidth + PANEL_GAP_MM;
      allPts.push(
        { x: rOff, y: 0 }, { x: rOff + fixedRightWidth, y: 0 },
        { x: rOff + fixedRightWidth, y: glassHeight }, { x: rOff, y: glassHeight },
        { x: rOff + fixedRightWidth / 2, y: glassHeight / 2 },
      );
    }

    let bestDist = SNAP_TOLERANCE;
    let bestPt: { x: number; y: number } | null = null;
    for (const pt of allPts) {
      const d = Math.sqrt((rawX - pt.x) ** 2 + (rawY - pt.y) ** 2);
      if (d < bestDist) {
        bestDist = d;
        bestPt = pt;
      }
    }
    if (bestPt) {
      return { x: bestPt.x, y: bestPt.y, snapped: true };
    }
    return { x: rawX, y: rawY, snapped: false };
  }, [shapes, glassWidth, glassHeight, hasLeft, hasRight, fixedLeftWidth, fixedRightWidth]);

  const toMm = useCallback((clientX: number, clientY: number) => {
    const raw = toMmRaw(clientX, clientY);
    // Try point snap first (always active)
    const pointSnap = snapToPoint(raw.x, raw.y);
    if (pointSnap.snapped) {
      setSnapIndicator({ x: pointSnap.x, y: pointSnap.y });
      return { x: pointSnap.x, y: pointSnap.y };
    }
    setSnapIndicator(null);
    // Fallback to grid snap
    return { x: snap(raw.x), y: snap(raw.y) };
  }, [toMmRaw, snap, snapToPoint]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    onZoomChange(Math.min(30, Math.max(0.1, zoom * delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const mm = toMm(e.clientX, e.clientY);

    if (tool === 'select') {
      onSelect(null);
      setDragging({ startX: e.clientX, startY: e.clientY, panStart: pan });
      return;
    }

    if (tool === 'eraser') {
      const hitShape = [...shapes].reverse().find(s => isPointInShape(mm.x, mm.y, s, scale));
      if (hitShape) {
        onDeleteShape(hitShape.id);
        return;
      }
      const hitMeasurement = [...measurements].reverse().find(m => isPointNearMeasurement(mm.x, mm.y, m));
      if (hitMeasurement) {
        onDeleteMeasurement(hitMeasurement.id);
      }
      return;
    }

    if (tool === 'trim') {
      const rawMm = toMmRaw(e.clientX, e.clientY);
      
      if (trimCircleId) {
        // Circle-as-cutter flow: click on a rect-like shape to apply circular cut
        const hitShape = [...shapes].reverse().find(s => 
          s.id !== trimCircleId && isPointInShape(rawMm.x, rawMm.y, s, scale)
        );
        if (!hitShape) {
          toast.info(t('cad.toasts.clickShapeOverlapsCircle'));
          return;
        }
        const circleShape = shapes.find(s => s.id === trimCircleId);
        if (!circleShape) { setTrimCircleId(null); return; }

        const updates = trimRectByCircle(hitShape, circleShape, rawMm.x, rawMm.y);
        if (updates) {
          onPushHistory?.();
          onUpdateShape(hitShape.id, updates);
          toast.success(t('cad.toasts.circularTrimApplied'));
        } else {
          toast.error(t('cad.toasts.circleNoOverlap'));
        }
        // Keep circle selected for additional trims
        return;
      }

      if (trimTempLine) {
        // Phase 3: We have a temp cut line drawn — click on shape to trim
        const hitShape = [...shapes].reverse().find(s => isPointInShape(rawMm.x, rawMm.y, s, scale));
        if (!hitShape) {
          toast.info(t('cad.toasts.clickShapeTraversedByLine'));
          return;
        }
        // Create a virtual cut line shape — extend it far in both directions so it acts as infinite
        const dx = trimTempLine.x2 - trimTempLine.x1;
        const dy = trimTempLine.y2 - trimTempLine.y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        const ext = Math.max(2000, len * 10); // extend generously
        const ux = len > 0 ? dx / len : 1, uy = len > 0 ? dy / len : 0;
        const virtualCutLine: CadShapeT = {
          id: 'trim-temp', type: 'line',
          x: trimTempLine.x1 - ux * ext, y: trimTempLine.y1 - uy * ext,
          x2: trimTempLine.x2 + ux * ext, y2: trimTempLine.y2 + uy * ext,
          width: 0, height: 0, radius: 0, rotation: 0,
        };

        let updates: Partial<CadShapeT> | null = null;
        if (hitShape.type === 'line') {
          updates = trimLineByLine(hitShape, virtualCutLine, rawMm.x, rawMm.y);
        } else if (hitShape.type === 'circle') {
          updates = trimCircleByLine(hitShape, virtualCutLine, rawMm.x, rawMm.y);
        } else {
          updates = trimRectByLine(hitShape, virtualCutLine, rawMm.x, rawMm.y);
        }

        if (updates) {
          onPushHistory?.();
          onUpdateShape(hitShape.id, updates);
          toast.success(t('cad.toasts.trimApplied'));
        } else {
          toast.error(t('cad.toasts.noIntersection'));
        }
        // Keep the temp line for additional trims, user can press Escape or change tool to clear
        return;
      }
      
      if (!trimCutLineId && !trimCircleId && !trimDrawing) {
        // Phase 1: Click an existing line, circle, OR start drawing a temp cut line
        const hitShape = [...shapes].reverse().find(s => isPointInShape(rawMm.x, rawMm.y, s, scale));
        if (hitShape && hitShape.type === 'line') {
          // Check if there are other non-line shapes — if so, use line as cutter
          const hasOtherShapes = shapes.some(s => s.id !== hitShape.id && s.type !== 'line');
          if (hasOtherShapes) {
            // Use as cut line (legacy flow)
            setTrimCutLineId(hitShape.id);
            onSelect(hitShape.id);
            toast.info(t('cad.toasts.trimLineSelected'));
          } else {
            // No other shapes to cut — delete this line directly
            onPushHistory?.();
            onDeleteShape(hitShape.id);
            toast.success(t('cad.toasts.lineDeleted'));
          }
        } else if (hitShape && hitShape.type === 'circle') {
          // Clicked on a circle → use as circular cutter
          setTrimCircleId(hitShape.id);
          onSelect(hitShape.id);
          toast.info(t('cad.toasts.circleSelected'));
        } else {
          // Start drawing a temporary cutting line
          setTrimDrawing({ x1: rawMm.x, y1: rawMm.y, x2: rawMm.x, y2: rawMm.y });
        }
        return;
      }

      if (trimCutLineId) {
        // Legacy flow Phase 2: trim target with existing line
        const hitShape = [...shapes].reverse().find(s => 
          s.id !== trimCutLineId && isPointInShape(rawMm.x, rawMm.y, s, scale)
        );
        if (!hitShape) {
          toast.info(t('cad.toasts.clickShapeTraversedByLine'));
          return;
        }
        const cutLine = shapes.find(s => s.id === trimCutLineId);
        if (!cutLine) { setTrimCutLineId(null); return; }

        let updates: Partial<CadShapeT> | null = null;
        if (hitShape.type === 'line') {
          updates = trimLineByLine(hitShape, cutLine, rawMm.x, rawMm.y);
        } else if (hitShape.type === 'circle') {
          updates = trimCircleByLine(hitShape, cutLine, rawMm.x, rawMm.y);
        } else {
          updates = trimRectByLine(hitShape, cutLine, rawMm.x, rawMm.y);
        }

        if (updates) {
          onPushHistory?.();
          onUpdateShape(hitShape.id, updates);
          // Auto-delete the cutting line after successful trim
          onDeleteShape(trimCutLineId);
          setTrimCutLineId(null);
          onSelect(null);
          toast.success(t('cad.toasts.trimAppliedLineDeleted'));
        } else {
          toast.error(t('cad.toasts.noIntersection'));
        }
      }
      return;
    }

    if (tool === 'subtract') {
      // Find the shape under cursor to subtract from
      const hitShape = [...shapes].reverse().find(s => s.type !== 'line' && isPointInShape(mm.x, mm.y, s, scale));
      if (hitShape) {
        onSelect(hitShape.id);
        setSubtracting({ targetId: hitShape.id, startMm: mm, current: { x: mm.x, y: mm.y, w: 0, h: 0 } });
      }
      return;
    }

    if (tool === 'move') {
      const hit = [...shapes].reverse().find(s => isPointInShape(mm.x, mm.y, s, scale));
      if (hit) {
        onSelect(hit.id);
        onPushHistory?.();
        setMoving({ id: hit.id, startMm: mm, origShape: { ...hit } });
      }
      return;
    }

    if (tool === 'stretch') {
      // Find shape, detect which edge is near cursor
      const hit = [...shapes].reverse().find(s => s.type !== 'line' && s.type !== 'circle' && isPointInShape(mm.x, mm.y, s, scale));
      if (hit) {
        onSelect(hit.id);
        const edge = detectEdge(mm.x, mm.y, hit, scale);
        if (edge) {
          onPushHistory?.();
          setStretching({ id: hit.id, edge, startMm: mm, origShape: { ...hit } });
        }
      }
      return;
    }

    if (tool === 'copyarea') {
      setCopyAreaSel({ startMm: mm, current: mm });
      return;
    }

    if (tool === 'join') {
      const hitShape = [...shapes].reverse().find(s => (s.type === 'line' || s.type === 'circle') && isPointInShape(mm.x, mm.y, s, scale));
      if (!hitShape) {
        toast.info(t('cad.toasts.clickLineOrCircle'));
        return;
      }
      if (!joinFirstId) {
        setJoinFirstId(hitShape.id);
        onSelect(hitShape.id);
        toast.info(t('cad.toasts.shapeSelectedJoin'));
      } else {
        if (hitShape.id === joinFirstId) return;
        const shape1 = shapes.find(s => s.id === joinFirstId);
        if (!shape1) { setJoinFirstId(null); return; }
        const TOL = 5;

        // Both lines — original logic
        if (shape1.type === 'line' && hitShape.type === 'line') {
          const pts1 = [{ x: shape1.x, y: shape1.y }, { x: shape1.x2 ?? shape1.x, y: shape1.y2 ?? shape1.y }];
          const pts2 = [{ x: hitShape.x, y: hitShape.y }, { x: hitShape.x2 ?? hitShape.x, y: hitShape.y2 ?? hitShape.y }];
          let joined = false;
          for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
              const d = Math.sqrt((pts1[i].x - pts2[j].x) ** 2 + (pts1[i].y - pts2[j].y) ** 2);
              if (d <= TOL) {
                const freeEnd1 = pts1[1 - i];
                const freeEnd2 = pts2[1 - j];
                onPushHistory?.();
                onDeleteShape(shape1.id);
                onDeleteShape(hitShape.id);
                const newLine: CadShapeT = {
                  id: crypto.randomUUID(), type: 'line',
                  x: freeEnd1.x, y: freeEnd1.y,
                  x2: freeEnd2.x, y2: freeEnd2.y,
                  width: 0, height: 0, radius: 0, rotation: 0,
                };
                onAddShape(newLine);
                onSelect(newLine.id);
                toast.success(t('cad.toasts.linesJoined'));
                joined = true;
                break;
              }
            }
            if (joined) break;
          }
          if (!joined) toast.error(t('cad.toasts.linesNoCommonEnds'));
        }
        // Line + Circle join — snap line endpoint to circle perimeter
        else if ((shape1.type === 'line' && hitShape.type === 'circle') || (shape1.type === 'circle' && hitShape.type === 'line')) {
          const line = shape1.type === 'line' ? shape1 : hitShape;
          const circle = shape1.type === 'circle' ? shape1 : hitShape;
          const r = circle.radius || 0;
          const joinTol = r + 10; // generous tolerance
          const pts = [
            { x: line.x, y: line.y, end: 'start' as const },
            { x: line.x2 ?? line.x, y: line.y2 ?? line.y, end: 'end' as const },
          ];
          // Find which endpoint is closest to circle center
          let bestIdx = -1;
          let bestDistToCenter = Infinity;
          for (let i = 0; i < 2; i++) {
            const distToCenter = Math.sqrt((pts[i].x - circle.x) ** 2 + (pts[i].y - circle.y) ** 2);
            if (distToCenter < bestDistToCenter) {
              bestDistToCenter = distToCenter;
              bestIdx = i;
            }
          }
          if (bestIdx >= 0 && bestDistToCenter <= joinTol) {
            // Snap endpoint to nearest point on circle perimeter
            const ep = pts[bestIdx];
            const dx = ep.x - circle.x, dy = ep.y - circle.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            // If endpoint is at center (dist~0), use direction from other endpoint
            let dirX = dx, dirY = dy;
            if (dist < 0.01) {
              const other = pts[1 - bestIdx];
              dirX = circle.x - other.x;
              dirY = circle.y - other.y;
              const dirLen = Math.sqrt(dirX * dirX + dirY * dirY);
              if (dirLen > 0.01) { dirX /= dirLen; dirY /= dirLen; }
              else { dirX = 1; dirY = 0; }
            } else {
              dirX /= dist; dirY /= dist;
            }
            const snapX = circle.x + dirX * r;
            const snapY = circle.y + dirY * r;
            onPushHistory?.();
            if (ep.end === 'start') {
              onUpdateShape(line.id, { x: snapX, y: snapY });
            } else {
              onUpdateShape(line.id, { x2: snapX, y2: snapY });
            }
            onSelect(line.id);
            toast.success(t('cad.toasts.lineJoinedCircle'));
          } else {
            // Fallback: try line-circle intersection
            const lx1 = pts[0].x, ly1 = pts[0].y, lx2 = pts[1].x, ly2 = pts[1].y;
            const ldx = lx2 - lx1, ldy = ly2 - ly1;
            const fx = lx1 - circle.x, fy = ly1 - circle.y;
            const a = ldx * ldx + ldy * ldy;
            const b = 2 * (fx * ldx + fy * ldy);
            const c = fx * fx + fy * fy - r * r;
            const disc = b * b - 4 * a * c;
            if (disc >= 0 && a > 1e-10) {
              const sqrtDisc = Math.sqrt(disc);
              const t1 = (-b - sqrtDisc) / (2 * a);
              const t2 = (-b + sqrtDisc) / (2 * a);
              // Pick the t closest to an endpoint (0 or 1)
              const candidates = [t1, t2].filter(t => t >= -0.5 && t <= 1.5);
              if (candidates.length > 0) {
                // Snap the nearest endpoint
                const tParam = candidates.reduce((best, curr) => {
                  const distToBound = Math.min(Math.abs(curr), Math.abs(curr - 1));
                  const bestDist = Math.min(Math.abs(best), Math.abs(best - 1));
                  return distToBound < bestDist ? curr : best;
                });
                const ix = lx1 + tParam * ldx, iy = ly1 + tParam * ldy;
                onPushHistory?.();
                if (tParam <= 0.5) {
                  onUpdateShape(line.id, { x: ix, y: iy });
                } else {
                  onUpdateShape(line.id, { x2: ix, y2: iy });
                }
                onSelect(line.id);
                toast.success(t('cad.toasts.lineJoinedCircle'));
              } else {
                toast.error(t('cad.toasts.lineNoIntersectCircle'));
              }
            } else {
              toast.error(t('cad.toasts.lineNoIntersectCircle'));
            }
          }
        } else {
          toast.error(t('cad.toasts.unsupportedJoinCombination'));
        }
        setJoinFirstId(null);
      }
      return;
    }

    if (tool === 'weld') {
      const hitShape = [...shapes].reverse().find(s => s.type !== 'line' && isPointInShape(mm.x, mm.y, s, scale));
      if (!hitShape) {
        toast.info(t('cad.toasts.clickShapeNotLine'));
        return;
      }
      if (!weldFirstId) {
        setWeldFirstId(hitShape.id);
        onSelect(hitShape.id);
        toast.info(t('cad.toasts.shapeSelectedMerge'));
      } else {
        if (hitShape.id === weldFirstId) return;
        const shape1 = shapes.find(s => s.id === weldFirstId);
        if (!shape1) { setWeldFirstId(null); return; }
        if (shape1.type !== hitShape.type) {
          toast.error(t('cad.toasts.sameTypeMerge'));
          setWeldFirstId(null);
          return;
        }
        // Check overlap
        if (shape1.type === 'circle') {
          const d = Math.sqrt((shape1.x - hitShape.x) ** 2 + (shape1.y - hitShape.y) ** 2);
          if (d > 2) {
            toast.error(t('cad.toasts.circlesNotClose'));
            setWeldFirstId(null);
            return;
          }
          onPushHistory?.();
          const newRadius = Math.max(shape1.radius, hitShape.radius);
          onDeleteShape(shape1.id);
          onDeleteShape(hitShape.id);
          const newShape: CadShapeT = {
            id: crypto.randomUUID(), type: 'circle',
            x: shape1.x, y: shape1.y,
            width: 0, height: 0, radius: newRadius, rotation: 0,
          };
          onAddShape(newShape);
          onSelect(newShape.id);
          toast.success(t('cad.toasts.circlesMerged'));
        } else {
          // Rect-like: bounding box union
          const getBB = (s: CadShapeT) => {
            const hw = (s.type === 'slot' ? (s.slotLength ?? 20) : s.width) / 2;
            const hh = (s.type === 'slot' ? s.radius : s.height) / 2;
            return { l: s.x - hw, r: s.x + hw, t: s.y - hh, b: s.y + hh };
          };
          const bb1 = getBB(shape1), bb2 = getBB(hitShape);
          // Check overlap (at least 1mm on both axes)
          const overlapX = Math.min(bb1.r, bb2.r) - Math.max(bb1.l, bb2.l);
          const overlapY = Math.min(bb1.b, bb2.b) - Math.max(bb1.t, bb2.t);
          if (overlapX < 1 || overlapY < 1) {
            toast.error(t('cad.toasts.shapesNotOverlapping'));
            setWeldFirstId(null);
            return;
          }
          const nl = Math.min(bb1.l, bb2.l), nr = Math.max(bb1.r, bb2.r);
          const nt = Math.min(bb1.t, bb2.t), nb = Math.max(bb1.b, bb2.b);
          const nw = nr - nl, nh = nb - nt;
          onPushHistory?.();
          onDeleteShape(shape1.id);
          onDeleteShape(hitShape.id);
          const newShape: CadShapeT = {
            id: crypto.randomUUID(), type: shape1.type,
            x: nl + nw / 2, y: nt + nh / 2,
            width: nw, height: nh,
            radius: shape1.type === 'slot' ? nh / 2 : shape1.radius,
            rotation: 0,
            ...(shape1.type === 'slot' ? { slotLength: nw } : {}),
          };
          onAddShape(newShape);
          onSelect(newShape.id);
          toast.success(t('cad.toasts.shapesMerged'));
        }
        setWeldFirstId(null);
      }
      return;
    }

    if (tool === 'measure') {
      if (!measuring) {
        setMeasuring({ x1: mm.x, y1: mm.y });
      }
      return;
    }

    // Drawing tools
    const drawTools: ShapeType[] = ['rect', 'stadium', 'circle', 'lshape', 'slot', 'line'];
    if (drawTools.includes(tool as ShapeType)) {
      const shapeType = tool as ShapeType;
      // Auto-detect target panel from raw canvas position
      const rawMm = toMmRaw(e.clientX, e.clientY);
      const targetPanel = detectTargetPanel(rawMm.x, glassWidth, panelLayout, fixedLeftWidth, fixedRightWidth);
      const newShape = createShape(shapeType, mm.x, mm.y);
      if (panelLayout !== 'door_only') {
        newShape.targetPanel = targetPanel;
      }
      if (shapeType === 'circle') newShape.radius = 0;
      else if (shapeType === 'line') { newShape.x2 = mm.x; newShape.y2 = mm.y; }
      else if (shapeType === 'slot') { newShape.slotLength = 0; newShape.radius = 3; }
      else { newShape.width = 0; newShape.height = 0; }
      setDrawing({ shape: newShape, startMm: mm });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const mm = toMm(e.clientX, e.clientY);
    onCursorChange(mm);

    if (trimDrawing) {
      const rawMm = toMmRaw(e.clientX, e.clientY);
      setTrimDrawing(prev => prev ? { ...prev, x2: rawMm.x, y2: rawMm.y } : null);
      return;
    }

    if (dragging) {
      onPanChange({
        x: dragging.panStart.x + (e.clientX - dragging.startX),
        y: dragging.panStart.y + (e.clientY - dragging.startY),
      });
      return;
    }

    if (moving) {
      const dx = mm.x - moving.startMm.x;
      const dy = mm.y - moving.startMm.y;
      onUpdateShape(moving.id, {
        x: moving.origShape.x + dx,
        y: moving.origShape.y + dy,
        ...(moving.origShape.x2 != null ? { x2: moving.origShape.x2 + dx } : {}),
        ...(moving.origShape.y2 != null ? { y2: moving.origShape.y2 + dy } : {}),
      });
      return;
    }

    if (stretching) {
      const orig = stretching.origShape;
      const dx = mm.x - stretching.startMm.x;
      const dy = mm.y - stretching.startMm.y;
      let updates: Partial<CadShapeT> = {};
      const minSize = 2;

      // Slots use slotLength/radius instead of width/height
      if (orig.type === 'slot') {
        const origLen = orig.slotLength ?? 20;
        const origR = orig.radius;
        switch (stretching.edge) {
          case 'right': case 'left': {
            const sign = stretching.edge === 'right' ? 1 : -1;
            const newLen = Math.max(minSize, origLen + dx * sign);
            const actualDx = (newLen - origLen) * sign;
            updates = { slotLength: newLen, x: orig.x + actualDx / 2 };
            break;
          }
          case 'bottom': case 'top': {
            const sign = stretching.edge === 'bottom' ? 1 : -1;
            const newR = Math.max(1, origR + (dy * sign) / 1);
            // Radius affects both sides, so halve the movement
            updates = { radius: newR };
            break;
          }
        }
      } else {
        switch (stretching.edge) {
          case 'right': {
            const newW = Math.max(minSize, orig.width + dx);
            const actualDx = newW - orig.width;
            updates = { width: newW, x: orig.x + actualDx / 2 };
            break;
          }
          case 'left': {
            const newW = Math.max(minSize, orig.width - dx);
            const actualDx = orig.width - newW;
            updates = { width: newW, x: orig.x + actualDx / 2 };
            break;
          }
          case 'bottom': {
            const newH = Math.max(minSize, orig.height + dy);
            const actualDy = newH - orig.height;
            updates = { height: newH, y: orig.y + actualDy / 2 };
            break;
          }
          case 'top': {
            const newH = Math.max(minSize, orig.height - dy);
            const actualDy = orig.height - newH;
            updates = { height: newH, y: orig.y + actualDy / 2 };
            break;
          }
        }
      }
      onUpdateShape(stretching.id, updates);
      return;
    }

    if (copyAreaSel) {
      setCopyAreaSel(prev => prev ? { ...prev, current: mm } : null);
      return;
    }

    if (subtracting) {
      const dx = mm.x - subtracting.startMm.x;
      const dy = mm.y - subtracting.startMm.y;
      const cx = subtracting.startMm.x + dx / 2;
      const cy = subtracting.startMm.y + dy / 2;
      setSubtracting(prev => prev ? {
        ...prev,
        current: { x: cx, y: cy, w: Math.abs(dx), h: Math.abs(dy) }
      } : null);
      return;
    }

    if (drawing) {
      const dx = mm.x - drawing.startMm.x;
      const dy = mm.y - drawing.startMm.y;
      const s = drawing.shape;

      if (s.type === 'circle') {
        const r = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        setDrawing(prev => prev ? { ...prev, shape: { ...prev.shape, radius: snap(r) } } : null);
      } else if (s.type === 'line') {
        setDrawing(prev => prev ? { ...prev, shape: { ...prev.shape, x2: mm.x, y2: mm.y } } : null);
      } else if (s.type === 'slot') {
        const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        setDrawing(prev => prev ? { ...prev, shape: { ...prev.shape, slotLength: snap(len), rotation: Math.round(angle) } } : null);
      } else {
        const w = Math.abs(dx);
        const h = Math.abs(dy);
        const cx = drawing.startMm.x + dx / 2;
        const cy = drawing.startMm.y + dy / 2;
        setDrawing(prev => prev ? {
          ...prev,
          shape: { ...prev.shape, x: cx, y: cy, width: Math.max(1, w), height: Math.max(1, h) }
        } : null);
      }
    }
  };

  const handleMouseUp = () => {
    if (trimDrawing) {
      const dx = trimDrawing.x2 - trimDrawing.x1;
      const dy = trimDrawing.y2 - trimDrawing.y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 3) {
        // Line is long enough → set as temp cut line
        setTrimTempLine({ ...trimDrawing });
        toast.info(t('cad.toasts.trimLineDrawn'));
      }
      setTrimDrawing(null);
      return;
    }

    if (drawing) {
      const s = drawing.shape;
      let hasSize = false;
      if (s.type === 'circle') hasSize = s.radius > 1;
      else if (s.type === 'line') hasSize = Math.abs((s.x2 ?? s.x) - s.x) > 1 || Math.abs((s.y2 ?? s.y) - s.y) > 1;
      else if (s.type === 'slot') hasSize = (s.slotLength ?? 0) > 1;
      else hasSize = s.width > 1 && s.height > 1;

      if (hasSize) {
        onAddShape(s);
        onSelect(s.id);
        onToolChange('select');
      }
      setDrawing(null);
    }

    if (subtracting) {
      const { targetId, current } = subtracting;
      if (current.w > 2 && current.h > 2) {
        const cut = {
          id: crypto.randomUUID(),
          x: current.x,
          y: current.y,
          width: current.w,
          height: current.h,
        };
        const targetShape = shapes.find(s => s.id === targetId);
        if (targetShape) {
          onPushHistory?.();
          const existingCuts = targetShape.cuts ?? [];
          onUpdateShape(targetId, { cuts: [...existingCuts, cut] });
        }
      }
      setSubtracting(null);
    }

    if (moving) setMoving(null);
    if (stretching) setStretching(null);

    if (copyAreaSel) {
      const { startMm, current } = copyAreaSel;
      const minX = Math.min(startMm.x, current.x);
      const maxX = Math.max(startMm.x, current.x);
      const minY = Math.min(startMm.y, current.y);
      const maxY = Math.max(startMm.y, current.y);
      if (maxX - minX > 2 && maxY - minY > 2) {
        const insideShapes = shapes.filter(s => {
          if (s.type === 'line') {
            return s.x >= minX && s.x <= maxX && s.y >= minY && s.y <= maxY &&
              (s.x2 ?? s.x) >= minX && (s.x2 ?? s.x) <= maxX && (s.y2 ?? s.y) >= minY && (s.y2 ?? s.y) <= maxY;
          }
          return s.x >= minX && s.x <= maxX && s.y >= minY && s.y <= maxY;
        });
        if (insideShapes.length > 0) {
          onPushHistory?.();
          const offsetX = maxX - minX + 10;
          insideShapes.forEach(s => {
            const dup = duplicateShape(s, offsetX, 0);
            onAddShape(dup);
          });
          toast.success(t('processing.cadToasts.shapesCopied', { count: insideShapes.length }));
        } else {
          toast.info(t('cad.toasts.noShapesInArea'));
        }
      }
      setCopyAreaSel(null);
    }

    if (measuring) {
      const mm = cursorPos;
      if (mm) {
        const dist = Math.sqrt(Math.pow(mm.x - measuring.x1, 2) + Math.pow(mm.y - measuring.y1, 2));
        if (dist > 1) {
          onAddMeasurement({
            id: crypto.randomUUID(),
            x1: measuring.x1, y1: measuring.y1,
            x2: mm.x, y2: mm.y,
            distance: dist,
          });
        }
      }
      setMeasuring(null);
    }

    setDragging(null);
  };

  // Grid lines - adaptive visibility based on zoom
  const gridLines: React.ReactNode[] = [];
  const gridStep = gridSize;
  const showMinorGrid = scale > 0.15;

  for (let x = 0; x <= glassWidth; x += gridStep) {
    const px = glassX + x * scale;
    const isMajor = x % (gridStep * 10) === 0;
    if (!showMinorGrid && !isMajor) continue;
    gridLines.push(
      <line key={`gx${x}`} x1={px} y1={glassY} x2={px} y2={glassY + glassH}
        stroke="hsl(var(--border))" strokeWidth={isMajor ? 0.5 : 0.15} opacity={isMajor ? 0.5 : 0.2} />
    );
  }
  for (let y = 0; y <= glassHeight; y += gridStep) {
    const py = glassY + y * scale;
    const isMajor = y % (gridStep * 10) === 0;
    if (!showMinorGrid && !isMajor) continue;
    gridLines.push(
      <line key={`gy${y}`} x1={glassX} y1={py} x2={glassX + glassW} y2={py}
        stroke="hsl(var(--border))" strokeWidth={isMajor ? 0.5 : 0.15} opacity={isMajor ? 0.5 : 0.2} />
    );
  }

  const dimOffset = 18 * Math.min(scale / fitScale, 1.5);
  const dimFontSize = Math.max(9, 11 * Math.min(zoom, 1.5));

  // Reset trim state when tool changes away from trim
  useEffect(() => {
    if (tool !== 'trim') {
      setTrimCutLineId(null);
      setTrimDrawing(null);
      setTrimTempLine(null);
      setTrimCircleId(null);
    }
    if (tool !== 'join') setJoinFirstId(null);
    if (tool !== 'weld') setWeldFirstId(null);
  }, [tool]);

  const cursorStyle = tool === 'select' ? (dragging ? 'grabbing' : 'grab') : tool === 'move' ? 'move' : tool === 'eraser' ? 'pointer' : tool === 'trim' ? (trimCutLineId ? 'crosshair' : 'pointer') : tool === 'stretch' ? 'col-resize' : tool === 'join' || tool === 'weld' ? 'pointer' : 'crosshair';

  // Crosshair guides for precision
  const showCrosshair = cursorPos && (tool === 'rect' || tool === 'circle' || tool === 'stadium' || tool === 'slot' || tool === 'lshape' || tool === 'measure' || tool === 'subtract' || tool === 'copyarea');

  // Copy area selection preview
  const copyAreaPreview = copyAreaSel ? (() => {
    const x1 = Math.min(copyAreaSel.startMm.x, copyAreaSel.current.x) * scale;
    const y1 = Math.min(copyAreaSel.startMm.y, copyAreaSel.current.y) * scale;
    const w = Math.abs(copyAreaSel.current.x - copyAreaSel.startMm.x) * scale;
    const h = Math.abs(copyAreaSel.current.y - copyAreaSel.startMm.y) * scale;
    return <rect x={x1} y={y1} width={w} height={h} fill="hsl(var(--primary) / 0.08)" stroke="hsl(var(--primary))" strokeWidth={1.5} strokeDasharray="6,3" />;
  })() : null;

  return (
    <div ref={containerRef} className="overflow-hidden bg-muted/10 flex-1 min-h-0 relative"
      style={{ cursor: cursorStyle }} onWheel={handleWheel}>
      <svg ref={svgRef} width={svgW} height={svgH}
        style={{ transform: `translate(${autoOffsetX + pan.x}px, ${Math.max(0, autoOffsetY) + pan.y}px)` }}
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} className="select-none">

        {/* Background */}
        <rect width={svgW} height={svgH} fill="hsl(var(--muted) / 0.08)" />

        {/* Glass sheet with cutouts — shadow, fill & grid all clipped */}
        {(() => {
          const cutouts: { x: number; y: number; w: number; h: number }[] = [];
          for (const s of shapes) {
            if (s.type !== 'rect' || !s.openEdges) continue;
            if (!s.openEdges.top && !s.openEdges.right && !s.openEdges.bottom && !s.openEdges.left) continue;
            const hw = s.width / 2, hh = s.height / 2;
            if (s.width <= 0 || s.height <= 0) continue;
            // Clamp cutout to glass bounds
            const cx1 = Math.max(0, s.x - hw), cy1 = Math.max(0, s.y - hh);
            const cx2 = Math.min(glassWidth, s.x + hw), cy2 = Math.min(glassHeight, s.y + hh);
            const cw = cx2 - cx1, ch = cy2 - cy1;
            if (cw <= 0 || ch <= 0) continue;
            cutouts.push({
              x: glassX + cx1 * scale,
              y: glassY + cy1 * scale,
              w: cw * scale,
              h: ch * scale,
            });
          }
          const clipId = 'glass-cutout-clip';
          const clipAttr = cutouts.length > 0 ? `url(#${clipId})` : undefined;
          return (
            <>
              {cutouts.length > 0 && (
                <defs>
                  <clipPath id={clipId}>
                    <path fillRule="evenodd" d={
                      `M${glassX - 5},${glassY - 5} h${glassW + 10} v${glassH + 10} h${-(glassW + 10)} Z` +
                      cutouts.map(c => ` M${c.x},${c.y} h${c.w} v${c.h} h${-c.w} Z`).join('')
                    } />
                  </clipPath>
                </defs>
              )}
              <g clipPath={clipAttr}>
                {/* Shadow */}
                <rect x={glassX + 3} y={glassY + 3} width={glassW} height={glassH}
                  fill="hsl(var(--foreground) / 0.06)" rx={1} />
                {/* Glass fill */}
                <rect x={glassX} y={glassY} width={glassW} height={glassH}
                  fill="hsl(var(--primary) / 0.03)" stroke="none" rx={0.5} />
                {/* Grid */}
                {gridLines}
              </g>
            </>
          );
        })()}

        {/* Glass edges — segmented to allow open-edge cutouts */}
        {(() => {
          const edgeColor = "hsl(var(--primary))";
          const ew = 2.5;
          // Collect gaps per glass edge from rect shapes with openEdges
          const gaps: { left: [number, number][]; right: [number, number][]; top: [number, number][]; bottom: [number, number][] } = { left: [], right: [], top: [], bottom: [] };
          const tol = 1; // mm tolerance for "touching edge"
          for (const s of shapes) {
            if (s.type !== 'rect' || !s.openEdges) continue;
            const hw = s.width / 2, hh = s.height / 2;
            if (s.openEdges.left && s.x - hw <= tol) {
              gaps.left.push([glassY + (s.y - hh) * scale, glassY + (s.y + hh) * scale]);
            }
            if (s.openEdges.right && s.x + hw >= glassWidth - tol) {
              gaps.right.push([glassY + (s.y - hh) * scale, glassY + (s.y + hh) * scale]);
            }
            if (s.openEdges.top && s.y - hh <= tol) {
              gaps.top.push([glassX + (s.x - hw) * scale, glassX + (s.x + hw) * scale]);
            }
            if (s.openEdges.bottom && s.y + hh >= glassHeight - tol) {
              gaps.bottom.push([glassX + (s.x - hw) * scale, glassX + (s.x + hw) * scale]);
            }
          }
          // Build segments by subtracting sorted gaps from a full range
          const buildSegs = (full0: number, full1: number, rawGaps: [number, number][]) => {
            if (rawGaps.length === 0) return [[full0, full1]];
            const sorted = rawGaps.map(([a, b]) => [Math.max(full0, a), Math.min(full1, b)] as [number, number]).sort((a, b) => a[0] - b[0]);
            const merged: [number, number][] = [];
            for (const g of sorted) {
              if (merged.length && g[0] <= merged[merged.length - 1][1]) merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], g[1]);
              else merged.push([...g]);
            }
            const segs: [number, number][] = [];
            let cur = full0;
            for (const [gs, ge] of merged) {
              if (gs > cur) segs.push([cur, gs]);
              cur = ge;
            }
            if (cur < full1) segs.push([cur, full1]);
            return segs;
          };
          const leftSegs = buildSegs(glassY, glassY + glassH, gaps.left);
          const rightSegs = buildSegs(glassY, glassY + glassH, gaps.right);
          const topSegs = buildSegs(glassX, glassX + glassW, gaps.top);
          const bottomSegs = buildSegs(glassX, glassX + glassW, gaps.bottom);
          return (
            <>
              {leftSegs.map(([a, b], i) => <line key={`gl${i}`} x1={glassX} y1={a} x2={glassX} y2={b} stroke={edgeColor} strokeWidth={ew} />)}
              {rightSegs.map(([a, b], i) => <line key={`gr${i}`} x1={glassX + glassW} y1={a} x2={glassX + glassW} y2={b} stroke={edgeColor} strokeWidth={ew} />)}
              {topSegs.map(([a, b], i) => <line key={`gt${i}`} x1={a} y1={glassY} x2={b} y2={glassY} stroke={edgeColor} strokeWidth={ew} />)}
              {bottomSegs.map(([a, b], i) => <line key={`gb${i}`} x1={a} y1={glassY + glassH} x2={b} y2={glassY + glassH} stroke={edgeColor} strokeWidth={ew} />)}
            </>
          );
        })()}

        {/* Side panels */}
        {hasLeft && (() => {
          const leftPanelX = PADDING_MM * scale;
          const leftPanelW = fixedLeftWidth * scale;
          return (
            <g>
              <rect x={leftPanelX} y={glassY} width={leftPanelW} height={glassH}
                fill="hsl(30 80% 55% / 0.06)" stroke="hsl(30 80% 55%)" strokeWidth={2} rx={0.5} />
              <text x={leftPanelX + leftPanelW / 2} y={glassY + glassH + 14} textAnchor="middle"
                fontSize={Math.max(7, 9 * Math.min(zoom, 1.2))} fill="hsl(30 80% 55%)" className="select-none font-medium">
                Stânga ({fixedLeftWidth}mm)
              </text>
            </g>
          );
        })()}
        {hasRight && (() => {
          const rightPanelX = glassX + glassW + PANEL_GAP_MM * scale;
          const rightPanelW = fixedRightWidth * scale;
          return (
            <g>
              <rect x={rightPanelX} y={glassY} width={rightPanelW} height={glassH}
                fill="hsl(142 60% 45% / 0.06)" stroke="hsl(142 60% 45%)" strokeWidth={2} rx={0.5} />
              <text x={rightPanelX + rightPanelW / 2} y={glassY + glassH + 14} textAnchor="middle"
                fontSize={Math.max(7, 9 * Math.min(zoom, 1.2))} fill="hsl(142 60% 45%)" className="select-none font-medium">
                Dreapta ({fixedRightWidth}mm)
              </text>
            </g>
          );
        })()}

        {/* Corner labels */}
        <text x={glassX - 3} y={glassY - 3} textAnchor="end" fontSize={Math.max(7, 8 * Math.min(zoom, 1.2))} fill="hsl(var(--muted-foreground))" className="select-none">0,0</text>
        <text x={glassX + glassW + 3} y={glassY - 3} textAnchor="start" fontSize={Math.max(7, 8 * Math.min(zoom, 1.2))} fill="hsl(var(--muted-foreground))" className="select-none">{glassWidth},0</text>
        <text x={glassX - 3} y={glassY + glassH + 10} textAnchor="end" fontSize={Math.max(7, 8 * Math.min(zoom, 1.2))} fill="hsl(var(--muted-foreground))" className="select-none">0,{glassHeight}</text>

        {/* Width dimension */}
        <line x1={glassX} y1={glassY - dimOffset} x2={glassX + glassW} y2={glassY - dimOffset} stroke="hsl(var(--foreground))" strokeWidth={0.8} markerEnd="url(#arrowR)" markerStart="url(#arrowL)" />
        <line x1={glassX} y1={glassY - dimOffset - 4} x2={glassX} y2={glassY - 2} stroke="hsl(var(--foreground))" strokeWidth={0.5} />
        <line x1={glassX + glassW} y1={glassY - dimOffset - 4} x2={glassX + glassW} y2={glassY - 2} stroke="hsl(var(--foreground))" strokeWidth={0.5} />
        <text x={glassX + glassW / 2} y={glassY - dimOffset - 5} textAnchor="middle" fontSize={dimFontSize} fill="hsl(var(--foreground))" className="select-none font-semibold">{glassWidth} mm</text>

        {/* Height dimension */}
        <line x1={glassX - dimOffset} y1={glassY} x2={glassX - dimOffset} y2={glassY + glassH} stroke="hsl(var(--foreground))" strokeWidth={0.8} />
        <line x1={glassX - dimOffset - 4} y1={glassY} x2={glassX - 2} y2={glassY} stroke="hsl(var(--foreground))" strokeWidth={0.5} />
        <line x1={glassX - dimOffset - 4} y1={glassY + glassH} x2={glassX - 2} y2={glassY + glassH} stroke="hsl(var(--foreground))" strokeWidth={0.5} />
        <text x={glassX - dimOffset - 6} y={glassY + glassH / 2} textAnchor="middle" fontSize={dimFontSize} fill="hsl(var(--foreground))" className="select-none font-semibold" transform={`rotate(-90, ${glassX - dimOffset - 6}, ${glassY + glassH / 2})`}>{glassHeight} mm</text>

        <defs>
          <marker id="arrowR" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
            <path d="M0,0 L6,2 L0,4" fill="hsl(var(--foreground))" />
          </marker>
          <marker id="arrowL" markerWidth="6" markerHeight="4" refX="1" refY="2" orient="auto">
            <path d="M6,0 L0,2 L6,4" fill="hsl(var(--foreground))" />
          </marker>
        </defs>

        {/* Shapes group */}
        <g transform={`translate(${glassX}, ${glassY})`}>
          {/* Crosshair guides */}
          {showCrosshair && cursorPos && (
            <g>
              <line x1={cursorPos.x * scale} y1={0} x2={cursorPos.x * scale} y2={glassH}
                stroke="hsl(var(--primary) / 0.2)" strokeWidth={0.5} strokeDasharray="4,4" />
              <line x1={0} y1={cursorPos.y * scale} x2={glassW} y2={cursorPos.y * scale}
                stroke="hsl(var(--primary) / 0.2)" strokeWidth={0.5} strokeDasharray="4,4" />
            </g>
           )}

          {/* Point snap indicator */}
          {snapIndicator && (
            <g>
              <circle cx={snapIndicator.x * scale} cy={snapIndicator.y * scale} r={6} fill="none" stroke="#f59e0b" strokeWidth={2} />
              <circle cx={snapIndicator.x * scale} cy={snapIndicator.y * scale} r={2} fill="#f59e0b" />
            </g>
          )}

          {shapes.map(s => (
            <g key={s.id}>
              <CadShapeRenderer shape={s} scale={scale} isSelected={s.id === selectedId} onSelect={onSelect} glassWidth={glassWidth} glassHeight={glassHeight} tool={tool} />
              {/* Trim cut line highlight */}
              {tool === 'trim' && trimCutLineId === s.id && s.type === 'line' && (() => {
                // Extend cutting line visually to infinity (canvas edges)
                const dx = (s.x2 ?? s.x) - s.x;
                const dy = (s.y2 ?? s.y) - s.y;
                const len = Math.sqrt(dx * dx + dy * dy);
                if (len < 0.01) return null;
                const ux = dx / len;
                const uy = dy / len;
                const ext = Math.max(glassWidth, glassHeight) * 2;
                return (
                  <line
                    x1={(s.x - ux * ext) * scale} y1={(s.y - uy * ext) * scale}
                    x2={(s.x + ux * ext) * scale} y2={(s.y + uy * ext) * scale}
                    stroke="hsl(var(--destructive))" strokeWidth={2} strokeDasharray="8,4" opacity={0.5}
                  />
                );
              })()}
            </g>
          ))}
          {drawing && (
            <CadShapeRenderer shape={drawing.shape} scale={scale} isSelected={false} onSelect={() => {}} glassWidth={glassWidth} glassHeight={glassHeight} tool={tool} />
          )}

          {/* Subtract preview */}
          {subtracting && subtracting.current.w > 0 && (
            <rect
              x={(subtracting.current.x - subtracting.current.w / 2) * scale}
              y={(subtracting.current.y - subtracting.current.h / 2) * scale}
              width={subtracting.current.w * scale}
              height={subtracting.current.h * scale}
              fill="hsl(var(--destructive) / 0.15)"
              stroke="hsl(var(--destructive))"
              strokeWidth={1.5}
              strokeDasharray="6,3"
            />
           )}

          {/* Trim drawing preview — while dragging to draw a cut line */}
          {trimDrawing && (() => {
            const dx = trimDrawing.x2 - trimDrawing.x1;
            const dy = trimDrawing.y2 - trimDrawing.y1;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len < 0.5) return null;
            const ux = dx / len, uy = dy / len;
            const ext = Math.max(glassWidth, glassHeight) * 2;
            return (
              <>
                <line x1={trimDrawing.x1 * scale} y1={trimDrawing.y1 * scale}
                  x2={trimDrawing.x2 * scale} y2={trimDrawing.y2 * scale}
                  stroke="hsl(var(--destructive))" strokeWidth={2} opacity={0.8} />
                <line x1={(trimDrawing.x1 - ux * ext) * scale} y1={(trimDrawing.y1 - uy * ext) * scale}
                  x2={(trimDrawing.x1 + ux * ext) * scale} y2={(trimDrawing.y1 + uy * ext) * scale}
                  stroke="hsl(var(--destructive))" strokeWidth={1} strokeDasharray="8,4" opacity={0.3} />
              </>
            );
          })()}

          {/* Trim temp line — after drawing, waiting for shape click */}
          {trimTempLine && (() => {
            const dx = trimTempLine.x2 - trimTempLine.x1;
            const dy = trimTempLine.y2 - trimTempLine.y1;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len < 0.5) return null;
            const ux = dx / len, uy = dy / len;
            const ext = Math.max(glassWidth, glassHeight) * 2;
            return (
              <line x1={(trimTempLine.x1 - ux * ext) * scale} y1={(trimTempLine.y1 - uy * ext) * scale}
                x2={(trimTempLine.x1 + ux * ext) * scale} y2={(trimTempLine.y1 + uy * ext) * scale}
                stroke="hsl(var(--destructive))" strokeWidth={2} strokeDasharray="8,4" opacity={0.5} />
            );
          })()}

          {/* Copy area preview */}
          {copyAreaPreview}

          {measurements.map(m => (
            <MeasurementRenderer key={m.id} m={m} scale={scale} />
          ))}

          {measuring && cursorPos && (
            <MeasurementRenderer m={{
              id: 'temp',
              x1: measuring.x1, y1: measuring.y1,
              x2: cursorPos.x, y2: cursorPos.y,
              distance: Math.sqrt(Math.pow(cursorPos.x - measuring.x1, 2) + Math.pow(cursorPos.y - measuring.y1, 2)),
            }} scale={scale} />
          )}
        </g>
      </svg>

      {/* Status bar */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-1 bg-background/95 border-t text-[11px] text-muted-foreground backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <span className="font-medium">{glassWidth} × {glassHeight} mm</span>
          {cursorPos && <span>X: {Math.round(cursorPos.x)} &nbsp; Y: {Math.round(cursorPos.y)}</span>}
        </div>
        <div className="flex items-center gap-4">
          <span>{shapes.length} formă(e)</span>
          <span>Zoom: {Math.round(zoom * 100)}%</span>
          {snapEnabled && <span>Snap: {gridSize}mm</span>}
        </div>
      </div>
    </div>
  );
}

function isPointInShape(px: number, py: number, s: CadShapeT, scale: number = 1): boolean {
  const tol = Math.max(8, 12 / scale); // adaptive tolerance based on zoom
  if (s.type === 'circle') {
    return Math.sqrt((px - s.x) ** 2 + (py - s.y) ** 2) <= s.radius + tol;
  }
  if (s.type === 'line') {
    const x2 = s.x2 ?? s.x;
    const y2 = s.y2 ?? s.y;
    const len = Math.sqrt((x2 - s.x) ** 2 + (y2 - s.y) ** 2);
    if (len < 1) return false;
    const t = Math.max(0, Math.min(1, ((px - s.x) * (x2 - s.x) + (py - s.y) * (y2 - s.y)) / (len * len)));
    const projX = s.x + t * (x2 - s.x);
    const projY = s.y + t * (y2 - s.y);
    return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2) <= tol;
  }
  if (s.type === 'slot') {
    const sl = (s.slotLength ?? 20) / 2;
    return Math.abs(px - s.x) <= sl + tol && Math.abs(py - s.y) <= s.radius + tol;
  }
  const hw = Math.max((s.width || 20) / 2, 3) + tol;
  const hh = Math.max((s.height || 20) / 2, 3) + tol;
  return Math.abs(px - s.x) <= hw && Math.abs(py - s.y) <= hh;
}

function isPointNearMeasurement(px: number, py: number, m: { x1: number; y1: number; x2: number; y2: number }): boolean {
  const tol = 8;
  const len = Math.sqrt((m.x2 - m.x1) ** 2 + (m.y2 - m.y1) ** 2);
  if (len < 1) return false;
  const t = Math.max(0, Math.min(1, ((px - m.x1) * (m.x2 - m.x1) + (py - m.y1) * (m.y2 - m.y1)) / (len * len)));
  const projX = m.x1 + t * (m.x2 - m.x1);
  const projY = m.y1 + t * (m.y2 - m.y1);
  return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2) <= tol;
}

/** Detect which edge of a rectangular shape is near the cursor */
function detectEdge(px: number, py: number, s: CadShapeT, scale: number): 'left' | 'right' | 'top' | 'bottom' | null {
  const edgeTol = Math.max(6, 10 / scale);
  let hw: number, hh: number;
  if (s.type === 'slot') {
    hw = (s.slotLength ?? 20) / 2;
    hh = s.radius;
  } else {
    hw = s.width / 2;
    hh = s.height / 2;
  }
  const left = s.x - hw, right = s.x + hw;
  const top = s.y - hh, bottom = s.y + hh;

  const dists = [
    { edge: 'left' as const, d: Math.abs(px - left) },
    { edge: 'right' as const, d: Math.abs(px - right) },
    { edge: 'top' as const, d: Math.abs(py - top) },
    { edge: 'bottom' as const, d: Math.abs(py - bottom) },
  ];

  const nearest = dists.reduce((a, b) => a.d < b.d ? a : b);
  return nearest.d <= edgeTol ? nearest.edge : null;
}
