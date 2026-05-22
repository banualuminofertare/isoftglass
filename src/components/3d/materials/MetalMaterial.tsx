import type { FinishType } from '@/types/calculators';
import { useFinishColor } from '@/hooks/useFinishColor';

interface MetalMaterialProps {
  finish?: FinishType | string;
  colorHex?: string | null;
}

export function useMetalMaterial({ finish = 'polished_stainless', colorHex }: MetalMaterialProps = {}) {
  const resolved = useFinishColor(finish);
  const color = colorHex || resolved.colorHex;
  const roughness = resolved.roughness;

  // Can't use useMemo with MeshStandardMaterial + hooks, return props instead
  return { color, metalness: 0.9, roughness };
}

// Declarative component version
export function MetalMaterial({ 
  finish = 'polished_stainless',
  colorHex,
  attach = 'material'
}: MetalMaterialProps & { attach?: string }) {
  const resolved = useFinishColor(finish);
  const color = colorHex || resolved.colorHex;

  return (
    <meshStandardMaterial
      attach={attach}
      color={color}
      metalness={0.9}
      roughness={resolved.roughness}
    />
  );
}
