import type { CadShape as CadShapeT, Measurement } from './cadTypes';
import { buildLShapePath } from './cadTypes';

/** Format dimension: show decimal with comma only when needed (44 → "44", 44.5 → "44,5") */
function fmtDim(v: number): string {
  const r = Math.round(v * 10) / 10;
  return r % 1 === 0 ? String(r) : r.toFixed(1).replace('.', ',');
}

interface Props {
  shape: CadShapeT;
  scale: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  glassWidth: number;
  glassHeight: number;
  tool?: string;
}

export function CadShapeRenderer({ shape, scale, isSelected, onSelect, glassWidth, glassHeight, tool }: Props) {
  const panelColor = shape.targetPanel === 'fixed_left' ? '#e67e22' : shape.targetPanel === 'fixed_right' ? '#27ae60' : null;
  const stroke = isSelected ? 'hsl(var(--primary))' : (panelColor || '#171d2d');
  const strokeW = isSelected ? 2.5 : 1.5;
  const sx = shape.x * scale;
  const sy = shape.y * scale;
  const hasCuts = shape.cuts && shape.cuts.length > 0;
  const maskId = `mask-${shape.id}`;

  const handleClick = (e: React.MouseEvent) => {
    if (tool === 'select') {
      e.stopPropagation();
      onSelect(shape.id);
    }
    // For trim, eraser, subtract, move — let event propagate to SVG
  };

  // Render cut mask definition (white = visible, black = cut away)
  const renderCutMask = (bx: number, by: number, bw: number, bh: number) => {
    if (!hasCuts) return null;
    return (
      <defs>
        <mask id={maskId}>
          <rect x={bx - 20} y={by - 20} width={bw + 40} height={bh + 40} fill="white" />
          {shape.cuts!.map(cut => {
            if (cut.cutType === 'circle') {
              return (
                <circle
                  key={cut.id}
                  cx={cut.x * scale}
                  cy={cut.y * scale}
                  r={cut.radius * scale}
                  fill="black"
                />
              );
            }
            const cutX = (cut.x - cut.width / 2) * scale;
            const cutY = (cut.y - cut.height / 2) * scale;
            const cutW = cut.width * scale;
            const cutH = cut.height * scale;
            const cutCx = cut.x * scale;
            const cutCy = cut.y * scale;
            const rot = cut.rotation ?? 0;
            return (
              <rect
                key={cut.id}
                x={cutX}
                y={cutY}
                width={cutW}
                height={cutH}
                fill="black"
                transform={rot ? `rotate(${rot}, ${cutCx}, ${cutCy})` : undefined}
              />
            );
          })}
        </mask>
      </defs>
    );
  };

  // Render cut outlines (dashed red borders)
  const renderCutOutlines = () => {
    if (!hasCuts || !isSelected) return null;
    return shape.cuts!.map(cut => {
      if (cut.cutType === 'circle') {
        return (
          <circle
            key={`cut-${cut.id}`}
            cx={cut.x * scale}
            cy={cut.y * scale}
            r={cut.radius * scale}
            fill="hsl(var(--destructive) / 0.08)"
            stroke="hsl(var(--destructive) / 0.5)"
            strokeWidth={0.8}
            strokeDasharray="3,2"
          />
        );
      }
      const rot = cut.rotation ?? 0;
      const cutCx = cut.x * scale;
      const cutCy = cut.y * scale;
      return (
        <g key={`cut-${cut.id}`} transform={rot ? `rotate(${rot}, ${cutCx}, ${cutCy})` : undefined}>
          <rect
            x={(cut.x - cut.width / 2) * scale}
            y={(cut.y - cut.height / 2) * scale}
            width={cut.width * scale}
            height={cut.height * scale}
            fill="hsl(var(--destructive) / 0.08)"
            stroke="hsl(var(--destructive) / 0.5)"
            strokeWidth={0.8}
            strokeDasharray="3,2"
          />
        </g>
      );
    });
  };

  const maskAttr = hasCuts ? { mask: `url(#${maskId})` } : {};

  // Edge distance lines for selected shape
  const edgeLines: React.ReactNode[] = [];
  if (isSelected && shape.type !== 'line') {
    const dashStyle = '3,2';
    const edgeColor = 'hsl(var(--destructive) / 0.5)';
    const fontSize = Math.max(8, 9);

    const getBounds = () => {
      if (shape.type === 'circle') {
        return { left: shape.x - shape.radius, top: shape.y - shape.radius, right: shape.x + shape.radius, bottom: shape.y + shape.radius };
      }
      if (shape.type === 'slot') {
        const sl = (shape.slotLength ?? 20) / 2;
        return { left: shape.x - sl, top: shape.y - shape.radius, right: shape.x + sl, bottom: shape.y + shape.radius };
      }
      return { left: shape.x - shape.width / 2, top: shape.y - shape.height / 2, right: shape.x + shape.width / 2, bottom: shape.y + shape.height / 2 };
    };

    const { left, top, right, bottom } = getBounds();
    const leftPx = left * scale;
    const topPx = top * scale;
    const rightPx = right * scale;
    const bottomPx = bottom * scale;
    const glassRPx = glassWidth * scale;
    const glassBPx = glassHeight * scale;

    if (left > 0) {
      edgeLines.push(
        <line key="el" x1={0} y1={sy} x2={leftPx} y2={sy} stroke={edgeColor} strokeWidth={0.7} strokeDasharray={dashStyle} />,
        <text key="elt" x={leftPx / 2} y={sy - 4} textAnchor="middle" fontSize={fontSize} fill="hsl(var(--destructive))" className="select-none">{fmtDim(left)}</text>
      );
    }
    if (top > 0) {
      edgeLines.push(
        <line key="et" x1={sx} y1={0} x2={sx} y2={topPx} stroke={edgeColor} strokeWidth={0.7} strokeDasharray={dashStyle} />,
        <text key="ett" x={sx + 4} y={topPx / 2} fontSize={fontSize} fill="hsl(var(--destructive))" className="select-none">{fmtDim(top)}</text>
      );
    }
    const rightDist = glassWidth - right;
    if (rightDist > 0) {
      edgeLines.push(
        <line key="er" x1={rightPx} y1={sy} x2={glassRPx} y2={sy} stroke={edgeColor} strokeWidth={0.7} strokeDasharray={dashStyle} />,
        <text key="ert" x={(rightPx + glassRPx) / 2} y={sy - 4} textAnchor="middle" fontSize={fontSize} fill="hsl(var(--destructive))" className="select-none">{fmtDim(rightDist)}</text>
      );
    }
    const bottomDist = glassHeight - bottom;
    if (bottomDist > 0) {
      edgeLines.push(
        <line key="eb" x1={sx} y1={bottomPx} x2={sx} y2={glassBPx} stroke={edgeColor} strokeWidth={0.7} strokeDasharray={dashStyle} />,
        <text key="ebt" x={sx + 4} y={(bottomPx + glassBPx) / 2} fontSize={fontSize} fill="hsl(var(--destructive))" className="select-none">{fmtDim(bottomDist)}</text>
      );
    }
  }

  const labelEl = shape.label ? (
    <text x={sx} y={sy - (shape.type === 'circle' ? shape.radius * scale : (shape.height || 10) * scale / 2) - 6}
      textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))" className="select-none">{shape.label}</text>
  ) : null;

  // Circle
  if (shape.type === 'circle') {
    const r = shape.radius * scale;
    return (
      <g onClick={handleClick} className="cursor-pointer">
        {renderCutMask(sx - r, sy - r, r * 2, r * 2)}
        {edgeLines}
        <circle cx={sx} cy={sy} r={r} fill="white" fillOpacity={0.6} stroke={stroke} strokeWidth={strokeW} {...maskAttr} />
        <line x1={sx - 4} y1={sy} x2={sx + 4} y2={sy} stroke={stroke} strokeWidth={0.5} />
        <line x1={sx} y1={sy - 4} x2={sx} y2={sy + 4} stroke={stroke} strokeWidth={0.5} />
        <text x={sx} y={sy + r + 12} textAnchor="middle" fontSize="10" fill="hsl(var(--foreground))" className="select-none">
          ⌀{fmtDim(shape.radius * 2)}
        </text>
        {renderCutOutlines()}
        {labelEl}
      </g>
    );
  }

  // Line (no cuts for lines)
  if (shape.type === 'line') {
    const lx2 = (shape.x2 ?? shape.x) * scale;
    const ly2 = (shape.y2 ?? shape.y) * scale;
    const len = Math.sqrt(Math.pow((shape.x2 ?? shape.x) - shape.x, 2) + Math.pow((shape.y2 ?? shape.y) - shape.y, 2));
    const mx = (sx + lx2) / 2;
    const my = (sy + ly2) / 2;
    return (
      <g onClick={handleClick} className="cursor-pointer">
        <line x1={sx} y1={sy} x2={lx2} y2={ly2} stroke={stroke} strokeWidth={strokeW} />
        <circle cx={sx} cy={sy} r={3} fill={stroke} />
        <circle cx={lx2} cy={ly2} r={3} fill={stroke} />
        <text x={mx} y={my - 6} textAnchor="middle" fontSize="10" fill="hsl(var(--foreground))" className="select-none">
          {fmtDim(len)}
        </text>
        {labelEl}
      </g>
    );
  }

  // Slot (oblong hole)
  if (shape.type === 'slot') {
    const sl = (shape.slotLength ?? 20) * scale;
    const sr = shape.radius * scale;
    const rot = shape.rotation || 0;
    return (
      <g onClick={handleClick} className="cursor-pointer" transform={rot ? `rotate(${rot}, ${sx}, ${sy})` : undefined}>
        {renderCutMask(sx - sl / 2, sy - sr, sl, sr * 2)}
        {edgeLines}
        <rect x={sx - sl / 2} y={sy - sr} width={sl} height={sr * 2} rx={sr}
          fill="white" fillOpacity={0.6} stroke={stroke} strokeWidth={strokeW} {...maskAttr} />
        <line x1={sx - 2} y1={sy} x2={sx + 2} y2={sy} stroke={stroke} strokeWidth={0.5} />
        <text x={sx} y={sy + sr + 12} textAnchor="middle" fontSize="10" fill="hsl(var(--foreground))" className="select-none">
          {fmtDim(shape.slotLength ?? 20)}×⌀{fmtDim(shape.radius * 2)}
        </text>
        {renderCutOutlines()}
        {labelEl}
      </g>
    );
  }

  // L-shape
  if (shape.type === 'lshape') {
    const sw = shape.width * scale;
    const sh = shape.height * scale;
    const cw = (shape.lCutWidth ?? 0) * scale;
    const ch = (shape.lCutHeight ?? 0) * scale;
    const path = buildLShapePath(sx, sy, sw, sh, cw, ch, shape.lCorner ?? 'tr');
    return (
      <g onClick={handleClick} className="cursor-pointer">
        {renderCutMask(sx - sw / 2, sy - sh / 2, sw, sh)}
        {edgeLines}
        <path d={path} fill="white" fillOpacity={0.6} stroke={stroke} strokeWidth={strokeW} {...maskAttr} />
        <text x={sx} y={sy - sh / 2 - 4} textAnchor="middle" fontSize="10" fill="hsl(var(--foreground))" className="select-none">
          {fmtDim(shape.width)}×{fmtDim(shape.height)}
        </text>
        {renderCutOutlines()}
        {labelEl}
      </g>
    );
  }

  // Rect / Stadium
  const sw = shape.width * scale;
  const sh = shape.height * scale;
  const chamfer = (shape.chamferSize ?? 0) * scale;
  const fillet = (shape.cornerRadius ?? 0) * scale;
  const rx = shape.type === 'stadium' ? Math.min(sh / 2, sw / 2) : fillet;
  const rot = shape.rotation || 0;
  const oe = shape.openEdges;
  const hasOpenEdges = oe && (oe.top || oe.right || oe.bottom || oe.left);

  // If chamfer is set (and not stadium), render as path with chamfered corners
  if (chamfer > 0 && shape.type === 'rect') {
    const l = sx - sw / 2, t = sy - sh / 2, r = sx + sw / 2, b = sy + sh / 2;
    const c = Math.min(chamfer, sw / 2, sh / 2);
    const chamferPath = `M${l + c},${t} L${r - c},${t} L${r},${t + c} L${r},${b - c} L${r - c},${b} L${l + c},${b} L${l},${b - c} L${l},${t + c} Z`;
    return (
      <g onClick={handleClick} className="cursor-pointer" transform={rot ? `rotate(${rot}, ${sx}, ${sy})` : undefined}>
        {renderCutMask(sx - sw / 2, sy - sh / 2, sw, sh)}
        {edgeLines}
        <path d={chamferPath} fill="white" fillOpacity={0.6} stroke={stroke} strokeWidth={strokeW} {...maskAttr} />
        <text x={sx} y={sy - sh / 2 - 4} textAnchor="middle" fontSize="10" fill="hsl(var(--foreground))" className="select-none">
          {fmtDim(shape.width)}
        </text>
        <text x={sx + sw / 2 + 4} y={sy} textAnchor="start" fontSize="10" fill="hsl(var(--foreground))" dominantBaseline="middle" className="select-none">
          {fmtDim(shape.height)}
        </text>
        {renderCutOutlines()}
        {labelEl}
      </g>
    );
  }

  // Open edges: render only active sides as separate line segments (no fill)
  if (hasOpenEdges && shape.type === 'rect') {
    const l = sx - sw / 2, t = sy - sh / 2, r = sx + sw / 2, b = sy + sh / 2;
    const segments: React.ReactNode[] = [];
    if (!oe!.top) segments.push(<line key="top" x1={l} y1={t} x2={r} y2={t} stroke={stroke} strokeWidth={strokeW} />);
    if (!oe!.right) segments.push(<line key="right" x1={r} y1={t} x2={r} y2={b} stroke={stroke} strokeWidth={strokeW} />);
    if (!oe!.bottom) segments.push(<line key="bottom" x1={r} y1={b} x2={l} y2={b} stroke={stroke} strokeWidth={strokeW} />);
    if (!oe!.left) segments.push(<line key="left" x1={l} y1={b} x2={l} y2={t} stroke={stroke} strokeWidth={strokeW} />);
    return (
      <g onClick={handleClick} className="cursor-pointer" transform={rot ? `rotate(${rot}, ${sx}, ${sy})` : undefined}>
        {edgeLines}
        {segments}
        <text x={sx} y={sy - sh / 2 - 4} textAnchor="middle" fontSize="10" fill="hsl(var(--foreground))" className="select-none">
          {fmtDim(shape.width)}
        </text>
        <text x={sx + sw / 2 + 4} y={sy} textAnchor="start" fontSize="10" fill="hsl(var(--foreground))" dominantBaseline="middle" className="select-none">
          {fmtDim(shape.height)}
        </text>
        {labelEl}
      </g>
    );
  }

  return (
    <g onClick={handleClick} className="cursor-pointer" transform={rot ? `rotate(${rot}, ${sx}, ${sy})` : undefined}>
      {renderCutMask(sx - sw / 2, sy - sh / 2, sw, sh)}
      {edgeLines}
      <rect x={sx - sw / 2} y={sy - sh / 2} width={sw} height={sh} rx={rx}
        fill="white" fillOpacity={0.6} stroke={stroke} strokeWidth={strokeW} {...maskAttr} />
      <text x={sx} y={sy - sh / 2 - 4} textAnchor="middle" fontSize="10" fill="hsl(var(--foreground))" className="select-none">
        {fmtDim(shape.width)}
      </text>
      <text x={sx + sw / 2 + 4} y={sy} textAnchor="start" fontSize="10" fill="hsl(var(--foreground))" dominantBaseline="middle" className="select-none">
        {fmtDim(shape.height)}
      </text>
      {renderCutOutlines()}
      {labelEl}
    </g>
  );
}

/** Measurement line renderer */
export function MeasurementRenderer({ m, scale }: { m: Measurement; scale: number }) {
  const x1 = m.x1 * scale;
  const y1 = m.y1 * scale;
  const x2 = m.x2 * scale;
  const y2 = m.y2 * scale;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;

  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(var(--chart-3))" strokeWidth={1.5} strokeDasharray="6,3" />
      <circle cx={x1} cy={y1} r={3} fill="hsl(var(--chart-3))" />
      <circle cx={x2} cy={y2} r={3} fill="hsl(var(--chart-3))" />
      <rect x={mx - 20} y={my - 10} width={40} height={16} rx={3} fill="hsl(var(--background))" stroke="hsl(var(--chart-3))" strokeWidth={0.5} />
      <text x={mx} y={my + 2} textAnchor="middle" fontSize="10" fill="hsl(var(--chart-3))" fontWeight="bold" className="select-none">
        {fmtDim(m.distance)}
      </text>
    </g>
  );
}