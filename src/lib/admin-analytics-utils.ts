export const MODULE_LABELS: Record<string, string> = {
  calculators: 'Calculatoare 3D',
  orders: 'Comenzi',
  production: 'Producție',
  inventory: 'Inventar',
  crm: 'Clienți / CRM',
  installation: 'Instalare',
  invoicing: 'Facturare',
  cutting: 'Optimizare sticlă',
  processing: 'Procesare',
  service: 'Service',
  operational: 'Operațional',
  reports: 'Rapoarte',
  settings: 'Setări',
  admin: 'Administrare',
  dashboard: 'Dashboard',
  other: 'Altele',
};

export const OPERATIONAL_MODULES = [
  'installation',
  'processing',
  'operational',
  'service',
  'cutting',
];

export function timeAgo(iso: string): string {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `acum ${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `acum ${m}m`;
  const h = Math.floor(m / 60);
  return `acum ${h}h`;
}
