import { useMemo } from 'react';
import * as THREE from 'three';

interface HingeCutoutProps {
  /** Cutout width in scene units */
  width: number;
  /** Cutout height in scene units */
  height: number;
  /** Offset from glass edge in scene units */
  edgeOffset: number;
  /** Glass thickness in scene units */
  glassThickness: number;
}

/**
 * 3D component that renders a hinge cutout on the glass edge.
 * Positioned so the cutout is on the hinge-side edge of the door.
 * Parent must position this at the correct Y (hinge position) and X (door edge).
 */
export function HingeCutout({ width, height, edgeOffset, glassThickness }: HingeCutoutProps) {
  const shape = useMemo(() => {
    const r = 0.002; // corner radius in scene units (~2mm)
    const w = width;
    const h = height;
    const s = new THREE.Shape();
    
    // Rounded rectangle
    s.moveTo(-w / 2 + r, -h / 2);
    s.lineTo(w / 2 - r, -h / 2);
    s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    s.lineTo(w / 2, h / 2 - r);
    s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    s.lineTo(-w / 2 + r, h / 2);
    s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    s.lineTo(-w / 2, -h / 2 + r);
    s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    
    return s;
  }, [width, height]);

  const extrudeSettings = useMemo(() => ({
    depth: glassThickness + 0.001, // slightly thicker than glass for visibility
    bevelEnabled: false,
  }), [glassThickness]);

  return (
    <mesh rotation={[0, Math.PI / 2, 0]} position={[0, 0, -glassThickness / 2 - 0.0005]}>
      <extrudeGeometry args={[shape, extrudeSettings]} />
      <meshStandardMaterial
        color="#cc3333"
        transparent
        opacity={0.6}
        roughness={0.4}
        metalness={0.1}
        depthWrite={false}
      />
    </mesh>
  );
}
