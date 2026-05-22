import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function s(text: string): string {
  return (text || '').toString()
    .replace(/[ăâ]/g, 'a').replace(/[ĂÂ]/g, 'A')
    .replace(/î/g, 'i').replace(/Î/g, 'I')
    .replace(/[șş]/g, 's').replace(/[ȘŞ]/g, 'S')
    .replace(/[țţ]/g, 't').replace(/[ȚŢ]/g, 'T');
}

export async function generateInvoicePDF(invoice: any, items: any[], payments: any[] = []) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const cs = invoice.company_snapshot || {};
  const cl = invoice.client_snapshot || {};

  // Header
  doc.setFontSize(18); doc.setFont('helvetica', 'bold');
  const title = invoice.invoice_type === 'proforma' ? 'FACTURA PROFORMA' : invoice.invoice_type === 'storno' ? 'FACTURA STORNO' : 'FACTURA FISCALA';
  doc.text(s(title), pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(11); doc.setFont('helvetica', 'normal');
  doc.text(s(`Nr: ${invoice.invoice_number || 'DRAFT'}`), 14, 32);
  doc.text(s(`Data emiterii: ${invoice.issue_date}`), 14, 38);
  if (invoice.due_date) doc.text(s(`Scadenta: ${invoice.due_date}`), 14, 44);

  // Furnizor
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.text('FURNIZOR', 14, 56);
  doc.setFont('helvetica', 'normal');
  let y = 62;
  [cs.name, cs.cui ? `CUI: ${cs.cui}` : null, cs.address, cs.phone, cs.email, cs.bank_account ? `IBAN: ${cs.bank_account}` : null]
    .filter(Boolean).forEach(line => { doc.text(s(line!), 14, y); y += 5; });

  // Client
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.text('CLIENT', pageWidth / 2 + 4, 56);
  doc.setFont('helvetica', 'normal');
  y = 62;
  [cl.company_name || cl.name, cl.cui ? `CUI: ${cl.cui}` : null, cl.address, [cl.city, cl.county].filter(Boolean).join(', '), cl.phone, cl.email]
    .filter(Boolean).forEach(line => { doc.text(s(line!), pageWidth / 2 + 4, y); y += 5; });

  // Items table
  autoTable(doc, {
    startY: Math.max(y, 100),
    head: [['#', 'Descriere', 'Cant.', 'UM', 'Pret unit.', 'TVA%', 'Total']],
    body: items.map((it, i) => [
      i + 1,
      s(it.description),
      Number(it.quantity).toFixed(2),
      s(it.unit || 'buc'),
      Number(it.unit_price).toFixed(2),
      Number(it.tax_percent).toFixed(0) + '%',
      Number(it.total).toFixed(2),
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [15, 23, 42] },
  });

  let endY = (doc as any).lastAutoTable.finalY + 8;
  // Totals
  doc.setFontSize(10);
  const totX = pageWidth - 80;
  doc.text(s(`Subtotal: ${Number(invoice.subtotal).toFixed(2)} ${invoice.currency}`), totX, endY); endY += 5;
  doc.text(s(`TVA: ${Number(invoice.tax_amount).toFixed(2)} ${invoice.currency}`), totX, endY); endY += 5;
  doc.setFont('helvetica', 'bold');
  doc.text(s(`TOTAL: ${Number(invoice.total).toFixed(2)} ${invoice.currency}`), totX, endY); endY += 6;
  doc.setFont('helvetica', 'normal');
  if (invoice.paid_amount > 0) {
    doc.text(s(`Platit: ${Number(invoice.paid_amount).toFixed(2)}`), totX, endY); endY += 5;
    doc.text(s(`Sold: ${(Number(invoice.total) - Number(invoice.paid_amount)).toFixed(2)}`), totX, endY); endY += 5;
  }
  const baseCcy = invoice.base_currency || 'RON';
  const rate = Number(invoice.exchange_rate) || 1;
  if (invoice.currency && invoice.currency !== baseCcy && rate > 0 && rate !== 1) {
    doc.setFontSize(8); doc.setTextColor(100);
    doc.text(s(`Curs schimb: 1 ${invoice.currency} = ${rate.toFixed(4)} ${baseCcy}`), totX, endY); endY += 5;
    doc.setTextColor(0);
  }
  if (invoice.notes) {
    endY += 8;
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.text('Observatii:', 14, endY); endY += 5;
    doc.setFont('helvetica', 'normal');
    doc.text(s(invoice.notes), 14, endY, { maxWidth: pageWidth - 28 });
  }

  if (invoice.invoice_type === 'proforma') {
    doc.setFontSize(8); doc.setTextColor(150);
    doc.text(s('Documentul nu este factura fiscala.'), pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
  }

  doc.save(`${invoice.invoice_number || 'factura-draft'}.pdf`);
}

import { mapUnitToUnece } from '@/lib/einvoice/validate';
import { generateFatturaPaXml, getFatturaPaFilename } from '@/lib/einvoice/cius/it-fatturapa';

const COUNTRY_TO_ISO: Record<string, string> = {
  'românia': 'RO', 'romania': 'RO', 'italia': 'IT', 'italy': 'IT',
  'germania': 'DE', 'germany': 'DE', 'franta': 'FR', 'franța': 'FR', 'france': 'FR',
  'polonia': 'PL', 'poland': 'PL', 'spania': 'ES', 'spain': 'ES',
};

function toIsoCountry(c?: string): string {
  if (!c) return 'RO';
  if (c.length === 2) return c.toUpperCase();
  return COUNTRY_TO_ISO[c.toLowerCase().trim()] || c.slice(0, 2).toUpperCase();
}

function normalizeVat(vat?: string, country = 'RO'): string {
  if (!vat) return '';
  const v = String(vat).trim().toUpperCase().replace(/\s/g, '');
  if (/^[A-Z]{2}/.test(v)) return v;
  return country + v;
}

// Peppol Electronic Address Scheme — schemeID per țară (folosit la EndpointID BT-34/BT-49)
// Ref: https://docs.peppol.eu/poacc/billing/3.0/codelist/eas/
const PEPPOL_EAS: Record<string, string> = {
  AT: '9915', BE: '0208', BG: '9926', HR: '9934', CY: '9928', CZ: '9930',
  DK: '0184', EE: '9931', FI: '0212', FR: '0009', DE: '9930',
  GR: '9933', HU: '9910', IE: '9935', IT: '0211', LV: '9939',
  LT: '9937', LU: '9938', MT: '9928', NL: '0106', PL: '9945',
  PT: '9946', RO: '9947', SK: '9952', SI: '9946', ES: '0151',
  SE: '0007', NO: '0192', GB: '0190', CH: '0183',
};

function getEndpointId(party: any, country: string, vat: string): { id: string; scheme: string } | null {
  // Prioritate: peppol_id explicit > VAT ID > nimic
  const explicitId = String(party.peppol_id || '').trim();
  const explicitScheme = String(party.peppol_scheme_id || '').trim();
  if (explicitId && explicitScheme) return { id: explicitId, scheme: explicitScheme };
  if (explicitId) return { id: explicitId, scheme: PEPPOL_EAS[country] || '9999' };
  if (vat) return { id: vat, scheme: PEPPOL_EAS[country] || '9999' };
  return null;
}

export function generateUblXml(invoice: any, items: any[]): string {
  const cs = invoice.company_snapshot || {};
  const cl = invoice.client_snapshot || {};
  const esc = (v: any) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const supplierCountry = toIsoCountry(cs.country_code || cs.country || 'RO');
  const buyerCountry = toIsoCountry(cl.country_code || cl.country || supplierCountry);
  const supplierVat = normalizeVat(cs.vat_id || cs.cui, supplierCountry);
  const buyerVat = normalizeVat(cl.vat_id || cl.cui, buyerCountry);
  const currency = cs.currency || invoice.currency || 'RON';
  const isCreditNote = invoice.invoice_type === 'storno' || Number(invoice.total) < 0;
  const isRomania = supplierCountry === 'RO';
  const isPeppol = !isRomania; // Italia merge pe FatturaPA, nu ajunge aici
  const customizationId = isRomania
    ? 'urn:cen.eu:en16931:2017#compliant#urn:efactura.mfinante.ro:CIUS-RO:1.0.1'
    : 'urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0';
  const profileId = isPeppol ? 'urn:fdc:peppol.eu:2017:poacc:billing:01:1.0' : null;

  const supplierEndpoint = isPeppol ? getEndpointId(cs, supplierCountry, supplierVat) : null;
  const buyerEndpoint = isPeppol ? getEndpointId(cl, buyerCountry, buyerVat) : null;

  // BuyerReference (BT-10) obligatoriu Peppol — fallback pe order_number / cod client / VAT
  const buyerReference = isPeppol
    ? String(cl.peppol_buyer_reference || cl.buyer_reference || invoice.order_number || cl.code || cl.cui || cl.vat_id || invoice.invoice_number || 'N/A')
    : null;

  const linesXml = items.map((it, i) => {
    const unit = mapUnitToUnece(it.unit);
    const qtyTag = isCreditNote ? 'CreditedQuantity' : 'InvoicedQuantity';
    return `
  <cac:${isCreditNote ? 'CreditNoteLine' : 'InvoiceLine'}>
    <cbc:ID>${i + 1}</cbc:ID>
    <cbc:${qtyTag} unitCode="${esc(unit)}">${Number(it.quantity).toFixed(4)}</cbc:${qtyTag}>
    <cbc:LineExtensionAmount currencyID="${esc(currency)}">${Number(it.subtotal).toFixed(2)}</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Name>${esc(it.description)}</cbc:Name>
      <cac:ClassifiedTaxCategory>
        <cbc:ID>S</cbc:ID>
        <cbc:Percent>${Number(it.tax_percent).toFixed(2)}</cbc:Percent>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:ClassifiedTaxCategory>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="${esc(currency)}">${Number(it.unit_price).toFixed(4)}</cbc:PriceAmount>
    </cac:Price>
  </cac:${isCreditNote ? 'CreditNoteLine' : 'InvoiceLine'}>`;
  }).join('');

  const supplierContact = (cs.phone || cs.email)
    ? `<cac:Contact>${cs.phone ? `<cbc:Telephone>${esc(cs.phone)}</cbc:Telephone>` : ''}${cs.email ? `<cbc:ElectronicMail>${esc(cs.email)}</cbc:ElectronicMail>` : ''}</cac:Contact>`
    : '';

  const buyerContact = (cl.phone || cl.email)
    ? `<cac:Contact>${cl.phone ? `<cbc:Telephone>${esc(cl.phone)}</cbc:Telephone>` : ''}${cl.email ? `<cbc:ElectronicMail>${esc(cl.email)}</cbc:ElectronicMail>` : ''}</cac:Contact>`
    : '';

  // Peppol recomandă cod 30 (SEPA Credit Transfer); RO acceptă 42 (alte ţări UE = 30)
  const paymentCode = isPeppol ? '30' : '42';
  const paymentMeans = cs.iban
    ? `<cac:PaymentMeans>
    <cbc:PaymentMeansCode>${paymentCode}</cbc:PaymentMeansCode>
    <cac:PayeeFinancialAccount>
      <cbc:ID>${esc(cs.iban)}</cbc:ID>
      ${cs.bank_name ? `<cbc:Name>${esc(cs.bank_name)}</cbc:Name>` : ''}
      ${cs.bic ? `<cac:FinancialInstitutionBranch><cbc:ID>${esc(cs.bic)}</cbc:ID></cac:FinancialInstitutionBranch>` : ''}
    </cac:PayeeFinancialAccount>
  </cac:PaymentMeans>`
    : '';

  const rootEl = isCreditNote ? 'CreditNote' : 'Invoice';
  const typeCode = isCreditNote ? '381' : '380';
  const typeCodeTag = isCreditNote ? 'CreditNoteTypeCode' : 'InvoiceTypeCode';

  // CIUS-RO: county code (BT-79) e cerut pt RO. Folosim cod judet în CountrySubentity dacă există.
  const buildAddress = (a: any, country: string) => {
    const street = a.address || '';
    const city = a.city || '';
    const county = a.county || '';
    const postal = a.postal_code || '';
    return `<cac:PostalAddress>
      ${street ? `<cbc:StreetName>${esc(street)}</cbc:StreetName>` : ''}
      ${city ? `<cbc:CityName>${esc(city)}</cbc:CityName>` : ''}
      ${postal ? `<cbc:PostalZone>${esc(postal)}</cbc:PostalZone>` : ''}
      ${county ? `<cbc:CountrySubentity>${esc(country === 'RO' ? mapRoCounty(county) : county)}</cbc:CountrySubentity>` : ''}
      <cac:Country><cbc:IdentificationCode>${esc(country)}</cbc:IdentificationCode></cac:Country>
    </cac:PostalAddress>`;
  };

  return `<?xml version="1.0" encoding="UTF-8"?>
<${rootEl} xmlns="urn:oasis:names:specification:ubl:schema:xsd:${rootEl}-2"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:CustomizationID>${customizationId}</cbc:CustomizationID>
  ${profileId ? `<cbc:ProfileID>${profileId}</cbc:ProfileID>` : ''}
  <cbc:ID>${esc(invoice.invoice_number || 'DRAFT')}</cbc:ID>
  <cbc:IssueDate>${esc(invoice.issue_date)}</cbc:IssueDate>
  ${invoice.due_date ? `<cbc:DueDate>${esc(invoice.due_date)}</cbc:DueDate>` : ''}
  <cbc:${typeCodeTag}>${typeCode}</cbc:${typeCodeTag}>
  ${invoice.notes ? `<cbc:Note>${esc(invoice.notes)}</cbc:Note>` : ''}
  ${isPeppol ? `<cbc:TaxPointDate>${esc(invoice.issue_date)}</cbc:TaxPointDate>` : ''}
  <cbc:DocumentCurrencyCode>${esc(currency)}</cbc:DocumentCurrencyCode>
  ${buyerReference ? `<cbc:BuyerReference>${esc(buyerReference)}</cbc:BuyerReference>` : ''}
  <cac:AccountingSupplierParty><cac:Party>
    ${supplierEndpoint ? `<cbc:EndpointID schemeID="${esc(supplierEndpoint.scheme)}">${esc(supplierEndpoint.id)}</cbc:EndpointID>` : ''}
    <cac:PartyName><cbc:Name>${esc(cs.name)}</cbc:Name></cac:PartyName>
    ${buildAddress(cs, supplierCountry)}
    ${supplierVat ? `<cac:PartyTaxScheme>
      <cbc:CompanyID>${esc(supplierVat)}</cbc:CompanyID>
      <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
    </cac:PartyTaxScheme>` : ''}
    <cac:PartyLegalEntity>
      <cbc:RegistrationName>${esc(cs.name)}</cbc:RegistrationName>
      ${cs.trade_register ? `<cbc:CompanyID>${esc(cs.trade_register)}</cbc:CompanyID>` : (supplierVat ? `<cbc:CompanyID>${esc(supplierVat)}</cbc:CompanyID>` : '')}
    </cac:PartyLegalEntity>
    ${supplierContact}
  </cac:Party></cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty><cac:Party>
    ${buyerEndpoint ? `<cbc:EndpointID schemeID="${esc(buyerEndpoint.scheme)}">${esc(buyerEndpoint.id)}</cbc:EndpointID>` : ''}
    <cac:PartyName><cbc:Name>${esc(cl.company_name || cl.name)}</cbc:Name></cac:PartyName>
    ${buildAddress(cl, buyerCountry)}
    ${buyerVat ? `<cac:PartyTaxScheme>
      <cbc:CompanyID>${esc(buyerVat)}</cbc:CompanyID>
      <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
    </cac:PartyTaxScheme>` : ''}
    <cac:PartyLegalEntity>
      <cbc:RegistrationName>${esc(cl.company_name || cl.name)}</cbc:RegistrationName>
      ${cl.reg_com ? `<cbc:CompanyID>${esc(cl.reg_com)}</cbc:CompanyID>` : (buyerVat ? `<cbc:CompanyID>${esc(buyerVat)}</cbc:CompanyID>` : '')}
    </cac:PartyLegalEntity>
    ${buyerContact}
  </cac:Party></cac:AccountingCustomerParty>
  ${paymentMeans}
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${esc(currency)}">${Number(invoice.tax_amount).toFixed(2)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${esc(currency)}">${Number(invoice.subtotal).toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${esc(currency)}">${Number(invoice.tax_amount).toFixed(2)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>S</cbc:ID>
        <cbc:Percent>${Number(invoice.tax_percent).toFixed(2)}</cbc:Percent>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${esc(currency)}">${Number(invoice.subtotal).toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${esc(currency)}">${Number(invoice.subtotal).toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${esc(currency)}">${Number(invoice.total).toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="${esc(currency)}">${Number(invoice.total).toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>${linesXml}
</${rootEl}>`;
}

// Cod ISO 3166-2:RO pentru județe (CIUS-RO necesită formatul RO-XX)
const RO_COUNTY_CODES: Record<string, string> = {
  'alba': 'RO-AB', 'arad': 'RO-AR', 'arges': 'RO-AG', 'argeș': 'RO-AG',
  'bacau': 'RO-BC', 'bacău': 'RO-BC', 'bihor': 'RO-BH', 'bistrita-nasaud': 'RO-BN', 'bistrița-năsăud': 'RO-BN',
  'botosani': 'RO-BT', 'botoșani': 'RO-BT', 'brasov': 'RO-BV', 'brașov': 'RO-BV', 'braila': 'RO-BR', 'brăila': 'RO-BR',
  'bucuresti': 'RO-B', 'bucurești': 'RO-B', 'buzau': 'RO-BZ', 'buzău': 'RO-BZ',
  'caras-severin': 'RO-CS', 'caraș-severin': 'RO-CS', 'calarasi': 'RO-CL', 'călărași': 'RO-CL',
  'cluj': 'RO-CJ', 'constanta': 'RO-CT', 'constanța': 'RO-CT', 'covasna': 'RO-CV',
  'dambovita': 'RO-DB', 'dâmbovița': 'RO-DB', 'dolj': 'RO-DJ',
  'galati': 'RO-GL', 'galați': 'RO-GL', 'giurgiu': 'RO-GR', 'gorj': 'RO-GJ',
  'harghita': 'RO-HR', 'hunedoara': 'RO-HD', 'ialomita': 'RO-IL', 'ialomița': 'RO-IL',
  'iasi': 'RO-IS', 'iași': 'RO-IS', 'ilfov': 'RO-IF',
  'maramures': 'RO-MM', 'maramureș': 'RO-MM', 'mehedinti': 'RO-MH', 'mehedinți': 'RO-MH',
  'mures': 'RO-MS', 'mureș': 'RO-MS', 'neamt': 'RO-NT', 'neamț': 'RO-NT',
  'olt': 'RO-OT', 'prahova': 'RO-PH', 'satu mare': 'RO-SM', 'salaj': 'RO-SJ', 'sălaj': 'RO-SJ',
  'sibiu': 'RO-SB', 'suceava': 'RO-SV', 'teleorman': 'RO-TR',
  'timis': 'RO-TM', 'timiș': 'RO-TM', 'tulcea': 'RO-TL',
  'vaslui': 'RO-VS', 'valcea': 'RO-VL', 'vâlcea': 'RO-VL', 'vrancea': 'RO-VN',
};

function mapRoCounty(name: string): string {
  if (!name) return '';
  if (/^RO-/i.test(name)) return name.toUpperCase();
  const k = name.toLowerCase().replace(/^jud(\.|ețul|etul)\s*/i, '').trim();
  return RO_COUNTY_CODES[k] || name;
}

export function downloadUblXml(invoice: any, items: any[]) {
  const cs = invoice.company_snapshot || {};
  const supplierCountry = toIsoCountry(cs.country_code || cs.country || 'RO');

  let xml: string;
  let filename: string;

  if (supplierCountry === 'IT') {
    // Italia: FatturaPA v1.2.2 (schemă proprie SdI, NU UBL)
    xml = generateFatturaPaXml(invoice, items);
    filename = getFatturaPaFilename(invoice);
  } else if (supplierCountry === 'RO') {
    // RO: UBL 2.1 cu CIUS-RO
    xml = generateUblXml(invoice, items);
    filename = `${invoice.invoice_number || 'factura'}-efactura.xml`;
  } else {
    // Restul UE: Peppol BIS Billing 3.0 (UBL 2.1)
    xml = generateUblXml(invoice, items);
    filename = `${invoice.invoice_number || 'invoice'}-peppol-bis.xml`;
  }

  const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
