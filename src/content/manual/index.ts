import type { ManualSection, ManualCategory } from './types';
import { sectionsRO, categoriesRO } from './ro';
import { sectionsEN, categoriesEN } from './en';
import { sectionsIT, categoriesIT } from './it';
import { sectionsDE, categoriesDE } from './de';
import { sectionsPL, categoriesPL } from './pl';
import { sectionsFR, categoriesFR } from './fr';
import { sectionsES, categoriesES } from './es';
import { sectionsNL, categoriesNL } from './nl';
import { sectionsHR, categoriesHR } from './hr';

export type { ManualSection, ManualCategory, ManualRole } from './types';

const LOCALES: Record<string, { sections: ManualSection[]; categories: ManualCategory[] }> = {
  ro: { sections: sectionsRO, categories: categoriesRO },
  en: { sections: sectionsEN, categories: categoriesEN },
  it: { sections: sectionsIT, categories: categoriesIT },
  de: { sections: sectionsDE, categories: categoriesDE },
  pl: { sections: sectionsPL, categories: categoriesPL },
  fr: { sections: sectionsFR, categories: categoriesFR },
  es: { sections: sectionsES, categories: categoriesES },
  nl: { sections: sectionsNL, categories: categoriesNL },
  hr: { sections: sectionsHR, categories: categoriesHR },
};

/**
 * Returns manual data for the requested language.
 * If a section exists in RO but not in the requested locale, the RO section is
 * merged in as fallback (preserves ID stability for deep-linking).
 */
export function getManualData(lang: string): {
  sections: ManualSection[];
  categories: ManualCategory[];
} {
  const base = LOCALES[lang] ?? LOCALES.ro;
  if (lang === 'ro' || !LOCALES[lang]) return base;

  // Merge RO sections as fallback for any missing ID
  const knownIds = new Set(base.sections.map((s) => s.id));
  const missing = sectionsRO.filter((s) => !knownIds.has(s.id));
  const knownCatIds = new Set(base.categories.map((c) => c.id));
  const missingCats = categoriesRO.filter((c) => !knownCatIds.has(c.id));

  return {
    sections: [...base.sections, ...missing],
    categories: [...base.categories, ...missingCats],
  };
}
