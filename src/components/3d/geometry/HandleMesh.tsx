import { MetalMaterial } from '@/components/3d/materials/MetalMaterial';
import type { FinishType } from '@/types/calculators';

interface HandleMeshProps {
  model: 'bar' | 'round' | 'square' | string;
  length: number; // already scaled (three.js units)
  finish?: FinishType | string;
  colorHex?: string | null;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

/**
 * Renders a 3D handle with geometry matching the selected model.
 * - bar:    vertical cylinder + 2 horizontal support pins ("H" pull bar)
 * - round:  spherical knob + short mounting cylinder
 * - square: rectangular box + 2 box supports
 */
export function HandleMesh({
  model,
  length,
  finish = 'polished_stainless',
  colorHex,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: HandleMeshProps) {
  const matProps = { finish, colorHex };
  const supportOffset = length / 2 - Math.min(length * 0.15, 0.03);
  const standoff = 0.015; // distance from glass surface

  if (model === 'round') {
    // Spherical knob
    return (
      <group position={position} rotation={rotation}>
        {/* Mounting cylinder */}
        <mesh position={[0, 0, -standoff / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.006, 0.006, standoff, 12]} />
          <MetalMaterial {...matProps} />
        </mesh>
        {/* Knob sphere */}
        <mesh position={[0, 0, standoff * 0.3]}>
          <sphereGeometry args={[0.018, 16, 16]} />
          <MetalMaterial {...matProps} />
        </mesh>
      </group>
    );
  }

  if (model === 'square') {
    // Square bar handle
    const barSize = 0.016;
    return (
      <group position={position} rotation={rotation}>
        {/* Main square bar (vertical) */}
        <mesh position={[0, 0, standoff]}>
          <boxGeometry args={[barSize, length, barSize]} />
          <MetalMaterial {...matProps} />
        </mesh>
        {/* Top support */}
        <mesh position={[0, supportOffset, standoff / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[barSize * 0.8, standoff, barSize * 0.8]} />
          <MetalMaterial {...matProps} />
        </mesh>
        {/* Bottom support */}
        <mesh position={[0, -supportOffset, standoff / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[barSize * 0.8, standoff, barSize * 0.8]} />
          <MetalMaterial {...matProps} />
        </mesh>
      </group>
    );
  }

  // Default: bar (round pull bar with H-shape supports)
  return (
    <group position={position} rotation={rotation}>
      {/* Main bar (vertical cylinder) */}
      <mesh position={[0, 0, standoff]}>
        <cylinderGeometry args={[0.01, 0.01, length, 16]} />
        <MetalMaterial {...matProps} />
      </mesh>
      {/* Top support pin */}
      <mesh position={[0, supportOffset, standoff / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.005, 0.005, standoff, 8]} />
        <MetalMaterial {...matProps} />
      </mesh>
      {/* Bottom support pin */}
      <mesh position={[0, -supportOffset, standoff / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.005, 0.005, standoff, 8]} />
        <MetalMaterial {...matProps} />
      </mesh>
    </group>
  );
}
