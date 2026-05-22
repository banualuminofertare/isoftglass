// FatturaPA v1.2.2 generator pentru Italia (SdI - Sistema di Interscambio)
// Spec: https://www.fatturapa.gov.it/export/documenti/fatturapa/v1.2.2/Specifiche_tecniche_del_formato_FatturaPA_v1.2.2.pdf
// Output: XML descărcabil. Semnătura XAdES-BES + transmiterea SdI rămân în sarcina abonatului
// (uploaded la commercialista / intermediar acreditat: Aruba, Fatture in Cloud, TeamSystem etc.)

const esc = (v: any) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

// Codici Natura IVA (folosit când AliquotaIVA = 0)
function inferNatura(item: any): string | null {
  const tax = Number(item.tax_percent || 0);
  if (tax > 0) return null;
  // Default neutru — abonatul poate suprascrie din notes/observatii
  // N2.2 = non soggette - altri casi (cel mai conservator pentru servicii export/intra-UE)
  return 'N2.2';
}

// Tipo Documento
function getTipoDocumento(invoiceType: string, isCredit: boolean): string {
  if (isCredit || invoiceType === 'storno') return 'TD04'; // Nota di credito
  if (invoiceType === 'proforma') return 'TD00'; // Nu există proforma în SdI; nu trimite la SdI
  return 'TD01'; // Fattura standard
}

// FormatoTrasmissione: FPA12 = Pubblica Amministrazione, FPR12 = Privati (B2B/B2C)
function getFormatoTrasmissione(client: any): 'FPA12' | 'FPR12' {
  const code = (client.codice_destinatario || '').trim().toUpperCase();
  // Codici PA au 6 caractere, codici privati au 7
  if (code && code.length === 6) return 'FPA12';
  return 'FPR12';
}

// Generează un ProgressivoInvio din invoice_number / id (max 10 char alfanumerici)
function getProgressivoInvio(invoice: any): string {
  const num = String(invoice.invoice_number || invoice.id || Date.now())
    .replace(/[^A-Z0-9]/gi, '')
    .toUpperCase()
    .slice(-10);
  return num.padStart(5, '0').slice(-10);
}

// Codice Destinatario default când lipsește
function getCodiceDestinatario(client: any, formato: 'FPA12' | 'FPR12'): string {
  const code = (client.codice_destinatario || '').trim().toUpperCase();
  if (formato === 'FPA12') return code.padEnd(6, '0').slice(0, 6);
  if (code) return code.padEnd(7, '0').slice(0, 7);
  // B2B/B2C fără SDI code: "0000000" + PEC obligatoriu (validat separat)
  return '0000000';
}

// Provincia (2 litere) extrasă din county sau lăsată goală
function getProvincia(addr: any): string {
  const county = String(addr.county || '').trim().toUpperCase();
  // Dacă deja are 2 litere, folosim direct
  if (/^[A-Z]{2}$/.test(county)) return county;
  // Mapping minimal pentru abonați RO care vând în IT (raritate); altfel se ia primele 2 litere
  return county.replace(/[^A-Z]/g, '').slice(0, 2);
}

// IdPaese + IdCodice din vat_id (ex: IT12345678901)
function splitVatId(vat: string, fallbackCountry = 'IT'): { paese: string; codice: string } {
  const v = String(vat || '').trim().toUpperCase().replace(/\s/g, '');
  if (/^[A-Z]{2}/.test(v)) return { paese: v.slice(0, 2), codice: v.slice(2) };
  return { paese: fallbackCountry, codice: v };
}

