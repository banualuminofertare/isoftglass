// Validări locale pentru e-Factură (înainte de generare XML)
export interface EInvoiceValidationError {
  field: string;
  message: string;
}

export function validateInvoiceForEFactura(invoice: any, items: any[]): EInvoiceValidationError[] {
  const errors: EInvoiceValidationError[] = [];
  const supplier = invoice.company_snapshot || {};
  const buyer = invoice.client_snapshot || {};

  // Emitent
  if (!supplier.cui && !supplier.vat_id) errors.push({ field: 'supplier.cui', message: 'CUI emitent lipsă' });
  if (!supplier.name) errors.push({ field: 'supplier.name', message: 'Denumire emitent lipsă' });
  if (!supplier.address) errors.push({ field: 'supplier.address', message: 'Adresă emitent lipsă' });
  if (!supplier.city) errors.push({ field: 'supplier.city', message: 'Localitate emitent lipsă (obligatoriu pentru e-Factura)' });
  if (!supplier.county) errors.push({ field: 'supplier.county', message: 'Județ emitent lipsă (obligatoriu pentru e-Factura)' });

  // Cumpărător
  if (!(buyer.company_name || buyer.name)) errors.push({ field: 'buyer.name', message: 'Denumire client lipsă' });
  if (!buyer.address) errors.push({ field: 'buyer.address', message: 'Adresă client lipsă' });
  if (!buyer.city) errors.push({ field: 'buyer.city', message: 'Localitate client lipsă' });

  // Factură
  if (!invoice.invoice_number) errors.push({ field: 'invoice.number', message: 'Factură fără număr (emite-o întâi)' });
  if (!invoice.issue_date) errors.push({ field: 'invoice.issue_date', message: 'Data emiterii lipsă' });
  if (!items || items.length === 0) errors.push({ field: 'items', message: 'Factura nu are linii' });
  if (invoice.currency && invoice.currency !== 'RON') errors.push({ field: 'currency', message: 'e-Factura ANAF necesită RON (moneda facturii: ' + invoice.currency + ')' });

  // Linii
  items?.forEach((it, idx) => {
    if (!it.description) errors.push({ field: `items[${idx}].description`, message: `Linia ${idx + 1}: descriere lipsă` });
    if (Number(it.quantity) <= 0) errors.push({ field: `items[${idx}].quantity`, message: `Linia ${idx + 1}: cantitate invalidă` });
  });

  // Totaluri
  const subtotalCalc = (items || []).reduce((s, i) => s + Number(i.subtotal || 0), 0);
  if (Math.abs(subtotalCalc - Number(invoice.subtotal || 0)) > 0.05) {
    errors.push({ field: 'totals', message: 'Subtotal nu corespunde cu suma liniilor' });
  }

  return errors;
}

