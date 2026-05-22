export const COLOR_PRESETS = [
  { label: 'Crom satinat', value: '#c8c8c8' },
  { label: 'Crom lucios', value: '#d4d4d8' },
  { label: 'Nichel satinat', value: '#a1a1aa' },
  { label: 'Negru mat', value: '#1a1a1a' },
  { label: 'Gun metal', value: '#52525b' },
  { label: 'Gun metal periat', value: '#71717a' },
  { label: 'Alamă lustruită', value: '#d4a017' },
  { label: 'Alamă satinată', value: '#b8960c' },
  { label: 'Bronz periat', value: '#8B6914' },
  { label: 'Alb mat', value: '#f0f0f0' },
  { label: 'Rose gold periat', value: '#c4908a' },
  { label: 'Rose gold lucios', value: '#e8a89a' },
  { label: 'Auriu lucios', value: '#FFD700' },
  { label: 'Auriu satinat', value: '#DAA520' },
  { label: 'Inox lucios', value: '#c0c0c8' },
  { label: 'Inox satinat', value: '#9e9ea8' },
  { label: 'Alu. anod. argintiu mat', value: '#b0b0b4' },
] as const;

export const GLASS_COLOR_PRESETS = [
  { label: 'Transparent (clar)', value: '#e8f4f8' },
  { label: 'Extra clar', value: '#f0f8ff' },
  { label: 'Bronz', value: '#8B6914' },
  { label: 'Gri', value: '#808080' },
  { label: 'Gri închis', value: '#505050' },
  { label: 'Verde', value: '#2e8b57' },
  { label: 'Albastru', value: '#4682b4' },
  { label: 'Alb opal', value: '#f5f5f5' },
  { label: 'Satinato (mat)', value: '#d9d9d9' },
  { label: 'Bronz reflectorizant', value: '#b8860b' },
  { label: 'Gri reflectorizant', value: '#a0a0a0' },
  { label: 'Parsol verde', value: '#3cb371' },
  { label: 'Lacobel alb', value: '#ffffff' },
  { label: 'Lacobel negru', value: '#0a0a0a' },
  { label: 'Lacobel roșu', value: '#cc0000' },
  { label: 'Lacobel gri', value: '#6b6b6b' },
] as const;

export type ColorPreset = { label: string; value: string };

export function getColorLabel(hex: string | null | undefined, presets?: readonly ColorPreset[]): string | null {
  if (!hex) return null;
  const lower = hex.toLowerCase();
  const allPresets = presets || COLOR_PRESETS;
  return allPresets.find(c => c.value.toLowerCase() === lower)?.label || hex;
}
