import { describe, it, expect } from 'vitest';
import { extractMaterialConsumption } from './materialConsumption';

describe('extractMaterialConsumption', () => {
  it('returns empty array for empty config', () => {
    expect(extractMaterialConsumption({})).toEqual([]);
  });

  it('extracts hinge material code with quantity', () => {
    const config = {
      accessories: {
        hinges: { materialCode: 'HNG-01', quantity: 3 },
      },
    };
    const result = extractMaterialConsumption(config);
    expect(result).toContainEqual({ code: 'HNG-01', quantity: 3 });
  });

  it('extracts handle and profile codes', () => {
    const config = {
      accessories: {
        handle: { materialCode: 'HDL-01' },
        profiles: { materialCode: 'PRF-01' },
      },
    };
    const result = extractMaterialConsumption(config);
    expect(result).toContainEqual({ code: 'HDL-01', quantity: 1 });
    expect(result).toContainEqual({ code: 'PRF-01', quantity: 1 });
  });

  it('extracts extra accessories with quantities', () => {
    const config = {
      accessories: {
        extraAccessories: [
          { materialCode: 'EX-01', quantity: 2 },
          { materialCode: 'EX-02', quantity: 5 },
        ],
      },
    };
    const result = extractMaterialConsumption(config);
    expect(result).toContainEqual({ code: 'EX-01', quantity: 2 });
    expect(result).toContainEqual({ code: 'EX-02', quantity: 5 });
  });

  it('sums duplicate codes', () => {
    const config = {
      accessories: {
        handle: { materialCode: 'SAME-01' },
        pivot: { materialCode: 'SAME-01' },
      },
    };
    const result = extractMaterialConsumption(config);
    const item = result.find(r => r.code === 'SAME-01');
    expect(item).toBeDefined();
    expect(item!.quantity).toBe(2);
  });

  it('extracts from selectedKit', () => {
    const config = {
      selectedKit: {
        code: 'KIT-01',
        items: [
          { material_code: 'KI-01', quantity: 2 },
          { material_code: 'KI-02', quantity: 1 },
        ],
      },
    };
    const result = extractMaterialConsumption(config);
    expect(result).toContainEqual({ code: 'KIT-01', quantity: 1 });
    expect(result).toContainEqual({ code: 'KI-01', quantity: 2 });
    expect(result).toContainEqual({ code: 'KI-02', quantity: 1 });
  });

  it('extracts seal material codes', () => {
    const config = {
      accessories: {
        seals: {
          magneticMaterialCode: 'MAG-01',
          rubberMaterialCode: 'RUB-01',
        },
      },
    };
    const result = extractMaterialConsumption(config);
    expect(result).toContainEqual({ code: 'MAG-01', quantity: 1 });
    expect(result).toContainEqual({ code: 'RUB-01', quantity: 1 });
  });

  it('defaults zero hinge quantity to 1', () => {
    const config = {
      accessories: {
        hinges: { materialCode: 'H1', quantity: 0 },
      },
    };
    const result = extractMaterialConsumption(config);
    // quantity 0 falls back to `Number(0) || 1` = 1
    expect(result).toContainEqual({ code: 'H1', quantity: 1 });
  });
});
