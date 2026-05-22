/**
 * Mapare între tipurile de accesorii din configuratoare și codurile din catalogul de materiale.
 * Codul returnat este prefixul materialului principal – variantele de culoare
 * se găsesc în material_variants cu variant_code = `${cod}.XX`
 */

// Balamale (hinges)
export const HINGE_CODES = {
  // SH56 series
  wall_glass_90: '30.SH56.090',   // perete-sticlă 90°
  wall_glass_T90: '30.SH56.T90',  // perete-sticlă T90 (shower)
  glass_glass_180: '30.SH56.180', // sticlă-sticlă 180°
  glass_glass_135: '30.SH56.135', // sticlă-sticlă 135°
  // AC56 series
  ac56_wall_T90: '30.AC56.T90',
  ac56_wall_L90: '30.AC56.L90',
  ac56_glass_180: '30.AC56.180',
  // BH70 series
  bh70_90: '30.BH70.090',
  bh70_180: '30.BH70.180',
  bh70_90E: '30.BH70.90E',
} as const;

// Puncte de prindere / cleme (mount points)
export const MOUNT_POINT_CODES = {
  sb45_90: '31.SB45.090',
  sb45_180: '31.SB45.180',
} as const;

// Bare stabilizatoare (stabilizer bars)
export const STABILIZER_CODES = {
  bar_20x10: '35.0810',
  bar_round: '35.0812',
} as const;

// Mânere (handles)
export const HANDLE_CODES = {
  shell: '51.SH10.058',
  bar: '51.BAR',
  round: '51.RND',
  square: '51.SQR',
} as const;

// Profile U
export const PROFILE_CODES = {
  u_1914: '11.1914.600',
  u_1515: '11.1515.600',
} as const;

// Mâna curentă (handrail)
export const HANDRAIL_CODES = {
  round_42: '37.SS3H.042',
  round_50: '37.SS3H.050',
} as const;

/**
 * Returnează codul de material pentru o balamală în funcție de tip
 */
export function getHingeMaterialCode(type: 'wall_glass' | 'glass_glass'): string {
  return type === 'wall_glass' ? HINGE_CODES.wall_glass_90 : HINGE_CODES.glass_glass_180;
}

/**
 * Returnează codul de material pentru mâna curentă
 */
export function getHandrailMaterialCode(diameter: number): string {
  return diameter <= 42 ? HANDRAIL_CODES.round_42 : HANDRAIL_CODES.round_50;
}
