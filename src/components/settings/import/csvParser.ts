import { HEADER_MAPS } from './constants';

export function csvToArray(csv: string, table: string): Record<string, unknown>[] {
  // Strip BOM if present
  const cleanCsv = csv.replace(/^\uFEFF/, '');
  const headerMap = HEADER_MAPS[table];
  if (!headerMap) return [];

  const reverseMap = Object.fromEntries(
    Object.entries(headerMap).map(([k, v]) => [v, k])
  );

  const lines = parseCsvLines(cleanCsv);
  if (lines.length < 2) return [];

  const headers = lines[0];
  const dbHeaders = headers.map(h => reverseMap[h] ?? h);

  return lines.slice(1).map(values => {
    const row: Record<string, unknown> = {};
    dbHeaders.forEach((key, i) => {
      const val = values[i] ?? '';
      if (val === '') {
        row[key] = null;
      } else if (!isNaN(Number(val)) && val.trim() !== '') {
        row[key] = Number(val);
      } else if (val === 'true' || val === 'false') {
        row[key] = val === 'true';
      } else {
        row[key] = val;
      }
    });
    return row;
  });
}

function parseCsvLines(csv: string): string[][] {
  const results: string[][] = [];
  let current = '';
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < csv.length; i++) {
    const ch = csv[i];
    if (inQuotes) {
      if (ch === '"') {
        if (csv[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(current);
        current = '';
      } else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && csv[i + 1] === '\n') i++;
        row.push(current);
        current = '';
        if (row.some(c => c.trim() !== '')) results.push(row);
        row = [];
      } else {
        current += ch;
      }
    }
  }
  row.push(current);
  if (row.some(c => c.trim() !== '')) results.push(row);

  return results;
}
