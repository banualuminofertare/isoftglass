import { useState, useCallback, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { cn } from '@/lib/utils';
import { Canvas3DErrorBoundary } from './Canvas3DErrorBoundary';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import i18next from 'i18next';

interface SceneSetupProps {
  children: React.ReactNode;
  className?: string;
  showGrid?: boolean;
  cameraPosition?: [number, number, number];
  cameraFov?: number;
  backgroundColor?: string;
  resetKey?: string | number;
}

function ControlsInvalidator() {
  const { invalidate } = useThree();
  const controls = useThree((s) => s.controls) as any;
  useEffect(() => {
    if (!controls) return;
    const handler = () => invalidate();
    controls.addEventListener('change', handler);
    return () => controls.removeEventListener('change', handler);
  }, [controls, invalidate]);
  return null;
}

function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

const MAX_AUTO_RETRIES = 3;
const RETRY_DELAY_MS = 1500;
const INIT_TIMEOUT_MS = 10000;

function WebGLFallbackMessage({ className, onRetry }: { className?: string; onRetry?: () => void }) {
  return (
    <div className={cn("w-full h-full flex flex-col items-center justify-center gap-4 bg-muted/30 rounded-lg p-6 text-center", className)}>
      <AlertTriangle className="h-8 w-8 text-destructive" />
      <p className="text-sm font-medium text-foreground">{i18next.t('ui.viewer3dNotWorking')}</p>
      <ul className="text-xs text-muted-foreground space-y-1 text-left list-disc pl-4">
        <li>{i18next.t('ui.viewer3dEnableHw')}</li>
        <li>{i18next.t('ui.viewer3dUpdateDrivers')}</li>
        <li>{i18next.t('ui.viewer3dTryBrowser')}</li>
      </ul>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <RefreshCw className="h-4 w-4" />
          {i18next.t('common.retry', 'Reîncearcă')}
        </button>
      )}
    </div>
  );
}