export function generateFatturaPaXml(invoice: any, items: any[]): string {
  const cs = invoice.company_snapshot || {};
  const cl = invoice.client_snapshot || {};
  const isCredit = invoice.invoice_type === 'storno' || Number(invoice.total) < 0;
  const tipoDoc = getTipoDocumento(invoice.invoice_type, isCredit);
  const formato = getFormatoTrasmissione(cl);
  const codiceDest = getCodiceDestinatario(cl, formato);
  const progressivo = getProgressivoInvio(invoice);

  const supplierVat = splitVatId(cs.vat_id || cs.cui, 'IT');
  const buyerVat = splitVatId(cl.vat_id || cl.cui, cl.country_code || 'IT');
  const supplierCF = cs.codice_fiscale || cs.cui || '';
  const buyerCF = cl.codice_fiscale || cl.cui || '';

  const buyerIsCompany = !!(cl.company_name && (cl.vat_id || cl.cui));

  // RegimeFiscale (RF01 = ordinario default)
  const regime = cs.regime_fiscale || 'RF01';

  // Importul total (cu semn pentru credit note)
  const importoTot = (isCredit ? -1 : 1) * Math.abs(Number(invoice.total || 0));

  // Linii
  const linee = items.map((it, i) => {
    const qty = (isCredit ? -1 : 1) * Math.abs(Number(it.quantity || 0));
    const prezzoUnit = Number(it.unit_price || 0);
    const prezzoTot = (isCredit ? -1 : 1) * Math.abs(Number(it.subtotal || 0));
    const aliquota = Number(it.tax_percent || 0);
    const natura = inferNatura(it);
    return `      <DettaglioLinee>
        <NumeroLinea>${i + 1}</NumeroLinea>
        <Descrizione>${esc(it.description || '-')}</Descrizione>
        <Quantita>${qty.toFixed(2)}</Quantita>
        ${it.unit ? `<UnitaMisura>${esc(it.unit)}</UnitaMisura>` : ''}
        <PrezzoUnitario>${prezzoUnit.toFixed(2)}</PrezzoUnitario>
        <PrezzoTotale>${prezzoTot.toFixed(2)}</PrezzoTotale>
        <AliquotaIVA>${aliquota.toFixed(2)}</AliquotaIVA>
        ${natura ? `<Natura>${natura}</Natura>` : ''}
      </DettaglioLinee>`;
  }).join('\n');

  // Riepilogo per cota TVA
  const aliquoteMap = new Map<string, { imponibile: number; imposta: number; natura: string | null }>();
  for (const it of items) {
    const aliquota = Number(it.tax_percent || 0).toFixed(2);
    const subtotal = (isCredit ? -1 : 1) * Math.abs(Number(it.subtotal || 0));
    const imposta = subtotal * (Number(aliquota) / 100);
    const cur = aliquoteMap.get(aliquota) || { imponibile: 0, imposta: 0, natura: inferNatura(it) };
    cur.imponibile += subtotal;
    cur.imposta += imposta;
    aliquoteMap.set(aliquota, cur);
  }

  const riepilogo = Array.from(aliquoteMap.entries())
    .map(([aliquota, vals]) => `      <DatiRiepilogo>
        <AliquotaIVA>${aliquota}</AliquotaIVA>
        ${vals.natura ? `<Natura>${vals.natura}</Natura>` : ''}
        <ImponibileImporto>${vals.imponibile.toFixed(2)}</ImponibileImporto>
        <Imposta>${vals.imposta.toFixed(2)}</Imposta>
        <EsigibilitaIVA>I</EsigibilitaIVA>
      </DatiRiepilogo>`)
    .join('\n');

  // Dati Pagamento (opțional)
  const datiPagamento = cs.iban ? `  <DatiPagamento>
    <CondizioniPagamento>TP02</CondizioniPagamento>
    <DettaglioPagamento>
      <ModalitaPagamento>MP05</ModalitaPagamento>
      ${invoice.due_date ? `<DataScadenzaPagamento>${esc(invoice.due_date)}</DataScadenzaPagamento>` : ''}
      <ImportoPagamento>${importoTot.toFixed(2)}</ImportoPagamento>
      <IBAN>${esc(String(cs.iban).replace(/\s/g, ''))}</IBAN>
      ${cs.bic ? `<BIC>${esc(cs.bic)}</BIC>` : ''}
    </DettaglioPagamento>
  </DatiPagamento>` : '';

  // Bollo virtuale (2€) când subtotal > 77.47 € fără TVA și TVA = 0
  const subtotal = Number(invoice.subtotal || 0);
  const taxAmount = Number(invoice.tax_amount || 0);
  const needBollo = subtotal > 77.47 && taxAmount === 0;
  const datiBollo = needBollo ? `      <DatiBollo>
        <BolloVirtuale>SI</BolloVirtuale>
        <ImportoBollo>2.00</ImportoBollo>
      </DatiBollo>` : '';

  // Cessionario: Anagrafica (persoana fizică) sau Denominazione (firmă)
  const cessionarioAnagrafica = buyerIsCompany
    ? `<Denominazione>${esc(cl.company_name || cl.name)}</Denominazione>`
    : `<Nome>${esc((cl.name || '').split(' ')[0] || cl.name)}</Nome><Cognome>${esc((cl.name || '').split(' ').slice(1).join(' ') || '-')}</Cognome>`;

  const cessionarioIdFiscale = buyerVat.codice ? `<IdFiscaleIVA>
        <IdPaese>${esc(buyerVat.paese)}</IdPaese>
        <IdCodice>${esc(buyerVat.codice)}</IdCodice>
      </IdFiscaleIVA>` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<p:FatturaElettronica versione="${formato}"
  xmlns:p="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2"
  xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <FatturaElettronicaHeader>
    <DatiTrasmissione>
      <IdTrasmittente>
        <IdPaese>${esc(supplierVat.paese)}</IdPaese>
        <IdCodice>${esc(supplierVat.codice)}</IdCodice>
      </IdTrasmittente>
      <ProgressivoInvio>${esc(progressivo)}</ProgressivoInvio>
      <FormatoTrasmissione>${formato}</FormatoTrasmissione>
      <CodiceDestinatario>${esc(codiceDest)}</CodiceDestinatario>
      ${cl.email && codiceDest === '0000000' ? `<PECDestinatario>${esc(cl.email)}</PECDestinatario>` : ''}
    </DatiTrasmissione>
    <CedentePrestatore>
      <DatiAnagrafici>
        <IdFiscaleIVA>
          <IdPaese>${esc(supplierVat.paese)}</IdPaese>
          <IdCodice>${esc(supplierVat.codice)}</IdCodice>
        </IdFiscaleIVA>
        ${supplierCF ? `<CodiceFiscale>${esc(supplierCF)}</CodiceFiscale>` : ''}
        <Anagrafica>
          <Denominazione>${esc(cs.name)}</Denominazione>
        </Anagrafica>
        <RegimeFiscale>${esc(regime)}</RegimeFiscale>
      </DatiAnagrafici>
      <Sede>
        <Indirizzo>${esc(cs.address || '-')}</Indirizzo>
        ${cs.postal_code ? `<CAP>${esc(String(cs.postal_code).replace(/\D/g, '').padStart(5, '0').slice(0, 5))}</CAP>` : '<CAP>00000</CAP>'}
        <Comune>${esc(cs.city || '-')}</Comune>
        ${getProvincia(cs) ? `<Provincia>${esc(getProvincia(cs))}</Provincia>` : ''}
        <Nazione>${esc(supplierVat.paese)}</Nazione>
      </Sede>
    </CedentePrestatore>
    <CessionarioCommittente>
      <DatiAnagrafici>
        ${cessionarioIdFiscale}
        ${buyerCF ? `<CodiceFiscale>${esc(buyerCF)}</CodiceFiscale>` : ''}
        <Anagrafica>
          ${cessionarioAnagrafica}
        </Anagrafica>
      </DatiAnagrafici>
      <Sede>
        <Indirizzo>${esc(cl.address || '-')}</Indirizzo>
        ${cl.postal_code ? `<CAP>${esc(String(cl.postal_code).replace(/\D/g, '').padStart(5, '0').slice(0, 5))}</CAP>` : '<CAP>00000</CAP>'}
        <Comune>${esc(cl.city || '-')}</Comune>
        ${getProvincia(cl) ? `<Provincia>${esc(getProvincia(cl))}</Provincia>` : ''}
        <Nazione>${esc(buyerVat.paese)}</Nazione>
      </Sede>
    </CessionarioCommittente>
  </FatturaElettronicaHeader>
  <FatturaElettronicaBody>
    <DatiGenerali>
      <DatiGeneraliDocumento>
        <TipoDocumento>${tipoDoc}</TipoDocumento>
        <Divisa>${esc(invoice.currency || 'EUR')}</Divisa>
        <Data>${esc(invoice.issue_date)}</Data>
        <Numero>${esc(invoice.invoice_number || 'DRAFT')}</Numero>
${datiBollo}
        <ImportoTotaleDocumento>${importoTot.toFixed(2)}</ImportoTotaleDocumento>
        ${invoice.notes ? `<Causale>${esc(String(invoice.notes).slice(0, 200))}</Causale>` : ''}
      </DatiGeneraliDocumento>
    </DatiGenerali>
    <DatiBeniServizi>
${linee}
${riepilogo}
    </DatiBeniServizi>
${datiPagamento}
  </FatturaElettronicaBody>
</p:FatturaElettronica>`;
}

// Numele fișierului conform nomenclator SdI: IT{IdCodice}_{ProgressivoInvio}.xml
export function getFatturaPaFilename(invoice: any): string {
  const cs = invoice.company_snapshot || {};
  const supplierVat = splitVatId(cs.vat_id || cs.cui, 'IT');
  const progressivo = getProgressivoInvio(invoice);
  return `${supplierVat.paese}${supplierVat.codice}_${progressivo}.xml`;
}

export function validateInvoiceForFatturaPa(invoice: any, items: any[]): { field: string; message: string }[] {
  const errors: { field: string; message: string }[] = [];
  const cs = invoice.company_snapshot || {};
  const cl = invoice.client_snapshot || {};

  // Emitent IT
  if (!(cs.vat_id || cs.cui)) errors.push({ field: 'supplier.vat', message: 'Partita IVA emitent lipsă (IT...)' });
  if (!cs.name) errors.push({ field: 'supplier.name', message: 'Denumire emitent (Denominazione) lipsă' });
  if (!cs.address) errors.push({ field: 'supplier.address', message: 'Indirizzo emitent lipsă' });
  if (!cs.city) errors.push({ field: 'supplier.city', message: 'Comune emitent lipsă' });
  if (!getProvincia(cs)) errors.push({ field: 'supplier.county', message: 'Provincia emitent lipsă (cod 2 litere, ex: MI, RM)' });
  if (!cs.postal_code) errors.push({ field: 'supplier.postal_code', message: 'CAP emitent lipsă (5 cifre)' });
  if (!cs.regime_fiscale) errors.push({ field: 'supplier.regime', message: 'Regime Fiscale lipsă (ex: RF01)' });

  // Cumpărător
  if (!(cl.company_name || cl.name)) errors.push({ field: 'buyer.name', message: 'Denumire client lipsă' });
  if (!cl.address) errors.push({ field: 'buyer.address', message: 'Indirizzo client lipsă' });
  if (!cl.city) errors.push({ field: 'buyer.city', message: 'Comune client lipsă' });
  if (!cl.postal_code) errors.push({ field: 'buyer.postal_code', message: 'CAP client lipsă (5 cifre)' });

  // Codice Destinatario sau PEC obligatoriu pentru clienți italieni
  const buyerCountry = (cl.country_code || 'IT').toUpperCase();
  if (buyerCountry === 'IT') {
    const cd = String(cl.codice_destinatario || '').trim();
    const hasPec = !!(cl.email && cl.email.includes('@') && (cl.email.includes('pec.') || cl.email.includes('@pec')));
    if (!cd && !hasPec) {
      errors.push({
        field: 'buyer.sdi',
        message: 'Lipsă Codice Destinatario (7 char) sau PEC. SdI nu poate livra factura.',
      });
    }
    if (cd && cd.length !== 6 && cd.length !== 7) {
      errors.push({ field: 'buyer.sdi', message: 'Codice Destinatario trebuie să aibă 7 caractere (B2B/B2C) sau 6 (PA)' });
    }
  }

  // Bollo
  const subtotal = Number(invoice.subtotal || 0);
  const taxAmount = Number(invoice.tax_amount || 0);
  if (subtotal > 77.47 && taxAmount === 0) {
    // Nu e eroare, doar info — adăugăm la avertizări soft (folosim "field=info")
    errors.push({
      field: 'info.bollo',
      message: 'Atenție: bollo virtuale 2€ se va adăuga automat în XML (subtotal > 77,47€ fără TVA).',
    });
  }

  // Linii
  if (!items || items.length === 0) errors.push({ field: 'items', message: 'Factura nu are linii' });
  items?.forEach((it, idx) => {
    if (!it.description) errors.push({ field: `items[${idx}]`, message: `Linia ${idx + 1}: descriere lipsă` });
    if (Number(it.quantity) === 0) errors.push({ field: `items[${idx}]`, message: `Linia ${idx + 1}: cantitate 0` });
  });

  if (!invoice.invoice_number) errors.push({ field: 'invoice.number', message: 'Factură fără număr (emite-o întâi)' });

  return errors;
}
