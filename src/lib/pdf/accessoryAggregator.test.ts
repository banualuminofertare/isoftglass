import { describe, it, expect } from 'vitest';
import { aggregateAccessories } from './accessoryAggregator';

describe('aggregateAccessories', () => {
  it('returns same array for single item', () => {
    const items = [{ code: 'A', detail: '1 buc' }];
    expect(aggregateAccessories(items)).toEqual(items);
  });

  it('sums quantities for same code', () => {
    const items = [
      { code: 'HNG-01', detail: '2 buc', name: 'Hinge' },
      { code: 'HNG-01', detail: '3 buc', name: 'Hinge' },
    ];
    const result = aggregateAccessories(items);
    const grouped = result.find(r => r.code === 'HNG-01');
    expect(grouped).toBeDefined();
    expect(grouped!.detail).toBe('5 buc');
  });

  it('keeps items without code separate', () => {
    const items = [
      { code: '', detail: '1 buc', name: 'Unknown A' },
      { code: '', detail: '2 buc', name: 'Unknown B' },
    ];
    const result = aggregateAccessories(items);
    expect(result).toHaveLength(2);
  });

  it('handles dash code as ungrouped', () => {
    const items = [
      { code: '-', detail: '1 buc', name: 'A' },
      { code: '-', detail: '1 buc', name: 'B' },
    ];
    const result = aggregateAccessories(items);
    expect(result).toHaveLength(2);
  });

  it('handles mixed grouped and ungrouped', () => {
    const items = [
      { code: 'X', detail: '1 buc', name: 'Item X' },
      { code: '', detail: '1 buc', name: 'No code' },
      { code: 'X', detail: '2 buc', name: 'Item X' },
    ];
    const result = aggregateAccessories(items);
    const xItem = result.find(r => r.code === 'X');
    expect(xItem!.detail).toBe('3 buc');
    expect(result).toHaveLength(2); // 1 grouped + 1 ungrouped
  });

  it('returns empty/null arrays as-is', () => {
    expect(aggregateAccessories([])).toEqual([]);
    expect(aggregateAccessories(null as any)).toEqual(null);
  });
});
