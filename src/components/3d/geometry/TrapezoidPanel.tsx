import { useMemo } from 'react';
import * as THREE from 'three';
import { GlassMaterial } from '@/components/3d/materials/GlassMaterial';

interface TrapezoidPanelProps {
  width: number;       // Panel width (scene units)
  heightLeft: number;  // Left edge height (scene units)
  heightRight: number; // Right edge height (scene units)
  thickness: number;   // Glass thickness (scene units)
  position: [number, number, number];
  rotation?: [number, number, number];
  glassType: string;
}

/**
 * Creates a trapezoidal glass panel with different heights on left and right edges.
 * 
 * The panel is built in the XY plane with base at Y = -maxHeight/2:
 * 
 *   P4 ──────────── P3        
 *   │                 \        heightLeft on left, heightRight on right
 *   │                  │       Both edges are vertical
 *   P1 ──────────── P2        ← bottom edge (horizontal)
 *   
 *   ←──── width ────→
 * 
 * Centered vertically around Y=0 based on the MAXIMUM height.
 */
export function TrapezoidPanel({
  width,
  heightLeft,
  heightRight,
  thickness,
  position,
  rotation,
  glassType,
}: TrapezoidPanelProps) {
  const geometry = useMemo(() => {
    const maxH = Math.max(heightLeft, heightRight);
    const W = width;

    const shape = new THREE.Shape();
    // Bottom-left (base at -maxH/2)
    shape.moveTo(-W / 2, -maxH / 2);
    // Bottom-right
    shape.lineTo(W / 2, -maxH / 2);
    // Top-right
    shape.lineTo(W / 2, -maxH / 2 + heightRight);
    // Top-left
    shape.lineTo(-W / 2, -maxH / 2 + heightLeft);
    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: thickness,
      bevelEnabled: false,
    });
    // Center thickness on Z axis
    geo.translate(0, 0, -thickness / 2);

    return geo;
  }, [width, heightLeft, heightRight, thickness]);

  return (
    <mesh geometry={geometry} position={position} rotation={rotation} castShadow>
      <GlassMaterial type={glassType as any} />
    </mesh>
  );
}
