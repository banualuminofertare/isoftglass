import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { ShowerConfig } from '@/types/calculators';
import { GlassMaterial, GlassColorContext } from '@/components/3d/materials/GlassMaterial';
import { MetalMaterial } from '@/components/3d/materials/MetalMaterial';
import { HandleMesh } from '@/components/3d/geometry/HandleMesh';
import { HingeCutout } from '@/components/3d/geometry/HingeCutout';
import { TrapezoidPanel } from '@/components/3d/geometry/TrapezoidPanel';
import { useProcessingLookup } from '@/hooks/useProcessingTemplates';
import { DimensionLines } from '@/components/3d/annotations/DimensionLines';
import * as THREE from 'three';

interface ShowerViewer3DProps {
  config: ShowerConfig;
  slidingOverlapMm?: number;
}

// Scale factor: 1 unit = 1000mm
const SCALE = 0.001;

// Convert mm-from-top position to 3D Y coordinate (centered at 0)
function posToY(positionMm: number, heightScene: number): number {
  return heightScene / 2 - (positionMm * SCALE);
}

// Convert mm-from-bottom position to 3D Y coordinate (centered at 0)
function posFromBottomToY(positionMm: number, heightScene: number): number {
  return -heightScene / 2 + (positionMm * SCALE);
}

function ThresholdProfile({ position, length, rotation }: {
  position: [number, number, number];
  length: number;
  rotation?: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={[length, 0.005, 0.008]} />
      <meshStandardMaterial color="#2a2a2a" roughness={0.6} metalness={0.3} />
    </mesh>
  );
}

export function ShowerViewer3D({ config, slidingOverlapMm }: ShowerViewer3DProps) {
  const { cabinType, doorType, dimensions, glass, accessories } = config;
  const profilesEnabled = accessories.profiles.enabled !== false;
  
  const groupRef = useRef<THREE.Group>(null);
  
  // Lookup processing template for hinge cutout
  const hingeMaterialCode = accessories.hinges?.materialCode;
  const { data: hingeTemplate } = useProcessingLookup(hingeMaterialCode);
  const cutoutDims = hingeTemplate?.dimensions as { height?: number; width?: number; edge_offset?: number } | undefined;
  
  // Convert mm to scene units
  const width = dimensions.width * SCALE;
  const height = dimensions.height * SCALE;
  const depth = dimensions.depth * SCALE;
  const doorWidth = dimensions.doorWidth * SCALE;
  const glassThickness = glass.thickness * SCALE;
  
  // Center the model
  const offsetX = -width / 2;
  const offsetZ = -depth / 2;

  return (
    <GlassColorContext.Provider value={glass.colorHex}>
    <group ref={groupRef} position={[0, height / 2, 0]}>
      {/* Floor indicator */}
      <mesh position={[0, -height / 2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width + 0.2, depth + 0.2]} />
        <meshStandardMaterial color="#e2e8f0" opacity={0.5} transparent />
      </mesh>

      {cabinType === 'corner_90' && (
        <Corner90Cabin
          width={width}
          height={height}
          depth={depth}
          doorWidth={doorWidth}
          lateralDoorWidth={(config.dimensions.lateralDoorWidth || dimensions.depth) * SCALE}
          glassThickness={glassThickness}
          glassType={glass.type}
          doorType={doorType}
          accessories={accessories}
          lateralConfig={config.lateralConfig}
          cutoutDims={cutoutDims}
          slidingOverlapMm={slidingOverlapMm}
          lateralHeightA={config.dimensions.lateralHeightB}
          lateralHeightB={config.dimensions.lateralHeightA}
          frontalHeightA={config.dimensions.frontalHeightA}
          frontalHeightB={config.dimensions.frontalHeightB}
        />
      )}
      
      {cabinType === 'walk_in' && (
        <WalkInCabin
          width={width}
          height={height}
          glassThickness={glassThickness}
          glassType={glass.type}
          doorType={doorType}
          accessories={accessories}
          cutoutDims={cutoutDims}
          slidingOverlapMm={slidingOverlapMm}
          frontalHeightA={config.dimensions.frontalHeightA}
          frontalHeightB={config.dimensions.frontalHeightB}
        />
      )}
      
      {cabinType === 'pentagon' && (
        <PentagonCabin
          width={width}
          height={height}
          depth={depth}
          doorWidth={doorWidth}
          glassThickness={glassThickness}
          glassType={glass.type}
          doorType={doorType}
          accessories={accessories}
          cutoutDims={cutoutDims}
          pentagonSides={config.pentagonSides ?? { left: true, right: true, back: true }}
        />
      )}
      
      {cabinType === 'bathtub' && (
        <BathtubCabin
          width={width}
          height={height}
          glassThickness={glassThickness}
          glassType={glass.type}
          doorType={doorType}
          accessories={accessories}
          cutoutDims={cutoutDims}
          frontalHeightA={config.dimensions.frontalHeightA}
          frontalHeightB={config.dimensions.frontalHeightB}
        />
      )}

      {cabinType === 'fixed_panel' && (
        <FixedPanelCabin
          width={width}
          height={height}
          glassThickness={glassThickness}
          glassType={glass.type}
          profilesEnabled={profilesEnabled}
          profileSides={accessories.profiles.sides}
          frontalHeightA={config.dimensions.frontalHeightA}
          frontalHeightB={config.dimensions.frontalHeightB}
        />
      )}

      {/* Dimension annotations */}
      <DimensionLines config={config} />
    </group>
    </GlassColorContext.Provider>
  );
}

