/**
 * Aggregates accessory items by material code, summing quantities.
 */

/** Parse quantity string like "3 buc", "1 set", "1500 mm" → { qty, unit } */
function parseQty(raw?: string): { qty: number; unit: string } {
  if (!raw) return { qty: 1, unit: 'buc' };
  const str = String(raw).trim();
  const match = str.match(/^([\d.,]+)\s*(.*)$/);
  if (!match) return { qty: 1, unit: str || 'buc' };
  const qty = parseFloat(match[1].replace(',', '.')) || 1;
  const unit = match[2].trim() || 'buc';
  return { qty, unit };
}

function formatQty(qty: number, unit: string): string {
  const formatted = Number.isInteger(qty) ? String(qty) : qty.toFixed(2).replace(/\.?0+$/, '');
  return `${formatted} ${unit}`;
}

/**
 * Aggregate items by `code` field, summing parsed quantities.
 * Items with empty/'-' code are NOT grouped together (kept as-is).
 * Reads quantity from `detail` or `quantity` field (whichever exists).
 */
export function aggregateAccessories<T extends { code?: string; detail?: string; quantity?: string }>(items: T[]): T[] {
  if (!items || items.length <= 1) return items;

  const grouped = new Map<string, T>();
  const ungrouped: T[] = [];

  for (const item of items) {
    const code = item.code?.trim();

    if (!code || code === '-' || code === '') {
      ungrouped.push(item);
      continue;
    }

    const existing = grouped.get(code);
    if (!existing) {
      grouped.set(code, { ...item });
      continue;
    }

    // Sum quantities
    const qtyField = item.detail ? 'detail' : 'quantity';
    const existingField = existing.detail ? 'detail' : 'quantity';

    const parsedExisting = parseQty(existing[existingField]);
    const parsedNew = parseQty(item[qtyField]);
    const sumQty = parsedExisting.qty + parsedNew.qty;
    const formatted = formatQty(sumQty, parsedExisting.unit);

    if (existingField === 'detail') {
      (existing as any).detail = formatted;
    }
    if ('quantity' in existing) {
      (existing as any).quantity = formatted;
    }
  }

  return [...Array.from(grouped.values()), ...ungrouped];
}