// Validare Peppol BIS Billing 3.0 (EN 16931 + reguli BR-* Peppol)
// Aplicabilă pentru toți emitenții UE în afara RO (CIUS-RO) și IT (FatturaPA)
export function validateInvoiceForPeppol(invoice: any, items: any[]): EInvoiceValidationError[] {
  const errors: EInvoiceValidationError[] = [];
  const supplier = invoice.company_snapshot || {};
  const buyer = invoice.client_snapshot || {};

  // Emitent (BR-* obligatorii)
  const supplierCountry = String(supplier.country_code || '').toUpperCase();
  if (!supplierCountry || supplierCountry.length !== 2) errors.push({ field: 'supplier.country_code', message: 'Cod țară emitent (ISO 3166, 2 litere) lipsă' });
  if (!supplier.name) errors.push({ field: 'supplier.name', message: 'Denumire emitent lipsă' });
  if (!supplier.address) errors.push({ field: 'supplier.address', message: 'Adresă emitent lipsă' });
  if (!supplier.city) errors.push({ field: 'supplier.city', message: 'Localitate emitent lipsă' });
  if (!supplier.postal_code) errors.push({ field: 'supplier.postal_code', message: 'Cod poștal emitent lipsă (Peppol BR-08)' });
  const supplierVat = String(supplier.vat_id || supplier.cui || '').trim();
  if (!supplierVat) errors.push({ field: 'supplier.vat_id', message: 'VAT ID emitent lipsă (cu prefix țară, ex. DE123456789)' });
  else if (!/^[A-Z]{2}/i.test(supplierVat)) errors.push({ field: 'supplier.vat_id', message: 'VAT ID emitent trebuie să înceapă cu codul de țară (ex. DE, FR, AT)' });

  // Cumpărător
  const buyerCountry = String(buyer.country_code || '').toUpperCase();
  if (!buyerCountry || buyerCountry.length !== 2) errors.push({ field: 'buyer.country_code', message: 'Cod țară client (ISO 3166, 2 litere) lipsă' });
  if (!(buyer.company_name || buyer.name)) errors.push({ field: 'buyer.name', message: 'Denumire client lipsă' });
  if (!buyer.address) errors.push({ field: 'buyer.address', message: 'Adresă client lipsă' });
  if (!buyer.city) errors.push({ field: 'buyer.city', message: 'Localitate client lipsă' });
  if (!buyer.postal_code) errors.push({ field: 'buyer.postal_code', message: 'Cod poștal client lipsă (Peppol BR-08)' });

  // Factură
  if (!invoice.invoice_number) errors.push({ field: 'invoice.number', message: 'Factură fără număr (emite-o întâi)' });
  if (!invoice.issue_date) errors.push({ field: 'invoice.issue_date', message: 'Data emiterii lipsă' });
  if (!items || items.length === 0) errors.push({ field: 'items', message: 'Factura nu are linii' });

  // BR-CO-25: BuyerReference SAU OrderReference obligatoriu (avertizare info — XML-ul are fallback automat)
  const hasBuyerRef = !!(buyer.peppol_buyer_reference || buyer.buyer_reference || buyer.code || buyer.cui || buyer.vat_id);
  const hasOrderRef = !!invoice.order_number;
  if (!hasBuyerRef && !hasOrderRef) {
    errors.push({ field: 'info.buyer_reference', message: 'Recomandat: setează un cod client sau un număr de comandă (BR-CO-25 Peppol)' });
  }

  // Linii
  items?.forEach((it, idx) => {
    if (!it.description) errors.push({ field: `items[${idx}].description`, message: `Linia ${idx + 1}: descriere lipsă` });
    if (Number(it.quantity) <= 0) errors.push({ field: `items[${idx}].quantity`, message: `Linia ${idx + 1}: cantitate invalidă` });
  });

  // Totaluri
  const subtotalCalc = (items || []).reduce((s, i) => s + Number(i.subtotal || 0), 0);
  if (Math.abs(subtotalCalc - Number(invoice.subtotal || 0)) > 0.05) {
    errors.push({ field: 'totals', message: 'Subtotal nu corespunde cu suma liniilor' });
  }

  // Avertizare informativă: fără Peppol Endpoint explicit (XML va folosi VAT ca endpoint)
  if (!supplier.peppol_id) {
    errors.push({ field: 'info.peppol_endpoint', message: 'Fără Peppol ID explicit — XML va folosi VAT ID ca EndpointID. Pentru rutare automată în rețea, configurează Peppol Participant ID.' });
  }

  return errors;
}

// Mapare unități măsură UN/ECE Recommendation 20 (acceptat de ANAF)
const UNIT_MAP: Record<string, string> = {
  buc: 'H87', bucati: 'H87', pcs: 'H87', pc: 'H87',
  ml: 'MTR', m: 'MTR', metru: 'MTR',
  mp: 'MTK', 'm2': 'MTK', 'm²': 'MTK',
  mc: 'MTQ', 'm3': 'MTQ',
  kg: 'KGM',
  l: 'LTR', litru: 'LTR',
  ora: 'HUR', h: 'HUR',
  set: 'SET',
  ansamblu: 'SET',
};

export function mapUnitToUnece(unit?: string): string {
  if (!unit) return 'H87';
  const k = unit.toLowerCase().trim();
  return UNIT_MAP[k] || unit.toUpperCase().slice(0, 3);
}
