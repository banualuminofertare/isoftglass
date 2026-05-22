import { DimensionLabel } from './DimensionLabel';

interface SimpleDimensionLinesProps {
  /** Width in mm */
  widthMm: number;
  /** Height in mm */
  heightMm: number;
  /** Depth in mm (optional, for 3D cabins) */
  depthMm?: number;
  /** Y offset for the group center (default 0 = centered at origin) */
  yOffset?: number;
}

const SCALE = 0.001;
const GAP = 0.12;

export function SimpleDimensionLines({ widthMm, heightMm, depthMm, yOffset = 0 }: SimpleDimensionLinesProps) {
  const w = widthMm * SCALE;
  const h = heightMm * SCALE;
  const d = depthMm ? depthMm * SCALE : 0;
  const hasDepth = !!depthMm && depthMm > 0;

  return (
    <group position={[0, yOffset, 0]}>
      {/* ── Total width (bottom, along X) ── */}
      <DimensionLabel
        start={[-w / 2, -h / 2 - GAP, hasDepth ? d / 2 : 0]}
        end={[w / 2, -h / 2 - GAP, hasDepth ? d / 2 : 0]}
        value={widthMm}
        offset={[0, -1, 0]}
      />

      {/* ── Height (right side, along Y) ── */}
      <DimensionLabel
        start={[w / 2 + GAP * 1.2, -h / 2, hasDepth ? d / 2 : 0]}
        end={[w / 2 + GAP * 1.2, h / 2, hasDepth ? d / 2 : 0]}
        value={heightMm}
        offset={[1, 0, 0]}
      />

      {/* ── Depth (far left, horizontal) ── */}
      {hasDepth && (
        <DimensionLabel
          start={[-w / 2 - GAP * 1.2, -h / 2 - GAP, -d / 2]}
          end={[-w / 2 - GAP * 1.2, -h / 2 - GAP, d / 2]}
          value={depthMm!}
          offset={[0, -1, 0]}
        />
      )}
    </group>
  );
}
