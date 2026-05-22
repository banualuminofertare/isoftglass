import type { ShowerConfig } from '@/types/calculators';
import { DimensionLabel } from './DimensionLabel';

interface DimensionLinesProps {
  config: ShowerConfig;
}

const SCALE = 0.001;
const GAP = 0.12;

export function DimensionLines({ config }: DimensionLinesProps) {
  const { cabinType, dimensions } = config;
  const w = dimensions.width * SCALE;
  const h = dimensions.height * SCALE;
  const d = dimensions.depth * SCALE;

  const hasDepth = cabinType === 'corner_90' || cabinType === 'pentagon';

  return (
    <group>
      {/* ── Total width (bottom, along X) ── */}
      <DimensionLabel
        start={[-w / 2, -h / 2 - GAP, hasDepth ? d / 2 : 0]}
        end={[w / 2, -h / 2 - GAP, hasDepth ? d / 2 : 0]}
        value={dimensions.width}
        offset={[0, -1, 0]}
      />

      {/* ── Height (right side, along Y) ── */}
      <DimensionLabel
        start={[w / 2 + GAP * 1.2, -h / 2, hasDepth ? d / 2 : 0]}
        end={[w / 2 + GAP * 1.2, h / 2, hasDepth ? d / 2 : 0]}
        value={dimensions.height}
        offset={[1, 0, 0]}
      />

      {/* ── Depth (for corner_90 / pentagon, along Z — far left, horizontal) ── */}
      {hasDepth && (
        <DimensionLabel
          start={[-w / 2 - GAP * 1.2, -h / 2 - GAP, -d / 2]}
          end={[-w / 2 - GAP * 1.2, -h / 2 - GAP, d / 2]}
          value={dimensions.depth}
          offset={[0, -1, 0]}
        />
      )}
    </group>
  );
}
