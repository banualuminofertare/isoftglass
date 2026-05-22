/**
 * Maps processing operation codes (stored in DB as Romanian names)
 * to i18n translation keys, so the operations from the "Prelucrări" tab
 * are localized when the user changes the UI language.
 *
 * Codes not in this map fall back to the original DB `name` (e.g. custom
 * subscriber-added operations such as "GHISEU 200X200").
 */
export const PROCESSING_NAME_KEYS: Record<string, string> = {
  tempering: 'processingNames.tempering',
  SEC: 'processingNames.tempering',
  balustrade_tempering: 'processingNames.tempering',
  laminating: 'processingNames.laminating',
  balustrade_glass_laminated: 'processingNames.laminatedGlass',
  hole: 'processingNames.drilling',
  balustrade_hole_drilling: 'processingNames.drilling',
  cutout_large: 'processingNames.largeCutout',
  cutout_small: 'processingNames.smallCutout',
  mirror_cutout: 'processingNames.mirrorCutout',
  mirror_custom_surcharge: 'processingNames.mirrorCustomShape',
  edge_polish_cnc: 'processingNames.edgeCnc',
  edge_polish_polished: 'processingNames.edgePolished',
  edge_polish_matte: 'processingNames.edgeMatte',
  balustrade_edge_polish: 'processingNames.edgePolish',
  bevel: 'processingNames.bevel',
  SABLAT: 'processingNames.sandblastingFull',
  sandblasting_partial: 'processingNames.sandblastingPartial',
  anti_calc: 'processingNames.antiCalc',
};

export function getProcessingDisplayName(
  code: string | null | undefined,
  fallbackName: string,
  t: (key: string, defaultValue?: any) => any,
): string {
  if (!code) return fallbackName;
  const key = PROCESSING_NAME_KEYS[code];
  if (!key) return fallbackName;
  return t(key, fallbackName) as string;
}

export const LABOR_NAME_KEYS: Record<string, string> = {
  labor_base: 'laborNames.laborBase',
  'CFPC . 21': 'laborNames.laborBase',
  transport: 'laborNames.transport',
  balustrade_labor_stairs: 'laborNames.laborBalustradeStairs',
  balustrade_labor_simple: 'laborNames.laborBalustradeSimple',
  balustrade_labor_exterior: 'laborNames.laborBalustradeExterior',
  labor_per_sqm: 'laborNames.laborPerSqm',
  assembly_complex: 'laborNames.assemblyComplex',
  assembly_simple: 'laborNames.assemblySimple',
};

export function getLaborDisplayName(
  code: string | null | undefined,
  fallbackName: string,
  t: (key: string, defaultValue?: any) => any,
): string {
  if (!code) return fallbackName;
  const key = LABOR_NAME_KEYS[code];
  if (!key) return fallbackName;
  return t(key, fallbackName) as string;
}

export const FINISH_NAME_KEYS: Record<string, string> = {
  anodized_silver: 'finishNames.anodizedSilver',
  balustrade_finish_anodized: 'finishNames.anodizedAluminum',
  matte_black: 'finishNames.matteBlack',
  balustrade_finish_black: 'finishNames.matteBlack',
  brushed_stainless: 'finishNames.brushedStainless',
  balustrade_finish_brushed: 'finishNames.brushedStainless',
  polished_stainless: 'finishNames.polishedStainless',
  balustrade_finish_polished: 'finishNames.polishedStainless',
  gold: 'finishNames.gold',
  balustrade_finish_gold: 'finishNames.gold',
  chrome: 'finishNames.chrome',
  ral_painted: 'finishNames.ralPainted',
};

export function getFinishDisplayName(
  code: string | null | undefined,
  fallbackName: string,
  t: (key: string, defaultValue?: any) => any,
): string {
  if (!code) return fallbackName;
  const key = FINISH_NAME_KEYS[code];
  if (!key) return fallbackName;
  return t(key, fallbackName) as string;
}

const GLASS_TYPE_KEY: Record<string, string> = {
  clear: 'glassNames.types.clear',
  frosted: 'glassNames.types.frosted',
  bronze: 'glassNames.types.bronze',
  green: 'glassNames.types.green',
  grey: 'glassNames.types.grey',
  low_e: 'glassNames.types.lowE',
  patterned: 'glassNames.types.patterned',
  silver: 'glassNames.types.silver',
};

const KITCHEN_TYPE_KEY: Record<string, string> = {
  frosted: 'glassNames.kitchen.frosted',
  lacquered: 'glassNames.kitchen.lacquered',
  lacquered_metallic: 'glassNames.kitchen.lacqueredMetallic',
  printed: 'glassNames.kitchen.printed',
};

export function getGlassDisplayName(
  code: string | null | undefined,
  fallbackName: string,
  t: (key: string, defaultValue?: any) => any,
): string {
  if (!code) return fallbackName;

  // glass_{N}_{type}
  let m = code.match(/^glass_(\d+)_(.+)$/);
  if (m) {
    const [, thick, type] = m;
    const typeKey = GLASS_TYPE_KEY[type];
    const base = t('glassNames.glass', 'Sticlă');
    const typeLabel = typeKey ? t(typeKey, type) : type;
    return `${base} ${thick}mm ${typeLabel}`;
  }

  // mirror_{N}_{type}
  m = code.match(/^mirror_(\d+)_(.+)$/);
  if (m) {
    const [, thick, type] = m;
    const typeKey = GLASS_TYPE_KEY[type];
    const base = t('glassNames.mirror', 'Oglindă');
    const typeLabel = typeKey ? t(typeKey, type) : type;
    return `${base} ${thick}mm ${typeLabel}`;
  }

  // balustrade_glass_{N}
  m = code.match(/^balustrade_glass_(\d+)$/);
  if (m) {
    const base = t('glassNames.balustradeGlass', 'Sticlă balustradă');
    return `${base} ${m[1]}mm`;
  }

  // kitchen_{type}
  m = code.match(/^kitchen_(.+)$/);
  if (m) {
    const typeKey = KITCHEN_TYPE_KEY[m[1]];
    const base = t('glassNames.kitchenGlass', 'Sticlă bucătărie');
    const typeLabel = typeKey ? t(typeKey, m[1]) : m[1];
    return `${base} ${typeLabel}`;
  }

  return fallbackName;
}

export function getCategoryDisplayName(
  category: string | null | undefined,
  code: string | null | undefined,
  fallbackName: string,
  t: (key: string, defaultValue?: any) => any,
): string {
  if (category === 'processing') return getProcessingDisplayName(code, fallbackName, t);
  if (category === 'labor') return getLaborDisplayName(code, fallbackName, t);
  if (category === 'finishing') return getFinishDisplayName(code, fallbackName, t);
  if (category === 'glass') return getGlassDisplayName(code, fallbackName, t);
  return fallbackName;
}
