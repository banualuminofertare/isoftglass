import { MeshPhysicalMaterial } from 'three';
import { createContext, useContext, useEffect, useMemo, useRef } from 'react';

// Context to provide glass color from settings to all GlassMaterial instances
export const GlassColorContext = createContext<string | undefined>(undefined);

interface GlassMaterialProps {
  type?: 'clear' | 'frosted' | 'patterned' | 'bronze' | 'grey' | 'timeless';
  color?: string;
  opacity?: number;
}

export function useGlassMaterial({ 
  type = 'clear', 
  color,
  opacity = 0.75 
}: GlassMaterialProps = {}) {
  const materialRef = useRef<MeshPhysicalMaterial | null>(null);

  const material = useMemo(() => {
    // Dispose previous material before creating a new one
    if (materialRef.current) {
      materialRef.current.dispose();
    }

    const baseProps = {
      transparent: true,
      depthWrite: false,
    };

    let mat: MeshPhysicalMaterial;

    if (color) {
      mat = new MeshPhysicalMaterial({
        ...baseProps,
        color,
        transmission: 0.5,
        roughness: 0.08,
        thickness: 0.5,
        clearcoat: 0.8,
        opacity: 0.6,
      });
    } else {
      switch (type) {
        case 'frosted':
          mat = new MeshPhysicalMaterial({ ...baseProps, color: '#e8e8e8', transmission: 0.5, roughness: 0.5, thickness: 0.5, clearcoat: 0.3, opacity: 0.95 });
          break;
        case 'patterned':
          mat = new MeshPhysicalMaterial({ ...baseProps, color: '#d0d0d0', transmission: 0.4, roughness: 0.3, thickness: 0.5, clearcoat: 0.5, opacity: 0.9 });
          break;
        case 'bronze':
          mat = new MeshPhysicalMaterial({ ...baseProps, color: '#8B6914', transmission: 0.5, roughness: 0.08, thickness: 0.5, clearcoat: 0.8, opacity: 0.6 });
          break;
        case 'grey':
          mat = new MeshPhysicalMaterial({ ...baseProps, color: '#6B7280', transmission: 0.5, roughness: 0.08, thickness: 0.5, clearcoat: 0.8, opacity: 0.6 });
          break;
        case 'timeless':
          mat = new MeshPhysicalMaterial({ ...baseProps, color: '#5B8A72', transmission: 0.55, roughness: 0.06, thickness: 0.5, clearcoat: 0.9, opacity: 0.55 });
          break;
        case 'clear':
        default:
          mat = new MeshPhysicalMaterial({ ...baseProps, color: '#4a90a4', transmission: opacity, roughness: 0.05, thickness: 0.5, clearcoat: 1, opacity: 0.5 });
          break;
      }
    }

    materialRef.current = mat;
    return mat;
  }, [type, color, opacity]);

  // Dispose on unmount
  useEffect(() => {
    return () => {
      if (materialRef.current) {
        materialRef.current.dispose();
        materialRef.current = null;
      }
    };
  }, []);

  return material;
}

// Declarative component version - auto-reads color from GlassColorContext
export function GlassMaterial({ 
  type = 'clear', 
  color,
  attach = 'material'
}: GlassMaterialProps & { attach?: string }) {
  const contextColor = useContext(GlassColorContext);
  const effectiveColor = color || contextColor;

  const typeColorMap: Record<string, string> = {
    clear: '#4a90a4',
    frosted: '#c8d4dc',
    patterned: '#b8c8d0',
    bronze: '#8B6914',
    grey: '#6B7280',
    timeless: '#5B8A72',
  };
  const opacityMap: Record<string, number> = {
    clear: 0.4, frosted: 0.7, patterned: 0.6, bronze: 0.55, grey: 0.55, timeless: 0.5,
  };
  const roughnessMap: Record<string, number> = {
    clear: 0.05, frosted: 0.6, patterned: 0.4, bronze: 0.08, grey: 0.08, timeless: 0.06,
  };
  // Custom color from settings takes priority over type-based color
  const materialColor = effectiveColor || typeColorMap[type] || '#4a90a4';
  const opacity = effectiveColor ? 0.5 : (opacityMap[type] || 0.4);
  const roughness = effectiveColor ? 0.08 : (roughnessMap[type] || 0.05);

  return (
    <meshStandardMaterial
      attach={attach}
      color={materialColor}
      transparent
      opacity={opacity}
      roughness={roughness}
      metalness={0.1}
    />
  );
}
