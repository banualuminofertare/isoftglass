import { describe, it, expect } from 'vitest';
import { guillotineCut, type CutPanel } from './guillotineCut';

describe('guillotineCut', () => {
  const SHEET_W = 3210;
  const SHEET_H = 2250;

  it('returns empty result for no panels', () => {
    const result = guillotineCut([], SHEET_W, SHEET_H);
    expect(result.totalSheets).toBe(0);
    expect(result.sheets).toEqual([]);
    expect(result.totalWastePercent).toBe(0);
  });

  it('places a single small panel on one sheet', () => {
    const panels: CutPanel[] = [{ width: 500, height: 600, label: 'P1' }];
    const result = guillotineCut(panels, SHEET_W, SHEET_H);
    expect(result.totalSheets).toBe(1);
    expect(result.sheets[0].panels).toHaveLength(1);
    expect(result.sheets[0].panels[0].x).toBe(0);
    expect(result.sheets[0].panels[0].y).toBe(0);
  });

  it('places multiple panels and accounts for all', () => {
    const panels: CutPanel[] = [
      { width: 1000, height: 1000, label: 'A' },
      { width: 800, height: 600, label: 'B' },
      { width: 500, height: 400, label: 'C' },
    ];
    const result = guillotineCut(panels, SHEET_W, SHEET_H);
    const totalPlaced = result.sheets.reduce((sum, s) => sum + s.panels.length, 0);
    expect(totalPlaced).toBe(3);
  });

  it('skips a panel larger than the sheet', () => {
    const panels: CutPanel[] = [{ width: 4000, height: 3000, label: 'TOO_BIG' }];
    const result = guillotineCut(panels, SHEET_W, SHEET_H);
    // Panel doesn't fit anywhere — no panels placed
    const placed = result.sheets.reduce((s, sh) => s + sh.panels.length, 0);
    expect(placed).toBe(0);
  });

  it('multi-strategy picks a layout with reasonable waste for a friendly mix', () => {
    // 6 panels of 1000x1000 on a 3210x2250 sheet — best layout fits 6 panels (2 rows × 3 cols)
    // using ~83% area, so waste should be under ~20% with a single sheet.
    const panels: CutPanel[] = Array.from({ length: 6 }, (_, i) => ({
      width: 1000,
      height: 1000,
      label: `P${i + 1}`,
    }));
    const result = guillotineCut(panels, SHEET_W, SHEET_H, 0);
    const placed = result.sheets.reduce((s, sh) => s + sh.panels.length, 0);
    expect(placed).toBe(6);
    expect(result.totalSheets).toBeLessThanOrEqual(1);
    expect(result.totalWastePercent).toBeLessThan(20);
  });

  it('rotates panel 90° when needed', () => {
    // Panel 300w x 100h on a sheet 200w x 400h — must rotate to 100w x 300h
    const panels: CutPanel[] = [{ width: 300, height: 100, label: 'R1' }];
    const result = guillotineCut(panels, 200, 400);
    expect(result.totalSheets).toBe(1);
    expect(result.sheets[0].panels[0].rotated).toBe(true);
    expect(result.sheets[0].panels[0].w).toBe(100);
    expect(result.sheets[0].panels[0].h).toBe(300);
  });

  it('calculates waste percentage correctly', () => {
    // Single panel exactly half the sheet area
    const panels: CutPanel[] = [{ width: SHEET_W, height: SHEET_H / 2, label: 'HALF' }];
    const result = guillotineCut(panels, SHEET_W, SHEET_H, 0);
    expect(result.totalWastePercent).toBeCloseTo(50, 0);
  });

  it('preserves orderId on placed panels', () => {
    const panels: CutPanel[] = [{ width: 500, height: 500, label: 'X', orderId: 'ORD-123' }];
    const result = guillotineCut(panels, SHEET_W, SHEET_H);
    expect(result.sheets[0].panels[0].orderId).toBe('ORD-123');
  });
});
