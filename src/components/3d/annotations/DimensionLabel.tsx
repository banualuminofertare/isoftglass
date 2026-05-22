import { useMemo } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface DimensionLabelProps {
  start: [number, number, number];
  end: [number, number, number];
  value: number; // mm
  offset?: [number, number, number];
  color?: string;
}

const LINE_RADIUS = 0.0008;
const ARROW_LENGTH = 0.018;
const ARROW_RADIUS = 0.004;
const EXT_OVERSHOOT = 0.012; // how far extension lines go past the dimension line

export function DimensionLabel({
  start,
  end,
  value,
  offset = [0, 0, 0],
  color = '#1e293b',
}: DimensionLabelProps) {
  const s = useMemo(() => new THREE.Vector3(...start), [start]);
  const e = useMemo(() => new THREE.Vector3(...end), [end]);
  const mid = useMemo(() => new THREE.Vector3().addVectors(s, e).multiplyScalar(0.5), [s, e]);
  const length = useMemo(() => s.distanceTo(e), [s, e]);
  const dir = useMemo(() => new THREE.Vector3().subVectors(e, s).normalize(), [s, e]);

  // Quaternion to align objects along the dimension line direction
  const quaternion = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    return q;
  }, [dir]);

  // Arrow quaternions (pointing inward toward center)
  const arrowQuatStart = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    return q;
  }, [dir]);

  const arrowQuatEnd = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().negate());
    return q;
  }, [dir]);

  // Extension line direction (perpendicular)
  const extDir = useMemo(() => new THREE.Vector3(...offset).normalize(), [offset]);
  const extQuat = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), extDir);
    return q;
  }, [extDir]);

  // Extension line positions — from object edge toward the dimension line + overshoot
  const extStartPos = useMemo(() => {
    const p = s.clone().sub(extDir.clone().multiplyScalar(EXT_OVERSHOOT));
    return p;
  }, [s, extDir]);

  const extEndPos = useMemo(() => {
    const p = e.clone().sub(extDir.clone().multiplyScalar(EXT_OVERSHOOT));
    return p;
  }, [e, extDir]);

  // Extension line length (GAP amount is embedded in start/end positions already, just add overshoot)
  const extLength = EXT_OVERSHOOT * 2;

  if (value <= 0 || length < 0.001) return null;

  // Calculate half-line lengths (from each arrow to center gap for label)
  const labelGap = Math.min(length * 0.35, 0.08); // gap in center for label
  const halfLineLen = (length - ARROW_LENGTH * 2 - labelGap) / 2;
  const showSplitLine = halfLineLen > 0.005;

  return (
    <group>
      {/* ── Extension lines (perpendicular witness lines) ── */}
      <mesh position={[extStartPos.x + extDir.x * extLength / 2, extStartPos.y + extDir.y * extLength / 2, extStartPos.z + extDir.z * extLength / 2]} quaternion={extQuat}>
        <cylinderGeometry args={[LINE_RADIUS, LINE_RADIUS, extLength, 4]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[extEndPos.x + extDir.x * extLength / 2, extEndPos.y + extDir.y * extLength / 2, extEndPos.z + extDir.z * extLength / 2]} quaternion={extQuat}>
        <cylinderGeometry args={[LINE_RADIUS, LINE_RADIUS, extLength, 4]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {showSplitLine ? (
        <>
          {/* Left half of dimension line (start arrow → label gap) */}
          <mesh
            position={[
              s.x + dir.x * (ARROW_LENGTH + halfLineLen / 2),
              s.y + dir.y * (ARROW_LENGTH + halfLineLen / 2),
              s.z + dir.z * (ARROW_LENGTH + halfLineLen / 2),
            ]}
            quaternion={quaternion}
          >
            <cylinderGeometry args={[LINE_RADIUS, LINE_RADIUS, halfLineLen, 4]} />
            <meshBasicMaterial color={color} />
          </mesh>

          {/* Right half of dimension line (label gap → end arrow) */}
          <mesh
            position={[
              e.x - dir.x * (ARROW_LENGTH + halfLineLen / 2),
              e.y - dir.y * (ARROW_LENGTH + halfLineLen / 2),
              e.z - dir.z * (ARROW_LENGTH + halfLineLen / 2),
            ]}
            quaternion={quaternion}
          >
            <cylinderGeometry args={[LINE_RADIUS, LINE_RADIUS, halfLineLen, 4]} />
            <meshBasicMaterial color={color} />
          </mesh>
        </>
      ) : (
        /* Full dimension line when too short for gap */
        <mesh position={[mid.x, mid.y, mid.z]} quaternion={quaternion}>
          <cylinderGeometry args={[LINE_RADIUS, LINE_RADIUS, length - ARROW_LENGTH * 2, 4]} />
          <meshBasicMaterial color={color} />
        </mesh>
      )}

      {/* ── Arrow at start (pointing inward) ── */}
      <mesh
        position={[
          s.x + dir.x * ARROW_LENGTH / 2,
          s.y + dir.y * ARROW_LENGTH / 2,
          s.z + dir.z * ARROW_LENGTH / 2,
        ]}
        quaternion={arrowQuatStart}
      >
        <coneGeometry args={[ARROW_RADIUS, ARROW_LENGTH, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* ── Arrow at end (pointing inward) ── */}
      <mesh
        position={[
          e.x - dir.x * ARROW_LENGTH / 2,
          e.y - dir.y * ARROW_LENGTH / 2,
          e.z - dir.z * ARROW_LENGTH / 2,
        ]}
        quaternion={arrowQuatEnd}
      >
        <coneGeometry args={[ARROW_RADIUS, ARROW_LENGTH, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* ── Label ── */}
      <Html
        center
        position={[mid.x, mid.y, mid.z]}
        distanceFactor={2.8}
        zIndexRange={[1, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            background: 'rgba(255,255,255,0.95)',
            border: '1px solid #94a3b8',
            borderRadius: '2px',
            padding: '1px 4px',
            fontSize: '9px',
            fontWeight: 600,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            color: '#1e293b',
            whiteSpace: 'nowrap',
            userSelect: 'none',
            lineHeight: '1.3',
            letterSpacing: '0.02em',
          }}
        >
          {Math.round(value)}
        </div>
      </Html>
    </group>
  );
}