// Corner 90 degree cabin - L-shaped with lateral and frontal panels meeting at 90°
function Corner90Cabin({ 
  width, height, depth, doorWidth, lateralDoorWidth, glassThickness, glassType, doorType, accessories, lateralConfig, cutoutDims, slidingOverlapMm, lateralHeightA, lateralHeightB, frontalHeightA, frontalHeightB 
}: {
  width: number;
  height: number;
  depth: number;
  doorWidth: number;
  lateralDoorWidth: number;
  glassThickness: number;
  glassType: ShowerConfig['glass']['type'];
  doorType: string;
  accessories: ShowerConfig['accessories'];
  lateralConfig: ShowerConfig['lateralConfig'];
  cutoutDims?: { height?: number; width?: number; edge_offset?: number };
  slidingOverlapMm?: number;
  lateralHeightA?: number;
  lateralHeightB?: number;
  frontalHeightA?: number;
  frontalHeightB?: number;
}) {
  const openingSide = accessories.openingSide || 'front';
  const doorPosition = accessories.door?.position || 'left';
  const openDirection = accessories.door?.openDirection || 'inward';
  const fixedPanelLeft = accessories.fixedPanel?.left;
  const fixedPanelRight = accessories.fixedPanel?.right;
  const hingeSide = accessories.door?.hingeSide || 'left';
  const isHingeLeft = hingeSide === 'left';
  const doorOffset = openDirection === 'outward' ? 0.05 : 0;
  const profilesEnabled = accessories.profiles.enabled !== false;
  const pSides = accessories.profiles.sides ?? { left: true, right: true, top: false, bottom: true };
  const pLeft = profilesEnabled && pSides.left;
  const pRight = profilesEnabled && pSides.right;
  const pBottom = profilesEnabled && pSides.bottom;
  const pTop = profilesEnabled && pSides.top;

  // When lateralConfig.enabled => both sides have doors
  const hasLateral = lateralConfig?.enabled;

  // ── FRONTAL SIDE (always present when hasLateral or openingSide==='front') ──
  const renderFrontal = hasLateral || openingSide === 'front';
  // When the user picked openingSide=lateral on Corner 90° (door is on the lateral side),
  // the frontal should be a SOLID fixed wall — no door, no panel split, no separators.
  const frontalIsSolid = hasLateral && openingSide === 'lateral';
  // ── LATERAL SIDE ──
  const renderLateralDoor = hasLateral;
  const renderLateralFull = !hasLateral && openingSide === 'front'; // full panel
  const renderLateralWithDoor = !hasLateral && openingSide === 'lateral'; // legacy lateral mode

  const leftPanelW = fixedPanelLeft?.enabled ? fixedPanelLeft.width * SCALE : 0;
  const rightPanelW = fixedPanelRight?.enabled ? fixedPanelRight.width * SCALE : 0;
  // For sliding doors, shift door position to show overlap over fixed panels (from mechanism settings)
  const slidingOverlap = doorType === 'sliding' && (leftPanelW > 0.01 || rightPanelW > 0.01) ? (slidingOverlapMm ?? 40) * SCALE : 0;
  const doorPosX = -width / 2 + leftPanelW + doorWidth / 2 - (leftPanelW > 0.01 ? slidingOverlap / 2 : 0);
  const hingePosX = isHingeLeft ? doorPosX - doorWidth / 2 : doorPosX + doorWidth / 2;
  const handleOffsetX = doorType === 'sliding'
    ? ((accessories.door?.slidingDirection || 'left') === 'right' ? -doorWidth / 2 + 0.05 : doorWidth / 2 - 0.05)
    : (isHingeLeft ? doorWidth / 2 - 0.05 : -doorWidth / 2 + 0.05);

  return (
    <group>
      {/* ═══ FRONTAL SIDE ═══ */}
      {renderFrontal && frontalIsSolid && (() => {
        // Solid frontal wall — no door, single fixed panel spanning the full width.
        const isFT = frontalHeightA !== undefined && frontalHeightB !== undefined && frontalHeightA !== frontalHeightB;
        const profileFinish = accessories.profiles.finish;
        if (isFT) {
          const hL = frontalHeightA! * SCALE;
          const hR = frontalHeightB! * SCALE;
          const maxH = Math.max(hL, hR);
          const posY = (maxH - height) / 2;
          return (
            <>
              <TrapezoidPanel width={width} heightLeft={hL} heightRight={hR} thickness={glassThickness} position={[0, posY, depth / 2]} glassType={glassType} />
              <UProfile visible={pBottom} position={[0, -height / 2 - U_PROFILE_HEIGHT / 2, depth / 2]} length={width} finish={profileFinish} />
            </>
          );
        }
        const panelH = height;
        return (
          <>
            <mesh position={[0, 0, depth / 2]} castShadow>
              <boxGeometry args={[width, panelH, glassThickness]} />
              <GlassMaterial type={glassType} />
            </mesh>
            <UProfile visible={pBottom} position={[0, -height / 2 - U_PROFILE_HEIGHT / 2, depth / 2]} length={width} finish={profileFinish} />
          </>
        );
      })()}
      {renderFrontal && !frontalIsSolid && (
        <>
          {/* Fixed panels */}
          {leftPanelW > 0.01 && (() => {
            const isFT = frontalHeightA !== undefined && frontalHeightB !== undefined && frontalHeightA !== frontalHeightB;
            const profileFinish = accessories.profiles.finish;
            const pOff = glassThickness / 2 + U_PROFILE_WIDTH / 2;

            if (isFT) {
              const hL = frontalHeightA! * SCALE;
              const hR = (frontalHeightA! + (frontalHeightB! - frontalHeightA!) * (leftPanelW / width)) * SCALE;
              const maxH = Math.max(hL, hR);
              const posY = (maxH - height) / 2;
              const bottomY = posY - maxH / 2;
              return (
                <>
                  <TrapezoidPanel width={leftPanelW} heightLeft={hL} heightRight={hR} thickness={glassThickness} position={[-width / 2 + leftPanelW / 2, posY, depth / 2]} glassType={glassType} />
                  <UProfile visible={false} position={[-width / 2 - pOff, (hL - height) / 2, depth / 2]} length={hL} finish={profileFinish} rotation={[0, 0, Math.PI / 2]} />
                  <UProfile visible={pBottom} position={[-width / 2 + leftPanelW / 2, bottomY - U_PROFILE_HEIGHT / 2, depth / 2]} length={leftPanelW} finish={profileFinish} />
                </>
              );
            }

            const panelH = (fixedPanelLeft?.height ?? (height / SCALE)) * SCALE;
            const yOffset = (height - panelH) / 2;
            const bottomY = yOffset - panelH / 2;
            return (
              <>
                <mesh position={[-width / 2 + leftPanelW / 2, yOffset, depth / 2]} castShadow>
                  <boxGeometry key={`fl-${leftPanelW}-${panelH}-${glassThickness}`} args={[leftPanelW, panelH, glassThickness]} />
                  <GlassMaterial type={glassType} />
                </mesh>
                <UProfile visible={false} position={[-width / 2 - pOff, yOffset, depth / 2]} length={panelH} finish={profileFinish} rotation={[0, 0, Math.PI / 2]} />
                <UProfile visible={pBottom} position={[-width / 2 + leftPanelW / 2, bottomY - U_PROFILE_HEIGHT / 2, depth / 2]} length={leftPanelW} finish={profileFinish} />
              </>
            );
          })()}
          {rightPanelW > 0.01 && (() => {
            const isFT = frontalHeightA !== undefined && frontalHeightB !== undefined && frontalHeightA !== frontalHeightB;
            const profileFinish = accessories.profiles.finish;
            const pOff = glassThickness / 2 + U_PROFILE_WIDTH / 2;

            if (isFT) {
              const hL = (frontalHeightA! + (frontalHeightB! - frontalHeightA!) * ((width - rightPanelW) / width)) * SCALE;
              const hR = frontalHeightB! * SCALE;
              const maxH = Math.max(hL, hR);
              const posY = (maxH - height) / 2;
              const bottomY = posY - maxH / 2;
              return (
                <>
                  <TrapezoidPanel width={rightPanelW} heightLeft={hL} heightRight={hR} thickness={glassThickness} position={[width / 2 - rightPanelW / 2, posY, depth / 2]} glassType={glassType} />
                  <UProfile visible={pRight} position={[width / 2 + pOff, (hR - height) / 2, depth / 2]} length={hR} finish={profileFinish} rotation={[0, 0, Math.PI / 2]} />
                  <UProfile visible={pBottom} position={[width / 2 - rightPanelW / 2, bottomY - U_PROFILE_HEIGHT / 2, depth / 2]} length={rightPanelW} finish={profileFinish} />
                </>
              );
            }

            const panelH = (fixedPanelRight?.height ?? (height / SCALE)) * SCALE;
            const yOffset = (height - panelH) / 2;
            const bottomY = yOffset - panelH / 2;
            return (
              <>
                <mesh position={[width / 2 - rightPanelW / 2, yOffset, depth / 2]} castShadow>
                  <boxGeometry key={`fr-${rightPanelW}-${panelH}-${glassThickness}`} args={[rightPanelW, panelH, glassThickness]} />
                  <GlassMaterial type={glassType} />
                </mesh>
                <UProfile visible={pRight} position={[width / 2 + pOff, yOffset, depth / 2]} length={panelH} finish={profileFinish} rotation={[0, 0, Math.PI / 2]} />
                <UProfile visible={pBottom} position={[width / 2 - rightPanelW / 2, bottomY - U_PROFILE_HEIGHT / 2, depth / 2]} length={rightPanelW} finish={profileFinish} />
              </>
            );
          })()}
          {/* Door */}
          <group position={[doorPosX, 0, depth / 2 + doorOffset]}>
            {(() => {
              const isFrontalTrapezoid = frontalHeightA !== undefined && frontalHeightB !== undefined && frontalHeightA !== frontalHeightB;
              if (isFrontalTrapezoid) {
                // Interpolate heights at door's actual position within the total width
                const doorLeftNorm = leftPanelW / width;
                const doorRightNorm = (leftPanelW + doorWidth) / width;
                const doorHL = (frontalHeightA! + (frontalHeightB! - frontalHeightA!) * doorLeftNorm) * SCALE;
                const doorHR = (frontalHeightA! + (frontalHeightB! - frontalHeightA!) * doorRightNorm) * SCALE;
                const maxDoorH = Math.max(doorHL, doorHR);
                const posY = (maxDoorH - height) / 2;
                return (
                  <TrapezoidPanel
                    width={doorWidth}
                    heightLeft={doorHL}
                    heightRight={doorHR}
                    thickness={glassThickness}
                    position={[0, posY, 0]}
                    glassType={glassType}
                  />
                );
              }
              return (
                <mesh castShadow>
                  <boxGeometry args={[doorWidth, height, glassThickness]} />
                  <GlassMaterial type={glassType} />
                </mesh>
              );
            })()}
            {doorType === 'sliding' && (
              <SlidingArrow doorWidth={doorWidth} doorHeight={height} direction={accessories.door?.slidingDirection || 'left'} />
            )}
            <HandleMesh model={accessories.handle.model} length={accessories.handle.length * SCALE} finish={accessories.handle.finish} position={[handleOffsetX, posFromBottomToY(accessories.handle.positionY ?? (height / SCALE) / 2, height), glassThickness / 2 + 0.01]} />
          </group>
          {/* Hinges */}
          {doorType === 'hinged' && accessories.hinges.quantity > 0 && (
            <>
              {(accessories.hinges.positions || []).map((posMm, idx) => (
                <group key={idx}>
                  <Hinge position={[hingePosX, posToY(posMm, height), depth / 2]} finish={accessories.hinges.finish} />
                  {cutoutDims?.width && cutoutDims?.height && (
                    <group position={[hingePosX, posToY(posMm, height), depth / 2]}>
                      <HingeCutout width={cutoutDims.width * SCALE} height={cutoutDims.height * SCALE} edgeOffset={(cutoutDims.edge_offset ?? 8) * SCALE} glassThickness={glassThickness} />
                    </group>
                  )}
                </group>
              ))}
            </>
          )}
          {/* Separators */}
          {leftPanelW > 0.01 && (() => {
            const isFT = frontalHeightA !== undefined && frontalHeightB !== undefined && frontalHeightA !== frontalHeightB;
            const sepNorm = leftPanelW / width;
            const sepH = isFT ? (frontalHeightA! + (frontalHeightB! - frontalHeightA!) * sepNorm) * SCALE : height;
            const sepY = (sepH - height) / 2;
            return <SeparatorProfile visible={profilesEnabled} position={[-width / 2 + leftPanelW + 0.004, sepY, depth / 2]} height={sepH} finish={accessories.profiles.finish} />;
          })()}
          {rightPanelW > 0.01 && (() => {
            const isFT = frontalHeightA !== undefined && frontalHeightB !== undefined && frontalHeightA !== frontalHeightB;
            const sepNorm = (leftPanelW + doorWidth) / width;
            const sepH = isFT ? (frontalHeightA! + (frontalHeightB! - frontalHeightA!) * sepNorm) * SCALE : height;
            const sepY = (sepH - height) / 2;
            return <SeparatorProfile visible={profilesEnabled} position={[-width / 2 + leftPanelW + doorWidth + 0.004, sepY, depth / 2]} height={sepH} finish={accessories.profiles.finish} />;
          })()}
        </>
      )}

      {/* ═══ LATERAL FULL PANEL (when no lateral door & openingSide=front) ═══ */}
      {renderLateralFull && (() => {
        const hAMm = lateralHeightA ?? (height / SCALE);
        const hBMm = lateralHeightB ?? (height / SCALE);
        const hasCustomHeight = lateralHeightA !== undefined || lateralHeightB !== undefined;
        const isTrapezoid = hasCustomHeight && hAMm !== hBMm;
        
        if (isTrapezoid) {
          const hA = hAMm * SCALE;
          const hB = hBMm * SCALE;
          const maxH = Math.max(hA, hB);
          const posY = (maxH - height) / 2;
          return (
            <TrapezoidPanel
              width={depth}
              heightLeft={hA}
              heightRight={hB}
              thickness={glassThickness}
              position={[-width / 2, posY, 0]}
              rotation={[0, Math.PI / 2, 0]}
              glassType={glassType}
            />
          );
        }
        
        const panelH = hasCustomHeight ? hAMm * SCALE : height;
        const posY = (panelH - height) / 2;
        return (
          <mesh position={[-width / 2, posY, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
            <boxGeometry key={`lat-full-${depth}-${panelH}-${glassThickness}`} args={[depth, panelH, glassThickness]} />
            <GlassMaterial type={glassType} />
          </mesh>
        );
      })()}

      {/* ═══ LATERAL WITH DOOR (lateralConfig enabled) ═══ */}
      {renderLateralDoor && lateralConfig && (() => {
        // Lateral side mapping (as seen by the user from the front of the cabin):
        //   fixedPanel.left  -> rendered near the back WALL (+Z in scene)
        //   fixedPanel.right -> rendered near the 90° CORNER (-Z in scene, where frontal meets lateral)
        // NOTE: The frontal plane lives at +Z (depth/2) in the scene; despite that, the user
        // perceives the corner on the *right* of the lateral viewport. So "right" -> corner side.
        // Z layout (wall -> corner): [latLeftW (wall, +Z)] [door] [latRightW (corner, -Z)]
        const latFPLeft = lateralConfig.fixedPanel.left;   // wall side
        const latFPRight = lateralConfig.fixedPanel.right; // corner side
        const latLeftW = latFPLeft?.enabled ? latFPLeft.width * SCALE : 0;
        const latRightW = latFPRight?.enabled ? latFPRight.width * SCALE : 0;
        // Wall panel occupies +Z block (top), corner panel occupies -Z block (bottom).
        // Door sits between: starts at +depth/2 - latLeftW (after wall panel) and spans -lateralDoorWidth toward corner.
        const latDoorPosZ = depth / 2 - latLeftW - lateralDoorWidth / 2;
        const latHingeSide = lateralConfig.door?.hingeSide || 'left';
        const latIsHingeLeft = latHingeSide === 'left';
        // Hinge "left" = wall side = +Z edge of the door; "right" = corner side = -Z edge.
        const latHingePosZ = latIsHingeLeft ? latDoorPosZ + lateralDoorWidth / 2 : latDoorPosZ - lateralDoorWidth / 2;
        const latHandleOffsetZ = lateralConfig.doorType === 'sliding'
          ? ((lateralConfig.door?.slidingDirection || 'left') === 'right' ? -lateralDoorWidth / 2 + 0.05 : lateralDoorWidth / 2 - 0.05)
          : (latIsHingeLeft ? lateralDoorWidth / 2 - 0.05 : -lateralDoorWidth / 2 + 0.05);
        const latDoorOffset = (lateralConfig.door?.openDirection || 'inward') === 'outward' ? -0.05 : 0;

        return (
          <>
            {/* Wall-side fixed panel (user "left"): rendered near +Z (back wall) */}
            {latLeftW > 0.01 && (() => {
              const isLT = lateralHeightA !== undefined && lateralHeightB !== undefined && lateralHeightA !== lateralHeightB;
              const profileFinish = accessories.profiles.finish;
              const pOff = glassThickness / 2 + U_PROFILE_WIDTH / 2;

              if (isLT) {
                // Wall-edge height = lateralHeightA, panel inner edge interpolates toward B.
                const hL = (lateralHeightA! + (lateralHeightB! - lateralHeightA!) * ((depth - latLeftW) / depth)) * SCALE;
                const hR = lateralHeightA! * SCALE;
                const maxH = Math.max(hL, hR);
                const posY = (maxH - height) / 2;
                const bottomY = posY - maxH / 2;
                return (
                  <>
                    <TrapezoidPanel width={latLeftW} heightLeft={hL} heightRight={hR} thickness={glassThickness} position={[-width / 2, posY, depth / 2 - latLeftW / 2]} rotation={[0, Math.PI / 2, 0]} glassType={glassType} />
                    <UProfile visible={pLeft} position={[-width / 2, (hR - height) / 2, depth / 2 + pOff]} length={hR} finish={profileFinish} rotation={[0, 0, Math.PI / 2]} />
                    <UProfile visible={pBottom} position={[-width / 2, bottomY - U_PROFILE_HEIGHT / 2, depth / 2 - latLeftW / 2]} length={latLeftW} finish={profileFinish} rotation={[0, Math.PI / 2, 0]} />
                  </>
                );
              }

              const panelH = (latFPLeft?.height ?? (height / SCALE)) * SCALE;
              const yOffset = (height - panelH) / 2;
              const bottomY = yOffset - panelH / 2;
              return (
                <>
                  <mesh position={[-width / 2, yOffset, depth / 2 - latLeftW / 2]} rotation={[0, Math.PI / 2, 0]} castShadow>
                    <boxGeometry key={`ll-${latLeftW}-${panelH}-${glassThickness}`} args={[latLeftW, panelH, glassThickness]} />
                    <GlassMaterial type={glassType} />
                  </mesh>
                  <UProfile visible={pLeft} position={[-width / 2, yOffset, depth / 2 + pOff]} length={panelH} finish={profileFinish} rotation={[0, 0, Math.PI / 2]} />
                  <UProfile visible={pBottom} position={[-width / 2, bottomY - U_PROFILE_HEIGHT / 2, depth / 2 - latLeftW / 2]} length={latLeftW} finish={profileFinish} rotation={[0, Math.PI / 2, 0]} />
                </>
              );
            })()}
            {/* Corner-side fixed panel (user "right"): rendered near -Z (90° corner) */}
            {latRightW > 0.01 && (() => {
              const isLT = lateralHeightA !== undefined && lateralHeightB !== undefined && lateralHeightA !== lateralHeightB;
              const profileFinish = accessories.profiles.finish;
              const pOff = glassThickness / 2 + U_PROFILE_WIDTH / 2;

              if (isLT) {
                // Corner-edge height = lateralHeightB, panel inner edge interpolates from A.
                const hL = lateralHeightB! * SCALE;
                const hR = (lateralHeightA! + (lateralHeightB! - lateralHeightA!) * (latRightW / depth)) * SCALE;
                const maxH = Math.max(hL, hR);
                const posY = (maxH - height) / 2;
                const bottomY = posY - maxH / 2;
                return (
                  <>
                    <TrapezoidPanel width={latRightW} heightLeft={hL} heightRight={hR} thickness={glassThickness} position={[-width / 2, posY, -depth / 2 + latRightW / 2]} rotation={[0, Math.PI / 2, 0]} glassType={glassType} />
                    <UProfile visible={false} position={[-width / 2, (hL - height) / 2, -depth / 2 - pOff]} length={hL} finish={profileFinish} rotation={[0, 0, Math.PI / 2]} />
                    <UProfile visible={pBottom} position={[-width / 2, bottomY - U_PROFILE_HEIGHT / 2, -depth / 2 + latRightW / 2]} length={latRightW} finish={profileFinish} rotation={[0, Math.PI / 2, 0]} />
                  </>
                );
              }

              const panelH = (latFPRight?.height ?? (height / SCALE)) * SCALE;
              const yOffset = (height - panelH) / 2;
              const bottomY = yOffset - panelH / 2;
              return (
                <>
                  <mesh position={[-width / 2, yOffset, -depth / 2 + latRightW / 2]} rotation={[0, Math.PI / 2, 0]} castShadow>
                    <boxGeometry key={`lr-${latRightW}-${panelH}-${glassThickness}`} args={[latRightW, panelH, glassThickness]} />
                    <GlassMaterial type={glassType} />
                  </mesh>
                  <UProfile visible={false} position={[-width / 2, yOffset, -depth / 2 - pOff]} length={panelH} finish={profileFinish} rotation={[0, 0, Math.PI / 2]} />
                  <UProfile visible={pBottom} position={[-width / 2, bottomY - U_PROFILE_HEIGHT / 2, -depth / 2 + latRightW / 2]} length={latRightW} finish={profileFinish} rotation={[0, Math.PI / 2, 0]} />
                </>
              );
            })()}
            {/* Lateral door — trapezoid aware */}
            {(() => {
              const isLT = lateralHeightA !== undefined && lateralHeightB !== undefined && lateralHeightA !== lateralHeightB;
              // Door layout along wall→corner axis: [latLeftW (wall)] [door] [latRightW (corner)]
              const doorWallNorm = latLeftW / depth;                         // door edge near wall
              const doorCornerNorm = (latLeftW + lateralDoorWidth) / depth;  // door edge near corner
              const doorHL = isLT ? (lateralHeightA! + (lateralHeightB! - lateralHeightA!) * doorWallNorm) * SCALE : height;
              const doorHR = isLT ? (lateralHeightA! + (lateralHeightB! - lateralHeightA!) * doorCornerNorm) * SCALE : height;
              const maxDoorH = Math.max(doorHL, doorHR);
              const doorPosY = isLT ? (maxDoorH - height) / 2 : 0;
              const avgDoorH = (doorHL + doorHR) / 2;

              return (
                <>
                  <group position={[-width / 2 + latDoorOffset, doorPosY, latDoorPosZ]} rotation={[0, Math.PI / 2, 0]}>
                    {isLT ? (
                      <TrapezoidPanel
                        width={lateralDoorWidth}
                        heightLeft={doorHL}
                        heightRight={doorHR}
                        thickness={glassThickness}
                        position={[0, 0, 0]}
                        glassType={glassType}
                      />
                    ) : (
                      <mesh castShadow>
                        <boxGeometry args={[lateralDoorWidth, height, glassThickness]} />
                        <GlassMaterial type={glassType} />
                      </mesh>
                    )}
                    {lateralConfig.doorType === 'sliding' && (
                      <SlidingArrow doorWidth={lateralDoorWidth} doorHeight={avgDoorH} direction={lateralConfig.door?.slidingDirection || 'left'} />
                    )}
                    <HandleMesh model={lateralConfig.handle?.model || 'bar'} length={(lateralConfig.handle?.length || 200) * SCALE} finish={lateralConfig.handle?.finish || 'polished_stainless'} position={[latHandleOffsetZ, isLT ? posFromBottomToY(lateralConfig.handle?.positionY ?? (avgDoorH / SCALE) / 2, avgDoorH) : posFromBottomToY(lateralConfig.handle?.positionY ?? (height / SCALE) / 2, height), glassThickness / 2 + 0.01]} />
                  </group>
                  {lateralConfig.doorType === 'hinged' && lateralConfig.hinges.quantity > 0 && (
                    <>
                      {(lateralConfig.hinges.positions || []).map((posMm, idx) => {
                        // User "left" = wall side = doorWallNorm; "right" = corner side = doorCornerNorm.
                        const hingeNorm = latIsHingeLeft ? doorWallNorm : doorCornerNorm;
                        const hingeHmm = isLT ? (lateralHeightA! + (lateralHeightB! - lateralHeightA!) * hingeNorm) : (height / SCALE);
                        const hingeH = hingeHmm * SCALE;
                        const hingeBaseY = isLT ? (hingeH - height) / 2 : 0;
                        const maxPosMm = hingeHmm - 100;
                        const clampedPosMm = Math.max(100, Math.min(posMm, maxPosMm));
                        return (
                          <group key={`lat-h-${idx}`}>
                            <Hinge position={[-width / 2, hingeBaseY + posToY(clampedPosMm, hingeH), latHingePosZ]} finish={lateralConfig.hinges.finish} rotation={[0, Math.PI / 2, 0]} />
                          </group>
                        );
                      })}
                    </>
                  )}
                </>
              );
            })()}
            {/* Lateral separators */}
            {latLeftW > 0.01 && (() => {
              const isLT = lateralHeightA !== undefined && lateralHeightB !== undefined && lateralHeightA !== lateralHeightB;
              const sepNorm = latLeftW / depth;
              const sepH = isLT ? (lateralHeightA! + (lateralHeightB! - lateralHeightA!) * sepNorm) * SCALE : height;
              const sepY = isLT ? (sepH - height) / 2 : 0;
              // Separator between wall panel and door (wall side, +Z)
              return <SeparatorProfile visible={profilesEnabled} position={[-width / 2, sepY, depth / 2 - latLeftW - 0.004]} height={sepH} finish={accessories.profiles.finish} rotation={[0, Math.PI / 2, 0]} />;
            })()}
            {latRightW > 0.01 && (() => {
              const isLT = lateralHeightA !== undefined && lateralHeightB !== undefined && lateralHeightA !== lateralHeightB;
              const sepNorm = (latLeftW + lateralDoorWidth) / depth;
              const sepH = isLT ? (lateralHeightA! + (lateralHeightB! - lateralHeightA!) * sepNorm) * SCALE : height;
              const sepY = isLT ? (sepH - height) / 2 : 0;
              // Separator between door and corner panel (corner side, -Z)
              return <SeparatorProfile visible={profilesEnabled} position={[-width / 2, sepY, depth / 2 - latLeftW - lateralDoorWidth + 0.004]} height={sepH} finish={accessories.profiles.finish} rotation={[0, Math.PI / 2, 0]} />;
            })()}
          </>
        );
      })()}

      {/* ═══ LEGACY: Lateral with door (openingSide=lateral, no lateralConfig) ═══ */}
      {renderLateralWithDoor && (() => {
        const isDoorLeft = doorPosition === 'left';
        const fixedPanelDepth = depth - doorWidth;
        const doorPosZ = isDoorLeft ? -depth / 2 + doorWidth / 2 : depth / 2 - doorWidth / 2;
        const fixedPanelPosZ = isDoorLeft ? depth / 2 - fixedPanelDepth / 2 : -depth / 2 + fixedPanelDepth / 2;
        const latHingePosZ = isHingeLeft ? doorPosZ - doorWidth / 2 : doorPosZ + doorWidth / 2;
        const latHandleZ = isHingeLeft ? -doorWidth / 2 + 0.05 : doorWidth / 2 - 0.05;
        const separatorPosZ = isDoorLeft ? doorPosZ + doorWidth / 2 : doorPosZ - doorWidth / 2;

        // Trapezoid detection
        const isLT = lateralHeightA !== undefined && lateralHeightB !== undefined && lateralHeightA !== lateralHeightB;

        // Determine active fixed panel side and its custom height
        const fpSide = isDoorLeft ? fixedPanelRight : fixedPanelLeft;

        // Interpolation helper: normalized position along depth (0 = wall/-depth/2, 1 = corner/+depth/2)
        const normZ = (z: number) => (z + depth / 2) / depth;

        // Door edge positions (normalized)
        const doorStartZ = isDoorLeft ? -depth / 2 : depth / 2 - doorWidth;
        const doorEndZ = isDoorLeft ? -depth / 2 + doorWidth : depth / 2;
        const doorStartNorm = normZ(doorStartZ);
        const doorEndNorm = normZ(doorEndZ);
        const doorHL = isLT ? (lateralHeightA! + (lateralHeightB! - lateralHeightA!) * doorStartNorm) * SCALE : height;
        const doorHR = isLT ? (lateralHeightA! + (lateralHeightB! - lateralHeightA!) * doorEndNorm) * SCALE : height;
        const maxDoorH = Math.max(doorHL, doorHR);
        const doorPosY = isLT ? (maxDoorH - height) / 2 : 0;

        // Fixed panel edge positions (normalized)
        const fpStartZ = isDoorLeft ? doorEndZ : -depth / 2;
        const fpEndZ = isDoorLeft ? depth / 2 : doorStartZ;
        const fpStartNorm = normZ(fpStartZ);
        const fpEndNorm = normZ(fpEndZ);
        const fpHL = isLT ? (lateralHeightA! + (lateralHeightB! - lateralHeightA!) * fpStartNorm) * SCALE : (fpSide?.height ?? (height / SCALE)) * SCALE;
        const fpHR = isLT ? (lateralHeightA! + (lateralHeightB! - lateralHeightA!) * fpEndNorm) * SCALE : (fpSide?.height ?? (height / SCALE)) * SCALE;
        const maxFpH = Math.max(fpHL, fpHR);
        const fpPosY = isLT ? (maxFpH - height) / 2 : (height - fpHL) / 2;

        // Separator height at its Z position
        const sepNorm = normZ(isDoorLeft ? doorEndZ : doorStartZ);
        const sepH = isLT ? (lateralHeightA! + (lateralHeightB! - lateralHeightA!) * sepNorm) * SCALE : maxFpH;
        const sepY = isLT ? (sepH - height) / 2 : fpPosY;

        return (
          <>
            <mesh position={[0, 0, depth / 2]} castShadow>
              <boxGeometry args={[width, height, glassThickness]} />
              <GlassMaterial type={glassType} />
            </mesh>
            {/* Fixed panel — trapezoid aware */}
            {fixedPanelDepth > 0.05 && (() => {
              if (isLT) {
                return (
                  <TrapezoidPanel width={fixedPanelDepth} heightLeft={fpHL} heightRight={fpHR} thickness={glassThickness} position={[-width / 2, fpPosY, fixedPanelPosZ]} rotation={[0, Math.PI / 2, 0]} glassType={glassType} />
                );
              }
              return (
                <mesh position={[-width / 2, fpPosY, fixedPanelPosZ]} rotation={[0, Math.PI / 2, 0]} castShadow>
                  <boxGeometry key={`leg-fp-${fixedPanelDepth}-${fpHL}-${glassThickness}`} args={[fixedPanelDepth, fpHL, glassThickness]} />
                  <GlassMaterial type={glassType} />
                </mesh>
              );
            })()}
            {/* Door — trapezoid aware */}
            <group position={[-width / 2 - doorOffset, doorPosY, doorPosZ]} rotation={[0, Math.PI / 2, 0]}>
              {isLT ? (
                <TrapezoidPanel width={doorWidth} heightLeft={doorHL} heightRight={doorHR} thickness={glassThickness} position={[0, 0, 0]} glassType={glassType} />
              ) : (
                <mesh castShadow>
                  <boxGeometry args={[doorWidth, height, glassThickness]} />
                  <GlassMaterial type={glassType} />
                </mesh>
              )}
              {doorType === 'sliding' && <SlidingArrow doorWidth={doorWidth} doorHeight={maxDoorH} direction={accessories.door?.slidingDirection || 'left'} />}
              <HandleMesh model={accessories.handle.model} length={accessories.handle.length * SCALE} finish={accessories.handle.finish} position={[latHandleZ, posFromBottomToY(accessories.handle.positionY ?? (maxDoorH / SCALE) / 2, maxDoorH), glassThickness / 2 + 0.01]} />
            </group>
            {/* Hinges — trapezoid aware */}
            {doorType === 'hinged' && accessories.hinges.quantity > 0 && (
              <>
                {(accessories.hinges.positions || []).map((posMm, idx) => {
                   const hingeNorm = normZ(latHingePosZ);
                   const hingeHmm = isLT ? (lateralHeightA! + (lateralHeightB! - lateralHeightA!) * hingeNorm) : (height / SCALE);
                   const hingeH = hingeHmm * SCALE;
                   const hingeBaseY = isLT ? (hingeH - height) / 2 : 0;
                   // Use position as-is (top-down mm), only clamp to glass bounds
                   const maxPosMm = hingeHmm - 100;
                   const clampedPosMm = Math.max(100, Math.min(posMm, maxPosMm));
                   return (
                     <group key={idx}>
                       <Hinge position={[-width / 2, hingeBaseY + posToY(clampedPosMm, hingeH), latHingePosZ]} finish={accessories.hinges.finish} rotation={[0, Math.PI / 2, 0]} />
                     </group>
                   );
                 })}
              </>
            )}
            {fixedPanelDepth > 0.05 && <SeparatorProfile visible={profilesEnabled} position={[-width / 2, sepY, separatorPosZ + 0.004]} height={sepH} finish={accessories.profiles.finish} rotation={[0, Math.PI / 2, 0]} />}
            {/* Vertical U-profile on wall — use wall-side height (lateralHeightB after swap = UI Latura A) */}
            {(() => {
              const wallH = isLT ? lateralHeightB! * SCALE : maxFpH;
              const wallY = isLT ? (wallH - height) / 2 : fpPosY;
              return <UProfile visible={pLeft} position={[-width / 2, wallY, -depth / 2 - U_PROFILE_WIDTH / 2]} length={wallH} finish={accessories.profiles.finish} rotation={[0, 0, Math.PI / 2]} />;
            })()}
            {/* Bottom U-profile aligned to fixed panel bottom */}
            {fixedPanelDepth > 0.05 && (
              <UProfile visible={pBottom} position={[-width / 2, -height / 2 - U_PROFILE_HEIGHT / 2, fixedPanelPosZ]} length={fixedPanelDepth} finish={accessories.profiles.finish} rotation={[0, Math.PI / 2, 0]} />
            )}
            {/* Threshold profile under door */}
            {accessories.seals.threshold && (
              <ThresholdProfile position={[-width / 2, -height / 2 - 0.003, doorPosZ]} length={doorWidth} rotation={[0, Math.PI / 2, 0]} />
            )}
          </>
        );
      })()}

      {/* ═══ COMMON: U-profiles and stabilizers ═══ */}
      {/* Bottom frontal profile: only under the door area (fixed panels have their own bottom profiles) */}
      {accessories.seals.threshold && (
        <ThresholdProfile position={[doorPosX, -height / 2 - 0.003, depth / 2]} length={doorWidth} />
      )}
      {/* Lateral bottom U-profile — follows custom height (lower edge).
          Skip when hasLateral (lateral door active): each fixed panel renders its own
          bottom profile, and there must be NO bottom profile under the mobile door. */}
      {!renderLateralWithDoor && !hasLateral && (() => {
        const hAMm = lateralHeightA ?? (height / SCALE);
        const hBMm = lateralHeightB ?? (height / SCALE);
        const hasCustomH = lateralHeightA !== undefined || lateralHeightB !== undefined;
        const isTrap = hasCustomH && hAMm !== hBMm;
        if (isTrap) {
          return <UProfile visible={pBottom} position={[-width / 2, -height / 2 - U_PROFILE_HEIGHT / 2, 0]} length={depth} finish={accessories.profiles.finish} rotation={[0, Math.PI / 2, 0]} />;
        }
        const panelH = hasCustomH ? hAMm * SCALE : height;
        const bottomY = -height / 2 + (height - panelH);
        return <UProfile visible={pBottom} position={[-width / 2, bottomY - U_PROFILE_HEIGHT / 2, 0]} length={depth} finish={accessories.profiles.finish} rotation={[0, Math.PI / 2, 0]} />;
      })()}
      {/* Lateral wall-side vertical U-profile: use lateralHeightB (after prop swap = UI Latura A = perete) */}
      {!renderLateralWithDoor && (() => {
        const latWallH = (lateralHeightB ?? (height / SCALE)) * SCALE;
        const posY = (latWallH - height) / 2;
        return <UProfile visible={pLeft} position={[-width / 2, posY, -depth / 2 - U_PROFILE_WIDTH / 2]} length={latWallH} finish={accessories.profiles.finish} rotation={[0, 0, Math.PI / 2]} />;
      })()}
      {/* Lateral corner-side vertical U-profile: use lateralHeightA (after prop swap = UI Latura B = colț) */}
      {!renderLateralWithDoor && (() => {
        const latCornerH = (lateralHeightA ?? (height / SCALE)) * SCALE;
        const posY = (latCornerH - height) / 2;
        return <UProfile visible={false} position={[-width / 2, posY, depth / 2 + U_PROFILE_WIDTH / 2]} length={latCornerH} finish={accessories.profiles.finish} rotation={[0, 0, Math.PI / 2]} />;
      })()}
      {/* Frontal corner-side vertical U-profile: use frontalHeightB (right edge) or lateralHeightB (corner) */}
      {rightPanelW < 0.01 && (() => {
        // The right edge of the frontal panel: use frontalHeightB if frontal trapezoid
        const cornerH = (frontalHeightA !== undefined && frontalHeightB !== undefined && frontalHeightA !== frontalHeightB)
          ? frontalHeightB * SCALE : height;
        return <UProfile visible={false} position={[width / 2, (cornerH - height) / 2, depth / 2 + U_PROFILE_WIDTH / 2]} length={cornerH} finish={accessories.profiles.finish} rotation={[0, 0, Math.PI / 2]} />;
      })()}

      {/* Frontal stabilizer bar — follows frontal trapezoid slope */}
      {(() => {
        const isFT = frontalHeightA !== undefined && frontalHeightB !== undefined && frontalHeightA !== frontalHeightB;
        if (isFT) {
          const hA = frontalHeightA * SCALE;
          const hB = frontalHeightB * SCALE;
          // World Y of each top edge
          const yLeft = -height / 2 + hA;
          const yRight = -height / 2 + hB;
          const midY = (yLeft + yRight) / 2;
          const angle = Math.atan2(hB - hA, width);
          const barLen = Math.sqrt(width * width + (hB - hA) * (hB - hA));
          return <Stabilizer position={[0, midY + 0.01, depth / 2]} length={barLen} type="wall_glass" finish={accessories.profiles.finish} shape={accessories.stabilizerShape} rotation={[0, 0, Math.PI / 2 + angle]} />;
        }
        return <Stabilizer position={[0, height / 2 + 0.01, depth / 2]} length={width} type="wall_glass" finish={accessories.profiles.finish} shape={accessories.stabilizerShape} />;
      })()}

      {/* Lateral stabilizer bar — follows lateral trapezoid slope */}
      {(() => {
        const hAMm = lateralHeightA ?? (height / SCALE);
        const hBMm = lateralHeightB ?? (height / SCALE);
        const hasCustom = lateralHeightA !== undefined || lateralHeightB !== undefined;
        const isLT = hasCustom && hAMm !== hBMm;
        if (isLT) {
          const hA = hAMm * SCALE;
          const hB = hBMm * SCALE;
          const yWall = -height / 2 + hA;
          const yCorner = -height / 2 + hB;
          const midY = (yWall + yCorner) / 2;
          const angle = Math.atan2(hB - hA, depth);
          const barLen = Math.sqrt(depth * depth + (hB - hA) * (hB - hA));
          return <Stabilizer position={[-width / 2, midY + 0.01, 0]} length={barLen} type="wall_glass" finish={accessories.profiles.finish} shape={accessories.stabilizerShape} rotation={[Math.PI / 2 + angle, 0, 0]} />;
        }
        const topY = hasCustom ? -height / 2 + hAMm * SCALE : height / 2;
        return <Stabilizer position={[-width / 2, topY + 0.01, 0]} length={depth} type="wall_glass" finish={accessories.profiles.finish} shape={accessories.stabilizerShape} rotation={[Math.PI / 2, 0, 0]} />;
      })()}

      {/* Magnetic seal profile — thin black line at corner junction */}
      {accessories.seals.magnetic && (
        <mesh position={[-width / 2, 0, depth / 2]}>
          <boxGeometry args={[0.003, height, 0.002]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.1} />
        </mesh>
      )}
    </group>
  );
}

// Walk-in / Niche cabin
function WalkInCabin({ 
  width, height, glassThickness, glassType, doorType, accessories, cutoutDims, slidingOverlapMm,
  frontalHeightA, frontalHeightB,
}: {
  width: number;
  height: number;
  glassThickness: number;
  glassType: ShowerConfig['glass']['type'];
  doorType: string;
  accessories: ShowerConfig['accessories'];
  cutoutDims?: { height?: number; width?: number; edge_offset?: number };
  slidingOverlapMm?: number;
  frontalHeightA?: number;
  frontalHeightB?: number;
}) {
  const hingeSide = accessories.door?.hingeSide || 'left';
  const isHingeLeft = hingeSide === 'left';
  const leftPanel = accessories.fixedPanel?.left;
  const rightPanel = accessories.fixedPanel?.right;
  const leftPanelW = leftPanel?.enabled ? leftPanel.width * SCALE : 0;
  const rightPanelW = rightPanel?.enabled ? rightPanel.width * SCALE : 0;
  const hasAnyPanel = leftPanelW > 0 || rightPanelW > 0;
  const profilesEnabled = accessories.profiles.enabled !== false;
  const pSides = accessories.profiles.sides ?? { left: true, right: true, top: false, bottom: true };
  const pLeft = profilesEnabled && pSides.left;
  const pRight = profilesEnabled && pSides.right;
  const pBottom = profilesEnabled && pSides.bottom;
  
  // Door width: for sliding doors, add overlap from mechanism settings
  const slidingOverlap3D = (slidingOverlapMm ?? 40) * SCALE;
  const hasFixedPanels = leftPanelW > 0.01 || rightPanelW > 0.01;
  const baseGap = doorType === 'sliding' ? 0 : 0; // walk-in has no gap in 3D
  const overlapBonus = (doorType === 'sliding' && hasFixedPanels) ? slidingOverlap3D : 0;
  const doorWidth = width - leftPanelW - rightPanelW + overlapBonus;
  
  // Door position: for sliding, shift toward panels to show overlap
  const doorPosX = -width / 2 + leftPanelW + doorWidth / 2 - (doorType === 'sliding' && leftPanelW > 0.01 ? overlapBonus / 2 : 0);
  
  // Hinge position based on hingeSide (relative to door)
  const hingePosX = isHingeLeft 
    ? doorPosX - doorWidth / 2 
    : doorPosX + doorWidth / 2;
  
  // Handle: for sliding, opposite side of sliding direction; for hinged/pivot, opposite of hinges
  const handleOffsetX = doorType === 'sliding'
    ? ((accessories.door?.slidingDirection || 'left') === 'right' ? doorPosX - doorWidth / 2 + 0.05 : doorPosX + doorWidth / 2 - 0.05)
    : (isHingeLeft ? doorPosX + doorWidth / 2 - 0.05 : doorPosX - doorWidth / 2 + 0.05);

  // Trapezoid support: interpolate heights across total width for each sub-panel
  const hA = frontalHeightA ? frontalHeightA * SCALE : height;
  const hB = frontalHeightB ? frontalHeightB * SCALE : height;
  const isTrapezoid = Math.abs(hA - hB) > 0.001;

  // Interpolate height at a given X fraction (0=left edge, 1=right edge)
  const interpH = (frac: number) => hA + (hB - hA) * frac;
  
  // Door sub-panel fractions
  const doorLeftFrac = leftPanelW / width;
  const doorRightFrac = (leftPanelW + doorWidth) / width;
  const doorHL = interpH(doorLeftFrac);
  const doorHR = interpH(doorRightFrac);

  return (
    <group>
      {/* Door panel */}
      {isTrapezoid ? (
        <TrapezoidPanel
          width={doorWidth}
          heightLeft={doorHL}
          heightRight={doorHR}
          thickness={glassThickness}
          position={[doorPosX, 0, 0]}
          glassType={glassType}
        />
      ) : (
        <mesh position={[doorPosX, 0, 0]} castShadow>
          <boxGeometry args={[doorWidth, height, glassThickness]} />
          <GlassMaterial type={glassType} />
        </mesh>
      )}
      
      {/* Sliding arrow on Walk-in door */}
      {doorType === 'sliding' && (
        <group position={[doorPosX, 0, 0]}>
          <SlidingArrow
            doorWidth={doorWidth}
            doorHeight={height}
            direction={accessories.door?.slidingDirection || 'left'}
          />
        </group>
      )}
      
      {/* Left fixed panel */}
      {leftPanelW > 0.01 && (
        isTrapezoid ? (
          <TrapezoidPanel
            width={leftPanelW}
            heightLeft={interpH(0)}
            heightRight={interpH(leftPanelW / width)}
            thickness={glassThickness}
            position={[-width / 2 + leftPanelW / 2, 0, 0]}
            glassType={glassType}
          />
        ) : (
          <mesh position={[-width / 2 + leftPanelW / 2, 0, 0]} castShadow>
            <boxGeometry args={[leftPanelW, height, glassThickness]} />
            <GlassMaterial type={glassType} />
          </mesh>
        )
      )}
      
      {/* Right fixed panel */}
      {rightPanelW > 0.01 && (
        isTrapezoid ? (
          <TrapezoidPanel
            width={rightPanelW}
            heightLeft={interpH(1 - rightPanelW / width)}
            heightRight={interpH(1)}
            thickness={glassThickness}
            position={[width / 2 - rightPanelW / 2, 0, 0]}
            glassType={glassType}
          />
        ) : (
          <mesh position={[width / 2 - rightPanelW / 2, 0, 0]} castShadow>
            <boxGeometry args={[rightPanelW, height, glassThickness]} />
            <GlassMaterial type={glassType} />
          </mesh>
        )
      )}
      
      {/* Separator profiles */}
      {leftPanelW > 0.01 && (
        <SeparatorProfile
          visible={profilesEnabled}
          position={[-width / 2 + leftPanelW + 0.004, 0, 0]}
          height={height}
          finish={accessories.profiles.finish}
        />
      )}
      {rightPanelW > 0.01 && (
        <SeparatorProfile
          visible={profilesEnabled}
          position={[width / 2 - rightPanelW - 0.004, 0, 0]}
          height={height}
          finish={accessories.profiles.finish}
        />
      )}

      {/* Shadow gap lines between fixed panels and sliding door */}
      {doorType === 'sliding' && leftPanelW > 0.01 && (
        <mesh position={[-width / 2 + leftPanelW, 0, 0]}>
          <boxGeometry args={[0.003, height, glassThickness + 0.002]} />
          <meshStandardMaterial color="#1a1a1a" transparent opacity={0.6} />
        </mesh>
      )}
      {doorType === 'sliding' && rightPanelW > 0.01 && (
        <mesh position={[width / 2 - rightPanelW, 0, 0]}>
          <boxGeometry args={[0.003, height, glassThickness + 0.002]} />
          <meshStandardMaterial color="#1a1a1a" transparent opacity={0.6} />
        </mesh>
      )}
      
      {/* Handle */}
      <HandleMesh model={accessories.handle.model} length={accessories.handle.length * SCALE} finish={accessories.handle.finish} position={[handleOffsetX, posFromBottomToY(accessories.handle.positionY ?? (height / SCALE) / 2, height), glassThickness / 2 + 0.01]} />
      
      {/* Hinges + Cutouts for Walk-in */}
      {doorType === 'hinged' && accessories.hinges.quantity > 0 && (
        <>
          {(accessories.hinges.positions || []).map((posMm, idx) => (
            <group key={idx}>
              <Hinge position={[hingePosX, posToY(posMm, height), 0]} finish={accessories.hinges.finish} />
              {cutoutDims?.width && cutoutDims?.height && (
                <group position={[hingePosX, posToY(posMm, height), 0]}>
                  <HingeCutout
                    width={cutoutDims.width * SCALE}
                    height={cutoutDims.height * SCALE}
                    edgeOffset={(cutoutDims.edge_offset ?? 8) * SCALE}
                    glassThickness={glassThickness}
                  />
                </group>
              )}
            </group>
          ))}
        </>
      )}
      
      {/* Profil U la baza sticlei */}
      <UProfile
        visible={pBottom}
        position={[0, -height / 2 - U_PROFILE_HEIGHT / 2, 0]}
        length={width}
        finish={accessories.profiles.finish}
      />
      {/* Profile U pe pereți laterali (walk-in se montează între 2 pereți) */}
      <UProfile
        visible={pLeft}
        position={[-width / 2 - U_PROFILE_WIDTH / 2, 0, 0]}
        length={height}
        finish={accessories.profiles.finish}
        rotation={[0, 0, Math.PI / 2]}
      />
      <UProfile
        visible={pRight}
        position={[width / 2 + U_PROFILE_WIDTH / 2, 0, 0]}
        length={height}
        finish={accessories.profiles.finish}
        rotation={[0, 0, Math.PI / 2]}
      />

      {/* Bara stabilizatoare pe toată lățimea */}
      <Stabilizer
        position={[0, height / 2 + 0.01, 0]}
        length={width}
        type="wall_glass"
        finish={accessories.profiles.finish}
        shape={accessories.stabilizerShape}
      />
    </group>
  );
}

// Pentagon/Square cabin
function PentagonCabin({ 
  width, height, depth, doorWidth, glassThickness, glassType, doorType, accessories, cutoutDims, pentagonSides 
}: {
  width: number;
  height: number;
  depth: number;
  doorWidth: number;
  glassThickness: number;
  glassType: ShowerConfig['glass']['type'];
  doorType: string;
  accessories: ShowerConfig['accessories'];
  cutoutDims?: { height?: number; width?: number; edge_offset?: number };
  pentagonSides: { left: boolean; right: boolean; back: boolean };
}) {
  const hingeSide = accessories.door?.hingeSide || 'left';
  const isHingeLeft = hingeSide === 'left';
  const leftPanel = accessories.fixedPanel?.left;
  const rightPanel = accessories.fixedPanel?.right;
  const leftPanelW = leftPanel?.enabled ? leftPanel.width * SCALE : 0;
  const rightPanelW = rightPanel?.enabled ? rightPanel.width * SCALE : 0;
  const profilesEnabled = accessories.profiles.enabled !== false;
  const pSides = accessories.profiles.sides ?? { left: true, right: true, top: false, bottom: true };
  const pLeft = profilesEnabled && pSides.left;
  const pBottom = profilesEnabled && pSides.bottom;
  
  // Door centered between fixed panels on frontal
  const doorPosX = -width / 2 + leftPanelW + doorWidth / 2;
  const hingePosX = isHingeLeft ? doorPosX - doorWidth / 2 : doorPosX + doorWidth / 2;
  const handleOffsetX = doorType === 'sliding'
    ? ((accessories.door?.slidingDirection || 'left') === 'right' ? doorPosX - doorWidth / 2 + 0.05 : doorPosX + doorWidth / 2 - 0.05)
    : (isHingeLeft ? doorPosX + doorWidth / 2 - 0.05 : doorPosX - doorWidth / 2 + 0.05);
  
  return (
    <group>
      {/* Back panel */}
      {pentagonSides.back && (
        <mesh position={[0, 0, -depth / 2]} castShadow>
          <boxGeometry args={[width, height, glassThickness]} />
          <GlassMaterial type={glassType} />
        </mesh>
      )}
      
      {/* Left side panel */}
      {pentagonSides.left && (
        <mesh position={[-width / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <boxGeometry args={[depth, height, glassThickness]} />
          <GlassMaterial type={glassType} />
        </mesh>
      )}
      
      {/* Right side panel */}
      {pentagonSides.right && (
        <mesh position={[width / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <boxGeometry args={[depth, height, glassThickness]} />
          <GlassMaterial type={glassType} />
        </mesh>
      )}
      
      {/* Front door */}
      <mesh position={[doorPosX, 0, depth / 2]} castShadow>
        <boxGeometry args={[doorWidth, height, glassThickness]} />
        <GlassMaterial type={glassType} />
      </mesh>
      
      {/* Left fixed panel on front */}
      {leftPanelW > 0.01 && (
        <mesh position={[-width / 2 + leftPanelW / 2, 0, depth / 2]} castShadow>
          <boxGeometry args={[leftPanelW, height, glassThickness]} />
          <GlassMaterial type={glassType} />
        </mesh>
      )}
      
      {/* Right fixed panel on front */}
      {rightPanelW > 0.01 && (
        <mesh position={[width / 2 - rightPanelW / 2, 0, depth / 2]} castShadow>
          <boxGeometry args={[rightPanelW, height, glassThickness]} />
          <GlassMaterial type={glassType} />
        </mesh>
      )}
      
      {/* Separator profiles */}
      {leftPanelW > 0.01 && (
        <SeparatorProfile visible={profilesEnabled} position={[-width / 2 + leftPanelW + 0.004, 0, depth / 2]} height={height} finish={accessories.profiles.finish} />
      )}
      {rightPanelW > 0.01 && (
        <SeparatorProfile visible={profilesEnabled} position={[-width / 2 + leftPanelW + doorWidth + 0.004, 0, depth / 2]} height={height} finish={accessories.profiles.finish} />
      )}
      
      {/* Sliding arrow on Pentagon door */}
      {doorType === 'sliding' && (
        <group position={[doorPosX, 0, depth / 2]}>
          <SlidingArrow
            doorWidth={doorWidth}
            doorHeight={height}
            direction={accessories.door?.slidingDirection || 'left'}
          />
        </group>
      )}
      
      {/* Handle */}
      <HandleMesh model={accessories.handle.model} length={accessories.handle.length * SCALE} finish={accessories.handle.finish} position={[handleOffsetX, posFromBottomToY(accessories.handle.positionY ?? (height / SCALE) / 2, height), depth / 2 + glassThickness / 2 + 0.01]} />
      
      {/* Hinges + Cutouts for Pentagon */}
      {doorType === 'hinged' && accessories.hinges.quantity > 0 && (
        <>
          {(accessories.hinges.positions || []).map((posMm, idx) => (
            <group key={idx}>
              <Hinge position={[hingePosX, posToY(posMm, height), depth / 2]} finish={accessories.hinges.finish} />
              {cutoutDims?.width && cutoutDims?.height && (
                <group position={[hingePosX, posToY(posMm, height), depth / 2]}>
                  <HingeCutout
                    width={cutoutDims.width * SCALE}
                    height={cutoutDims.height * SCALE}
                    edgeOffset={(cutoutDims.edge_offset ?? 8) * SCALE}
                    glassThickness={glassThickness}
                  />
                </group>
              )}
            </group>
          ))}
        </>
        )}

        {/* Profile U la baza sticlei pe toate laturile */}
        {/* Baza frontal */}
        {leftPanelW > 0.01 && (
          <UProfile
            visible={pBottom}
            position={[-width / 2 + leftPanelW / 2, -height / 2 - U_PROFILE_HEIGHT / 2, depth / 2]}
            length={leftPanelW}
            finish={accessories.profiles.finish}
          />
        )}
        {rightPanelW > 0.01 && (
          <UProfile
            visible={pBottom}
            position={[width / 2 - rightPanelW / 2, -height / 2 - U_PROFILE_HEIGHT / 2, depth / 2]}
            length={rightPanelW}
            finish={accessories.profiles.finish}
          />
        )}
        {accessories.seals.threshold && (
          <ThresholdProfile position={[doorPosX, -height / 2 - 0.003, depth / 2]} length={doorWidth} />
        )}
        {/* Baza spate */}
        {pentagonSides.back && (
          <UProfile
            visible={pBottom}
            position={[0, -height / 2 - U_PROFILE_HEIGHT / 2, -depth / 2]}
            length={width}
            finish={accessories.profiles.finish}
          />
        )}
        {/* Baza stânga */}
        {pentagonSides.left && (
          <UProfile
            visible={pBottom}
            position={[-width / 2, -height / 2 - U_PROFILE_HEIGHT / 2, 0]}
            length={depth}
            finish={accessories.profiles.finish}
            rotation={[0, Math.PI / 2, 0]}
          />
        )}
        {/* Baza dreapta */}
        {pentagonSides.right && (
          <UProfile
            visible={pBottom}
            position={[width / 2, -height / 2 - U_PROFILE_HEIGHT / 2, 0]}
            length={depth}
            finish={accessories.profiles.finish}
            rotation={[0, Math.PI / 2, 0]}
          />
        )}
        {/* Profil U pe perete (colțul din spate-stânga, vertical) */}
        <UProfile
          visible={pLeft}
          position={[-width / 2 - U_PROFILE_WIDTH / 2, 0, -depth / 2]}
          length={height}
          finish={accessories.profiles.finish}
          rotation={[0, 0, Math.PI / 2]}
        />

        {/* Bare stabilizatoare pe toate laturile */}
        {/* Frontal */}
        <Stabilizer
          position={[0, height / 2 + 0.01, depth / 2]}
          length={width}
          type="wall_glass"
          finish={accessories.profiles.finish}
          shape={accessories.stabilizerShape}
        />
        {/* Spate */}
        {pentagonSides.back && (
          <Stabilizer
            position={[0, height / 2 + 0.01, -depth / 2]}
            length={width}
            type="wall_glass"
            finish={accessories.profiles.finish}
            shape={accessories.stabilizerShape}
          />
        )}
        {/* Stânga */}
        {pentagonSides.left && (
          <Stabilizer
            position={[-width / 2, height / 2 + 0.01, 0]}
            length={depth}
            type="wall_glass"
            finish={accessories.profiles.finish}
            shape={accessories.stabilizerShape}
            rotation={[Math.PI / 2, 0, 0]}
          />
        )}
        {/* Dreapta */}
        {pentagonSides.right && (
          <Stabilizer
            position={[width / 2, height / 2 + 0.01, 0]}
            length={depth}
            type="wall_glass"
            finish={accessories.profiles.finish}
            shape={accessories.stabilizerShape}
            rotation={[Math.PI / 2, 0, 0]}
          />
        )}
      </group>
    );
  }

// Bathtub screen
function BathtubCabin({ 
  width, height, glassThickness, glassType, doorType, accessories, cutoutDims,
  frontalHeightA, frontalHeightB,
}: {
  width: number;
  height: number;
  glassThickness: number;
  glassType: ShowerConfig['glass']['type'];
  doorType: string;
  accessories: ShowerConfig['accessories'];
  cutoutDims?: { height?: number; width?: number; edge_offset?: number };
  frontalHeightA?: number;
  frontalHeightB?: number;
}) {
  const hingeSide = accessories.door?.hingeSide || 'left';
  const isHingeLeft = hingeSide === 'left';
  const leftPanel = accessories.fixedPanel?.left;
  const rightPanel = accessories.fixedPanel?.right;
  const leftPanelW = leftPanel?.enabled ? leftPanel.width * SCALE : 0;
  const rightPanelW = rightPanel?.enabled ? rightPanel.width * SCALE : 0;
  const profilesEnabled = accessories.profiles.enabled !== false;
  const pSides = accessories.profiles.sides ?? { left: true, right: true, top: false, bottom: true };
  const pLeft = profilesEnabled && pSides.left;
  const pBottom = profilesEnabled && pSides.bottom;
  
  const doorWidth = width - leftPanelW - rightPanelW;
  const doorPosX = -width / 2 + leftPanelW + doorWidth / 2;
  const hingePosX = isHingeLeft ? doorPosX - doorWidth / 2 : doorPosX + doorWidth / 2;
  const handleOffsetX = doorType === 'sliding'
    ? ((accessories.door?.slidingDirection || 'left') === 'right' ? doorPosX - doorWidth / 2 + 0.05 : doorPosX + doorWidth / 2 - 0.05)
    : (isHingeLeft ? doorPosX + doorWidth / 2 - 0.05 : doorPosX - doorWidth / 2 + 0.05);
  
  // Trapezoid support
  const hA = frontalHeightA ? frontalHeightA * SCALE : height;
  const hB = frontalHeightB ? frontalHeightB * SCALE : height;
  const isTrapezoid = Math.abs(hA - hB) > 0.001;
  const interpH = (frac: number) => hA + (hB - hA) * frac;
  const doorLeftFrac = leftPanelW / width;
  const doorRightFrac = (leftPanelW + doorWidth) / width;
  const doorHL = interpH(doorLeftFrac);
  const doorHR = interpH(doorRightFrac);

  return (
    <group>
      {/* Bathtub indicator */}
      <mesh position={[0, -height / 2 - 0.2, 0]}>
        <boxGeometry args={[width + 0.2, 0.4, 0.5]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      
      {/* Door / main glass screen */}
      {isTrapezoid ? (
        <TrapezoidPanel
          width={doorWidth}
          heightLeft={doorHL}
          heightRight={doorHR}
          thickness={glassThickness}
          position={[doorPosX, 0, 0]}
          glassType={glassType}
        />
      ) : (
        <mesh position={[doorPosX, 0, 0]} castShadow>
          <boxGeometry args={[doorWidth, height, glassThickness]} />
          <GlassMaterial type={glassType} />
        </mesh>
      )}
      
      {/* Left fixed panel */}
      {leftPanelW > 0.01 && (
        isTrapezoid ? (
          <TrapezoidPanel
            width={leftPanelW}
            heightLeft={interpH(0)}
            heightRight={interpH(leftPanelW / width)}
            thickness={glassThickness}
            position={[-width / 2 + leftPanelW / 2, 0, 0]}
            glassType={glassType}
          />
        ) : (
          <mesh position={[-width / 2 + leftPanelW / 2, 0, 0]} castShadow>
            <boxGeometry args={[leftPanelW, height, glassThickness]} />
            <GlassMaterial type={glassType} />
          </mesh>
        )
      )}
      
      {/* Right fixed panel */}
      {rightPanelW > 0.01 && (
        isTrapezoid ? (
          <TrapezoidPanel
            width={rightPanelW}
            heightLeft={interpH(1 - rightPanelW / width)}
            heightRight={interpH(1)}
            thickness={glassThickness}
            position={[width / 2 - rightPanelW / 2, 0, 0]}
            glassType={glassType}
          />
        ) : (
          <mesh position={[width / 2 - rightPanelW / 2, 0, 0]} castShadow>
            <boxGeometry args={[rightPanelW, height, glassThickness]} />
            <GlassMaterial type={glassType} />
          </mesh>
        )
      )}
      
      {/* Separator profiles */}
      {leftPanelW > 0.01 && (
        <SeparatorProfile visible={profilesEnabled} position={[-width / 2 + leftPanelW + 0.004, 0, 0]} height={height} finish={accessories.profiles.finish} />
      )}
      {rightPanelW > 0.01 && (
        <SeparatorProfile visible={profilesEnabled} position={[width / 2 - rightPanelW - 0.004, 0, 0]} height={height} finish={accessories.profiles.finish} />
      )}
      
      {/* Sliding arrow on Bathtub */}
      {doorType === 'sliding' && (
        <group position={[doorPosX, 0, 0]}>
          <SlidingArrow
            doorWidth={doorWidth}
            doorHeight={height}
            direction={accessories.door?.slidingDirection || 'left'}
          />
        </group>
      )}
      
      {/* Handle */}
      <HandleMesh model={accessories.handle.model} length={accessories.handle.length * SCALE} finish={accessories.handle.finish} position={[handleOffsetX, posFromBottomToY(accessories.handle.positionY ?? (height / SCALE) / 2, height), glassThickness / 2 + 0.01]} />
      
      {/* Hinges + Cutouts for Bathtub */}
      {doorType === 'hinged' && accessories.hinges.quantity > 0 && (
        <>
          {(accessories.hinges.positions || []).map((posMm, idx) => (
            <group key={idx}>
              <Hinge position={[hingePosX, posToY(posMm, height), 0]} finish={accessories.hinges.finish} />
              {cutoutDims?.width && cutoutDims?.height && (
                <group position={[hingePosX, posToY(posMm, height), 0]}>
                  <HingeCutout
                    width={cutoutDims.width * SCALE}
                    height={cutoutDims.height * SCALE}
                    edgeOffset={(cutoutDims.edge_offset ?? 8) * SCALE}
                    glassThickness={glassThickness}
                  />
                </group>
              )}
            </group>
          ))}
        </>
        )}

        {/* Profil U la baza sticlei — sub panouri fixe mereu, sub ușă doar cu prag */}
        {leftPanelW > 0.01 && (
          <UProfile
            visible={pBottom}
            position={[-width / 2 + leftPanelW / 2, -height / 2 - U_PROFILE_HEIGHT / 2, 0]}
            length={leftPanelW}
            finish={accessories.profiles.finish}
          />
        )}
        {rightPanelW > 0.01 && (
          <UProfile
            visible={pBottom}
            position={[width / 2 - rightPanelW / 2, -height / 2 - U_PROFILE_HEIGHT / 2, 0]}
            length={rightPanelW}
            finish={accessories.profiles.finish}
          />
        )}
        {accessories.seals.threshold && (
          <ThresholdProfile position={[doorPosX, -height / 2 - 0.003, 0]} length={doorWidth} />
        )}
        {/* Profil U pe perete (unde se fixează sticla) */}
        <UProfile
          visible={pLeft}
          position={[hingePosX + (isHingeLeft ? -U_PROFILE_WIDTH / 2 : U_PROFILE_WIDTH / 2), 0, 0]}
          length={height}
          finish={accessories.profiles.finish}
          rotation={[0, 0, Math.PI / 2]}
        />

        {/* Bara stabilizatoare pe sticla */}
        <Stabilizer
          position={[0, height / 2 + 0.01, 0]}
          length={width}
          type="wall_glass"
          finish={accessories.profiles.finish}
          shape={accessories.stabilizerShape}
        />
      </group>
    );
  }

// Sliding Arrow component - shows direction on sliding doors
function SlidingArrow({
  doorWidth,
  doorHeight,
  direction,
  offset = [0, 0, 0],
}: {
  doorWidth: number;
  doorHeight: number;
  direction: 'left' | 'right';
  offset?: [number, number, number];
}) {
  const arrowLength = doorWidth * 0.5;
  const arrowHeadSize = doorWidth * 0.08;
  const arrowBodyWidth = doorWidth * 0.015;
  const sign = direction === 'right' ? 1 : -1;

  return (
    <group position={offset}>
      {/* Arrow body (horizontal bar) */}
      <mesh position={[sign * arrowLength * 0.15, 0, 0.005]}>
        <boxGeometry args={[arrowLength * 0.7, arrowBodyWidth, 0.002]} />
        <meshStandardMaterial color="#1a1a1a" opacity={0.85} transparent />
      </mesh>
      {/* Arrow head (triangle) */}
      <mesh position={[sign * arrowLength / 2, 0, 0.005]} rotation={[0, 0, direction === 'left' ? Math.PI / 2 : -Math.PI / 2]}>
        <coneGeometry args={[arrowHeadSize, arrowHeadSize * 1.5, 3]} />
        <meshStandardMaterial color="#1a1a1a" opacity={0.85} transparent />
      </mesh>
    </group>
  );
}

// Hinge component
function Hinge({ 
  position, 
  finish, 
  rotation = [0, 0, 0] 
}: { 
  position: [number, number, number]; 
  finish: string;
  rotation?: [number, number, number] | number[];
}) {
  return (
    <mesh position={position} rotation={rotation as [number, number, number]}>
      <boxGeometry args={[0.03, 0.06, 0.02]} />
      <MetalMaterial finish={finish as any} />
    </mesh>
  );
}

// Separator profile between door and fixed panel
function SeparatorProfile({ 
  position, 
  height, 
  finish,
  rotation = [0, 0, 0],
  visible = true
}: { 
  position: [number, number, number]; 
  height: number;
  finish: string;
  rotation?: [number, number, number] | number[];
  visible?: boolean;
}) {
  if (!visible) return null;
  const PROFILE_WIDTH = 0.008;  // 8mm lățime
  const PROFILE_DEPTH = 0.010;  // 10mm adâncime
  
  return (
    <mesh position={position} rotation={rotation as [number, number, number]}>
      <boxGeometry key={`sp-${height}`} args={[PROFILE_WIDTH, height, PROFILE_DEPTH]} />
      <MetalMaterial finish={finish as any} />
    </mesh>
  );
}

// U-Profile component (bottom/wall mount profile)
// Dimensions: 19mm height × 12mm width
const U_PROFILE_HEIGHT = 0.019;
const U_PROFILE_WIDTH = 0.012;

function UProfile({
  position,
  length,
  finish,
  rotation = [0, 0, 0],
  visible = true
}: {
  position: [number, number, number];
  length: number;
  finish: string;
  rotation?: [number, number, number] | number[];
  visible?: boolean;
}) {
  if (!visible) return null;
  return (
    <mesh position={position} rotation={rotation as [number, number, number]}>
      <boxGeometry key={`up-${length}`} args={[length, U_PROFILE_HEIGHT, U_PROFILE_WIDTH]} />
      <MetalMaterial finish={finish as any} />
    </mesh>
  );
}

// Stabilizer bar component
function Stabilizer({
  position, 
  length, 
  type, 
  finish,
  shape = 'round',
  rotation = [0, 0, Math.PI / 2]
}: { 
  position: [number, number, number]; 
  length: number; 
  type: string;
  finish: string;
  shape?: 'round' | 'rectangular';
  rotation?: [number, number, number] | number[];
}) {
  return (
    <mesh position={position} rotation={rotation as [number, number, number]}>
      {shape === 'rectangular' ? (
        <boxGeometry args={[0.02, length, 0.01]} />
      ) : (
        <cylinderGeometry args={[0.01, 0.01, length, 16]} />
      )}
      <MetalMaterial finish={finish as any} />
    </mesh>
  );
}

// Fixed Panel cabin - single glass pane between two walls, no door/hinges/handle
function FixedPanelCabin({
  width, height, glassThickness, glassType, profilesEnabled, profileSides,
  frontalHeightA, frontalHeightB,
}: {
  width: number;
  height: number;
  glassThickness: number;
  glassType: string;
  profilesEnabled: boolean;
  profileSides?: { left: boolean; right: boolean; top: boolean; bottom: boolean };
  frontalHeightA?: number;
  frontalHeightB?: number;
}) {
  const offsetX = -width / 2;
  const ps = profileSides ?? { left: true, right: true, top: false, bottom: true };

  // Trapezoid support
  const hA = frontalHeightA ? frontalHeightA * SCALE : height;
  const hB = frontalHeightB ? frontalHeightB * SCALE : height;
  const isTrapezoid = Math.abs(hA - hB) > 0.001;
  const maxH = Math.max(hA, hB);

  return (
    <group>
      {/* Left wall */}
      <mesh position={[offsetX - 0.05, 0, 0]}>
        <boxGeometry args={[0.1, maxH, 0.1]} />
        <meshStandardMaterial color="#94a3b8" opacity={0.4} transparent />
      </mesh>

      {/* Single fixed glass panel */}
      {isTrapezoid ? (
        <TrapezoidPanel
          width={width}
          heightLeft={hA}
          heightRight={hB}
          thickness={glassThickness}
          position={[offsetX + width / 2, 0, 0]}
          glassType={glassType}
        />
      ) : (
        <mesh position={[offsetX + width / 2, 0, 0]}>
          <boxGeometry args={[width, height, glassThickness]} />
          <GlassMaterial type={glassType as any} />
        </mesh>
      )}

      {/* U-profiles on selected sides */}
      {profilesEnabled && ps.left && (
        <mesh position={[offsetX + 0.003, (maxH - hA) / 2, 0]}>
          <boxGeometry args={[0.006, hA, glassThickness + 0.008]} />
          <MetalMaterial finish="polished_stainless" />
        </mesh>
      )}
      {profilesEnabled && ps.right && (
        <mesh position={[offsetX + width - 0.003, (maxH - hB) / 2, 0]}>
          <boxGeometry args={[0.006, hB, glassThickness + 0.008]} />
          <MetalMaterial finish="polished_stainless" />
        </mesh>
      )}
      {profilesEnabled && ps.bottom && (
        <mesh position={[offsetX + width / 2, -maxH / 2 + 0.003, 0]}>
          <boxGeometry args={[width, 0.006, glassThickness + 0.008]} />
          <MetalMaterial finish="polished_stainless" />
        </mesh>
      )}
      {profilesEnabled && ps.top && !isTrapezoid && (
        <mesh position={[offsetX + width / 2, maxH / 2 - 0.003, 0]}>
          <boxGeometry args={[width, 0.006, glassThickness + 0.008]} />
          <MetalMaterial finish="polished_stainless" />
        </mesh>
      )}
    </group>
  );
}
