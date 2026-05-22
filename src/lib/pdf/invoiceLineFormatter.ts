import type { TFunction } from 'i18next';

/**
 * Build a rich invoice line description from an order_product row.
 * Reads full_config (fallback to configuration) — full_config is the source of truth.
 */
export function buildInvoiceLineDescription(
  product: { product_type: string; full_config?: any; configuration?: any },
  t: TFunction,
): string {
  const cfg = (product.full_config || product.configuration || {}) as any;
  const parts: string[] = [];

  // Base product type
  const typeKey = `invoicing.productDesc.type.${product.product_type}`;
  const typeLabel = t(typeKey, { defaultValue: product.product_type });
  let base = String(typeLabel);

  // Sub-type
  const cabinType = cfg?.cabinType;
  if (cabinType) {
    base += ' ' + t(`invoicing.productDesc.cabin.${cabinType}`, { defaultValue: cabinType });
  }
  const doorType = cfg?.doorType;
  if (doorType) {
    base += ' ' + t(`invoicing.productDesc.door.${doorType}`, { defaultValue: doorType });
  }
  parts.push(base);

  // Dimensions
  const d = cfg?.dimensions;
  if (d) {
    const dims: number[] = [];
    if (d.width) dims.push(Number(d.width));
    if (d.depth) dims.push(Number(d.depth));
    if (d.height) dims.push(Number(d.height));
    if (dims.length >= 2) parts.push(dims.join('×') + 'mm');
  }

  // Glass
  const g = cfg?.glass;
  if (g) {
    const glassBits: string[] = [];
    if (g.thickness) glassBits.push(g.thickness + 'mm');
    if (g.type) glassBits.push(t(`invoicing.productDesc.glass.${g.type}`, { defaultValue: g.type }));
    if (g.isLaminated) glassBits.push(t('invoicing.productDesc.glass.laminated', { defaultValue: 'laminat' }));
    if (g.isTempered) glassBits.push(t('invoicing.productDesc.glass.tempered', { defaultValue: 'securizat' }));
    if (g.antiCalc) glassBits.push(t('invoicing.productDesc.glass.antiCalc', { defaultValue: 'anticalcar' }));
    if (glassBits.length) {
      parts.push(t('invoicing.productDesc.glass.label', { defaultValue: 'sticlă' }) + ' ' + glassBits.join(' '));
    }
  }

  // Profile / hinge finish
  const profileFinish = cfg?.accessories?.profiles?.finish;
  const hingesFinish = cfg?.accessories?.hinges?.finish;
  const finish = profileFinish || hingesFinish;
  if (finish && typeof finish === 'string' && !/^\d/.test(finish)) {
    const finishLabel = t(`invoicing.productDesc.finish.${finish}`, { defaultValue: finish.replace(/_/g, ' ') });
    const noun = profileFinish
      ? t('invoicing.productDesc.profile', { defaultValue: 'profil' })
      : t('invoicing.productDesc.hinges', { defaultValue: 'balamale' });
    parts.push(`${noun} ${finishLabel}`);
  }

  return parts.filter(Boolean).join(', ');
}
