import { useMemo } from 'react';
import { MeshStandardMaterial } from 'three';
import type { MirrorType } from '@/types/calculators';

interface MirrorMaterialProps {
  type?: MirrorType;
}

const mirrorColors: Record<MirrorType, string> = {
  silver: '#e8e8e8',
  bronze: '#b8956e',
  grey: '#808080',
};

export function useMirrorMaterial({ type = 'silver' }: MirrorMaterialProps = {}) {
  return useMemo(() => {
    return new MeshStandardMaterial({
      color: mirrorColors[type],
      metalness: 1,
      roughness: 0.02,
      envMapIntensity: 1.5,
    });
  }, [type]);
}

// Declarative component version
export function MirrorMaterial({ 
  type = 'silver',
  attach = 'material'
}: MirrorMaterialProps & { attach?: string }) {
  return (
    <meshStandardMaterial
      attach={attach}
      color={mirrorColors[type]}
      metalness={1}
      roughness={0.02}
      envMapIntensity={1.5}
    />
  );
}
