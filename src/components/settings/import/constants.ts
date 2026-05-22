// Re-export shared constants and define import-specific ones
export { HEADER_MAPS, TABLE_CONFIGS } from '../dataExportConstants';

export const IMPORT_CONFLICT_KEYS: Record<string, string> = {
  clients: 'name',
  quotes: 'ref_number',
  orders: 'order_number',
  materials: 'code',
};

export const TABLE_LABELS: Record<string, string> = {
  clients: 'Clienți',
  quotes: 'Oferte',
  orders: 'Comenzi',
  materials: 'Materiale',
};
