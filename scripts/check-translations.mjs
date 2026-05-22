#!/usr/bin/env node
/**
 * Diagnostic pentru fișierele de localizare din src/i18n/locales/.
 *
 * Rulare:
 *   bunx tsx scripts/check-translations.mjs           # raport sumar
 *   bunx tsx scripts/check-translations.mjs --full    # listează toate valorile identice cu RO
 *   bunx tsx scripts/check-translations.mjs --lang=de # doar o limbă
 *
 * Exit code != 0 dacă există diferențe structurale (chei lipsă/extra).
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.resolve(__dirname, '../src/i18n/locales');

const LANGS = ['en', 'de', 'es', 'fr', 'hr', 'it', 'nl', 'pl'];
const args = process.argv.slice(2);
const FULL = args.includes('--full');
const LANG_FILTER = args.find(a => a.startsWith('--lang='))?.split('=')[1];
const targets = LANG_FILTER ? [LANG_FILTER] : LANGS;

// Cuvinte/valori identice între RO și alte limbi care sunt corecte (cognate, branduri, simboluri).
const SHARED_OK = new Set([
  // branding & coduri
  'IsoftGlass ERP', 'iSoftGlass', 'RAL', 'LED', 'RON', 'EUR', 'JPG', 'PNG',
  'Hettich', 'Demo', '404', 'm²', 'ml', '••••••••',
  // unități tehnice
  'Format: JPG, PNG (min 300 DPI)', 'Standard: 170 mm', 'Standard: 300 mm',
  // cuvinte comune limbilor latine/europene
  'Status', 'Total', 'Email', 'Email:', 'Dashboard', 'Kanban', 'Calendar',
  'Plan', 'Operator', 'Operator:', 'Administrator', 'Material', 'Client',
  'Client:', 'CLIENT:', 'Subtotal', 'Subtotal:', 'TOTAL:', 'Discount',
  'Discount %', 'Contact', 'Walk-in', 'Bottleneck', 'Interior', 'Exterior',
  'Oval', 'Stadium / Oval (S)', 'Col', 'Kol', 'Sp.', 'Stupac',
  'Timeless', 'Bronze', 'Low-E', 'Pivot', 'Profile', 'Profil', 'Profil U',
  'Profile U', 'Format', 'Foto', 'FOTO', 'Frontal', 'Front', 'Forma U',
  'Element', 'Normal', 'ERP System', 'Deadline', 'Calculator', 'TVA',
  'TVA (%)', 'TVA:', 'Mat', 'Img', 'Categorie', 'Pagina', 'Page',
  // luni & zile abrevieri (ro/en/it/fr/de/es/nl/hr/pl overlap heavily)
  'Feb', 'Mar', 'Apr', 'May', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct',
  'Nov', 'Dec', 'Lun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun',
  // proprii / loanwords
  'Telefon', 'Telefon:', 'Data', 'Note', 'Verde', 'verde', 'Modell', 'Model',
  'Rol', 'Linie', 'Rampa 1', 'Rampa 2', 'Podest', 'Anterior', 'Principal',
  'Anual', 'Cant.', 'membri', 'litri', 'l (litri)', 'ore', 'Operatori',
  'Editor CAD', 'Formular', 'Linie (I)', 'Specifica', 'Specificatie',
  'Inventar', 'Balustrade', 'Balustrada', 'Cabina:', 'Cabina',
  'Complet', 'Completa', 'Complete', 'Compleet', 'Komplett',
  'Prag', 'Rezultat', 'Standard', 'set', 'kit', 'Kit', 'Vorne', 'Vorderseite',
  'Lateral', 'Lateral (H)', 'U.M.', 'Nr.', 'Nr. Ticket',
  'Demo', 'Data Demo', 'Follow-up', 'Website', 'Social Media',
  'Specificación', 'Spécification', 'Spezifikation', 'Specyfikacja',
  'Specifikacija', 'Specification',
  'Layout:', 'Active', 'Checklist', 'Checklist Template',
  'Stadium', 'Rectangular', 'Fillet (mm)', 'Chamfer (mm)', 'Fillet / Chamfer',
  'X offset (mm)', 'Y offset (mm)', 'Import DXF', 'Export DXF', 'Export PDF',
  'Ex: HET-TL25', 'Ex: Standard, Hettich TopLine', 'Ex: JOB-2024-001',
  'ex: Dorma, Sadev',
  // template strings
  'Lateral {{side}} {{n}}', 'Lateral {{side}}', 'Front {{n}}',
  'Total {{title}}', '{{count}} / {{max}} membri',
  // simboluri pdf
  'TOTAL:', 'CLIENT:', '6. Contact', '9. Contact', '11. Contact',
  'Data: ________________',
]);

function flat(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) Object.assign(out, flat(v, p));
    else out[p] = v;
  }
  return out;
}

async function loadLocale(lang) {
  const url = pathToFileURL(path.join(localesDir, `${lang}.ts`)).href;
  const mod = await import(url);
  return flat(mod.default);
}

const ro = await loadLocale('ro');
console.log(`\nRO: ${Object.keys(ro).length} chei`);

let hasStructuralDiff = false;
const summary = [];

for (const lang of targets) {
  const f = await loadLocale(lang);
  const missing = Object.keys(ro).filter(k => !(k in f));
  const extra = Object.keys(f).filter(k => !(k in ro));
  const same = Object.keys(ro).filter(
    k => k in f && typeof f[k] === 'string' && typeof ro[k] === 'string' && f[k] === ro[k] && f[k].length > 0
  );
  const suspicious = same.filter(k => {
    const v = ro[k];
    if (SHARED_OK.has(v)) return false;
    if (/^[\d\s.,\-:€$%mlpx²°(){}\[\]\/]+$/.test(v)) return false;
    if (v.length <= 2) return false;
    return true;
  });

  if (missing.length || extra.length) hasStructuralDiff = true;

  summary.push({ lang, total: Object.keys(f).length, missing: missing.length, extra: extra.length, same: same.length, suspicious: suspicious.length });

  console.log(`\n=== ${lang.toUpperCase()} === total:${Object.keys(f).length} missing:${missing.length} extra:${extra.length} same-as-RO:${same.length} (suspicios:${suspicious.length})`);

  missing.slice(0, 50).forEach(k => console.log(`  [LIPSĂ] ${k}`));
  extra.slice(0, 50).forEach(k => console.log(`  [EXTRA] ${k}`));

  const list = FULL ? same : suspicious;
  if (list.length) {
    console.log(`  ${FULL ? 'Toate identice cu RO:' : 'Posibil de tradus:'} (${list.length})`);
    list.forEach(k => console.log(`    ${k} = ${JSON.stringify(ro[k]).slice(0, 80)}`));
  }
}

console.log('\n────── SUMAR ──────');
console.table(summary);

if (hasStructuralDiff) {
  console.error('\n✗ Diferențe structurale detectate (chei lipsă sau în plus).');
  process.exit(1);
}
console.log('\n✓ Structură identică pe toate limbile.');
