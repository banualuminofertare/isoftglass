import { describe, it, expect } from 'vitest';
import { collectMaterialCodesFromConfig, aggregateGlassDeductions, calculateShowerPrice } from './pricing';
import type { ShowerConfig } from '@/types/calculators';

describe('collectMaterialCodesFromConfig', () => {
  it('extracts materialCode from nested objects', () => {
    const config = {
      accessories: {
        hinges: { materialCode: 'HINGE-01' },
        handle: { materialCode: 'HANDLE-01' },
      },
    };
    const codes = collectMaterialCodesFromConfig(config);
    expect(codes).toContain('HINGE-01');
    expect(codes).toContain('HANDLE-01');
    expect(codes).toHaveLength(2);
  });

  it('extracts seal material codes', () => {
    const config = {
      seals: {
        magneticMaterialCode: 'MAG-01',
        rubberMaterialCode: 'RUB-01',
        thresholdMaterialCode: 'THR-01',
      },
    };
    const codes = collectMaterialCodesFromConfig(config);
    expect(codes).toContain('MAG-01');
    expect(codes).toContain('RUB-01');
    expect(codes).toContain('THR-01');
  });

  it('extracts materialCodes array', () => {
    const config = { mountPoints: { materialCodes: ['MP-01', 'MP-02'] } };
    const codes = collectMaterialCodesFromConfig(config);
    expect(codes).toContain('MP-01');
    expect(codes).toContain('MP-02');
  });

  it('returns empty array for empty object', () => {
    expect(collectMaterialCodesFromConfig({})).toEqual([]);
  });

  it('deduplicates codes', () => {
    const config = {
      a: { materialCode: 'X' },
      b: { materialCode: 'X' },
    };
    const codes = collectMaterialCodesFromConfig(config);
    expect(codes).toEqual(['X']);
  });
});

describe('aggregateGlassDeductions', () => {
  it('returns zero for empty codes', () => {
    const pricing = {
      getGlassDeductionsByCode: () => ({}),
    } as any;
    const result = aggregateGlassDeductions([], pricing);
    expect(result).toEqual({ widthDeduction: 0, heightDeduction: 0 });
  });

  it('takes max per side across multiple codes', () => {
    const deductions: Record<string, Record<string, number>> = {
      A: { side_a: 5, side_b: 3, top: 2, bottom: 4 },
      B: { side_a: 3, side_b: 7, top: 6, bottom: 1 },
    };
    const pricing = {
      getGlassDeductionsByCode: (code: string) => deductions[code] || {},
    } as any;
    const result = aggregateGlassDeductions(['A', 'B'], pricing);
    expect(result.widthDeduction).toBe(5 + 7); // max side_a + max side_b
    expect(result.heightDeduction).toBe(6 + 4); // max top + max bottom
  });
});

describe('calculateShowerPrice', () => {
  it('returns a valid price breakdown for walk_in config', () => {
    const config: ShowerConfig = {
      dimensions: {
        width: 1000,
        height: 2000,
        depth: 900,
        doorWidth: 800,
        lateralDoorWidth: 0,
      },
      glass: { thickness: 8, type: 'clear', isLaminated: false, antiCalc: false },
      cabinType: 'walk_in',
      doorType: 'pivot',
      edgePolish: { enabled: false, type: 'polished' },
      lateralConfig: { enabled: false, doorType: 'hinged', fixedPanel: { left: { enabled: false, width: 0 }, right: { enabled: false, width: 0 } }, door: { position: 'left', openDirection: 'outward', hingeSide: 'left' }, hinges: { type: 'wall_glass', quantity: 2, finish: 'chrome' }, handle: { model: 'bar', length: 200, finish: 'chrome' }, seals: { magnetic: false, rubber: false, threshold: false } },
      accessories: {
        openingSide: 'front',
        door: { position: 'left', openDirection: 'outward', hingeSide: 'left' },
        fixedPanel: { left: { enabled: false, width: 0 }, right: { enabled: false, width: 0 } },
        hinges: { type: 'wall_glass', finish: 'chrome', quantity: 2 },
        handle: { model: 'bar', length: 200, finish: 'chrome' },
        profiles: { enabled: true, type: 'u_profile', finish: 'chrome', sides: { left: true, right: true, top: false, bottom: true } },
        stabilizers: [],
        seals: { magnetic: true, rubber: true, threshold: false },
        extraAccessories: [],
      },
    };

    const result = calculateShowerPrice(config);
    expect(result).toBeDefined();
    expect(result.total).toBeGreaterThan(0);
    expect(result.glass).toBeGreaterThan(0);
  });
});
