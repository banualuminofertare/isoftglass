import { SheetResult, PlacedPanel } from '@/lib/cutting/guillotineCut';

const COLORS = [
  'hsl(210, 70%, 75%)', 'hsl(150, 60%, 70%)', 'hsl(40, 80%, 75%)',
  'hsl(280, 50%, 75%)', 'hsl(0, 60%, 75%)', 'hsl(180, 50%, 70%)',
  'hsl(60, 70%, 70%)', 'hsl(320, 50%, 75%)', 'hsl(100, 50%, 70%)',
  'hsl(220, 60%, 80%)',
];

interface Props {
  sheet: SheetResult;
  sheetWidth: number;
  sheetHeight: number;
  sheetIndex: number;
}

/** Extract unique sorted cut positions from placed panels */
function getCutPositions(panels: PlacedPanel[], sheetWidth: number, sheetHeight: number) {
  const xCuts = new Set<number>();
  const yCuts = new Set<number>();

  for (const p of panels) {
    if (p.x > 0) xCuts.add(p.x);
    if (p.x + p.w < sheetWidth) xCuts.add(p.x + p.w);
    if (p.y > 0) yCuts.add(p.y);
    if (p.y + p.h < sheetHeight) yCuts.add(p.y + p.h);
  }

  return {
    xPositions: [0, ...Array.from(xCuts).sort((a, b) => a - b), sheetWidth],
    yPositions: [0, ...Array.from(yCuts).sort((a, b) => a - b), sheetHeight],
  };
}

