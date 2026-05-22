import { useMemo } from 'react';
import * as THREE from 'three';
import { GlassMaterial } from '@/components/3d/materials/GlassMaterial';

interface ParallelogramPanelProps {
  width: number;      // Panel width (along the slope/horizontal projection)
  height: number;     // Panel height (vertical, perpendicular to ground)
  thickness: number;  // Glass thickness
  angle: number;      // Slope angle in degrees
  position: [number, number, number];
  glassType: 'clear' | 'frosted';
}

/**
 * Creates a parallelogram-shaped glass panel for stair balustrades.
 * 
 * The parallelogram has:
 * - VERTICAL side edges (perpendicular to the ground)
 * - Top and bottom edges PARALLEL to the stair slope
 * 
 * Geometry is built in the XY plane (vertical wall):
 * - X axis: horizontal (along the stairs)
 * - Y axis: vertical (height)
 * - Z axis: thickness (perpendicular to the glass surface)
 * 
 * The "rise" of the panel (vertical offset due to slope) is calculated as:
 * rise = width × tan(angle)
 * 
 * Vertices (centered on X, base at Y=0):
 *       
 *   P4 ────────────────── P3     ← top edge (parallel to slope)
 *   │                      │
 *   │                      │  height
 *   │                      │
 *   P1 ────────────────── P2     ← bottom edge (parallel to slope)
 *   
 *   ←─────── width ───────→
 * 
 * P1 = (-W/2, -R/2)           → bottom-left
 * P2 = (+W/2, +R/2)           → bottom-right (rises with slope)
 * P3 = (+W/2, H + R/2)        → top-right
 * P4 = (-W/2, H - R/2)        → top-left
 * 
 * The sides (P1-P4 and P2-P3) are vertical (same X coordinate).
 * The top and bottom edges follow the slope angle.
 */
export function ParallelogramPanel({ 
  width, 
  height, 
  thickness, 
  angle, 
  position, 
  glassType 
}: ParallelogramPanelProps) {
  const geometry = useMemo(() => {
    const angleRad = (angle * Math.PI) / 180;
    // Vertical rise across the panel width due to slope
    const rise = width * Math.tan(angleRad);
    
    const W = width;
    const H = height;
    const R = rise;
    
    const shape = new THREE.Shape();
    // Build parallelogram with VERTICAL sides in XY plane
    // Centered on X axis, with the middle of the bottom edge at Y=0
    shape.moveTo(-W / 2, -R / 2);          // P1: bottom-left
    shape.lineTo(W / 2, R / 2);            // P2: bottom-right (rises)
    shape.lineTo(W / 2, H + R / 2);        // P3: top-right
    shape.lineTo(-W / 2, H - R / 2);       // P4: top-left
    shape.closePath();
    
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: thickness,
      bevelEnabled: false
    };
    
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    // Center thickness on Z axis
    geo.translate(0, 0, -thickness / 2);
    
    return geo;
  }, [width, height, thickness, angle]);

  return (
    <mesh 
      geometry={geometry} 
      position={position} 
      castShadow
    >
      <GlassMaterial type={glassType} />
    </mesh>
  );
}