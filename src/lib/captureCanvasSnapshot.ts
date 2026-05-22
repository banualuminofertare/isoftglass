/**
 * Captures a screenshot from the Three.js WebGL canvas in the DOM.
 * Returns a base64 PNG data URL, or null if no canvas is found.
 * Requires `preserveDrawingBuffer: true` on the Canvas component.
 */
export function captureCanvasSnapshot(): string | null {
  const canvas = document.querySelector('canvas') as HTMLCanvasElement | null;
  if (!canvas) return null;
  try {
    return canvas.toDataURL('image/png');
  } catch {
    console.warn('Could not capture canvas snapshot');
    return null;
  }
}
