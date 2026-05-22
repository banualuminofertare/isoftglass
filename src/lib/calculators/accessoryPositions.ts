/**
 * Calculate default hinge positions based on height and quantity.
 * Positions are in mm from the TOP of the glass.
 * First position = top hinge, last position = bottom hinge.
 */
export function calculateDefaultHingePositions(height: number, quantity: number): number[] {
  const margin = 200; // 200mm from edges
  if (quantity <= 0) return [];
  if (quantity === 1) return [height / 2];
  if (quantity === 2) return [margin, height - margin];
  // 3 or more
  return [margin, Math.round(height / 2), height - margin];
}

/**
 * Calculate default handle position (center of height).
 * Position is in mm from the BOTTOM of the glass.
 */
export function calculateDefaultHandlePosition(height: number): number {
  return Math.round(height / 2);
}