export function SceneSetup({
  children,
  className,
  showGrid = true,
  cameraPosition = [2, 2, 4],
  cameraFov = 50,
  backgroundColor = '#f8fafc',
  resetKey,
}: SceneSetupProps) {
  const [contextLost, setContextLost] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const [canvasReady, setCanvasReady] = useState(false);
  const [initTimedOut, setInitTimedOut] = useState(false);
  const retriesRef = useRef(0);
  const rendererRef = useRef<any>(null);
  const listenersRef = useRef<{
    canvas: HTMLCanvasElement;
    onLost: (e: Event) => void;
    onRestored: () => void;
  } | null>(null);

  // Check WebGL availability once
  const [webglAvailable] = useState(() => isWebGLAvailable());

  // Initialization timeout
  useEffect(() => {
    if (!webglAvailable || canvasReady || contextLost) return;
    const timer = setTimeout(() => {
      if (!canvasReady) setInitTimedOut(true);
    }, INIT_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [webglAvailable, canvasReady, contextLost, canvasKey]);

  const handleCreated = useCallback((state: any) => {
    setCanvasReady(true);
    setInitTimedOut(false);
    const canvas = state.gl.domElement as HTMLCanvasElement;
    const renderer = state.gl;

    if (listenersRef.current) {
      const { canvas: prevCanvas, onLost, onRestored } = listenersRef.current;
      prevCanvas.removeEventListener('webglcontextlost', onLost);
      prevCanvas.removeEventListener('webglcontextrestored', onRestored);
    }

    const onLost = (e: Event) => {
      e.preventDefault();
      console.warn('WebGL context lost – auto-recovering...');
      setContextLost(true);
    };

    const onRestored = () => {
      console.info('WebGL context restored');
      setContextLost(false);
    };

    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);
    listenersRef.current = { canvas, onLost, onRestored };
    rendererRef.current = renderer;
  }, []);

  useEffect(() => {
    return () => {
      if (listenersRef.current) {
        const { canvas, onLost, onRestored } = listenersRef.current;
        canvas.removeEventListener('webglcontextlost', onLost);
        canvas.removeEventListener('webglcontextrestored', onRestored);
        listenersRef.current = null;
      }

      if (rendererRef.current) {
        const renderer = rendererRef.current;
        const scene = renderer.scene ?? renderer._scene;
        const traverseDispose = (obj: any) => {
          if (!obj) return;
          if (obj.children) {
            for (let i = obj.children.length - 1; i >= 0; i--) {
              traverseDispose(obj.children[i]);
            }
          }
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m: any) => m.dispose());
            } else {
              obj.material.dispose();
            }
          }
        };
        try { if (scene) traverseDispose(scene); } catch {}
        renderer.dispose();
        try { renderer.forceContextLoss(); } catch {}
        rendererRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (resetKey === undefined) return;
    setCanvasReady(false);
    setInitTimedOut(false);
    setCanvasKey((k) => k + 1);
  }, [resetKey]);

  // Auto-recovery for context lost
  useEffect(() => {
    if (!contextLost) {
      retriesRef.current = 0;
      return;
    }
    if (retriesRef.current >= MAX_AUTO_RETRIES) return;
    retriesRef.current += 1;
    const timer = setTimeout(() => {
      setContextLost(false);
      setCanvasReady(false);
      setInitTimedOut(false);
      setCanvasKey((k) => k + 1);
    }, RETRY_DELAY_MS);
    return () => clearTimeout(timer);
  }, [contextLost]);

  const handleRetry = () => {
    retriesRef.current = 0;
    setContextLost(false);
    setCanvasReady(false);
    setInitTimedOut(false);
    setCanvasKey((k) => k + 1);
  };

  // No WebGL support
  if (!webglAvailable) {
    return <WebGLFallbackMessage className={className} />;
  }

  // Init timed out
  if (initTimedOut && !canvasReady) {
    return <WebGLFallbackMessage className={className} onRetry={handleRetry} />;
  }

  // Context lost - max retries
  if (contextLost && retriesRef.current >= MAX_AUTO_RETRIES) {
    return <WebGLFallbackMessage className={className} onRetry={handleRetry} />;
  }

  // Context lost - recovering
  if (contextLost) {
    return (
      <div className={cn("w-full h-full flex items-center justify-center bg-muted/30 rounded-lg", className)}>
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <Canvas3DErrorBoundary className={className}>
      <div className={cn("w-full h-full", className)}>
        <Canvas
          key={canvasKey}
          shadows
          dpr={[1, 1.5]}
          frameloop="demand"
          gl={{
            powerPreference: 'default',
            antialias: true,
            preserveDrawingBuffer: true,
          }}
          onCreated={handleCreated}
        >
          <color attach="background" args={[backgroundColor]} />
          <PerspectiveCamera makeDefault position={cameraPosition} fov={cameraFov} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} castShadow shadow-mapSize={[2048, 2048]} />
          <directionalLight position={[-5, 3, -5]} intensity={0.3} />
          <Environment preset="apartment" />
          {showGrid && (
            <Grid
              position={[0, 0, 0]}
              args={[10, 10]}
              cellSize={0.5}
              cellThickness={0.5}
              cellColor="#94a3b8"
              sectionSize={2}
              sectionThickness={1}
              sectionColor="#64748b"
              fadeDistance={10}
              fadeStrength={1}
              infiniteGrid
            />
          )}
          {children}
          <ControlsInvalidator />
          <OrbitControls
            makeDefault
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            enableDamping={false}
            mouseButtons={{
              LEFT: THREE.MOUSE.ROTATE,
              MIDDLE: THREE.MOUSE.PAN,
              RIGHT: THREE.MOUSE.PAN,
            }}
            minDistance={1}
            maxDistance={20}
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </div>
    </Canvas3DErrorBoundary>
  );
}