export function SheetVisualization({ sheet, sheetWidth, sheetHeight, sheetIndex }: Props) {
  const dimBarH = 36;
  const dimBarW = 44;
  const padding = 24;
  const topPad = padding + dimBarH;
  const leftPad = padding + dimBarW;
  const maxSvgWidth = 800;
  const scale = Math.min((maxSvgWidth - leftPad - padding) / sheetWidth, 420 / sheetHeight);
  const svgW = sheetWidth * scale + leftPad + padding;
  const svgH = sheetHeight * scale + topPad + padding + dimBarH + 8;

  const sheetArea = sheetWidth * sheetHeight;
  const wastePercent = sheetArea > 0
    ? Math.round(((sheetArea - sheet.usedArea) / sheetArea) * 10000) / 100
    : 0;

  const { xPositions, yPositions } = getCutPositions(sheet.panels, sheetWidth, sheetHeight);

  const dimFontSize = Math.max(7, Math.min(10, scale * 40));
  const tickLen = 4;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">
          Coala {sheetIndex + 1} — {sheet.panels.length} panouri
        </h3>
        <span className={`text-xs font-medium px-2 py-0.5 rounded ${wastePercent > 30 ? 'bg-red-100 text-red-700' : wastePercent > 15 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
          Pierderi: {wastePercent}%
        </span>
      </div>
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full border rounded-lg bg-muted/30" style={{ maxWidth: maxSvgWidth }}>
        <defs>
          <pattern id={`waste-${sheetIndex}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" opacity="0.3" />
          </pattern>
          {/* ClipPaths for each panel */}
          {sheet.panels.map((p, i) => {
            const x = leftPad + p.x * scale;
            const y = topPad + p.y * scale;
            const w = p.w * scale;
            const h = p.h * scale;
            return (
              <clipPath key={`clip-${i}`} id={`panel-clip-${sheetIndex}-${i}`}>
                <rect x={x + 2} y={y + 2} width={Math.max(0, w - 4)} height={Math.max(0, h - 4)} />
              </clipPath>
            );
          })}
        </defs>

        {/* Sheet background with hatch for waste */}
        <rect
          x={leftPad} y={topPad}
          width={sheetWidth * scale} height={sheetHeight * scale}
          fill={`url(#waste-${sheetIndex})`}
          stroke="hsl(var(--border))" strokeWidth="1.5"
        />

        {/* Panels */}
        {sheet.panels.map((p, i) => {
          const x = leftPad + p.x * scale;
          const y = topPad + p.y * scale;
          const w = p.w * scale;
          const h = p.h * scale;
          const color = COLORS[i % COLORS.length];
          const minDim = Math.min(w, h);
          const showText = minDim > 28;
          const fontSize = minDim > 50 ? 10 : minDim > 35 ? 8 : 7;

          return (
            <g key={i}>
              <rect x={x} y={y} width={w} height={h}
                fill={color} stroke="hsl(var(--foreground))" strokeWidth="0.8" rx="1" opacity="0.85" />
              {showText && (
                <g clipPath={`url(#panel-clip-${sheetIndex}-${i})`}>
                  <text x={x + w / 2} y={y + h / 2 - fontSize * 0.5} textAnchor="middle"
                    fontSize={fontSize} fontWeight="600" fill="hsl(var(--foreground))">
                    {p.label}
                  </text>
                  <text x={x + w / 2} y={y + h / 2 + fontSize * 0.8} textAnchor="middle"
                    fontSize={fontSize * 0.8} fill="hsl(var(--muted-foreground))">
                    {p.w}×{p.h}{p.rotated ? ' ↻' : ''}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* ---- HORIZONTAL DIMENSION CHAIN (top) ---- */}
        {xPositions.map((pos, i) => {
          if (i === xPositions.length - 1) return null;
          const x1 = leftPad + pos * scale;
          const x2 = leftPad + xPositions[i + 1] * scale;
          const segW = xPositions[i + 1] - pos;
          const cy = topPad - dimBarH / 2;
          const midX = (x1 + x2) / 2;
          const segPx = x2 - x1;

          if (segW <= 0) return null;

          return (
            <g key={`hd-${i}`}>
              {/* tick marks */}
              <line x1={x1} y1={cy - tickLen} x2={x1} y2={cy + tickLen}
                stroke="hsl(var(--primary))" strokeWidth="0.8" />
              <line x1={x2} y1={cy - tickLen} x2={x2} y2={cy + tickLen}
                stroke="hsl(var(--primary))" strokeWidth="0.8" />
              {/* dimension line */}
              <line x1={x1 + 1} y1={cy} x2={x2 - 1} y2={cy}
                stroke="hsl(var(--primary))" strokeWidth="0.6" />
              {/* arrows */}
              <polygon points={`${x1},${cy} ${x1 + 3},${cy - 2} ${x1 + 3},${cy + 2}`}
                fill="hsl(var(--primary))" />
              <polygon points={`${x2},${cy} ${x2 - 3},${cy - 2} ${x2 - 3},${cy + 2}`}
                fill="hsl(var(--primary))" />
              {/* label with background */}
              {segPx > 30 && (
                <>
                  <rect
                    x={midX - String(segW).length * dimFontSize * 0.32}
                    y={cy - dimFontSize - 2}
                    width={String(segW).length * dimFontSize * 0.64 + 4}
                    height={dimFontSize + 2}
                    fill="hsl(var(--background))" opacity="0.85" rx="1"
                  />
                  <text x={midX} y={cy - 3} textAnchor="middle"
                    fontSize={dimFontSize} fontWeight="500" fill="hsl(var(--primary))">
                    {segW}
                  </text>
                </>
              )}
            </g>
          );
        })}

        {/* ---- VERTICAL DIMENSION CHAIN (left) ---- */}
        {yPositions.map((pos, i) => {
          if (i === yPositions.length - 1) return null;
          const y1 = topPad + pos * scale;
          const y2 = topPad + yPositions[i + 1] * scale;
          const segH = yPositions[i + 1] - pos;
          const cx = leftPad - dimBarW / 2;
          const midY = (y1 + y2) / 2;
          const segPx = y2 - y1;

          if (segH <= 0) return null;

          return (
            <g key={`vd-${i}`}>
              {/* tick marks */}
              <line x1={cx - tickLen} y1={y1} x2={cx + tickLen} y2={y1}
                stroke="hsl(var(--primary))" strokeWidth="0.8" />
              <line x1={cx - tickLen} y1={y2} x2={cx + tickLen} y2={y2}
                stroke="hsl(var(--primary))" strokeWidth="0.8" />
              {/* dimension line */}
              <line x1={cx} y1={y1 + 1} x2={cx} y2={y2 - 1}
                stroke="hsl(var(--primary))" strokeWidth="0.6" />
              {/* arrows */}
              <polygon points={`${cx},${y1} ${cx - 2},${y1 + 3} ${cx + 2},${y1 + 3}`}
                fill="hsl(var(--primary))" />
              <polygon points={`${cx},${y2} ${cx - 2},${y2 - 3} ${cx + 2},${y2 - 3}`}
                fill="hsl(var(--primary))" />
              {/* label with background */}
              {segPx > 30 && (
                <g transform={`rotate(-90, ${cx}, ${midY})`}>
                  <rect
                    x={cx - String(segH).length * dimFontSize * 0.32 - 2}
                    y={midY - dimFontSize * 0.6}
                    width={String(segH).length * dimFontSize * 0.64 + 4}
                    height={dimFontSize + 2}
                    fill="hsl(var(--background))" opacity="0.85" rx="1"
                  />
                  <text x={cx} y={midY + dimFontSize * 0.35} textAnchor="middle"
                    fontSize={dimFontSize} fontWeight="500" fill="hsl(var(--primary))">
                    {segH}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Total dimension labels */}
        <text x={leftPad + sheetWidth * scale / 2} y={svgH - 6}
          textAnchor="middle" fontSize="11" fill="hsl(var(--foreground))" fontWeight="600">
          {sheetWidth} mm
        </text>
        <text x={10} y={topPad + sheetHeight * scale / 2}
          textAnchor="middle" fontSize="11" fill="hsl(var(--foreground))" fontWeight="600"
          transform={`rotate(-90, 10, ${topPad + sheetHeight * scale / 2})`}>
          {sheetHeight} mm
        </text>
      </svg>
    </div>
  );
}
